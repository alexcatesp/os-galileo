// Tokenización para «Token»: caracteres, palabras, bytes UTF-8 y BPE (Byte Pair Encoding) entrenado en el navegador.
// El BPE es el mismo algoritmo que usan los modelos de lenguaje, pero con un vocabulario de juguete aprendido de un
// texto corto: sirve para entender cómo se trocea un texto, no para contar los tokens de ningún modelo concreto.

export type Par = readonly [number, number];

const codificador = new TextEncoder();

export const bytesUtf8 = (s: string): number[] => Array.from(codificador.encode(s));

/** Pretokenizado estilo GPT-2: palabra con su espacio delante, números, símbolos y blancos */
const PRETOKEN = /\s?\p{L}+|\s?\p{N}+|\s?[^\s\p{L}\p{N}]+|\s+/gu;
export const pretokenizar = (s: string): string[] => s.match(PRETOKEN) ?? [];

/** Una fusión aprendida: los ids `a` y `b` pasan a ser el id `id` (= 256 + posición) */
export interface Fusion {
  a: number;
  b: number;
  id: number;
}

/** Bytes que representa cada id del vocabulario (0–255 son los bytes sueltos) */
export function bytesDe(id: number, fusiones: readonly Fusion[], memo = new Map<number, number[]>()): number[] {
  if (id < 256) return [id];
  const ya = memo.get(id);
  if (ya) return ya;
  const f = fusiones[id - 256];
  const r = [...bytesDe(f.a, fusiones, memo), ...bytesDe(f.b, fusiones, memo)];
  memo.set(id, r);
  return r;
}

/** Texto visible de una lista de bytes: espacios como «·», saltos como «↵» y bytes UTF-8 incompletos en hexadecimal */
export function visible(bytes: readonly number[]): string {
  let texto: string;
  try {
    texto = new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(bytes));
  } catch {
    return bytes.map((b) => `<${b.toString(16).toUpperCase().padStart(2, "0")}>`).join("");
  }
  return texto.replace(/ /g, "·").replace(/\n/g, "↵").replace(/\t/g, "→");
}

type Palabras = Map<string, { ids: number[]; frec: number }>;

function contarPalabras(corpus: string): Palabras {
  const m: Palabras = new Map();
  for (const p of pretokenizar(corpus)) {
    const e = m.get(p);
    if (e) e.frec++;
    else m.set(p, { ids: bytesUtf8(p), frec: 1 });
  }
  return m;
}

export interface CuentaPar {
  a: number;
  b: number;
  veces: number;
}

/** Pares adyacentes ordenados por frecuencia (desempate estable por ids, para que el resultado sea reproducible) */
function contarPares(palabras: Palabras): CuentaPar[] {
  const cuenta = new Map<number, CuentaPar>();
  for (const { ids, frec } of palabras.values()) {
    for (let i = 0; i + 1 < ids.length; i++) {
      const clave = ids[i] * 100000 + ids[i + 1];
      const c = cuenta.get(clave);
      if (c) c.veces += frec;
      else cuenta.set(clave, { a: ids[i], b: ids[i + 1], veces: frec });
    }
  }
  return [...cuenta.values()].sort((x, y) => y.veces - x.veces || x.a - y.a || x.b - y.b);
}

function aplicar(ids: number[], f: Fusion): number[] {
  const r: number[] = [];
  for (let i = 0; i < ids.length; i++) {
    if (i + 1 < ids.length && ids[i] === f.a && ids[i + 1] === f.b) {
      r.push(f.id);
      i++;
    } else r.push(ids[i]);
  }
  return r;
}

/** Entrenador que avanza fusión a fusión, para poder enseñar cada paso */
export class Entrenador {
  readonly fusiones: Fusion[] = [];
  private palabras: Palabras;

  constructor(corpus: string) {
    this.palabras = contarPalabras(corpus);
  }

  /** los pares más frecuentes ahora mismo */
  pares(n = 6): CuentaPar[] {
    return contarPares(this.palabras).slice(0, n);
  }

  /** estado actual de cada palabra distinta, de más a menos frecuente */
  estado(): { texto: string; ids: number[]; frec: number }[] {
    return [...this.palabras.entries()]
      .map(([texto, { ids, frec }]) => ({ texto, ids, frec }))
      .sort((x, y) => y.frec - x.frec || x.texto.localeCompare(y.texto));
  }

  /** hace la fusión más frecuente; devuelve null si ya no queda ningún par que repetirse (o el texto está agotado) */
  paso(): (Fusion & { veces: number }) | null {
    const mejor = contarPares(this.palabras)[0];
    if (!mejor) return null;
    const f: Fusion = { a: mejor.a, b: mejor.b, id: 256 + this.fusiones.length };
    this.fusiones.push(f);
    for (const e of this.palabras.values()) e.ids = aplicar(e.ids, f);
    return { ...f, veces: mejor.veces };
  }
}

export function entrenar(corpus: string, cuantas: number): Fusion[] {
  const e = new Entrenador(corpus);
  for (let i = 0; i < cuantas && e.paso(); i++);
  return e.fusiones;
}

/** Aplica las fusiones aprendidas, en el orden en que se aprendieron, a los bytes de cada palabra */
export function codificar(texto: string, fusiones: readonly Fusion[]): number[][] {
  const rango = new Map<number, number>();
  fusiones.forEach((f, i) => rango.set(f.a * 100000 + f.b, i));
  return pretokenizar(texto).map((palabra) => {
    let ids = bytesUtf8(palabra);
    for (;;) {
      let mejor = -1;
      for (let i = 0; i + 1 < ids.length; i++) {
        const r = rango.get(ids[i] * 100000 + ids[i + 1]);
        if (r !== undefined && (mejor === -1 || r < mejor)) mejor = r;
      }
      if (mejor === -1) return ids;
      ids = aplicar(ids, fusiones[mejor]);
    }
  });
}

/** Un token que se pinta: texto visible, id y, si hay bytes sueltos, cuántos bytes ocupa */
export interface Ficha {
  texto: string;
  id: number;
  bytes: number;
}

export type Metodo = "caracteres" | "palabras" | "bytes" | "bpe";

export function trocear(texto: string, metodo: Metodo, fusiones: readonly Fusion[]): Ficha[] {
  const memo = new Map<number, number[]>();
  switch (metodo) {
    case "caracteres":
      return Array.from(texto).map((c) => ({ texto: visible(bytesUtf8(c)), id: c.codePointAt(0)!, bytes: bytesUtf8(c).length }));
    case "palabras": {
      const orden = new Map<string, number>();
      return (texto.match(/\p{L}+|\p{N}+|[^\s\p{L}\p{N}]|\s+/gu) ?? []).map((p) => {
        if (!orden.has(p)) orden.set(p, orden.size);
        return { texto: visible(bytesUtf8(p)), id: orden.get(p)!, bytes: bytesUtf8(p).length };
      });
    }
    case "bytes":
      return bytesUtf8(texto).map((b) => ({ texto: visible([b]), id: b, bytes: 1 }));
    case "bpe":
      return codificar(texto, fusiones)
        .flat()
        .map((id) => {
          const bs = bytesDe(id, fusiones, memo);
          return { texto: visible(bs), id, bytes: bs.length };
        });
  }
}

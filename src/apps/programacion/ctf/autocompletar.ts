// Sugerencias de autocompletado para el editor de «CTF de Strings». Averigua el tipo de lo que hay
// a la izquierda del punto ejecutando el script anterior y evaluando esa expresión.

import { CLASES_ESTATICAS, ejecutar, estaticosDe, evaluarSuelta, firmaDe, metodosDe, type Def } from "./interprete";

export interface Sugerencia {
  etiqueta: string;
  firma: string;
  doc: string;
  insertar: string;
  /** posición del cursor dentro de `insertar` */
  cursor: number;
}

export interface Propuesta {
  /** posición donde empieza lo que se sustituye */
  desde: number;
  items: Sugerencia[];
}

const PALABRAS: [string, string][] = [
  ["String", "tipo de las cadenas de texto"],
  ["StringBuilder", "cadena mutable"],
  ["int", "número entero"],
  ["char", "un carácter"],
  ["boolean", "verdadero o falso"],
  ["new", "crea un objeto: new StringBuilder(s)"],
  ["Integer", "clase con utilidades de enteros (Integer.parseInt)"],
];

function porDef(d: Def): Sugerencia {
  const firma = `${firmaDe(d)} → ${d.ret}`;
  return { etiqueta: d.nombre, firma, doc: d.doc, insertar: `${d.nombre}(${")"}`, cursor: d.params.length ? d.nombre.length + 1 : d.nombre.length + 2 };
}

/** Extrae la expresión que hay a la izquierda de un punto (`new StringBuilder(s)`, `s.trim()`, `"a"`…). */
export function receptorDe(prefijo: string): string {
  let i = prefijo.length - 1;
  const saltarCadena = (desde: number): number => {
    let j = desde - 1;
    while (j >= 0 && !(prefijo[j] === '"' && prefijo[j - 1] !== "\\")) j--;
    return j;
  };
  while (i >= 0) {
    const c = prefijo[i];
    if (c === ")" || c === "]") {
      let prof = 0;
      let j = i;
      for (; j >= 0; j--) {
        const d = prefijo[j];
        if (d === ")" || d === "]") prof++;
        else if (d === "(" || d === "[") {
          prof--;
          if (prof === 0) break;
        } else if (d === '"') j = saltarCadena(j);
      }
      if (j < 0) break;
      i = j - 1;
    } else if (c === '"') {
      const j = saltarCadena(i);
      if (j < 0) break;
      i = j - 1;
    } else if (/[\w.]/.test(c)) i--;
    else break;
  }
  const resto = prefijo.slice(0, i + 1).trimEnd();
  const inicio = /\bnew$/.test(resto) ? resto.length - 3 : i + 1;
  return prefijo.slice(inicio).trim();
}

export function sugerir(texto: string, pos: number, entrada: string, forzar = false): Propuesta | null {
  const inicioLinea = texto.lastIndexOf("\n", pos - 1) + 1;
  const prefijo = texto.slice(inicioLinea, pos);
  // dentro de una cadena o de un comentario no se sugiere nada
  if (((prefijo.replace(/\\./g, "").match(/"/g) ?? []).length & 1) === 1 || prefijo.includes("//")) return null;
  const parcial = /([A-Za-z_]\w*)?$/.exec(prefijo)![1] ?? "";
  const antes = prefijo.slice(0, prefijo.length - parcial.length);
  const desde = pos - parcial.length;
  const minus = parcial.toLowerCase();
  const entorno = () => ejecutar(texto.slice(0, inicioLinea), entrada).entorno;

  if (antes.endsWith(".")) {
    const recep = receptorDe(antes.slice(0, -1));
    if (!recep) return null;
    let defs: Def[] = [];
    if (CLASES_ESTATICAS.includes(recep) && !entorno().has(recep)) defs = estaticosDe(recep);
    else {
      const v = evaluarSuelta(recep, entorno());
      if (v) defs = metodosDe(v);
    }
    const items = defs
      .filter((d) => d.nombre.toLowerCase().startsWith(minus))
      .sort((a, b) => a.nombre.localeCompare(b.nombre) || a.params.length - b.params.length)
      .map(porDef);
    return items.length ? { desde, items } : null;
  }

  if (!parcial && !forzar) return null;
  const env = entorno();
  const vars: Sugerencia[] = [...env.entries()]
    .filter(([n]) => n.toLowerCase().startsWith(minus) && n !== parcial)
    .map(([n, v]) => ({ etiqueta: n, firma: `${v.tipo} ${n}`, doc: "variable", insertar: n, cursor: n.length }));
  const palabras: Sugerencia[] = PALABRAS.filter(([p]) => p.toLowerCase().startsWith(minus) && p !== parcial).map(([p, d]) => ({ etiqueta: p, firma: p, doc: d, insertar: p, cursor: p.length }));
  const items = [...vars, ...palabras];
  return items.length ? { desde, items } : null;
}

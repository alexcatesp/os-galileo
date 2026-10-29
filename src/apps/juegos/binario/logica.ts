// Lógica del juego «Binario»: conversiones y circuitos de puertas lógicas.

export const PUERTAS = ["AND", "OR", "XOR", "NAND", "NOR"] as const;
export type Puerta = (typeof PUERTAS)[number];

export const DESCRIPCION: Record<Puerta, string> = {
  AND: "Y: solo es 1 si las dos entradas son 1",
  OR: "O: es 1 si alguna entrada es 1",
  XOR: "O exclusiva: es 1 si las entradas son distintas",
  NAND: "NO Y: lo contrario de AND",
  NOR: "NO O: lo contrario de OR",
};

export function aplicar(p: Puerta, a: boolean, b: boolean): boolean {
  switch (p) {
    case "AND": return a && b;
    case "OR": return a || b;
    case "XOR": return a !== b;
    case "NAND": return !(a && b);
    case "NOR": return !(a || b);
  }
}

export type Expr =
  | { t: "in"; n: string }
  | { t: "no"; x: Expr }
  | { t: "p"; id: number; a: Expr; b: Expr };

export function evaluar(e: Expr, v: Record<string, boolean>, puertas: Puerta[]): boolean {
  switch (e.t) {
    case "in": return v[e.n];
    case "no": return !evaluar(e.x, v, puertas);
    case "p": return aplicar(puertas[e.id], evaluar(e.a, v, puertas), evaluar(e.b, v, puertas));
  }
}

export interface Circuito {
  entradas: string[];
  expr: Expr;
  huecos: number;
  /** salida esperada para cada combinación de entradas (A es el bit más alto) */
  objetivo: boolean[];
  solucion: Puerta[];
}

const I = (n: string): Expr => ({ t: "in", n });
const NO = (x: Expr): Expr => ({ t: "no", x });
const P = (id: number, a: Expr, b: Expr): Expr => ({ t: "p", id, a, b });

const PLANTILLAS: Record<1 | 2 | 3, { entradas: string[]; huecos: number; expr: () => Expr }[]> = {
  1: [{ entradas: ["A", "B"], huecos: 1, expr: () => P(0, I("A"), I("B")) }],
  2: [
    { entradas: ["A", "B", "C"], huecos: 2, expr: () => P(1, P(0, I("A"), I("B")), I("C")) },
    { entradas: ["A", "B", "C"], huecos: 2, expr: () => P(1, I("A"), P(0, I("B"), I("C"))) },
    { entradas: ["A", "B", "C"], huecos: 2, expr: () => P(1, P(0, I("A"), I("B")), NO(I("C"))) },
    { entradas: ["A", "B", "C"], huecos: 2, expr: () => P(1, NO(I("A")), P(0, I("B"), I("C"))) },
  ],
  3: [
    { entradas: ["A", "B", "C", "D"], huecos: 3, expr: () => P(2, P(0, I("A"), I("B")), P(1, I("C"), I("D"))) },
    { entradas: ["A", "B", "C", "D"], huecos: 3, expr: () => P(2, P(0, I("A"), NO(I("B"))), P(1, I("C"), I("D"))) },
    { entradas: ["A", "B", "C", "D"], huecos: 3, expr: () => P(2, P(0, I("A"), I("B")), P(1, NO(I("C")), I("D"))) },
  ],
};

/** combinaciones de entradas en orden de tabla de verdad (A = bit más alto) */
export function combinaciones(entradas: string[]): Record<string, boolean>[] {
  const n = entradas.length;
  return Array.from({ length: 1 << n }, (_, f) => Object.fromEntries(entradas.map((e, i) => [e, !!((f >> (n - 1 - i)) & 1)])));
}

export function tabla(c: Pick<Circuito, "entradas" | "expr">, puertas: Puerta[]): boolean[] {
  return combinaciones(c.entradas).map((v) => evaluar(c.expr, v, puertas));
}

const elegir = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

export function generarCircuito(nivel: 1 | 2 | 3): Circuito {
  for (;;) {
    const pl = elegir(PLANTILLAS[nivel]);
    const solucion = Array.from({ length: pl.huecos }, () => elegir(PUERTAS));
    const expr = pl.expr();
    const objetivo = tabla({ entradas: pl.entradas, expr }, solucion);
    const unos = objetivo.filter(Boolean).length;
    // descartamos salidas constantes y las que ya acierta el circuito de partida (todo AND)
    const inicial = tabla({ entradas: pl.entradas, expr }, solucion.map(() => "AND" as Puerta));
    if (unos === 0 || unos === objetivo.length) continue;
    if (inicial.every((x, i) => x === objetivo[i])) continue;
    return { entradas: pl.entradas, expr, huecos: pl.huecos, objetivo, solucion };
  }
}

// ---------- conversiones ----------
export const aBinario = (n: number, bits: number) => n.toString(2).padStart(bits, "0");
export const aHex = (n: number) => n.toString(16).toUpperCase().padStart(2, "0");

/** interpreta lo que escribe la persona; devuelve null si no es un número de esa base */
export function leerNumero(texto: string, base: 2 | 10 | 16): number | null {
  let t = texto.trim().replace(/\s+/g, "");
  if (base === 16) t = t.replace(/^0x/i, "");
  if (base === 2) t = t.replace(/^0b/i, "");
  const ok = base === 2 ? /^[01]+$/ : base === 10 ? /^\d+$/ : /^[0-9a-fA-F]+$/;
  return ok.test(t) ? parseInt(t, base) : null;
}

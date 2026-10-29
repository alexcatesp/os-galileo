// Modelo único de un algoritmo: el pseudocódigo y el diagrama de flujo son dos vistas de este árbol.

export type Nodo = Leer | Escribir | Asignar | Si | Mientras | Repetir | Para | Segun;
export type Lista = Nodo[];

interface Base {
  /** línea del pseudocódigo (1..n); la fijan el analizador y el formateador */
  linea?: number;
  /** solo en nodos sintéticos del dibujo (las decisiones de un SEGÚN): el nodo real */
  origen?: Nodo;
}
export interface Leer extends Base { t: "leer"; vars: string }
export interface Escribir extends Base { t: "escribir"; expr: string }
export interface Asignar extends Base { t: "asignar"; variable: string; expr: string }
export interface Si extends Base { t: "si"; cond: string; entonces: Lista; sino: Lista }
export interface Mientras extends Base { t: "mientras"; cond: string; cuerpo: Lista }
export interface Repetir extends Base { t: "repetir"; hasta: string; cuerpo: Lista }
export interface Para extends Base { t: "para"; variable: string; desde: string; hasta: string; paso: string; cuerpo: Lista }
export interface Caso { valor: string; cuerpo: Lista }
export interface Segun extends Base { t: "segun"; expr: string; casos: Caso[]; otro: Lista }

export interface Programa {
  cuerpo: Lista;
}

export type TipoNuevo = "leer" | "escribir" | "asignar" | "si" | "mientras" | "repetir" | "para";

/** Nodo con valores por defecto válidos (sin huecos «…»: tiene que poder analizarse). */
export function nuevoNodo(t: TipoNuevo): Nodo {
  switch (t) {
    case "leer": return { t, vars: "x" };
    case "escribir": return { t, expr: '"Hola"' };
    case "asignar": return { t, variable: "x", expr: "0" };
    case "si": return { t, cond: "x > 0", entonces: [], sino: [] };
    case "mientras": return { t, cond: "x > 0", cuerpo: [] };
    case "repetir": return { t, hasta: "x > 0", cuerpo: [] };
    case "para": return { t, variable: "i", desde: "1", hasta: "10", paso: "", cuerpo: [] };
  }
}

/** Todas las listas hijas de un nodo (para recorrerlo) */
export function hijos(n: Nodo): Lista[] {
  switch (n.t) {
    case "si": return [n.entonces, n.sino];
    case "mientras": case "repetir": case "para": return [n.cuerpo];
    case "segun": return [...n.casos.map((c) => c.cuerpo), n.otro];
    default: return [];
  }
}

/** Busca la lista que contiene un nodo y su posición */
export function ubicar(raiz: Lista, nodo: Nodo): { lista: Lista; idx: number } | null {
  const i = raiz.indexOf(nodo);
  if (i >= 0) return { lista: raiz, idx: i };
  for (const n of raiz) {
    for (const h of hijos(n)) {
      const r = ubicar(h, nodo);
      if (r) return r;
    }
  }
  return null;
}

export function contar(raiz: Lista): number {
  return raiz.reduce((a, n) => a + 1 + hijos(n).reduce((b, h) => b + contar(h), 0), 0);
}

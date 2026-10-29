// Modelo único de un algoritmo: el pseudocódigo y el diagrama de flujo son dos vistas de este árbol.

export type Nodo = Leer | Escribir | Asignar | Si | Mientras | Repetir | Para | Segun | Accion | Llamar;
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
/** Paso en lenguaje natural («Coger el cepillo»): solo en el modo de texto libre */
export interface Accion extends Base { t: "accion"; texto: string }
/** Llamada a un subproceso por su nombre */
export interface Llamar extends Base { t: "llamar"; nombre: string }

export interface Subproceso {
  nombre: string;
  cuerpo: Lista;
}

export interface Programa {
  cuerpo: Lista;
  subprocesos: Subproceso[];
}

export type TipoNuevo = "leer" | "escribir" | "asignar" | "si" | "mientras" | "repetir" | "para" | "accion" | "llamar";

/** Nodo con valores por defecto válidos (sin huecos «…»: tiene que poder analizarse). */
export function nuevoNodo(t: TipoNuevo, nombre = ""): Nodo {
  switch (t) {
    case "leer": return { t, vars: "x" };
    case "escribir": return { t, expr: '"Hola"' };
    case "asignar": return { t, variable: "x", expr: "0" };
    case "si": return { t, cond: "x > 0", entonces: [], sino: [] };
    case "mientras": return { t, cond: "x > 0", cuerpo: [] };
    case "repetir": return { t, hasta: "x > 0", cuerpo: [] };
    case "para": return { t, variable: "i", desde: "1", hasta: "10", paso: "", cuerpo: [] };
    case "accion": return { t, texto: "Hacer algo" };
    case "llamar": return { t, nombre };
  }
}

export function programaVacio(): Programa {
  return { cuerpo: [], subprocesos: [] };
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

/** Las listas de primer nivel: el algoritmo y cada subproceso */
export function raices(p: Programa): Lista[] {
  return [p.cuerpo, ...p.subprocesos.map((s) => s.cuerpo)];
}

function ubicarEn(raiz: Lista, nodo: Nodo): { lista: Lista; idx: number } | null {
  const i = raiz.indexOf(nodo);
  if (i >= 0) return { lista: raiz, idx: i };
  for (const n of raiz) {
    for (const h of hijos(n)) {
      const r = ubicarEn(h, nodo);
      if (r) return r;
    }
  }
  return null;
}

/** Busca la lista que contiene un nodo, su posición y a qué raíz pertenece (0 = algoritmo, 1.. = subprocesos) */
export function ubicar(p: Programa, nodo: Nodo): { lista: Lista; idx: number; raiz: number } | null {
  const rs = raices(p);
  for (let k = 0; k < rs.length; k++) {
    const r = ubicarEn(rs[k], nodo);
    if (r) return { ...r, raiz: k };
  }
  return null;
}

function contieneLista(raiz: Lista, buscada: Lista): boolean {
  if (raiz === buscada) return true;
  return raiz.some((n) => hijos(n).some((h) => contieneLista(h, buscada)));
}

export function esListaReal(p: Programa, lista: Lista): boolean {
  return raices(p).some((r) => contieneLista(r, lista));
}

function contarLista(l: Lista): number {
  return l.reduce((a, n) => a + 1 + hijos(n).reduce((b, h) => b + contarLista(h), 0), 0);
}

export function contar(p: Programa): number {
  return raices(p).reduce((a, r) => a + contarLista(r), 0);
}

/** Recorre todos los nodos del programa */
export function recorrer(p: Programa, f: (n: Nodo, lista: Lista) => void): void {
  const rec = (l: Lista) => {
    for (const n of l) {
      f(n, l);
      hijos(n).forEach(rec);
    }
  };
  raices(p).forEach(rec);
}

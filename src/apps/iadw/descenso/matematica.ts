// Matemáticas de «Descenso»: funciones de dos variables, optimizadores y regresión lineal.

export type Vec = [number, number];

export interface Dom {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

export interface Funcion {
  id: string;
  nombre: string;
  formula: string;
  idea: string;
  dom: Dom;
  f(x: number, y: number): number;
  grad(x: number, y: number): Vec;
  inicio: Vec;
  minimos: Vec[];
  /** tasa de aprendizaje con la que funciona bien con SGD */
  lr: number;
}

export const FUNCIONES: Funcion[] = [
  {
    id: "cuenco",
    nombre: "Cuenco",
    formula: "f(x, y) = x² + y²",
    idea: "El caso ideal: un solo mínimo y curvatura igual en todas direcciones. Prueba tasas muy altas (≥ 1) y verás cómo se pasa de largo.",
    dom: { x0: -4, x1: 4, y0: -4, y1: 4 },
    f: (x, y) => x * x + y * y,
    grad: (x, y) => [2 * x, 2 * y],
    inicio: [3, 2.5],
    minimos: [[0, 0]],
    lr: 0.1,
  },
  {
    id: "valle",
    nombre: "Valle alargado",
    formula: "f(x, y) = 0,1·x² + 2·y²",
    idea: "Muy empinado en y y casi plano en x. Con SGD, una tasa alta hace zigzag y una baja avanza lentísimo por el fondo. Momentum y Adam lo resuelven mejor.",
    dom: { x0: -5, x1: 5, y0: -5, y1: 5 },
    f: (x, y) => 0.1 * x * x + 2 * y * y,
    grad: (x, y) => [0.2 * x, 4 * y],
    inicio: [4, 2],
    minimos: [[0, 0]],
    lr: 0.2,
  },
  {
    id: "dos",
    nombre: "Dos mínimos",
    formula: "f(x, y) = (x² − 1)² + y²",
    idea: "Hay dos mínimos, en (−1, 0) y (1, 0). A cuál llegas depende del punto de partida: haz clic en el mapa para probar distintos inicios.",
    dom: { x0: -2, x1: 2, y0: -2, y1: 2 },
    f: (x, y) => (x * x - 1) ** 2 + y * y,
    grad: (x, y) => [4 * x * (x * x - 1), 2 * y],
    inicio: [-0.3, 1.5],
    minimos: [[-1, 0], [1, 0]],
    lr: 0.03,
  },
  {
    id: "rosenbrock",
    nombre: "Valle curvo (Rosenbrock)",
    formula: "f(x, y) = (1 − x)² + 5·(y − x²)²",
    idea: "Un valle estrecho y curvado hacia el mínimo (1, 1). Es la prueba clásica de optimizadores: llegar al valle es fácil, recorrerlo cuesta.",
    dom: { x0: -2, x1: 2, y0: -1, y1: 3 },
    f: (x, y) => (1 - x) ** 2 + 5 * (y - x * x) ** 2,
    grad: (x, y) => [-2 * (1 - x) - 20 * x * (y - x * x), 10 * (y - x * x)],
    inicio: [-1.5, 2],
    minimos: [[1, 1]],
    lr: 0.005,
  },
];

export type TipoOpt = "sgd" | "momentum" | "adam";

export const OPTIMIZADORES: Record<TipoOpt, { nombre: string; idea: string }> = {
  sgd: { nombre: "Descenso del gradiente", idea: "Cada paso es p ← p − tasa · gradiente. Simple y fiable, pero sensible a la tasa y lento en valles estrechos." },
  momentum: { nombre: "Con momento (β = 0,9)", idea: "Acumula una «velocidad» como una bola que rueda: atraviesa zonas planas y amortigua el zigzag, aunque puede pasarse y volver." },
  adam: { nombre: "Adam", idea: "Adapta el tamaño del paso a cada parámetro con medias móviles del gradiente. Es el más usado para entrenar redes neuronales." },
};

/** Optimizador con estado (velocidad, medias móviles); la tasa se puede cambiar mientras corre */
export class Optimizador {
  private m: Vec = [0, 0];
  private v: Vec = [0, 0];
  private t = 0;
  constructor(
    readonly tipo: TipoOpt,
    public lr: number,
  ) {}

  paso(p: Vec, g: Vec): Vec {
    if (this.tipo === "sgd") return [p[0] - this.lr * g[0], p[1] - this.lr * g[1]];
    if (this.tipo === "momentum") {
      this.m = [0.9 * this.m[0] + g[0], 0.9 * this.m[1] + g[1]];
      return [p[0] - this.lr * this.m[0], p[1] - this.lr * this.m[1]];
    }
    this.t++;
    const [b1, b2] = [0.9, 0.999];
    const r: Vec = [p[0], p[1]];
    for (const i of [0, 1] as const) {
      this.m[i] = b1 * this.m[i] + (1 - b1) * g[i];
      this.v[i] = b2 * this.v[i] + (1 - b2) * g[i] * g[i];
      const mh = this.m[i] / (1 - b1 ** this.t);
      const vh = this.v[i] / (1 - b2 ** this.t);
      r[i] -= (this.lr * mh) / (Math.sqrt(vh) + 1e-8);
    }
    return r;
  }
}

export const norma = (g: Vec): number => Math.hypot(g[0], g[1]);

// ---------- regresión lineal y = w·x + b ----------

export interface Punto {
  x: number;
  y: number;
}

/** generador pseudoaleatorio con semilla (mulberry32), para que «nuevos datos» sea reproducible */
export function azarConSemilla(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 20 puntos alrededor de una recta con pendiente y ordenada al azar, más ruido */
export function datosRecta(semilla: number): { puntos: Punto[]; w: number; b: number } {
  const az = azarConSemilla(semilla);
  const w = Math.round((0.8 + az() * 2.4) * 10) / 10;
  const b = Math.round((-1.5 + az() * 3) * 10) / 10;
  const puntos = Array.from({ length: 20 }, () => {
    const x = -3.5 + az() * 7;
    return { x, y: w * x + b + (az() + az() + az() - 1.5) * 2.2 };
  });
  return { puntos, w, b };
}

export const ecm = (p: readonly Punto[], w: number, b: number): number => p.reduce((s, q) => s + (w * q.x + b - q.y) ** 2, 0) / p.length;

export function gradRecta(p: readonly Punto[], w: number, b: number): Vec {
  let gw = 0;
  let gb = 0;
  for (const q of p) {
    const e = w * q.x + b - q.y;
    gw += 2 * e * q.x;
    gb += 2 * e;
  }
  return [gw / p.length, gb / p.length];
}

/** solución exacta por mínimos cuadrados, para comparar con lo que encuentra el descenso */
export function ajusteExacto(p: readonly Punto[]): Vec {
  const n = p.length;
  const mx = p.reduce((s, q) => s + q.x, 0) / n;
  const my = p.reduce((s, q) => s + q.y, 0) / n;
  const sxy = p.reduce((s, q) => s + (q.x - mx) * (q.y - my), 0);
  const sxx = p.reduce((s, q) => s + (q.x - mx) ** 2, 0);
  const w = sxy / sxx;
  return [w, my - w * mx];
}

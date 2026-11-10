// Mundo del «Robot Galileo»: una cuadrícula con paredes, monedas y una meta, y un robot que mira al norte,
// este, sur u oeste. Las reglas viven aquí; el intérprete solo llama a estas funciones.

/** 0 = norte (arriba), 1 = este, 2 = sur, 3 = oeste */
export type Dir = 0 | 1 | 2 | 3;
export const DX = [0, 1, 0, -1];
export const DY = [-1, 0, 1, 0];

export interface Estado {
  x: number;
  y: number;
  d: Dir;
  /** monedas que quedan, como «x,y» */
  monedas: string[];
}

export interface Mundo {
  ancho: number;
  alto: number;
  paredes: boolean[][];
  meta: { x: number; y: number } | null;
  inicial: Estado;
}

/**
 * Un mapa es una lista de filas de texto:
 * `#` pared · `.` suelo · `o` moneda · `G` meta · `^ > v <` robot al empezar (y hacia dónde mira).
 */
export function crearMundo(filas: string[]): Mundo {
  const alto = filas.length;
  const ancho = Math.max(...filas.map((f) => f.length));
  const paredes: boolean[][] = [];
  const monedas: string[] = [];
  let meta: Mundo["meta"] = null;
  let inicial: Estado | null = null;
  for (let y = 0; y < alto; y++) {
    paredes.push([]);
    for (let x = 0; x < ancho; x++) {
      const c = filas[y][x] ?? "#";
      paredes[y].push(c === "#");
      if (c === "o") monedas.push(`${x},${y}`);
      else if (c === "G") meta = { x, y };
      else if (c === "^" || c === ">" || c === "v" || c === "<") inicial = { x, y, d: (c === "^" ? 0 : c === ">" ? 1 : c === "v" ? 2 : 3) as Dir, monedas: [] };
    }
  }
  if (!inicial) throw new Error("El mapa no tiene robot");
  inicial.monedas = monedas;
  return { ancho, alto, paredes, meta, inicial };
}

export function esPared(m: Mundo, x: number, y: number): boolean {
  return x < 0 || y < 0 || x >= m.ancho || y >= m.alto || m.paredes[y][x];
}

export const copiar = (e: Estado): Estado => ({ ...e, monedas: [...e.monedas] });

/** Sensores que puede consultar el programa. */
export const SENSORES: Record<string, { doc: string; leer: (m: Mundo, e: Estado) => boolean }> = {
  hayPared: { doc: "¿hay una pared justo delante?", leer: (m, e) => esPared(m, e.x + DX[e.d], e.y + DY[e.d]) },
  hayParedIzquierda: { doc: "¿hay una pared a su izquierda?", leer: (m, e) => esPared(m, e.x + DX[(e.d + 3) % 4], e.y + DY[(e.d + 3) % 4]) },
  hayParedDerecha: { doc: "¿hay una pared a su derecha?", leer: (m, e) => esPared(m, e.x + DX[(e.d + 1) % 4], e.y + DY[(e.d + 1) % 4]) },
  hayMoneda: { doc: "¿hay una moneda en la casilla donde está?", leer: (_m, e) => e.monedas.includes(`${e.x},${e.y}`) },
  enMeta: { doc: "¿está sobre la meta?", leer: (m, e) => !!m.meta && m.meta.x === e.x && m.meta.y === e.y },
};

export class Fallo extends Error {}

/** Órdenes del robot. Cambian el estado o lanzan `Fallo` con un mensaje para el alumno. */
export const ACCIONES: Record<string, { doc: string; hacer: (m: Mundo, e: Estado) => void }> = {
  avanzar: {
    doc: "avanza una casilla hacia donde mira",
    hacer(m, e) {
      const nx = e.x + DX[e.d];
      const ny = e.y + DY[e.d];
      if (esPared(m, nx, ny)) throw new Fallo("¡Choca contra una pared! avanzar() solo se puede usar si delante hay hueco.");
      e.x = nx;
      e.y = ny;
    },
  },
  girarIzquierda: { doc: "gira 90° a la izquierda sin moverse", hacer: (_m, e) => void (e.d = ((e.d + 3) % 4) as Dir) },
  girarDerecha: { doc: "gira 90° a la derecha sin moverse", hacer: (_m, e) => void (e.d = ((e.d + 1) % 4) as Dir) },
  recoger: {
    doc: "recoge la moneda de la casilla donde está",
    hacer(_m, e) {
      const k = e.monedas.indexOf(`${e.x},${e.y}`);
      if (k < 0) throw new Fallo("Intentó recoger() donde no hay ninguna moneda.");
      e.monedas.splice(k, 1);
    },
  },
};

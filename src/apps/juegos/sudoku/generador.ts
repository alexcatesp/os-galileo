// Generador y resolutor de Sudoku (4×4 y 9×9). Todos los tableros tienen solución única.
// Fácil y Medio se pueden resolver solo con «únicos» (candidato único y único lugar posible);
// Difícil y Experto tienen menos pistas y exigen razonar más.

export type Nivel = "facil" | "medio" | "dificil" | "experto";
export type Tamano = 4 | 9;

export const NIVELES: { id: Nivel; nombre: string }[] = [
  { id: "facil", nombre: "Fácil" },
  { id: "medio", nombre: "Medio" },
  { id: "dificil", nombre: "Difícil" },
  { id: "experto", nombre: "Experto" },
];

/** pistas que se intenta dejar (puede quedar alguna más si no se puede quitar sin perder la solución única) */
const PISTAS: Record<Tamano, Record<Nivel, number>> = {
  4: { facil: 11, medio: 9, dificil: 7, experto: 5 },
  9: { facil: 42, medio: 34, dificil: 28, experto: 24 },
};

export function caja(n: Tamano): [number, number] {
  return n === 4 ? [2, 2] : [3, 3];
}

const POPCOUNT: number[] = Array.from({ length: 512 }, (_, i) => i.toString(2).replace(/0/g, "").length);

/** unidades del tablero: filas, columnas y cajas, como listas de índices */
export function unidades(n: Tamano): number[][] {
  const [br, bc] = caja(n);
  const u: number[][] = [];
  for (let f = 0; f < n; f++) u.push(Array.from({ length: n }, (_, c) => f * n + c));
  for (let c = 0; c < n; c++) u.push(Array.from({ length: n }, (_, f) => f * n + c));
  for (let bf = 0; bf < n; bf += br) {
    for (let bcol = 0; bcol < n; bcol += bc) {
      const celdas: number[] = [];
      for (let f = 0; f < br; f++) for (let c = 0; c < bc; c++) celdas.push((bf + f) * n + bcol + c);
      u.push(celdas);
    }
  }
  return u;
}

/** para cada casilla, las que comparten fila, columna o caja con ella */
export function vecinas(n: Tamano): number[][] {
  const us = unidades(n);
  return Array.from({ length: n * n }, (_, i) => [...new Set(us.filter((u) => u.includes(i)).flat())].filter((j) => j !== i));
}

class Estado {
  readonly celdas: number[];
  private mascaras: number[]; // dígitos usados en cada unidad (bit v-1)
  private porCelda: number[][]; // unidades de cada casilla

  constructor(readonly n: Tamano, datos: number[]) {
    const us = unidades(n);
    this.mascaras = us.map(() => 0);
    this.porCelda = Array.from({ length: n * n }, () => []);
    us.forEach((u, k) => u.forEach((i) => this.porCelda[i].push(k)));
    this.celdas = datos.slice();
    datos.forEach((v, i) => {
      if (v) this.marcar(i, v);
    });
  }

  private marcar(i: number, v: number): void {
    for (const k of this.porCelda[i]) this.mascaras[k] |= 1 << (v - 1);
  }
  private desmarcar(i: number, v: number): void {
    for (const k of this.porCelda[i]) this.mascaras[k] &= ~(1 << (v - 1));
  }
  poner(i: number, v: number): void {
    this.celdas[i] = v;
    this.marcar(i, v);
  }
  quitar(i: number): void {
    this.desmarcar(i, this.celdas[i]);
    this.celdas[i] = 0;
  }
  /** máscara de dígitos posibles en una casilla vacía */
  candidatos(i: number): number {
    let usados = 0;
    for (const k of this.porCelda[i]) usados |= this.mascaras[k];
    return ~usados & ((1 << this.n) - 1);
  }
}

function barajar<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Cuenta soluciones (hasta `limite`) con la casilla de menos candidatos primero. Con `azar` mezcla el orden de los dígitos. */
export function resolver(n: Tamano, datos: number[], limite = 2, azar = false): { soluciones: number; primera: number[] | null } {
  const e = new Estado(n, datos);
  let soluciones = 0;
  let primera: number[] | null = null;
  const rec = (): void => {
    let mejor = -1, mejorMascara = 0, mejorCuenta = 99;
    for (let i = 0; i < e.celdas.length; i++) {
      if (e.celdas[i]) continue;
      const m = e.candidatos(i);
      const c = POPCOUNT[m];
      if (c < mejorCuenta) {
        mejor = i;
        mejorMascara = m;
        mejorCuenta = c;
        if (c <= 1) break;
      }
    }
    if (mejor < 0) {
      soluciones++;
      primera ??= e.celdas.slice();
      return;
    }
    if (mejorCuenta === 0) return;
    const digitos: number[] = [];
    for (let v = 1; v <= n; v++) if (mejorMascara & (1 << (v - 1))) digitos.push(v);
    for (const v of azar ? barajar(digitos) : digitos) {
      e.poner(mejor, v);
      rec();
      e.quitar(mejor);
      if (soluciones >= limite) return;
    }
  };
  rec();
  return { soluciones, primera };
}

/** ¿se resuelve usando solo candidato único y único lugar posible? */
export function resolubleConUnicos(n: Tamano, datos: number[]): boolean {
  const e = new Estado(n, datos);
  const us = unidades(n);
  let avance = true;
  while (avance) {
    avance = false;
    for (let i = 0; i < e.celdas.length; i++) {
      if (e.celdas[i]) continue;
      const m = e.candidatos(i);
      if (POPCOUNT[m] === 1) {
        e.poner(i, Math.log2(m) + 1);
        avance = true;
      }
    }
    for (const u of us) {
      for (let v = 1; v <= n; v++) {
        if (u.some((i) => e.celdas[i] === v)) continue;
        const sitios = u.filter((i) => !e.celdas[i] && e.candidatos(i) & (1 << (v - 1)));
        if (sitios.length === 1) {
          e.poner(sitios[0], v);
          avance = true;
        }
      }
    }
  }
  return e.celdas.every((v) => v !== 0);
}

export interface Partida {
  n: Tamano;
  nivel: Nivel;
  /** tablero inicial (0 = vacía) */
  puzzle: number[];
  solucion: number[];
}

export function generar(n: Tamano, nivel: Nivel): Partida {
  const vacio = new Array<number>(n * n).fill(0);
  const solucion = resolver(n, vacio, 1, true).primera!;
  const objetivo = PISTAS[n][nivel];
  const soloUnicos = nivel === "facil" || nivel === "medio";
  const puzzle = solucion.slice();
  let pistas = n * n;
  for (const i of barajar(Array.from({ length: n * n }, (_, k) => k))) {
    if (pistas <= objetivo) break;
    const v = puzzle[i];
    puzzle[i] = 0;
    const valido = soloUnicos ? resolubleConUnicos(n, puzzle) : resolver(n, puzzle, 2).soluciones === 1;
    if (valido) pistas--;
    else puzzle[i] = v;
  }
  return { n, nivel, puzzle, solucion };
}

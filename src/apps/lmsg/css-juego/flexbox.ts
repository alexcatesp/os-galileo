// Niveles de «Flexbox». El alumno escribe CSS y las cajas deben acabar donde están en el objetivo.
// Se comparan las POSICIONES reales que calcula el navegador, así que vale cualquier CSS que dé
// el mismo resultado. Todo ocurre en iframes aislados (sandbox, sin scripts).

export interface NivelFlex {
  titulo: string;
  bloque: string;
  /** cuántas cajas (ids c1, c2…) */
  cajas: number;
  /** tamaño de cada caja en px (0 = automático, para que las estire la rejilla) */
  ancho?: number;
  alto?: number;
  /** CSS que ya viene dado y no se edita */
  base: string;
  /** CSS de la solución de referencia (define el objetivo) */
  solucion: string;
  /** texto con el que empieza el editor */
  inicial: string;
}

const PISTA = `.pista {\n  display: flex;\n}`;
const reglaVacia = (sel = ".pista") => `${sel} {\n  \n}\n`;

export const NIVELES_FLEX: NivelFlex[] = [
  {
    bloque: "Eje principal",
    titulo: "Activar flex",
    cajas: 3,
    base: "",
    solucion: ".pista { display: flex; }",
    inicial: reglaVacia(),
  },
  {
    bloque: "Eje principal",
    titulo: "Al final de la fila",
    cajas: 3,
    base: PISTA,
    solucion: ".pista { justify-content: flex-end; }",
    inicial: reglaVacia(),
  },
  {
    bloque: "Eje principal",
    titulo: "Centrados",
    cajas: 3,
    base: PISTA,
    solucion: ".pista { justify-content: center; }",
    inicial: reglaVacia(),
  },
  {
    bloque: "Eje principal",
    titulo: "Espacio entre cajas",
    cajas: 4,
    base: PISTA,
    solucion: ".pista { justify-content: space-between; }",
    inicial: reglaVacia(),
  },
  {
    bloque: "Eje principal",
    titulo: "Espacio alrededor",
    cajas: 3,
    base: PISTA,
    solucion: ".pista { justify-content: space-around; }",
    inicial: reglaVacia(),
  },
  {
    bloque: "Eje secundario",
    titulo: "Abajo",
    cajas: 3,
    base: PISTA,
    solucion: ".pista { align-items: flex-end; }",
    inicial: reglaVacia(),
  },
  {
    bloque: "Eje secundario",
    titulo: "En el centro vertical",
    cajas: 3,
    base: PISTA,
    solucion: ".pista { align-items: center; }",
    inicial: reglaVacia(),
  },
  {
    bloque: "Eje secundario",
    titulo: "Centro perfecto",
    cajas: 1,
    ancho: 70,
    alto: 70,
    base: PISTA,
    solucion: ".pista { justify-content: center; align-items: center; }",
    inicial: reglaVacia(),
  },
  {
    bloque: "Dirección",
    titulo: "Fila invertida",
    cajas: 3,
    base: PISTA,
    solucion: ".pista { flex-direction: row-reverse; }",
    inicial: reglaVacia(),
  },
  {
    bloque: "Dirección",
    titulo: "En columna",
    cajas: 3,
    alto: 44,
    base: PISTA,
    solucion: ".pista { flex-direction: column; }",
    inicial: reglaVacia(),
  },
  {
    bloque: "Dirección",
    titulo: "Los ejes se cruzan",
    cajas: 3,
    alto: 44,
    base: PISTA,
    solucion: ".pista { flex-direction: column; justify-content: flex-end; align-items: center; }",
    inicial: reglaVacia(),
  },
  {
    bloque: "Elementos sueltos",
    titulo: "Cambiar el orden",
    cajas: 4,
    base: PISTA,
    solucion: "#c3 { order: -1; }",
    inicial: reglaVacia("#c3"),
  },
  {
    bloque: "Elementos sueltos",
    titulo: "Una caja rebelde",
    cajas: 3,
    base: PISTA,
    solucion: "#c2 { align-self: flex-end; }",
    inicial: reglaVacia("#c2"),
  },
  {
    bloque: "Elementos sueltos",
    titulo: "Hueco entre cajas",
    cajas: 4,
    base: PISTA,
    solucion: ".pista { gap: 24px; }",
    inicial: reglaVacia(),
  },
  {
    bloque: "Elementos sueltos",
    titulo: "Repartirse el sitio",
    cajas: 3,
    base: PISTA,
    solucion: ".caja { flex: 1; }",
    inicial: reglaVacia(".caja"),
  },
  {
    bloque: "Varias líneas",
    titulo: "Saltar de línea",
    cajas: 7,
    ancho: 80,
    base: PISTA,
    solucion: ".pista { flex-wrap: wrap; }",
    inicial: reglaVacia(),
  },
  {
    bloque: "Varias líneas",
    titulo: "Reparto de líneas",
    cajas: 6,
    ancho: 110,
    base: `.pista {\n  display: flex;\n  flex-wrap: wrap;\n}`,
    solucion: ".pista { align-content: space-between; }",
    inicial: reglaVacia(),
  },
  {
    bloque: "Reto final",
    titulo: "Menú con logo",
    cajas: 4,
    ancho: 54,
    alto: 54,
    base: PISTA,
    solucion: ".pista { align-items: center; } #c2 { margin-left: auto; }",
    inicial: `.pista {\n  \n}\n\n#c2 {\n  \n}\n`,
  },
];

// ---------------------------------------------------------------------------------------------

export const ANCHO_PISTA = 300;
export const ALTO_PISTA = 240;

/** Documento de una escena: la pista con sus cajas y, aparte, el CSS del alumno (o la solución). */
export function documentoFlex(n: NivelFlex): string {
  const colores = ["#4a2fb5", "#da251c", "#1f9d4d", "#d98e04", "#0b7fa8", "#a23bb5", "#5b6b00"];
  const cajas = Array.from({ length: n.cajas }, (_, i) => `<div class="caja" id="c${i + 1}">${i + 1}</div>`).join("");
  const estilosCajas = colores.map((c, i) => `.caja:nth-child(${colores.length}n+${i + 1}){background:${c}}`).join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;background:#fff}
    .pista{width:${ANCHO_PISTA}px;height:${ALTO_PISTA}px;box-sizing:border-box;background:#ece8fb;border:2px solid #b9b0ea}
    .caja{width:${n.ancho === 0 ? "auto" : `${n.ancho ?? 50}px`};height:${n.alto === 0 ? "auto" : `${n.alto ?? 50}px`};min-height:${n.alto === 0 ? "34px" : "0"};box-sizing:border-box;border-radius:8px;color:#fff;font:700 18px Arial,sans-serif;display:grid;place-items:center}
    ${estilosCajas}
  </style><style id="base">${n.base}</style><style id="u"></style></head><body><div class="pista">${cajas}</div></body></html>`;
}

/** Posiciones de la pista y de las cajas, relativas a la pista. */
export function medir(marco: HTMLIFrameElement): number[][] | null {
  const doc = marco.contentDocument;
  const pista = doc?.querySelector(".pista");
  if (!doc || !pista) return null;
  const p = pista.getBoundingClientRect();
  return [...doc.querySelectorAll(".caja")].map((c) => {
    const r = c.getBoundingClientRect();
    return [r.left - p.left, r.top - p.top, r.width, r.height];
  });
}

export function mismaDisposicion(a: number[][] | null, b: number[][] | null): boolean {
  if (!a || !b || a.length !== b.length) return false;
  return a.every((r, i) => r.every((v, j) => Math.abs(v - b[i][j]) < 1));
}

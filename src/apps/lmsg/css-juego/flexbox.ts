// Niveles de «Flexbox». El alumno escribe CSS y las cajas deben acabar donde están en el objetivo.
// Se comparan las POSICIONES reales que calcula el navegador, así que vale cualquier CSS que dé
// el mismo resultado. Todo ocurre en iframes aislados (sandbox, sin scripts).

export interface NivelFlex {
  titulo: string;
  bloque: string;
  /** explicación breve de lo nuevo (HTML) */
  teoria: string;
  /** cuántas cajas (ids c1, c2…) */
  cajas: number;
  /** tamaño de cada caja en px */
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
    teoria: `Con <code>display: flex</code> en el contenedor, sus hijos pasan de apilarse a colocarse <b>en fila</b>.`,
    cajas: 3,
    base: "",
    solucion: ".pista { display: flex; }",
    inicial: reglaVacia(),
  },
  {
    bloque: "Eje principal",
    titulo: "Al final de la fila",
    teoria: `<code>justify-content</code> reparte los elementos a lo largo del <b>eje principal</b> (en una fila, el horizontal). <code>flex-end</code> los lleva al final.`,
    cajas: 3,
    base: PISTA,
    solucion: ".pista { justify-content: flex-end; }",
    inicial: reglaVacia(),
  },
  {
    bloque: "Eje principal",
    titulo: "Centrados",
    teoria: `<code>justify-content: center</code> los junta en el centro.`,
    cajas: 3,
    base: PISTA,
    solucion: ".pista { justify-content: center; }",
    inicial: reglaVacia(),
  },
  {
    bloque: "Eje principal",
    titulo: "Espacio entre cajas",
    teoria: `<code>space-between</code> reparte el espacio sobrante <b>entre</b> los elementos: el primero pegado al principio y el último al final.`,
    cajas: 4,
    base: PISTA,
    solucion: ".pista { justify-content: space-between; }",
    inicial: reglaVacia(),
  },
  {
    bloque: "Eje principal",
    titulo: "Espacio alrededor",
    teoria: `<code>space-around</code> deja el mismo espacio a cada lado de cada elemento; <code>space-evenly</code> reparte los huecos exactamente iguales. Aquí: <b>space-around</b>.`,
    cajas: 3,
    base: PISTA,
    solucion: ".pista { justify-content: space-around; }",
    inicial: reglaVacia(),
  },
  {
    bloque: "Eje secundario",
    titulo: "Abajo",
    teoria: `<code>align-items</code> coloca los elementos en el <b>eje secundario</b> (en una fila, el vertical). <code>flex-end</code> los baja al fondo.`,
    cajas: 3,
    base: PISTA,
    solucion: ".pista { align-items: flex-end; }",
    inicial: reglaVacia(),
  },
  {
    bloque: "Eje secundario",
    titulo: "En el centro vertical",
    teoria: `<code>align-items: center</code> los centra en vertical.`,
    cajas: 3,
    base: PISTA,
    solucion: ".pista { align-items: center; }",
    inicial: reglaVacia(),
  },
  {
    bloque: "Eje secundario",
    titulo: "Centro perfecto",
    teoria: `Para centrar algo en los <b>dos ejes</b> se combinan <code>justify-content</code> y <code>align-items</code>. El truco más usado de Flexbox.`,
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
    teoria: `<code>flex-direction</code> cambia la dirección del eje principal. <code>row-reverse</code> invierte el orden: mira los números de las cajas.`,
    cajas: 3,
    base: PISTA,
    solucion: ".pista { flex-direction: row-reverse; }",
    inicial: reglaVacia(),
  },
  {
    bloque: "Dirección",
    titulo: "En columna",
    teoria: `Con <code>flex-direction: column</code> el eje principal pasa a ser <b>vertical</b>.`,
    cajas: 3,
    alto: 44,
    base: PISTA,
    solucion: ".pista { flex-direction: column; }",
    inicial: reglaVacia(),
  },
  {
    bloque: "Dirección",
    titulo: "Los ejes se cruzan",
    teoria: `En columna, <code>justify-content</code> actúa en <b>vertical</b> y <code>align-items</code> en <b>horizontal</b>: los ejes se intercambian. Lleva las cajas abajo y centradas.`,
    cajas: 3,
    alto: 44,
    base: PISTA,
    solucion: ".pista { flex-direction: column; justify-content: flex-end; align-items: center; }",
    inicial: reglaVacia(),
  },
  {
    bloque: "Elementos sueltos",
    titulo: "Cambiar el orden",
    teoria: `<code>order</code> se pone en el <b>hijo</b>. Por defecto vale 0; los menores van antes. Pon la caja 3 la primera con un valor negativo.`,
    cajas: 4,
    base: PISTA,
    solucion: "#c3 { order: -1; }",
    inicial: reglaVacia("#c3"),
  },
  {
    bloque: "Elementos sueltos",
    titulo: "Una caja rebelde",
    teoria: `<code>align-self</code> es como <code>align-items</code> pero para <b>un solo hijo</b>. Baja solo la caja 2 al fondo.`,
    cajas: 3,
    base: PISTA,
    solucion: "#c2 { align-self: flex-end; }",
    inicial: reglaVacia("#c2"),
  },
  {
    bloque: "Elementos sueltos",
    titulo: "Hueco entre cajas",
    teoria: `<code>gap</code> en el contenedor deja un hueco fijo entre los hijos, sin tocar los márgenes. Pon <b>24px</b>.`,
    cajas: 4,
    base: PISTA,
    solucion: ".pista { gap: 24px; }",
    inicial: reglaVacia(),
  },
  {
    bloque: "Elementos sueltos",
    titulo: "Repartirse el sitio",
    teoria: `<code>flex: 1</code> en los hijos les dice que <b>crezcan</b> para ocupar el espacio libre a partes iguales. Haz que las cajas llenen toda la fila.`,
    cajas: 3,
    base: PISTA,
    solucion: ".caja { flex: 1; }",
    inicial: reglaVacia(".caja"),
  },
  {
    bloque: "Varias líneas",
    titulo: "Saltar de línea",
    teoria: `Por defecto Flexbox encoge los elementos para que quepan en una sola línea. Con <code>flex-wrap: wrap</code> los que no caben pasan a la línea siguiente.`,
    cajas: 7,
    ancho: 80,
    base: PISTA,
    solucion: ".pista { flex-wrap: wrap; }",
    inicial: reglaVacia(),
  },
  {
    bloque: "Varias líneas",
    titulo: "Reparto de líneas",
    teoria: `Cuando hay varias líneas, <code>align-content</code> las reparte en el eje secundario (como <code>justify-content</code>, pero para las líneas). Separa las líneas con <code>space-between</code>.`,
    cajas: 6,
    ancho: 110,
    base: `.pista {\n  display: flex;\n  flex-wrap: wrap;\n}`,
    solucion: ".pista { align-content: space-between; }",
    inicial: reglaVacia(),
  },
  {
    bloque: "Reto final",
    titulo: "Menú con logo",
    teoria: `Cuatro cajas: la <b>1</b> (el logo) a la izquierda y las otras tres a la derecha, todas centradas en vertical. Pista: en Flexbox un <code>margin-left: auto</code> empuja un elemento hasta el borde opuesto.`,
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
    .caja{width:${n.ancho ?? 50}px;height:${n.alto ?? 50}px;box-sizing:border-box;border-radius:8px;color:#fff;font:700 18px Arial,sans-serif;display:grid;place-items:center}
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

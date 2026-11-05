// Curvas de una variable para las demos didácticas de «Descenso»: se pintan en un canvas, con la bola, la
// tangente (la pendiente), la flecha de «hacia dónde bajar» y el camino recorrido. Con `niebla` solo se ve el
// terreno cercano a la bola, como al andar por una montaña con niebla.

export interface Curva {
  f(x: number): number;
  /** derivada = pendiente */
  df(x: number): number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

export const ANCHO = 560;
export const ALTO = 250;

export const PARABOLA: Curva = { f: (x) => x * x, df: (x) => 2 * x, x0: -4, x1: 4, y0: -1, y1: 17 };

/** Dos valles: el de la izquierda (x ≈ −2,13) es el más profundo; el de la derecha (x ≈ 1,82) es un mínimo local */
export const DOS_VALLES: Curva = { f: (x) => x ** 4 / 16 - (x * x) / 2 + 0.3 * x, df: (x) => x ** 3 / 4 - x + 0.3, x0: -3.5, x1: 3.5, y0: -2.4, y1: 4.8 };
export const X_VALLE_HONDO = -2.13;

export const UN_VALLE: Curva = { f: (x) => 0.3 * (x - 1) ** 2 + 0.2, df: (x) => 0.6 * (x - 1), x0: -4, x1: 4, y0: -0.5, y1: 8.2 };

export interface OpcionesCurva {
  x: number;
  camino?: number[];
  tangente?: boolean;
  flecha?: boolean;
  niebla?: boolean;
  /** x de los mínimos a marcar con una ✕ */
  minimos?: number[];
}

export function pintarCurva(c: HTMLCanvasElement, k: Curva, o: OpcionesCurva): void {
  const cx = c.getContext("2d")!;
  const [W, H] = [c.width, c.height];
  const px = (x: number) => ((x - k.x0) / (k.x1 - k.x0)) * W;
  const py = (y: number) => Math.max(-20, Math.min(H + 20, (1 - (y - k.y0) / (k.y1 - k.y0)) * H));
  cx.clearRect(0, 0, W, H);
  cx.fillStyle = o.niebla ? "#e6e3f3" : "#fff";
  cx.fillRect(0, 0, W, H);
  // eje x
  if (k.y0 < 0 && k.y1 > 0) {
    cx.strokeStyle = "#e4e0f7";
    cx.lineWidth = 1;
    cx.beginPath();
    cx.moveTo(0, py(0));
    cx.lineTo(W, py(0));
    cx.stroke();
  }
  // curva (con niebla, solo la parte cercana)
  const alcance = o.niebla ? 0.7 : Infinity;
  cx.strokeStyle = "#2a1770";
  cx.lineWidth = 3;
  cx.lineJoin = "round";
  cx.beginPath();
  let abierto = false;
  for (let i = 0; i <= 240; i++) {
    const x = k.x0 + (i / 240) * (k.x1 - k.x0);
    if (Math.abs(x - o.x) > alcance) {
      abierto = false;
      continue;
    }
    if (abierto) cx.lineTo(px(x), py(k.f(x)));
    else cx.moveTo(px(x), py(k.f(x)));
    abierto = true;
  }
  cx.stroke();
  for (const m of o.minimos ?? []) {
    cx.strokeStyle = "#1f9d4d";
    cx.lineWidth = 2;
    const [mx, my] = [px(m), py(k.f(m))];
    cx.beginPath();
    cx.moveTo(mx - 6, my + 12);
    cx.lineTo(mx + 6, my + 24);
    cx.moveTo(mx + 6, my + 12);
    cx.lineTo(mx - 6, my + 24);
    cx.stroke();
  }
  // camino recorrido
  (o.camino ?? []).forEach((x, i, a) => {
    if (i === a.length - 1) return;
    cx.beginPath();
    cx.arc(px(x), py(k.f(x)), 4, 0, 7);
    cx.fillStyle = `rgba(42, 23, 112, ${0.25 + (0.5 * i) / a.length})`;
    cx.fill();
  });
  const [bx, by] = [px(o.x), py(k.f(o.x))];
  const pendiente = k.df(o.x);
  // tangente: en píxeles, la pendiente se invierte (eje y hacia abajo) y se reescala
  if (o.tangente) {
    const dx = 0.9;
    cx.strokeStyle = "#e8a200";
    cx.lineWidth = 2.5;
    cx.beginPath();
    cx.moveTo(px(o.x - dx), py(k.f(o.x) - pendiente * dx));
    cx.lineTo(px(o.x + dx), py(k.f(o.x) + pendiente * dx));
    cx.stroke();
  }
  if (o.flecha && Math.abs(pendiente) > 0.05) {
    const dir = -Math.sign(pendiente);
    const largo = 56;
    const yf = by - 26;
    cx.strokeStyle = "#1f9d4d";
    cx.fillStyle = "#1f9d4d";
    cx.lineWidth = 4;
    cx.beginPath();
    cx.moveTo(bx, yf);
    cx.lineTo(bx + dir * largo, yf);
    cx.stroke();
    cx.beginPath();
    cx.moveTo(bx + dir * (largo + 10), yf);
    cx.lineTo(bx + dir * (largo - 4), yf - 8);
    cx.lineTo(bx + dir * (largo - 4), yf + 8);
    cx.fill();
  }
  cx.beginPath();
  cx.arc(bx, by, 9, 0, 7);
  cx.fillStyle = "#da251c";
  cx.fill();
  cx.strokeStyle = "#fff";
  cx.lineWidth = 2.5;
  cx.stroke();
}

/** Arrastrar (o pulsar) sobre el canvas elige una x; devuelve la función que quita los eventos */
export function arrastrable(c: HTMLCanvasElement, k: Curva, alMover: (x: number) => void): void {
  let arrastrando = false;
  const xDe = (e: PointerEvent) => {
    const r = c.getBoundingClientRect();
    return Math.max(k.x0, Math.min(k.x1, k.x0 + ((e.clientX - r.left) / r.width) * (k.x1 - k.x0)));
  };
  c.style.touchAction = "none";
  c.addEventListener("pointerdown", (e) => {
    arrastrando = true;
    c.setPointerCapture(e.pointerId);
    alMover(xDe(e));
  });
  c.addEventListener("pointermove", (e) => {
    if (arrastrando) alMover(xDe(e));
  });
  const fin = () => (arrastrando = false);
  c.addEventListener("pointerup", fin);
  c.addEventListener("pointercancel", fin);
}

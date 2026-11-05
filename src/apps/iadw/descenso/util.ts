// Utilidades compartidas de «Descenso»: formato de números, gráfica de la pérdida, escala logarítmica de la tasa
// de aprendizaje y el bucle de entrenamiento con temporizador.

export const fmt = (n: number, d = 3) => (Math.abs(n) >= 1e5 || (n !== 0 && Math.abs(n) < 1e-3) ? n.toExponential(2) : n.toFixed(d)).replace(".", ",");

export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Curva de pérdida en escala logarítmica */
export function pintarPerdida(lienzo: HTMLCanvasElement, v: number[]): void {
  const cx = lienzo.getContext("2d")!;
  const [W, H] = [lienzo.width, lienzo.height];
  cx.clearRect(0, 0, W, H);
  cx.fillStyle = "#fff";
  cx.fillRect(0, 0, W, H);
  cx.strokeStyle = "#ddd8f5";
  cx.strokeRect(0.5, 0.5, W - 1, H - 1);
  if (v.length < 2) return;
  const l = v.map((x) => Math.log10(Math.max(x, 1e-12)));
  const hi = Math.min(Math.max(...l), 8);
  const lo = Math.min(...l);
  const rango = hi - lo || 1;
  cx.beginPath();
  l.forEach((y, i) => {
    const px = 6 + (i / (l.length - 1)) * (W - 12);
    const py = 6 + (1 - (Math.min(y, hi) - lo) / rango) * (H - 12);
    if (i) cx.lineTo(px, py);
    else cx.moveTo(px, py);
  });
  cx.strokeStyle = "#2a1770";
  cx.lineWidth = 2;
  cx.stroke();
}

/** Deslizador (0–100) ↔ valor en escala logarítmica entre `min` y `max` */
export function escalaLog(min: number, max: number) {
  return {
    de: (v: number) => min * (max / min) ** (v / 100),
    a: (x: number) => (Math.log(x / min) / Math.log(max / min)) * 100,
  };
}

/** Bucle de entrenamiento: `paso()` devuelve false cuando hay que parar (converge, diverge o límite) */
export function crearBucle(paso: () => boolean, pintar: () => void) {
  let timer = 0;
  const parar = () => {
    window.clearInterval(timer);
    timer = 0;
  };
  return {
    parar,
    get corriendo() {
      return timer !== 0;
    },
    iniciar(porTic: number) {
      parar();
      timer = window.setInterval(() => {
        for (let i = 0; i < porTic; i++) {
          if (!paso()) {
            parar();
            break;
          }
        }
        pintar();
      }, 50);
      pintar();
    },
    uno() {
      parar();
      paso();
      pintar();
    },
  };
}

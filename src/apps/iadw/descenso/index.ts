import type { AppDef } from "../../../kernel/kernel";
import { FUNCIONES, OPTIMIZADORES, Optimizador, ajusteExacto, datosRecta, ecm, gradRecta, norma, type Dom, type Funcion, type Punto, type TipoOpt, type Vec } from "./matematica";

const LADO = 360;
const MAX_PASOS = 3000;
const fmt = (n: number, d = 3) => (Math.abs(n) >= 1e5 || (n !== 0 && Math.abs(n) < 1e-3) ? n.toExponential(2) : n.toFixed(d)).replace(".", ",");

// tasa de aprendizaje: deslizador logarítmico de 0,001 a 1
const lrDe = (v: number) => 10 ** (-3 + (3 * v) / 100);
const vDe = (lr: number) => ((Math.log10(lr) + 3) / 3) * 100;

type Estado = "listo" | "corriendo" | "converge" | "diverge" | "limite";

/** Mapa de colores de una función de dos variables: bandas de nivel sobre escala logarítmica (azul = bajo, amarillo = alto) */
function mapaCalor(f: (x: number, y: number) => number, dom: Dom): HTMLCanvasElement {
  const n = 180;
  const valores = new Float32Array(n * n);
  let min = Infinity;
  let max = -Infinity;
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) {
      const v = f(dom.x0 + ((i + 0.5) / n) * (dom.x1 - dom.x0), dom.y1 - ((j + 0.5) / n) * (dom.y1 - dom.y0));
      const vf = Math.fround(v);
      valores[j * n + i] = vf;
      if (vf < min) min = vf;
      if (vf > max) max = vf;
    }
  const c = document.createElement("canvas");
  c.width = c.height = n;
  const cx = c.getContext("2d")!;
  const img = cx.createImageData(n, n);
  const escala = Math.log1p(max - min) || 1;
  const paleta: [number, number, number][] = [[27, 20, 100], [30, 120, 160], [90, 190, 150], [255, 227, 138]];
  for (let k = 0; k < n * n; k++) {
    const t = Math.min(1, Math.max(0, Math.log1p(valores[k] - min) / escala));
    const s = Math.min(0.999, t) * 3;
    const a = Math.floor(s);
    const u = s - a;
    const banda = (t * 12) % 1;
    const sombra = banda < 0.07 ? 0.78 : 1;
    for (let ch = 0; ch < 3; ch++) img.data[k * 4 + ch] = (paleta[a][ch] * (1 - u) + paleta[a + 1][ch] * u) * sombra;
    img.data[k * 4 + 3] = 255;
  }
  cx.putImageData(img, 0, 0);
  return c;
}

const aPx = (p: Vec, dom: Dom): Vec => [((p[0] - dom.x0) / (dom.x1 - dom.x0)) * LADO, (1 - (p[1] - dom.y0) / (dom.y1 - dom.y0)) * LADO];

function pintarMapa(lienzo: HTMLCanvasElement, mapa: HTMLCanvasElement, dom: Dom, camino: Vec[], minimos: Vec[], optimos: Vec[] = []): void {
  const cx = lienzo.getContext("2d")!;
  cx.imageSmoothingEnabled = true;
  cx.drawImage(mapa, 0, 0, LADO, LADO);
  for (const m of minimos.concat(optimos)) {
    const [x, y] = aPx(m, dom);
    cx.strokeStyle = "#fff";
    cx.lineWidth = 2;
    cx.beginPath();
    cx.moveTo(x - 6, y - 6);
    cx.lineTo(x + 6, y + 6);
    cx.moveTo(x + 6, y - 6);
    cx.lineTo(x - 6, y + 6);
    cx.stroke();
  }
  if (!camino.length) return;
  cx.lineJoin = "round";
  for (const [ancho, col] of [[4, "rgba(0,0,0,0.55)"], [2, "#fff"]] as const) {
    cx.beginPath();
    camino.forEach((p, i) => {
      const [x, y] = aPx(p, dom);
      if (i) cx.lineTo(x, y);
      else cx.moveTo(x, y);
    });
    cx.lineWidth = ancho;
    cx.strokeStyle = col;
    cx.stroke();
  }
  const [x, y] = aPx(camino[camino.length - 1], dom);
  cx.beginPath();
  cx.arc(x, y, 6, 0, 7);
  cx.fillStyle = "#da251c";
  cx.fill();
  cx.strokeStyle = "#fff";
  cx.lineWidth = 2;
  cx.stroke();
  const [x0, y0] = aPx(camino[0], dom);
  cx.beginPath();
  cx.arc(x0, y0, 4, 0, 7);
  cx.fillStyle = "#fff";
  cx.fill();
}

/** Curva de pérdida en escala logarítmica */
function pintarPerdida(lienzo: HTMLCanvasElement, v: number[]): void {
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

export const descenso: AppDef = {
  id: "descenso",
  nombre: "Descenso",
  carpeta: "IADW",
  icono: `<svg viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="7" fill="#0d0b1e" stroke="#8fb4ff" stroke-width="2.5"/><path d="M9 14c8 0 10 22 15 22s7-22 15-22" fill="none" stroke="#6fd08c" stroke-width="2.5" stroke-linecap="round"/><circle cx="14" cy="22" r="3.4" fill="#da251c"/><path d="M17 26l4 6" stroke="#f7e26b" stroke-width="2" stroke-linecap="round" stroke-dasharray="1 4"/></svg>`,
  ancho: 720,
  alto: 720,
  iniciar({ ventana, raiz }) {
    raiz.classList.add("ds");
    raiz.innerHTML = `
      <div class="ds-tabs" role="tablist"><button data-m="paisaje">🏔 Paisaje</button><button data-m="recta">📈 Ajustar una recta</button></div>
      <div class="ds-cuerpo"></div>`;
    const cuerpo = raiz.querySelector<HTMLElement>(".ds-cuerpo")!;
    let limpiar: (() => void) | null = null;

    function abrir(m: "paisaje" | "recta"): void {
      limpiar?.();
      raiz.querySelectorAll<HTMLElement>("[data-m]").forEach((b) => b.classList.toggle("on", b.dataset.m === m));
      const caja = document.createElement("div");
      caja.className = "ds-modo";
      cuerpo.replaceChildren(caja);
      ventana.fijarTitulo(`Descenso · ${m === "paisaje" ? "Paisaje" : "Ajustar una recta"}`);
      limpiar = m === "paisaje" ? paisaje(caja) : recta(caja);
    }
    raiz.querySelector(".ds-tabs")!.addEventListener("click", (e) => {
      const m = (e.target as HTMLElement).dataset.m as "paisaje" | "recta" | undefined;
      if (m) abrir(m);
    });

    const opcionesOpt = (Object.keys(OPTIMIZADORES) as TipoOpt[]).map((t) => `<option value="${t}">${OPTIMIZADORES[t].nombre}</option>`).join("");
    const controlesLr = (lr: number) => `<label>Tasa de aprendizaje <input type="range" min="0" max="100" step="0.5" data-k="lr" value="${vDe(lr)}" aria-label="Tasa de aprendizaje" /> <b data-k="lr-n"></b></label>`;
    const botones = `<div class="ds-botones"><button class="ds-primario" data-k="play">▶ Iniciar</button><button data-k="paso">Un paso</button><button data-k="reiniciar">Reiniciar</button>
      <label class="ds-vel">Velocidad <select data-k="vel"><option value="1">Lenta</option><option value="3" selected>Normal</option><option value="12">Rápida</option></select></label></div>`;

    // ============ 1. Paisaje ============
    function paisaje(caja: HTMLElement): () => void {
      let fn: Funcion = FUNCIONES[0];
      let tipo: TipoOpt = "sgd";
      let lr = fn.lr;
      let pos: Vec = [...fn.inicio];
      let camino: Vec[] = [pos];
      let perdidas: number[] = [fn.f(...pos)];
      let opt = new Optimizador(tipo, lr);
      let estado: Estado = "listo";
      let timer = 0;
      let mapa = mapaCalor(fn.f, fn.dom);

      caja.innerHTML = `
        <div class="ds-controles">
          <label>Función <select data-k="fn">${FUNCIONES.map((f) => `<option value="${f.id}">${f.nombre}</option>`).join("")}</select></label>
          <label>Método <select data-k="opt">${opcionesOpt}</select></label>
          ${controlesLr(lr)}
        </div>
        ${botones}
        <p class="ds-formula" data-k="formula"></p>
        <div class="ds-fila">
          <div class="ds-col"><canvas class="ds-lienzo" data-k="mapa" width="${LADO}" height="${LADO}" aria-label="Mapa de la función; haz clic para elegir el punto de partida"></canvas><small>Clic en el mapa = nuevo punto de partida. ✕ = mínimo. Las bandas son niveles de la función.</small></div>
          <div class="ds-col">
            <div class="ds-datos" data-k="datos" aria-live="polite"></div>
            <canvas class="ds-curva" data-k="curva" width="320" height="110" aria-label="Pérdida en cada iteración"></canvas><small>Pérdida f(x, y) en cada iteración (escala logarítmica).</small>
            <p class="ds-msg" data-k="msg" aria-live="polite"></p>
          </div>
        </div>
        <p class="ds-idea" data-k="idea"></p>`;
      const q = <T extends HTMLElement>(k: string) => caja.querySelector<T>(`[data-k="${k}"]`)!;
      const lienzo = q<HTMLCanvasElement>("mapa");
      q<HTMLSelectElement>("fn").value = fn.id;

      function mensaje(): string {
        const [x, y] = pos;
        if (estado === "diverge") return "💥 <b>Diverge</b>: la tasa de aprendizaje es demasiado grande y cada paso se pasa más que el anterior. Redúcela y reinicia.";
        if (estado === "converge") {
          const cerca = fn.minimos.map((m) => Math.hypot(m[0] - x, m[1] - y));
          const k = cerca.indexOf(Math.min(...cerca));
          return `✓ <b>Converge</b> en ${camino.length - 1} pasos, cerca de (${fmt(fn.minimos[k][0], 2)}, ${fmt(fn.minimos[k][1], 2)}).`;
        }
        if (estado === "limite") return `⏹ Se alcanzó el límite de ${MAX_PASOS} pasos sin converger: con esta tasa avanza muy despacio. Prueba una más alta o un método con momento.`;
        return "";
      }

      function dibujar(): void {
        pintarMapa(lienzo, mapa, fn.dom, camino, fn.minimos);
        pintarPerdida(q<HTMLCanvasElement>("curva"), perdidas);
        const g = fn.grad(...pos);
        q("datos").innerHTML = `<span>Iteración <b>${camino.length - 1}</b></span><span>x = <b>${fmt(pos[0])}</b></span><span>y = <b>${fmt(pos[1])}</b></span><span>f = <b>${fmt(perdidas[perdidas.length - 1])}</b></span><span>|∇f| = <b>${fmt(norma(g))}</b></span>`;
        q("msg").innerHTML = mensaje();
        q("lr-n").textContent = fmt(lr, lr < 0.01 ? 4 : 3);
        q("formula").innerHTML = `<b>${fn.formula}</b>`;
        q("idea").textContent = `${fn.idea}  ·  ${OPTIMIZADORES[tipo].idea}`;
        const b = q<HTMLButtonElement>("play");
        b.textContent = estado === "corriendo" ? "⏸ Pausa" : "▶ Iniciar";
        b.disabled = estado === "converge" || estado === "diverge" || estado === "limite";
        q<HTMLButtonElement>("paso").disabled = b.disabled;
      }

      function parar(): void {
        window.clearInterval(timer);
        timer = 0;
      }

      function unPaso(): void {
        pos = opt.paso(pos, fn.grad(...pos));
        const f = fn.f(...pos);
        camino.push(pos);
        perdidas.push(f);
        if (!isFinite(f) || f > 1e8 || Math.abs(pos[0]) > 1e4 || Math.abs(pos[1]) > 1e4) {
          estado = "diverge";
          parar();
        } else if (camino.length > MAX_PASOS) {
          estado = "limite";
          parar();
        } else if (norma(fn.grad(...pos)) < 1e-4) {
          estado = "converge";
          parar();
        }
      }

      function avanzar(n: number): void {
        for (let i = 0; i < n && estado !== "converge" && estado !== "diverge" && estado !== "limite"; i++) unPaso();
        dibujar();
        if (estado !== "corriendo") parar();
      }

      function reiniciar(inicio: Vec = camino[0]): void {
        parar();
        pos = [...inicio];
        camino = [pos];
        perdidas = [fn.f(...pos)];
        opt = new Optimizador(tipo, lr);
        estado = "listo";
        dibujar();
      }

      function elegirFuncion(f: Funcion): void {
        fn = f;
        lr = f.lr;
        q<HTMLInputElement>("lr").value = String(vDe(lr));
        mapa = mapaCalor(fn.f, fn.dom);
        reiniciar([...f.inicio]);
      }

      caja.addEventListener("click", (e) => {
        const k = (e.target as HTMLElement).dataset.k;
        if (k === "play") {
          if (estado === "corriendo") {
            estado = "listo";
            parar();
            dibujar();
          } else {
            estado = "corriendo";
            const n = Number(q<HTMLSelectElement>("vel").value);
            timer = window.setInterval(() => avanzar(n), 50);
            dibujar();
          }
        } else if (k === "paso") {
          parar();
          if (estado === "corriendo") estado = "listo";
          avanzar(1);
        } else if (k === "reiniciar") reiniciar();
      });
      caja.addEventListener("change", (e) => {
        const t = e.target as HTMLSelectElement;
        if (t.dataset.k === "fn") elegirFuncion(FUNCIONES.find((f) => f.id === t.value)!);
        else if (t.dataset.k === "opt") {
          tipo = t.value as TipoOpt;
          reiniciar(camino[0]);
        } else if (t.dataset.k === "vel" && estado === "corriendo") {
          parar();
          timer = window.setInterval(() => avanzar(Number(t.value)), 50);
        }
      });
      caja.addEventListener("input", (e) => {
        const t = e.target as HTMLInputElement;
        if (t.dataset.k === "lr") {
          lr = lrDe(Number(t.value));
          opt.lr = lr;
          q("lr-n").textContent = fmt(lr, lr < 0.01 ? 4 : 3);
        }
      });
      lienzo.addEventListener("click", (e) => {
        const r = lienzo.getBoundingClientRect();
        const x = fn.dom.x0 + ((e.clientX - r.left) / r.width) * (fn.dom.x1 - fn.dom.x0);
        const y = fn.dom.y1 - ((e.clientY - r.top) / r.height) * (fn.dom.y1 - fn.dom.y0);
        reiniciar([x, y]);
      });
      dibujar();
      return parar;
    }

    // ============ 2. Ajustar una recta ============
    function recta(caja: HTMLElement): () => void {
      const DOM: Dom = { x0: -2, x1: 6, y0: -3, y1: 5 };
      let semilla = 7;
      let datos = datosRecta(semilla);
      let puntos: Punto[] = datos.puntos;
      let optimo: Vec = ajusteExacto(puntos);
      let tipo: TipoOpt = "sgd";
      let lr = 0.02;
      let lote = 20;
      let pos: Vec = [-1, 3];
      let camino: Vec[] = [pos];
      let perdidas: number[] = [ecm(puntos, ...pos)];
      let opt = new Optimizador(tipo, lr);
      let corriendo = false;
      let timer = 0;
      let mapa = mapaCalor((w, b) => ecm(puntos, w, b), DOM);

      caja.innerHTML = `
        <p class="ds-idea">Los datos siguen una recta <b>y = w·x + b</b> con ruido. Mueve <b>w</b> (pendiente) y <b>b</b> (ordenada) a mano para bajar el error, o deja que el descenso del gradiente lo haga por ti.</p>
        <div class="ds-fila">
          <div class="ds-col"><canvas class="ds-lienzo" data-k="datos-c" width="${LADO}" height="${LADO}" aria-label="Puntos y recta"></canvas><small>Puntos, tu recta (roja) y los errores (segmentos).</small></div>
          <div class="ds-col"><canvas class="ds-lienzo" data-k="mapa" width="${LADO}" height="${LADO}" aria-label="Error según w y b; haz clic para elegir w y b"></canvas><small>Error ECM según (w, b). Eje horizontal: w; vertical: b. Clic = poner la recta ahí. ✕ = solución exacta.</small></div>
        </div>
        <div class="ds-controles">
          <label>w <input type="range" min="-2" max="6" step="0.05" data-k="w" aria-label="Pendiente w" /> <b data-k="w-n"></b></label>
          <label>b <input type="range" min="-3" max="5" step="0.05" data-k="b" aria-label="Ordenada b" /> <b data-k="b-n"></b></label>
        </div>
        <div class="ds-controles">
          <label>Método <select data-k="opt">${opcionesOpt}</select></label>
          ${controlesLr(lr)}
          <label>Datos por paso <select data-k="lote"><option value="20">Todos (20)</option><option value="4">Mini-lote (4)</option><option value="1">Uno (SGD estocástico)</option></select></label>
        </div>
        ${botones}
        <div class="ds-datos" data-k="datos" aria-live="polite"></div>
        <canvas class="ds-curva" data-k="curva" width="680" height="90" aria-label="Error en cada iteración"></canvas>
        <p class="ds-msg" data-k="msg" aria-live="polite"></p>
        <div class="ds-botones"><button data-k="nuevos">🎲 Datos nuevos</button></div>`;
      const q = <T extends HTMLElement>(k: string) => caja.querySelector<T>(`[data-k="${k}"]`)!;
      const cDatos = q<HTMLCanvasElement>("datos-c");
      const cMapa = q<HTMLCanvasElement>("mapa");
      const ajustes: Dom = { x0: -4, x1: 4, y0: -10, y1: 10 };

      function dibujarDatos(): void {
        const cx = cDatos.getContext("2d")!;
        cx.fillStyle = "#fff";
        cx.fillRect(0, 0, LADO, LADO);
        cx.strokeStyle = "#e4e0f7";
        cx.lineWidth = 1;
        const [cx0] = aPx([0, 0], ajustes);
        const [, cy0] = aPx([0, 0], ajustes);
        cx.beginPath();
        cx.moveTo(cx0, 0);
        cx.lineTo(cx0, LADO);
        cx.moveTo(0, cy0);
        cx.lineTo(LADO, cy0);
        cx.stroke();
        const [w, b] = pos;
        for (const p of puntos) {
          const [px, py] = aPx([p.x, p.y], ajustes);
          const [, ry] = aPx([p.x, w * p.x + b], ajustes);
          cx.strokeStyle = "rgba(218, 37, 28, 0.45)";
          cx.beginPath();
          cx.moveTo(px, py);
          cx.lineTo(px, ry);
          cx.stroke();
        }
        cx.strokeStyle = "#da251c";
        cx.lineWidth = 3;
        cx.beginPath();
        const [ax, ay] = aPx([ajustes.x0, w * ajustes.x0 + b], ajustes);
        const [bx, by] = aPx([ajustes.x1, w * ajustes.x1 + b], ajustes);
        cx.moveTo(ax, ay);
        cx.lineTo(bx, by);
        cx.stroke();
        for (const p of puntos) {
          const [px, py] = aPx([p.x, p.y], ajustes);
          cx.beginPath();
          cx.arc(px, py, 4.5, 0, 7);
          cx.fillStyle = "#2a1770";
          cx.fill();
        }
      }

      function dibujar(): void {
        dibujarDatos();
        pintarMapa(cMapa, mapa, DOM, camino, [], [optimo]);
        pintarPerdida(q<HTMLCanvasElement>("curva"), perdidas);
        const e = perdidas[perdidas.length - 1];
        const eMin = ecm(puntos, ...optimo);
        q<HTMLInputElement>("w").value = String(Math.max(-2, Math.min(6, pos[0])));
        q<HTMLInputElement>("b").value = String(Math.max(-3, Math.min(5, pos[1])));
        q("w-n").textContent = fmt(pos[0], 2);
        q("b-n").textContent = fmt(pos[1], 2);
        q("lr-n").textContent = fmt(lr, lr < 0.01 ? 4 : 3);
        q("datos").innerHTML = `<span>Iteración <b>${camino.length - 1}</b></span><span>w = <b>${fmt(pos[0])}</b></span><span>b = <b>${fmt(pos[1])}</b></span><span>Error (ECM) = <b>${fmt(e)}</b></span><span>Mejor posible: <b>${fmt(eMin)}</b> con w = ${fmt(optimo[0], 2)}, b = ${fmt(optimo[1], 2)}</span>`;
        const cerca = Math.hypot(pos[0] - optimo[0], pos[1] - optimo[1]) < 0.05;
        q("msg").innerHTML = !isFinite(e) || e > 1e8 ? "💥 <b>Diverge</b>: la tasa es demasiado grande. Redúcela y reinicia." : cerca ? `✓ ¡Ya estás en la mejor recta! (la recta que generó los datos era w = ${fmt(datos.w, 1)}, b = ${fmt(datos.b, 1)}; el ruido hace que la óptima difiera un poco)` : "";
        const b2 = q<HTMLButtonElement>("play");
        b2.textContent = corriendo ? "⏸ Pausa" : "▶ Iniciar";
      }

      const parar = () => {
        window.clearInterval(timer);
        timer = 0;
        corriendo = false;
      };

      function paso(): void {
        const idx = puntos.map((_, i) => i);
        for (let i = idx.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [idx[i], idx[j]] = [idx[j], idx[i]];
        }
        const sub = lote >= puntos.length ? puntos : idx.slice(0, lote).map((i) => puntos[i]);
        pos = opt.paso(pos, gradRecta(sub, ...pos));
        camino.push(pos);
        perdidas.push(ecm(puntos, ...pos));
        const e = perdidas[perdidas.length - 1];
        if (!isFinite(e) || e > 1e8 || camino.length > MAX_PASOS || (lote >= puntos.length && norma(gradRecta(puntos, ...pos)) < 1e-4)) parar();
      }

      function colocar(w: number, b: number): void {
        parar();
        pos = [w, b];
        camino = [pos];
        perdidas = [ecm(puntos, w, b)];
        opt = new Optimizador(tipo, lr);
        dibujar();
      }

      function nuevos(): void {
        semilla++;
        datos = datosRecta(semilla);
        puntos = datos.puntos;
        optimo = ajusteExacto(puntos);
        mapa = mapaCalor((w, b) => ecm(puntos, w, b), DOM);
        colocar(-1, 3);
      }

      caja.addEventListener("click", (e) => {
        const k = (e.target as HTMLElement).dataset.k;
        if (k === "play") {
          if (corriendo) {
            parar();
            dibujar();
          } else {
            corriendo = true;
            const n = Number(q<HTMLSelectElement>("vel").value);
            timer = window.setInterval(() => {
              for (let i = 0; i < n && corriendo; i++) paso();
              dibujar();
            }, 50);
            dibujar();
          }
        } else if (k === "paso") {
          parar();
          paso();
          dibujar();
        } else if (k === "reiniciar") colocar(camino[0][0], camino[0][1]);
        else if (k === "nuevos") nuevos();
      });
      caja.addEventListener("change", (e) => {
        const t = e.target as HTMLSelectElement;
        if (t.dataset.k === "opt") {
          tipo = t.value as TipoOpt;
          colocar(camino[0][0], camino[0][1]);
        } else if (t.dataset.k === "lote") lote = Number(t.value);
      });
      caja.addEventListener("input", (e) => {
        const t = e.target as HTMLInputElement;
        if (t.dataset.k === "lr") {
          lr = lrDe(Number(t.value));
          opt.lr = lr;
          q("lr-n").textContent = fmt(lr, lr < 0.01 ? 4 : 3);
        } else if (t.dataset.k === "w") colocar(Number(t.value), pos[1]);
        else if (t.dataset.k === "b") colocar(pos[0], Number(t.value));
      });
      cMapa.addEventListener("click", (e) => {
        const r = cMapa.getBoundingClientRect();
        colocar(DOM.x0 + ((e.clientX - r.left) / r.width) * (DOM.x1 - DOM.x0), DOM.y1 - ((e.clientY - r.top) / r.height) * (DOM.y1 - DOM.y0));
      });
      dibujar();
      return parar;
    }

    abrir("paisaje");
    return () => limpiar?.();
  },
};

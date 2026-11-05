// Pestaña «Ejemplos» de Descenso: cuatro problemas donde se aplica el descenso del gradiente.
// 1) montaña a ciegas (intuición), 2) ajustar una recta (la de siempre), 3) ¿spam o no spam? (regresión logística)
// y 4) precio de un piso (regresión con dos variables y por qué se normalizan los datos).

import { ALTO, ANCHO, DOS_VALLES, UN_VALLE, X_VALLE_HONDO, pintarCurva, type Curva } from "./curvas";
import { azarConSemilla } from "./matematica";
import { crearBucle, escalaLog, fmt, pintarPerdida } from "./util";

const q = <T extends HTMLElement>(zona: HTMLElement, k: string) => zona.querySelector<T>(`[data-k="${k}"]`)!;

/** Marco común de cada ejemplo: qué problema es, qué aprende y qué error se reduce */
const intro = (problema: string, aprende: string, error: string) =>
  `<div class="ds-intro"><div><b>🎯 Problema</b>${problema}</div><div><b>🎛 Lo que aprende</b>${aprende}</div><div><b>📉 El error</b>${error}</div></div>`;

const mates = (html: string) => `<details class="ds-mates"><summary>🧮 Ver las matemáticas</summary><p>${html}</p></details>`;

// =====================================================================================================
// 1 · Montaña a ciegas
// =====================================================================================================
const UMBRAL = 0.25;

function montanaCiega(caja: HTMLElement): () => void {
  const terrenos: { nombre: string; curva: Curva; lr: number; inicios: number[]; minimos: number[] }[] = [
    { nombre: "Un valle", curva: UN_VALLE, lr: 1, inicios: [-3.2, 3.4, -1.6, 2.8], minimos: [1] },
    { nombre: "Dos valles", curva: DOS_VALLES, lr: 0.3, inicios: [3, -3, 2.6, -0.2], minimos: [X_VALLE_HONDO, 1.82] },
  ];
  let t = 0;
  let intento = 0;
  let x = 0;
  let pasos = 0;
  let camino: number[] = [];
  let niebla = true;
  let ayuda = false;

  caja.innerHTML = `${intro("Estás en una montaña con niebla y quieres llegar al punto más bajo.", "Tu posición <b>x</b>.", "La altura del terreno: cuanto más abajo, mejor.")}
    <div class="ds-controles"><label>Terreno <select data-k="terreno">${terrenos.map((r, i) => `<option value="${i}">${r.nombre}</option>`).join("")}</select></label>
    <label><input type="checkbox" data-k="ayuda" /> 💡 Mostrar la flecha de ayuda</label></div>
    <canvas class="ds-c1d" data-k="c" width="${ANCHO}" height="${ALTO}" aria-label="Terreno con niebla"></canvas>
    <div class="ds-botones"><button data-k="mover" data-d="-1">⏪ Izq. grande</button><button data-k="mover" data-d="-0.2">◀ Izq. pequeño</button><button data-k="mover" data-d="0.2">Der. pequeño ▶</button><button data-k="mover" data-d="1">Der. grande ⏩</button></div>
    <div class="ds-botones"><button class="ds-primario" data-k="gradiente">🧭 Un paso de gradiente</button><button data-k="revelar">🗺️ Quitar la niebla</button><button data-k="nueva">🔄 Nueva salida</button></div>
    <div class="ds-datos" data-k="datos" aria-live="polite"></div>
    <p class="ds-msg" data-k="msg" aria-live="polite"></p>
    ${mates("El «paso de gradiente» calcula la pendiente <code>f'(x)</code> y se mueve a <code>x ← x − η · f'(x)</code>. Tú, a ciegas, haces lo mismo a ojo: miras hacia dónde baja el suelo y eliges cuánto avanzar. La diferencia es que el gradiente ajusta el tamaño del paso a la pendiente solo.")}`;

  const c = q<HTMLCanvasElement>(caja, "c");
  const terreno = () => terrenos[t];
  const abajo = () => Math.abs(terreno().curva.df(x)) < UMBRAL;

  function simularGradiente(): number {
    let y = terreno().inicios[intento % terreno().inicios.length];
    let n = 0;
    while (Math.abs(terreno().curva.df(y)) >= UMBRAL && n < 500) {
      y -= terreno().lr * terreno().curva.df(y);
      n++;
    }
    return n;
  }

  function pintar(): void {
    const { curva } = terreno();
    pintarCurva(c, curva, { x, camino, tangente: true, flecha: ayuda, niebla, minimos: niebla ? [] : terreno().minimos });
    const p = curva.df(x);
    const suelo = Math.abs(p) < UMBRAL ? "es casi plano" : p > 0 ? "sube hacia la derecha ↗ (baja hacia la izquierda)" : "baja hacia la derecha ↘";
    q(caja, "datos").innerHTML = `<span>Pasos: <b>${pasos}</b></span><span>Altura aquí: <b>${fmt(curva.f(x), 2)}</b></span><span>Pendiente: <b>${fmt(p, 2)}</b></span><span>El suelo ${suelo}</span>`;
    let msg = "";
    if (abajo()) {
      const hondo = terreno().minimos.length < 2 || Math.abs(x - X_VALLE_HONDO) < 0.5;
      msg = `✓ Has llegado a un fondo en <b>${pasos}</b> pasos. ${!niebla ? "" : "Pulsa «Quitar la niebla» para comparar con el gradiente."}`;
      if (!niebla) msg += hondo ? ` El descenso del gradiente, desde tu mismo punto de salida, habría necesitado <b>${simularGradiente()}</b> pasos.` : ` ⚠ Pero es el valle <b>más alto</b>: hay otro más profundo.`;
    } else if (!niebla) msg = "Sin niebla ves todo el terreno, pero el método solo tiene la pendiente local.";
    q(caja, "msg").innerHTML = msg;
  }

  function nueva(): void {
    intento++;
    x = terreno().inicios[intento % terreno().inicios.length];
    pasos = 0;
    camino = [x];
    niebla = true;
    pintar();
  }

  caja.addEventListener("click", (e) => {
    const b = e.target as HTMLElement;
    const k = b.dataset.k;
    if (k === "mover") {
      x = Math.max(terreno().curva.x0, Math.min(terreno().curva.x1, x + Number(b.dataset.d)));
      pasos++;
      camino.push(x);
    } else if (k === "gradiente") {
      x = Math.max(terreno().curva.x0, Math.min(terreno().curva.x1, x - terreno().lr * terreno().curva.df(x)));
      pasos++;
      camino.push(x);
    } else if (k === "revelar") niebla = false;
    else if (k === "nueva") return nueva();
    else return;
    pintar();
  });
  caja.addEventListener("change", (e) => {
    const s = e.target as HTMLInputElement | HTMLSelectElement;
    if (s.dataset.k === "terreno") {
      t = Number(s.value);
      nueva();
    } else if (s.dataset.k === "ayuda") {
      ayuda = (s as HTMLInputElement).checked;
      pintar();
    }
  });
  x = terreno().inicios[0];
  camino = [x];
  pintar();
  return () => {};
}

// =====================================================================================================
// 3 · ¿Spam o no spam? (regresión logística con dos pistas)
// =====================================================================================================
interface Correo {
  a: number; // palabras sospechosas («gratis», «premio», «urgente»…)
  b: number; // enlaces
  spam: 0 | 1;
}

function crearCorreos(semilla: number): Correo[] {
  const az = azarConSemilla(semilla);
  const gauss = () => (az() + az() + az() + az() - 2) * 1.7;
  const r = (v: number) => Math.round(Math.max(0, Math.min(6, v)) * 10) / 10;
  const lista: Correo[] = [];
  for (let i = 0; i < 20; i++) lista.push({ a: r(3.4 + gauss()), b: r(3.2 + gauss() * 1.2), spam: 1 });
  for (let i = 0; i < 20; i++) lista.push({ a: r(1 + gauss() * 0.9), b: r(1.1 + gauss()), spam: 0 });
  return lista;
}

const sigmoide = (z: number) => 1 / (1 + Math.exp(-z));

function spam(caja: HTMLElement): () => void {
  const LIM = 6.5;
  const LADO = 360;
  const esc = escalaLog(0.01, 3);
  let semilla = 11;
  let correos = crearCorreos(semilla);
  let w1 = 0;
  let w2 = 0;
  let b0 = 0;
  let lr = 0.3;
  let perdidas: number[] = [];
  let pasos = 0;
  let estado: "listo" | "converge" | "limite" = "listo";
  let ta = 4;
  let tb = 3.5;

  const perdida = () => -correos.reduce((s, c) => s + (c.spam ? Math.log(Math.max(1e-12, sigmoide(w1 * c.a + w2 * c.b + b0))) : Math.log(Math.max(1e-12, 1 - sigmoide(w1 * c.a + w2 * c.b + b0)))), 0) / correos.length;
  const aciertos = () => correos.filter((c) => (sigmoide(w1 * c.a + w2 * c.b + b0) > 0.5 ? 1 : 0) === c.spam).length;

  caja.innerHTML = `${intro("Decidir si un correo es <b>spam</b> o no, mirando cuántas palabras sospechosas tiene («gratis», «premio», «urgente»…) y cuántos enlaces.", "Tres números: el <b>peso</b> de cada pista (w₁, w₂) y un <b>sesgo</b> b. Con ellos calcula la probabilidad de spam.", "Cuánto se equivoca al clasificar (entropía cruzada): castiga mucho estar muy seguro y fallar.")}
    <div class="ds-fila">
      <div class="ds-col"><canvas class="ds-lienzo" data-k="mapa" width="${LADO}" height="${LADO}" aria-label="Correos y frontera de decisión"></canvas>
        <small>🔴 spam · 🟢 no spam. El fondo es lo que piensa el modelo (rojo = spam) y la línea negra, su frontera. ⭐ = el correo que pruebas.</small></div>
      <div class="ds-col">
        <div class="ds-datos" data-k="datos" aria-live="polite"></div>
        <canvas class="ds-curva" data-k="curva" width="320" height="110" aria-label="Pérdida en cada iteración"></canvas><small>Pérdida en cada iteración.</small>
        <div class="ds-pesos" data-k="pesos"></div>
        <p class="ds-msg" data-k="msg" aria-live="polite"></p>
      </div>
    </div>
    <div class="ds-controles"><label>Tasa de aprendizaje <input type="range" min="0" max="100" step="0.5" data-k="lr" aria-label="Tasa de aprendizaje" /> <b data-k="lrn"></b></label></div>
    <div class="ds-botones"><button class="ds-primario" data-k="play">▶ Entrenar</button><button data-k="paso">Un paso</button><button data-k="reset">Reiniciar</button><button data-k="nuevos">🎲 Correos nuevos</button>
      <label class="ds-vel">Velocidad <select data-k="vel"><option value="1">Lenta</option><option value="5" selected>Normal</option><option value="25">Rápida</option></select></label></div>
    <div class="ds-prueba"><b>✉️ Prueba un correo</b>
      <label>Palabras sospechosas <input type="range" min="0" max="6" step="0.1" value="${ta}" data-k="ta" /> <b data-k="tan"></b></label>
      <label>Enlaces <input type="range" min="0" max="6" step="0.1" value="${tb}" data-k="tb" /> <b data-k="tbn"></b></label>
      <p class="ds-msg" data-k="veredicto" aria-live="polite"></p></div>
    ${mates("Probabilidad de spam: <code>p = σ(w₁·a + w₂·b + b₀)</code> con <code>σ(z) = 1/(1+e<sup>−z</sup>)</code>. Pérdida: <code>−media[ y·ln p + (1−y)·ln(1−p) ]</code>. Su gradiente es sorprendentemente simple: <code>∂/∂w₁ = media[(p − y)·a]</code>, y lo mismo para w₂ (con b) y b₀ (con 1). Cada correo mal clasificado «empuja» los pesos hacia el lado correcto, más fuerte cuanto más se equivoca.")}`;

  const cMapa = q<HTMLCanvasElement>(caja, "mapa");
  const px = (v: number) => (v / LIM) * LADO;
  const py = (v: number) => (1 - v / LIM) * LADO;
  const sliderLr = q<HTMLInputElement>(caja, "lr");
  sliderLr.value = String(esc.a(lr));

  function reiniciar(): void {
    bucle.parar();
    [w1, w2, b0] = [0, 0, 0];
    perdidas = [perdida()];
    pasos = 0;
    estado = "listo";
    pintar();
  }

  function paso(): boolean {
    let g1 = 0;
    let g2 = 0;
    let g0 = 0;
    for (const c of correos) {
      const e = sigmoide(w1 * c.a + w2 * c.b + b0) - c.spam;
      g1 += e * c.a;
      g2 += e * c.b;
      g0 += e;
    }
    const n = correos.length;
    w1 -= (lr * g1) / n;
    w2 -= (lr * g2) / n;
    b0 -= (lr * g0) / n;
    pasos++;
    perdidas.push(perdida());
    if (Math.hypot(g1, g2, g0) / n < 1e-3) {
      estado = "converge";
      return false;
    }
    if (pasos >= 5000) {
      estado = "limite";
      return false;
    }
    return true;
  }
  const bucle = crearBucle(paso, () => pintar());

  function pintar(): void {
    const cx = cMapa.getContext("2d")!;
    // fondo: lo que piensa el modelo
    const N = 48;
    const img = cx.createImageData(N, N);
    for (let j = 0; j < N; j++)
      for (let i = 0; i < N; i++) {
        const p = sigmoide(w1 * (((i + 0.5) / N) * LIM) + w2 * ((1 - (j + 0.5) / N) * LIM) + b0);
        const s = Math.abs(p - 0.5) * 2 * 0.75;
        const base = p > 0.5 ? [232, 98, 79] : [91, 191, 132];
        for (let ch = 0; ch < 3; ch++) img.data[(j * N + i) * 4 + ch] = 255 * (1 - s) + base[ch] * s;
        img.data[(j * N + i) * 4 + 3] = 255;
      }
    const tmp = document.createElement("canvas");
    tmp.width = tmp.height = N;
    tmp.getContext("2d")!.putImageData(img, 0, 0);
    cx.imageSmoothingEnabled = true;
    cx.drawImage(tmp, 0, 0, LADO, LADO);
    // frontera p = 0,5
    if (Math.abs(w1) + Math.abs(w2) > 1e-6) {
      cx.strokeStyle = "#111";
      cx.lineWidth = 2.5;
      cx.beginPath();
      if (Math.abs(w2) >= Math.abs(w1)) {
        cx.moveTo(px(0), py(-b0 / w2));
        cx.lineTo(px(LIM), py(-(w1 * LIM + b0) / w2));
      } else {
        cx.moveTo(px(-b0 / w1), py(0));
        cx.lineTo(px(-(w2 * LIM + b0) / w1), py(LIM));
      }
      cx.stroke();
    }
    for (const c of correos) {
      cx.beginPath();
      cx.arc(px(c.a), py(c.b), 6, 0, 7);
      cx.fillStyle = c.spam ? "#c0291a" : "#1f8a4c";
      cx.fill();
      cx.strokeStyle = "#fff";
      cx.lineWidth = 2;
      cx.stroke();
    }
    cx.font = "20px system-ui";
    cx.textAlign = "center";
    cx.textBaseline = "middle";
    cx.fillText("⭐", px(ta), py(tb));
    cx.font = "11px system-ui";
    cx.fillStyle = "#2a1770";
    cx.textAlign = "right";
    cx.fillText("palabras sospechosas →", LADO - 6, LADO - 8);
    cx.save();
    cx.translate(12, 8);
    cx.rotate(Math.PI / 2);
    cx.textAlign = "left";
    cx.fillText("enlaces →", 0, 0);
    cx.restore();

    pintarPerdida(q<HTMLCanvasElement>(caja, "curva"), perdidas);
    q(caja, "datos").innerHTML = `<span>Iteración <b>${pasos}</b></span><span>Pérdida <b>${fmt(perdidas[perdidas.length - 1])}</b></span><span>Aciertos <b>${aciertos()}/${correos.length}</b> (${Math.round((aciertos() / correos.length) * 100)} %)</span>`;
    const nombre = (w: number) => (Math.abs(w) < 0.05 ? "casi no influye" : w > 0 ? "más probable que sea spam" : "menos probable que sea spam");
    q(caja, "pesos").innerHTML = `<div>w₁ (palabras sospechosas) = <b>${fmt(w1, 2)}</b> → <small>${nombre(w1)}</small></div><div>w₂ (enlaces) = <b>${fmt(w2, 2)}</b> → <small>${nombre(w2)}</small></div><div>sesgo b = <b>${fmt(b0, 2)}</b></div>`;
    q(caja, "lrn").textContent = fmt(lr, lr < 0.1 ? 3 : 2);
    q(caja, "msg").innerHTML = estado === "converge" ? `✓ Ha aprendido a separarlos tras ${pasos} pasos. Fíjate: no llega al 100 %, porque algunos correos de cada tipo se parecen demasiado.` : estado === "limite" ? "⏹ Límite de pasos alcanzado." : "";
    const pr = sigmoide(w1 * ta + w2 * tb + b0);
    q(caja, "tan").textContent = fmt(ta, 1);
    q(caja, "tbn").textContent = fmt(tb, 1);
    q(caja, "veredicto").innerHTML = `Probabilidad de spam: <b>${Math.round(pr * 100)} %</b> → ${pr > 0.5 ? "🚫 <b>SPAM</b>" : "✅ correo normal"}${pasos === 0 ? " <small>(sin entrenar, el modelo duda de todo)</small>" : ""}`;
    const b = q<HTMLButtonElement>(caja, "play");
    b.textContent = bucle.corriendo ? "⏸ Pausa" : "▶ Entrenar";
    b.disabled = estado !== "listo";
    q<HTMLButtonElement>(caja, "paso").disabled = estado !== "listo";
  }

  caja.addEventListener("click", (e) => {
    const k = (e.target as HTMLElement).dataset.k;
    if (k === "play") {
      if (bucle.corriendo) {
        bucle.parar();
        pintar();
      } else bucle.iniciar(Number(q<HTMLSelectElement>(caja, "vel").value));
    } else if (k === "paso") bucle.uno();
    else if (k === "reset") reiniciar();
    else if (k === "nuevos") {
      semilla++;
      correos = crearCorreos(semilla);
      reiniciar();
    }
  });
  caja.addEventListener("input", (e) => {
    const t = e.target as HTMLInputElement;
    if (t.dataset.k === "lr") lr = esc.de(Number(t.value));
    else if (t.dataset.k === "ta") ta = Number(t.value);
    else if (t.dataset.k === "tb") tb = Number(t.value);
    else return;
    pintar();
  });
  caja.addEventListener("change", (e) => {
    const t = e.target as HTMLSelectElement;
    if (t.dataset.k === "vel" && bucle.corriendo) bucle.iniciar(Number(t.value));
  });
  reiniciar();
  return bucle.parar;
}

// =====================================================================================================
// 4 · Precio de un piso (dos variables) y por qué se normalizan los datos
// =====================================================================================================
interface Piso {
  m2: number;
  hab: number;
  precio: number; // miles de euros
}

function crearPisos(semilla: number): Piso[] {
  const az = azarConSemilla(semilla);
  return Array.from({ length: 30 }, () => {
    const m2 = Math.round(40 + az() * 120);
    const hab = Math.max(1, Math.min(6, Math.round(m2 / 35 + (az() - 0.5) * 2.2)));
    return { m2, hab, precio: Math.round(2.2 * m2 + 12 * hab + 30 + (az() + az() - 1) * 50) };
  });
}

function piso(caja: HTMLElement): () => void {
  const LADO = 360;
  const MAXP = 500;
  let semilla = 5;
  let pisos = crearPisos(semilla);
  const media = (f: (p: Piso) => number) => pisos.reduce((s, p) => s + f(p), 0) / pisos.length;
  let normalizar = true;
  let esc = escalaLog(1e-7, 1);
  let lr = 0.1;
  let w1 = 0;
  let w2 = 0;
  let b0 = 0;
  let perdidas: number[] = [];
  let pasos = 0;
  let estado: "listo" | "converge" | "diverge" | "limite" = "listo";
  let tm = 90;
  let th = 3;

  const stats = () => {
    const m1 = media((p) => p.m2);
    const m2 = media((p) => p.hab);
    return { m1, m2, s1: Math.sqrt(media((p) => (p.m2 - m1) ** 2)), s2: Math.sqrt(media((p) => (p.hab - m2) ** 2)) };
  };
  let st = stats();
  const feat = (p: Piso): [number, number] => (normalizar ? [(p.m2 - st.m1) / st.s1, (p.hab - st.m2) / st.s2] : [p.m2, p.hab]);
  const pred = (p: Piso) => {
    const [f1, f2] = feat(p);
    return w1 * f1 + w2 * f2 + b0;
  };
  const rmse = () => Math.sqrt(pisos.reduce((s, p) => s + (pred(p) - p.precio) ** 2, 0) / pisos.length);
  /** parámetros en unidades reales (mil € por m², por habitación y base) */
  const reales = () => (normalizar ? { m: w1 / st.s1, h: w2 / st.s2, c: b0 - (w1 * st.m1) / st.s1 - (w2 * st.m2) / st.s2 } : { m: w1, h: w2, c: b0 });

  caja.innerHTML = `${intro("Estimar el <b>precio de un piso</b> (en miles de euros) a partir de sus metros cuadrados y sus habitaciones.", "Tres números: cuánto suma cada <b>m²</b>, cuánto suma cada <b>habitación</b> y un precio <b>base</b>.", "La diferencia media entre el precio que predice y el real (en miles de €).")}
    <div class="ds-fila">
      <div class="ds-col"><canvas class="ds-lienzo" data-k="mapa" width="${LADO}" height="${LADO}" aria-label="Precio predicho frente a precio real"></canvas>
        <small>Cada punto es un piso: horizontal = lo que <b>predice</b> el modelo, vertical = el precio <b>real</b>. Si acierta, está sobre la diagonal.</small></div>
      <div class="ds-col">
        <div class="ds-datos" data-k="datos" aria-live="polite"></div>
        <canvas class="ds-curva" data-k="curva" width="320" height="110" aria-label="Error en cada iteración"></canvas><small>Error medio (miles de €) en cada iteración.</small>
        <div class="ds-pesos" data-k="pesos"></div>
        <p class="ds-msg" data-k="msg" aria-live="polite"></p>
      </div>
    </div>
    <div class="ds-controles"><label class="ds-check"><input type="checkbox" data-k="norm" checked /> <b>Normalizar los datos</b> (poner m² y habitaciones en una escala parecida)</label></div>
    <div class="ds-controles"><label>Tasa de aprendizaje <input type="range" min="0" max="100" step="0.5" data-k="lr" aria-label="Tasa de aprendizaje" /> <b data-k="lrn"></b></label></div>
    <div class="ds-botones"><button class="ds-primario" data-k="play">▶ Entrenar</button><button data-k="paso">Un paso</button><button data-k="reset">Reiniciar</button><button data-k="nuevos">🎲 Pisos nuevos</button>
      <label class="ds-vel">Velocidad <select data-k="vel"><option value="1">Lenta</option><option value="5">Normal</option><option value="25" selected>Rápida</option></select></label></div>
    <div class="ds-prueba"><b>🏠 Tasa un piso</b>
      <label>Metros² <input type="range" min="30" max="200" step="1" value="${tm}" data-k="tm" /> <b data-k="tmn"></b></label>
      <label>Habitaciones <input type="range" min="1" max="6" step="1" value="${th}" data-k="th" /> <b data-k="thn"></b></label>
      <p class="ds-msg" data-k="veredicto" aria-live="polite"></p></div>
    ${mates("Predicción: <code>ŷ = w₁·m² + w₂·hab + b</code>. Error: <code>media[(ŷ − y)²]</code> (se enseña su raíz, en miles de €). Gradiente: <code>∂/∂w₁ = media[2·(ŷ − y)·m²]</code>, etc. <b>Normalizar</b> es restar la media y dividir por la desviación: así m² (de 40 a 160) y habitaciones (de 1 a 6) pesan parecido. Sin normalizar, el «terreno» es un valle larguísimo y estrecho: una tasa que va bien para una variable hace explotar la otra, y hay que usar una tasa minúscula que tarda una eternidad.")}`;

  const cMapa = q<HTMLCanvasElement>(caja, "mapa");
  const sliderLr = q<HTMLInputElement>(caja, "lr");

  function fijarLr(v: number, a: ReturnType<typeof escalaLog>): void {
    esc = a;
    lr = v;
    sliderLr.value = String(esc.a(lr));
  }
  function reiniciar(): void {
    bucle.parar();
    [w1, w2, b0] = [0, 0, 0];
    perdidas = [rmse()];
    pasos = 0;
    estado = "listo";
    pintar();
  }
  function paso(): boolean {
    let g1 = 0;
    let g2 = 0;
    let g0 = 0;
    for (const p of pisos) {
      const e = pred(p) - p.precio;
      const [f1, f2] = feat(p);
      g1 += 2 * e * f1;
      g2 += 2 * e * f2;
      g0 += 2 * e;
    }
    const n = pisos.length;
    const antes = perdidas[perdidas.length - 1];
    w1 -= (lr * g1) / n;
    w2 -= (lr * g2) / n;
    b0 -= (lr * g0) / n;
    pasos++;
    const r = rmse();
    perdidas.push(r);
    if (!isFinite(r) || r > 1e7) {
      estado = "diverge";
      return false;
    }
    if (Math.abs(antes - r) < 1e-7) {
      estado = "converge";
      return false;
    }
    if (pasos >= 8000) {
      estado = "limite";
      return false;
    }
    return true;
  }
  const bucle = crearBucle(paso, () => pintar());

  function pintar(): void {
    const cx = cMapa.getContext("2d")!;
    const a = (v: number) => Math.max(-10, Math.min(LADO + 10, (v / MAXP) * LADO));
    cx.fillStyle = "#fff";
    cx.fillRect(0, 0, LADO, LADO);
    cx.strokeStyle = "#e4e0f7";
    cx.lineWidth = 1;
    for (let v = 100; v < MAXP; v += 100) {
      cx.beginPath();
      cx.moveTo(a(v), 0);
      cx.lineTo(a(v), LADO);
      cx.moveTo(0, LADO - a(v));
      cx.lineTo(LADO, LADO - a(v));
      cx.stroke();
    }
    cx.strokeStyle = "#1f9d4d";
    cx.lineWidth = 2;
    cx.beginPath();
    cx.moveTo(0, LADO);
    cx.lineTo(LADO, 0);
    cx.stroke();
    for (const p of pisos) {
      cx.beginPath();
      cx.arc(a(pred(p)), LADO - a(p.precio), 5, 0, 7);
      cx.fillStyle = "#2a1770";
      cx.fill();
    }
    cx.font = "11px system-ui";
    cx.fillStyle = "#2a1770";
    cx.textAlign = "right";
    cx.fillText("precio predicho (miles €) →", LADO - 6, LADO - 6);
    cx.save();
    cx.translate(12, 8);
    cx.rotate(Math.PI / 2);
    cx.textAlign = "left";
    cx.fillText("precio real →", 0, 0);
    cx.restore();

    pintarPerdida(q<HTMLCanvasElement>(caja, "curva"), perdidas);
    const r = reales();
    const err = perdidas[perdidas.length - 1];
    q(caja, "datos").innerHTML = `<span>Iteración <b>${pasos}</b></span><span>Error medio <b>${isFinite(err) ? fmt(err, 1) : "∞"}</b> mil €</span>`;
    q(caja, "pesos").innerHTML = `<div>Cada m² suma <b>${fmt(r.m, 2)}</b> mil €</div><div>Cada habitación suma <b>${fmt(r.h, 1)}</b> mil €</div><div>Precio base <b>${fmt(r.c, 1)}</b> mil €</div><small>(Los datos se generaron con ≈ 2,2 por m², 12 por habitación y 30 de base, más ruido. No salen exactos: hay solo 30 pisos y los m² y las habitaciones van muy ligados.)</small>`;
    q(caja, "lrn").textContent = fmt(lr, lr < 0.001 ? 7 : lr < 0.1 ? 5 : 3);
    q(caja, "msg").innerHTML =
      estado === "diverge"
        ? `💥 <b>Diverge</b>: la tasa es demasiado grande para estos datos.${normalizar ? "" : " Sin normalizar, los m² (cientos) hacen que el gradiente sea enorme. Baja mucho la tasa o <b>normaliza los datos</b>."}`
        : estado === "converge"
          ? `✓ Ha aprendido tras ${pasos} pasos: se equivoca de media unos <b>${fmt(err, 0)}</b> mil €.`
          : estado === "limite"
            ? `⏹ Tras ${pasos} pasos aún no ha terminado (error ${fmt(err, 0)} mil €). ${normalizar ? "" : "Sin normalizar, tiene que usar una tasa minúscula y avanza muy despacio. Prueba a <b>normalizar</b>."}`
            : "";
    q(caja, "tmn").textContent = `${tm} m²`;
    q(caja, "thn").textContent = String(th);
    const precio = r.c + r.m * tm + r.h * th;
    q(caja, "veredicto").innerHTML = pasos === 0 ? "Entrena el modelo para que pueda tasar." : isFinite(precio) ? `Precio estimado: <b>${fmt(precio, 0)} mil €</b>` : "—";
    const b = q<HTMLButtonElement>(caja, "play");
    b.textContent = bucle.corriendo ? "⏸ Pausa" : "▶ Entrenar";
    b.disabled = estado !== "listo";
    q<HTMLButtonElement>(caja, "paso").disabled = estado !== "listo";
  }

  caja.addEventListener("click", (e) => {
    const k = (e.target as HTMLElement).dataset.k;
    if (k === "play") {
      if (bucle.corriendo) {
        bucle.parar();
        pintar();
      } else bucle.iniciar(Number(q<HTMLSelectElement>(caja, "vel").value));
    } else if (k === "paso") bucle.uno();
    else if (k === "reset") reiniciar();
    else if (k === "nuevos") {
      semilla++;
      pisos = crearPisos(semilla);
      st = stats();
      reiniciar();
    }
  });
  caja.addEventListener("input", (e) => {
    const t = e.target as HTMLInputElement;
    if (t.dataset.k === "lr") lr = esc.de(Number(t.value));
    else if (t.dataset.k === "tm") tm = Number(t.value);
    else if (t.dataset.k === "th") th = Number(t.value);
    else return;
    pintar();
  });
  caja.addEventListener("change", (e) => {
    const t = e.target as HTMLInputElement | HTMLSelectElement;
    if (t.dataset.k === "norm") {
      normalizar = (t as HTMLInputElement).checked;
      fijarLr(normalizar ? 0.1 : 5e-5, escalaLog(1e-7, 1));
      reiniciar();
    } else if (t.dataset.k === "vel" && bucle.corriendo) bucle.iniciar(Number(t.value));
  });
  fijarLr(0.1, escalaLog(1e-7, 1));
  reiniciar();
  return bucle.parar;
}

// =====================================================================================================
export type IdEjemplo = "ciega" | "recta" | "spam" | "piso";

const EJEMPLOS: { id: IdEjemplo; icono: string; nombre: string; lema: string }[] = [
  { id: "ciega", icono: "🌫️", nombre: "Montaña a ciegas", lema: "Intuición pura" },
  { id: "recta", icono: "📈", nombre: "Ajustar una recta", lema: "Regresión simple" },
  { id: "spam", icono: "✉️", nombre: "¿Spam o no spam?", lema: "Clasificar" },
  { id: "piso", icono: "🏠", nombre: "Precio de un piso", lema: "Varias variables" },
];

/** `recta` es la demo de ajustar una recta, que vive en index.ts junto al laboratorio */
export function ejemplos(caja: HTMLElement, recta: (c: HTMLElement) => () => void): () => void {
  let limpiar: () => void = () => {};
  caja.innerHTML = `<p class="ds-idea">Cuatro problemas distintos, <b>el mismo método</b>: tener un error, mirar hacia dónde baja y dar pasos. Elige uno.</p>
    <div class="ds-ejs">${EJEMPLOS.map((e) => `<button data-e="${e.id}"><span>${e.icono}</span><b>${e.nombre}</b><small>${e.lema}</small></button>`).join("")}</div>
    <div class="ds-ej" data-k="ej"></div>`;

  function abrir(id: IdEjemplo): void {
    limpiar();
    caja.querySelectorAll<HTMLElement>("[data-e]").forEach((b) => b.classList.toggle("on", b.dataset.e === id));
    const zona = document.createElement("div");
    zona.className = "ds-modo ds-sinpad";
    q(caja, "ej").replaceChildren(zona);
    if (id === "ciega") limpiar = montanaCiega(zona);
    else if (id === "spam") limpiar = spam(zona);
    else if (id === "piso") limpiar = piso(zona);
    else {
      zona.innerHTML = `${intro("Ajustar una <b>recta</b> y = w·x + b a 20 puntos con ruido.", "La <b>pendiente w</b> y la <b>ordenada b</b>.", "El error cuadrático medio (ECM): la distancia media al cuadrado entre la recta y los puntos.")}<div data-k="r"></div>`;
      limpiar = recta(q(zona, "r"));
    }
  }
  caja.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>("[data-e]");
    if (b) abrir(b.dataset.e as IdEjemplo);
  });
  abrir("ciega");
  return () => limpiar();
}


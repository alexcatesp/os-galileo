// Pestaña «Qué es» de Descenso: recorrido guiado en siete pasos, cada uno con una demo interactiva,
// un recuadro opcional con las matemáticas y, al final, un mini test.

import { ALTO, ANCHO, DOS_VALLES, PARABOLA, X_VALLE_HONDO, arrastrable, pintarCurva, type Curva } from "./curvas";
import { fmt } from "./util";

type Destino = "ejemplos" | "laboratorio";

interface Paso {
  titulo: string;
  texto: string;
  mates: string;
  /** monta la demo en `zona`; devuelve cómo pararla */
  demo(zona: HTMLElement): () => void;
}

const lienzo = (k: string, alto = ALTO) => `<canvas class="ds-c1d" data-k="${k}" width="${ANCHO}" height="${alto}"></canvas>`;
const q = <T extends HTMLElement>(zona: HTMLElement, k: string) => zona.querySelector<T>(`[data-k="${k}"]`)!;

// ---- datos del paso 2: un «modelo» de una sola perilla (y = w·x) ----
const DX = [-2, -1, 0, 1, 2];
const DY = [-3.6, -2.2, 0.4, 1.9, 4.1];
const ecm1 = (w: number) => DX.reduce((s, x, i) => s + (w * x - DY[i]) ** 2, 0) / DX.length;
const grad1 = (w: number) => (2 * DX.reduce((s, x, i) => s + x * (w * x - DY[i]), 0)) / DX.length;
const CURVA_ERROR: Curva = { f: ecm1, df: grad1, x0: -1, x1: 4, y0: -1, y1: 19 };

function pintarDatos(c: HTMLCanvasElement, w: number): void {
  const cx = c.getContext("2d")!;
  const [W, H] = [c.width, c.height];
  const px = (x: number) => ((x + 3) / 6) * W;
  const py = (y: number) => (1 - (y + 8) / 16) * H;
  cx.fillStyle = "#fff";
  cx.fillRect(0, 0, W, H);
  cx.strokeStyle = "#e4e0f7";
  cx.lineWidth = 1;
  cx.beginPath();
  cx.moveTo(px(0), 0);
  cx.lineTo(px(0), H);
  cx.moveTo(0, py(0));
  cx.lineTo(W, py(0));
  cx.stroke();
  DX.forEach((x, i) => {
    cx.strokeStyle = "rgba(218,37,28,0.55)";
    cx.lineWidth = 2;
    cx.beginPath();
    cx.moveTo(px(x), py(DY[i]));
    cx.lineTo(px(x), py(w * x));
    cx.stroke();
  });
  cx.strokeStyle = "#da251c";
  cx.lineWidth = 3;
  cx.beginPath();
  cx.moveTo(px(-3), py(-3 * w));
  cx.lineTo(px(3), py(3 * w));
  cx.stroke();
  DX.forEach((x, i) => {
    cx.beginPath();
    cx.arc(px(x), py(DY[i]), 6, 0, 7);
    cx.fillStyle = "#2a1770";
    cx.fill();
  });
}

const PASOS: Paso[] = [
  // ------------------------------------------------------------------ 1
  {
    titulo: "1 · La idea: bajar una montaña con niebla",
    texto: `Imagina que estás en una montaña con tanta niebla que <b>no ves el valle</b>. Solo notas hacia dónde baja el suelo bajo tus pies. ¿Qué haces? Das un paso hacia donde baja, miras otra vez, y repites. Así acabas en el fondo sin haber visto nunca el mapa.<br>Eso es el <b>descenso del gradiente</b>: un método para <b>encontrar el punto más bajo</b> de algo (el valle) dando pasos cuesta abajo.`,
    mates: `Buscamos el valor de <code>x</code> que hace mínima una función <code>f(x)</code>. En esta demo, <code>f(x) = x²</code>: la altura del terreno en cada punto. El mínimo está en <code>x = 0</code>, pero el método no lo sabe: solo puede preguntar «¿qué altura hay aquí?» y «¿cuánto se inclina el suelo aquí?».`,
    demo(zona) {
      zona.innerHTML = `<p class="ds-reto">🎯 <b>Reto:</b> arrastra la bola hasta lo más bajo que puedas.</p>${lienzo("c")}<div class="ds-datos" data-k="d" aria-live="polite"></div><p class="ds-msg" data-k="m"></p>`;
      const c = q<HTMLCanvasElement>(zona, "c");
      let x = -3.2;
      let mejor = PARABOLA.f(x);
      const pintar = () => {
        mejor = Math.min(mejor, PARABOLA.f(x));
        pintarCurva(c, PARABOLA, { x });
        q(zona, "d").innerHTML = `<span>Altura aquí: <b>${fmt(PARABOLA.f(x), 2)}</b></span><span>Mejor altura lograda: <b>${fmt(mejor, 2)}</b></span>`;
        q(zona, "m").textContent = PARABOLA.f(x) < 0.05 ? "🎉 ¡Has llegado al fondo!" : "La altura es lo mal que lo hace algo; queremos que sea lo más pequeña posible.";
      };
      arrastrable(c, PARABOLA, (nx) => {
        x = nx;
        pintar();
      });
      pintar();
      return () => {};
    },
  },
  // ------------------------------------------------------------------ 2
  {
    titulo: "2 · ¿Para qué sirve? Para que una IA aprenda",
    texto: `Un modelo de IA tiene «perillas» (<b>parámetros</b>) que hay que ajustar. Aquí solo hay una: la <b>pendiente w</b> de la recta roja, que debería pasar cerca de los puntos. El <b>error</b> mide cuánto se equivoca. Cada valor de w tiene un error: es el «terreno» de abajo, y <b>entrenar = bajar hasta su fondo</b>.<br>Se usa para entrenar casi toda la IA actual: desde predecir precios hasta los modelos de lenguaje con miles de millones de parámetros.`,
    mates: `Error cuadrático medio: <code>E(w) = media de (w·x − y)²</code>. Su derivada es <code>E'(w) = 2 · media de x·(w·x − y)</code>. El descenso actualiza <code>w ← w − tasa · E'(w)</code>. Para una recta con 2 parámetros o una red con miles de millones es exactamente la misma idea.`,
    demo(zona) {
      zona.innerHTML = `${lienzo("datos", 200)}
        <label class="ds-ctl">Mueve la perilla <b>w</b> <input type="range" min="-1" max="4" step="0.05" data-k="w" aria-label="Pendiente w" /> <b data-k="wn"></b></label>
        ${lienzo("err", 200)}
        <div class="ds-botones"><button class="ds-primario" data-k="solo">▶ Que lo haga solo</button><button data-k="reset">Reiniciar</button></div>
        <div class="ds-datos" data-k="d" aria-live="polite"></div>`;
      const cd = q<HTMLCanvasElement>(zona, "datos");
      const ce = q<HTMLCanvasElement>(zona, "err");
      const sw = q<HTMLInputElement>(zona, "w");
      let w = -0.5;
      let timer = 0;
      const parar = () => {
        window.clearInterval(timer);
        timer = 0;
        q(zona, "solo").textContent = "▶ Que lo haga solo";
      };
      const pintar = () => {
        pintarDatos(cd, w);
        pintarCurva(ce, CURVA_ERROR, { x: w, minimos: [1.95] });
        sw.value = String(Math.max(-1, Math.min(4, w)));
        q(zona, "wn").textContent = fmt(w, 2);
        q(zona, "d").innerHTML = `<span>w = <b>${fmt(w, 2)}</b></span><span>Error = <b>${fmt(ecm1(w), 2)}</b></span><span>Los segmentos rojos son los fallos del modelo; el error es su tamaño medio al cuadrado.</span>`;
      };
      sw.addEventListener("input", () => {
        parar();
        w = Number(sw.value);
        pintar();
      });
      arrastrable(ce, CURVA_ERROR, (nx) => {
        parar();
        w = nx;
        pintar();
      });
      zona.addEventListener("click", (e) => {
        const k = (e.target as HTMLElement).dataset.k;
        if (k === "reset") {
          parar();
          w = -0.5;
          pintar();
        } else if (k === "solo") {
          if (timer) return parar();
          q(zona, "solo").textContent = "⏸ Pausa";
          timer = window.setInterval(() => {
            const paso = 0.1 * grad1(w);
            w -= paso;
            pintar();
            if (Math.abs(paso) < 1e-4) parar();
          }, 90);
        }
      });
      pintar();
      return parar;
    },
  },
  // ------------------------------------------------------------------ 3
  {
    titulo: "3 · La pendiente es la brújula",
    texto: `¿Cómo sabe la bola hacia dónde bajar sin ver el valle? Mira la <b>pendiente</b> (la inclinación) justo donde está: la línea <span class="ds-amarillo">amarilla</span> es esa inclinación. Si el suelo <b>sube hacia la derecha</b>, hay que ir a la <b>izquierda</b>, y al revés. La flecha <span class="ds-verde">verde</span> lo indica.<br>Además, cuanto <b>más empinado</b>, más lejos estás del fondo; cerca del fondo el suelo es casi plano.`,
    mates: `La pendiente es la <b>derivada</b>: <code>f'(x) = 2x</code> para <code>f(x) = x²</code>. Con varias variables se llama <b>gradiente</b> ∇f: el vector de derivadas parciales, que apunta hacia donde la función <b>sube</b> más deprisa. Por eso se baja en sentido contrario: <code>−∇f</code>. De ahí el nombre «descenso del gradiente».`,
    demo(zona) {
      zona.innerHTML = `<p class="ds-reto">👆 Arrastra la bola y mira cómo cambia la pendiente.</p>${lienzo("c")}<div class="ds-datos" data-k="d" aria-live="polite"></div><p class="ds-msg" data-k="m"></p>`;
      const c = q<HTMLCanvasElement>(zona, "c");
      let x = 2.5;
      const pintar = () => {
        const p = PARABOLA.df(x);
        pintarCurva(c, PARABOLA, { x, tangente: true, flecha: true });
        q(zona, "d").innerHTML = `<span>x = <b>${fmt(x, 2)}</b></span><span>Pendiente = 2·x = <b>${fmt(p, 2)}</b></span><span>Hay que ir hacia la <b>${Math.abs(p) < 0.05 ? "—" : p > 0 ? "izquierda ⬅" : "derecha ➡"}</b></span>`;
        q(zona, "m").textContent = Math.abs(p) < 0.15 ? "Casi plano: estás en el fondo (o en una cima: en cualquier caso, ya no hay hacia dónde bajar)." : Math.abs(p) > 5 ? "Muy empinado: estás lejos del fondo." : "";
      };
      arrastrable(c, PARABOLA, (nx) => {
        x = nx;
        pintar();
      });
      pintar();
      return () => {};
    },
  },
  // ------------------------------------------------------------------ 4
  {
    titulo: "4 · Dar un paso",
    texto: `Con la pendiente ya podemos movernos. La regla es siempre la misma: <b>nueva posición = posición − tasa × pendiente</b>. La <b>tasa de aprendizaje</b> es lo que decide lo grande que es el paso (aquí vale 0,1). Pulsa «Dar un paso» varias veces.`,
    mates: `<code>x ← x − η · f'(x)</code>, con η (eta) la tasa de aprendizaje. Con <code>f'(x) = 2x</code> y η = 0,1: <code>x ← x − 0,2·x = 0,8·x</code>. En cada paso la distancia al fondo se multiplica por 0,8, por eso los pasos se van acortando.`,
    demo(zona) {
      zona.innerHTML = `${lienzo("c")}
        <div class="ds-botones"><button class="ds-primario" data-k="paso">Dar un paso ▶</button><button data-k="reset">Reiniciar</button><small>Pulsa en la curva para elegir otro punto de partida.</small></div>
        <p class="ds-formula" data-k="f" aria-live="polite"></p><p class="ds-msg" data-k="m"></p>`;
      const c = q<HTMLCanvasElement>(zona, "c");
      const lr = 0.1;
      let x = 3.5;
      let camino = [x];
      let ultima = "";
      const pintar = () => {
        pintarCurva(c, PARABOLA, { x, camino, tangente: true });
        q(zona, "f").innerHTML = ultima || "Pulsa «Dar un paso».";
        q(zona, "m").textContent = camino.length > 4 ? "Fíjate: cada paso es más corto que el anterior. Cerca del fondo la pendiente es pequeña, así que el paso también." : "";
      };
      const reiniciar = (nx = 3.5) => {
        x = nx;
        camino = [x];
        ultima = "";
        pintar();
      };
      arrastrable(c, PARABOLA, (nx) => reiniciar(nx));
      zona.addEventListener("click", (e) => {
        const k = (e.target as HTMLElement).dataset.k;
        if (k === "paso") {
          const p = PARABOLA.df(x);
          const nuevo = x - lr * p;
          ultima = `x nueva = x − tasa · pendiente = ${fmt(x, 2)} − ${fmt(lr, 1)} · ${fmt(p, 2)} = <b>${fmt(nuevo, 2)}</b>`;
          x = nuevo;
          camino.push(x);
          pintar();
        } else if (k === "reset") reiniciar();
      });
      pintar();
      return () => {};
    },
  },
  // ------------------------------------------------------------------ 5
  {
    titulo: "5 · La tasa de aprendizaje: ni muy pequeña ni muy grande",
    texto: `El tamaño del paso es el ajuste más importante. <b>Muy pequeño</b>: llegas, pero tardas muchísimo. <b>Muy grande</b>: te pasas de largo, rebotas de lado a lado y puedes salir disparado (<b>diverge</b>). Mueve el deslizador y suelta la bola.`,
    mates: `Con <code>f(x) = x²</code>, cada paso hace <code>x ← (1 − 2η)·x</code>. Si <code>0 &lt; η &lt; 0,5</code> baja suave; si <code>0,5 &lt; η &lt; 1</code> cambia de signo en cada paso (rebota) pero converge; si <code>η = 1</code> salta entre dos puntos para siempre; si <code>η &gt; 1</code> cada paso se aleja más: diverge.`,
    demo(zona) {
      zona.innerHTML = `${lienzo("c")}
        <div class="ds-controles"><label>Tasa de aprendizaje <input type="range" min="0.01" max="1.1" step="0.01" value="0.1" data-k="lr" aria-label="Tasa de aprendizaje" /> <b data-k="lrn"></b></label></div>
        <div class="ds-botones"><button class="ds-primario" data-k="soltar">▶ Soltar la bola</button><button data-k="paso">Un paso</button><button data-k="reset">Reiniciar</button></div>
        <p class="ds-msg" data-k="m" aria-live="polite"></p>`;
      const c = q<HTMLCanvasElement>(zona, "c");
      let lr = 0.1;
      let x = 3.5;
      let camino = [x];
      let timer = 0;
      const parar = () => {
        window.clearInterval(timer);
        timer = 0;
        q(zona, "soltar").textContent = "▶ Soltar la bola";
      };
      const diagnostico = () => {
        if (lr < 0.1) return "🐢 Muy pequeña: llegará, pero con muchísimos pasos.";
        if (lr < 0.45) return "✅ Buena: baja con pasos cada vez más cortos.";
        if (lr < 0.55) return "⚡ Con esta parábola perfecta cae al fondo de un salto (con otras funciones no ocurre).";
        if (lr < 0.98) return "↔ Grande: se pasa de largo y rebota de un lado a otro, aunque al final llega.";
        if (lr < 1.02) return "🔁 Justo en el límite: salta entre dos puntos sin llegar nunca.";
        return "💥 Demasiado grande: cada paso la aleja más del fondo. Diverge.";
      };
      const pintar = () => {
        pintarCurva(c, PARABOLA, { x: Math.max(-4, Math.min(4, x)), camino: camino.map((v) => Math.max(-4, Math.min(4, v))) });
        q(zona, "lrn").textContent = fmt(lr, 2);
        q(zona, "m").innerHTML = `${diagnostico()} <small>(x = ${fmt(x, 2)} tras ${camino.length - 1} pasos)</small>`;
      };
      const paso = (): boolean => {
        x -= lr * PARABOLA.df(x);
        camino.push(x);
        if (Math.abs(x) > 1e3) {
          parar();
          return false;
        }
        if (Math.abs(x) < 1e-3 || camino.length > 80) {
          parar();
          return false;
        }
        return true;
      };
      zona.addEventListener("input", (e) => {
        const t = e.target as HTMLInputElement;
        if (t.dataset.k === "lr") {
          lr = Number(t.value);
          pintar();
        }
      });
      zona.addEventListener("click", (e) => {
        const k = (e.target as HTMLElement).dataset.k;
        if (k === "reset") {
          parar();
          x = 3.5;
          camino = [x];
          pintar();
        } else if (k === "paso") {
          parar();
          paso();
          pintar();
        } else if (k === "soltar") {
          if (timer) {
            parar();
            return;
          }
          q(zona, "soltar").textContent = "⏸ Pausa";
          timer = window.setInterval(() => {
            if (!paso()) parar();
            pintar();
          }, 220);
        }
      });
      pintar();
      return parar;
    },
  },
  // ------------------------------------------------------------------ 6
  {
    titulo: "6 · Trampas: los mínimos locales",
    texto: `El método solo ve lo que tiene bajo los pies: baja hasta que el suelo se aplana, y <b>ahí se para</b>. Si el terreno tiene varios valles, <b>dónde acabas depende de dónde empieces</b>. Pulsa en la curva para elegir el punto de salida y suelta la bola. Prueba a la izquierda y a la derecha.`,
    mates: `Una función con varios mínimos locales puede atrapar al método en uno que no es el mejor (el global). En redes neuronales con millones de parámetros esto se combate con trucos: empezar desde puntos al azar, usar <b>momento</b> o <b>Adam</b> (los verás en el Laboratorio) y datos por lotes.`,
    demo(zona) {
      zona.innerHTML = `${lienzo("c")}
        <div class="ds-botones"><button class="ds-primario" data-k="soltar">▶ Soltar la bola</button><button data-k="reset">Reiniciar</button><small>Pulsa en la curva para elegir el punto de salida.</small></div>
        <p class="ds-msg" data-k="m" aria-live="polite"></p>`;
      const c = q<HTMLCanvasElement>(zona, "c");
      const lr = 0.1;
      let x = 3;
      let camino = [x];
      let timer = 0;
      let fin = "";
      const parar = () => {
        window.clearInterval(timer);
        timer = 0;
        q(zona, "soltar").textContent = "▶ Soltar la bola";
      };
      const pintar = () => {
        pintarCurva(c, DOS_VALLES, { x, camino });
        q(zona, "m").innerHTML = fin || "Elige dónde empezar y suelta la bola.";
      };
      const reiniciar = (nx: number) => {
        parar();
        x = nx;
        camino = [x];
        fin = "";
        pintar();
      };
      arrastrable(c, DOS_VALLES, reiniciar);
      zona.addEventListener("click", (e) => {
        const k = (e.target as HTMLElement).dataset.k;
        if (k === "reset") reiniciar(3);
        else if (k === "soltar") {
          if (timer) return parar();
          if (Math.abs(DOS_VALLES.df(x)) < 1e-3) fin = "La bola ya está parada: pulsa en otro punto.";
          q(zona, "soltar").textContent = "⏸ Pausa";
          timer = window.setInterval(() => {
            x -= lr * DOS_VALLES.df(x);
            camino.push(x);
            if (Math.abs(DOS_VALLES.df(x)) < 1e-3 || camino.length > 600) {
              parar();
              const hondo = Math.abs(x - X_VALLE_HONDO) < 0.3;
              fin = hondo ? "🏆 Ha llegado al <b>valle más profundo</b> (mínimo global)." : "😕 Se ha quedado en el <b>valle más alto</b> (mínimo local): hay otro más profundo a la izquierda, pero desde aquí la bola no puede saberlo.";
            }
            pintar();
          }, 40);
        }
      });
      pintar();
      return parar;
    },
  },
];

// ---------------------------------------------------------------- final: resumen y test
const TEST: { pregunta: string; opciones: { t: string; ok?: boolean; porque: string }[] }[] = [
  {
    pregunta: "La pendiente donde estás es positiva (el terreno sube hacia la derecha). ¿Hacia dónde vas para bajar?",
    opciones: [
      { t: "Hacia la izquierda", ok: true, porque: "Correcto: se va en sentido contrario a la pendiente (x − tasa · pendiente)." },
      { t: "Hacia la derecha", porque: "Eso es subir. El gradiente apunta hacia donde la función sube; hay que ir al revés." },
      { t: "Me quedo quieto", porque: "Solo te quedarías quieto con pendiente cero (suelo plano)." },
    ],
  },
  {
    pregunta: "Pones una tasa de aprendizaje demasiado grande. ¿Qué puede pasar?",
    opciones: [
      { t: "Que tarde más en llegar, pero llegue seguro", porque: "Eso pasa con una tasa muy pequeña." },
      { t: "Que se pase de largo y rebote o incluso diverja", ok: true, porque: "Correcto: los pasos son tan grandes que saltas al otro lado del valle, y a veces cada salto te aleja más." },
      { t: "Nada, el resultado es el mismo", porque: "La tasa es de lo más importante: cambia mucho el resultado." },
    ],
  },
  {
    pregunta: "¿Qué garantiza el descenso del gradiente?",
    opciones: [
      { t: "Encontrar siempre el mínimo más bajo de todos", porque: "No: puede quedarse en un mínimo local, como viste en la demo de los dos valles." },
      { t: "Bajar hasta un punto donde el suelo se aplana (que puede ser un mínimo local)", ok: true, porque: "Correcto. Por eso importa dónde empieces y qué variantes uses (momento, Adam…)." },
      { t: "Llegar al fondo en un solo paso", porque: "No: son muchos pasos pequeños." },
    ],
  },
];

function resumenYTest(zona: HTMLElement, irA: (d: Destino) => void): () => void {
  zona.innerHTML = `
    <ul class="ds-resumen">
      <li><b>Qué es:</b> un método para encontrar el mínimo de una función bajando paso a paso.</li>
      <li><b>Cómo:</b> en cada punto mira la pendiente (el gradiente) y da un paso en sentido contrario: <code>x ← x − tasa · pendiente</code>.</li>
      <li><b>Para qué:</b> entrenar modelos de IA: ajustar sus parámetros para que el error sea pequeño.</li>
      <li><b>Cuidado con:</b> la tasa de aprendizaje (ni muy pequeña ni muy grande) y los mínimos locales.</li>
    </ul>
    <h4>Comprueba lo que has aprendido</h4>
    ${TEST.map(
      (t, i) => `<div class="ds-pregunta" data-p="${i}"><p>${i + 1}. ${t.pregunta}</p>${t.opciones.map((o, j) => `<button data-q="${i}.${j}">${o.t}</button>`).join("")}<p class="ds-msg" data-r="${i}" aria-live="polite"></p></div>`,
    ).join("")}
    <div class="ds-botones"><button class="ds-primario" data-ir="ejemplos">Ver ejemplos ▶</button><button data-ir="laboratorio">Ir al laboratorio 🔬</button></div>`;
  zona.addEventListener("click", (e) => {
    const b = e.target as HTMLElement;
    if (b.dataset.ir) irA(b.dataset.ir as Destino);
    else if (b.dataset.q) {
      const [i, j] = b.dataset.q.split(".").map(Number);
      const o = TEST[i].opciones[j];
      b.classList.add(o.ok ? "acierto" : "fallo");
      zona.querySelector<HTMLElement>(`[data-r="${i}"]`)!.innerHTML = `${o.ok ? "✅" : "❌"} ${o.porque}`;
    }
  });
  return () => {};
}

export function recorrido(caja: HTMLElement, irA: (d: Destino) => void): () => void {
  const total = PASOS.length + 1;
  let actual = 0;
  let limpiar: () => void = () => {};
  caja.innerHTML = `
    <div class="ds-nav"><button data-n="-1">◀ Anterior</button><span class="ds-puntos" data-k="puntos"></span><button class="ds-primario" data-n="1">Siguiente ▶</button></div>
    <h3 class="ds-titulo" data-k="titulo"></h3>
    <p class="ds-texto" data-k="texto"></p>
    <div class="ds-demo" data-k="demo"></div>
    <details class="ds-mates" data-k="mates"><summary>🧮 Ver las matemáticas</summary><p data-k="mates-t"></p></details>`;
  const k = <T extends HTMLElement>(n: string) => caja.querySelector<T>(`[data-k="${n}"]`)!;

  function mostrar(i: number): void {
    limpiar();
    actual = i;
    const ultimo = i === total - 1;
    const p = PASOS[i];
    k("titulo").textContent = ultimo ? "7 · Resumen y comprobación" : p.titulo;
    k("texto").innerHTML = ultimo ? "Repasa lo esencial y contesta tres preguntas rápidas." : p.texto;
    k("mates").hidden = ultimo;
    k<HTMLDetailsElement>("mates").open = false;
    if (!ultimo) k("mates-t").innerHTML = p.mates;
    k("puntos").innerHTML = Array.from({ length: total }, (_, n) => `<i class="${n === i ? "on" : n < i ? "hecho" : ""}"></i>`).join("");
    const zona = k("demo");
    zona.replaceChildren();
    const nueva = zona.cloneNode(false) as HTMLElement; // elimina los eventos de la demo anterior
    zona.replaceWith(nueva);
    limpiar = ultimo ? resumenYTest(nueva, irA) : p.demo(nueva);
    caja.querySelector<HTMLButtonElement>('[data-n="-1"]')!.disabled = i === 0;
    caja.querySelector<HTMLButtonElement>('[data-n="1"]')!.disabled = ultimo;
  }

  caja.querySelector(".ds-nav")!.addEventListener("click", (e) => {
    const n = (e.target as HTMLElement).dataset.n;
    if (n) mostrar(Math.max(0, Math.min(total - 1, actual + Number(n))));
  });
  mostrar(0);
  return () => limpiar();
}

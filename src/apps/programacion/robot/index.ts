// «Robot Galileo» (0485 · bucles): un playground a pantalla partida. A la izquierda el mapa y el robot;
// a la derecha los bloques y el código Java (mismo modelo, dos vistas). El alumno diseña bucles para que
// el robot llegue a la meta y recoja monedas con un número limitado de instrucciones.

import "./robot.css";
import type { AppDef } from "../../../kernel/kernel";
import { bloqueJava, esc, progreso } from "../comun";
import { aTexto, comoRepetir, compilar, condSimple, contar, normalizarBloques, repetir, sePuedeEnBloques, type ErrorJava, type Expr, type Sent } from "./lenguaje";
import { SENSORES, crearMundo, type Estado, type Mundo } from "./mundo";
import { MUNDOS, NIVELES, evaluar, type BloqueId, type Nivel, type Veredicto } from "./niveles";


interface Registro {
  hechas: string[];
  estrellas: Record<string, number>;
  /** lo último que escribió el alumno en cada nivel (Java) */
  codigos: Record<string, string>;
  /** vista con la que dejó cada nivel */
  modos: Record<string, "bloques" | "java">;
}
const guardado = progreso<Registro>("osg-java-robot", { hechas: [], estrellas: {}, codigos: {}, modos: {} });

const S = 48; // lado de una casilla en el SVG
const VELOCIDADES = [
  { etq: "🐢", titulo: "Muy lento", ms: 750 },
  { etq: "🚶", titulo: "Normal", ms: 380 },
  { etq: "🐇", titulo: "Rápido", ms: 140 },
  { etq: "⚡", titulo: "Instantáneo", ms: 0 },
];

const BLOQUES: Record<BloqueId, { texto: string; clase: string; icono: string }> = {
  avanzar: { texto: "avanzar()", clase: "mov", icono: "⬆" },
  girarIzquierda: { texto: "girarIzquierda()", clase: "mov", icono: "↶" },
  girarDerecha: { texto: "girarDerecha()", clase: "mov", icono: "↷" },
  recoger: { texto: "recoger()", clase: "rec", icono: "💰" },
  repetir: { texto: "repetir … veces", clase: "bucle", icono: "🔁" },
  mientras: { texto: "mientras …", clase: "bucle", icono: "🔄" },
  hacerMientras: { texto: "hacer … mientras", clase: "bucle", icono: "🔂" },
  si: { texto: "si …", clase: "cond", icono: "❓" },
};

/** fragmentos para el modo Java; `§` marca dónde queda el cursor */
const PLANTILLAS: Record<BloqueId, string> = {
  avanzar: "avanzar();",
  girarIzquierda: "girarIzquierda();",
  girarDerecha: "girarDerecha();",
  recoger: "recoger();",
  repetir: "for (int i = 0; i < §; i++) {\n  \n}",
  mientras: "while (§) {\n  \n}",
  hacerMientras: "do {\n  \n} while (§);",
  si: "if (§) {\n  \n}",
};

const ICONO = `<svg viewBox="0 0 48 48"><rect x="3" y="3" width="42" height="42" rx="9" fill="#0d0b1e" stroke="#8c6dff" stroke-width="2.5"/><rect x="12" y="14" width="24" height="24" rx="7" fill="#8c6dff" stroke="#e8e4ff" stroke-width="1.5"/><rect x="15" y="18" width="18" height="9" rx="3" fill="#0d0b1e"/><circle cx="20" cy="22.5" r="2.2" fill="#5eead4"/><circle cx="28" cy="22.5" r="2.2" fill="#5eead4"/><path d="M24 6l5 8H19z" fill="#da251c"/><path d="M33 8c4 0 7 2 7 6" fill="none" stroke="#f7c948" stroke-width="2.5" stroke-linecap="round"/></svg>`;

// ---------------------------------------------------------------- dibujo del mapa
const ROBOT = `<g class="rb-robot"><g class="rb-giro">
  <rect x="6" y="13" width="8" height="25" rx="3.5" fill="#2a1770" stroke="#150c40"/><rect x="34" y="13" width="8" height="25" rx="3.5" fill="#2a1770" stroke="#150c40"/>
  <rect x="11" y="11" width="26" height="29" rx="9" fill="#8c6dff" stroke="#e8e4ff" stroke-width="1.6"/>
  <rect x="14.5" y="15" width="19" height="12" rx="4.5" fill="#0d0b1e"/>
  <circle cx="20" cy="21" r="2.6" fill="#5eead4"/><circle cx="28" cy="21" r="2.6" fill="#5eead4"/>
  <rect x="18" y="30" width="12" height="5" rx="2.2" fill="#e8e4ff" opacity=".85"/>
  <path d="M24 3.5l6 8.5H18z" fill="#da251c" stroke="#fff" stroke-width="1"/>
</g></g>`;

function dibujarMapa(filas: string[]): string {
  const m = crearMundo(filas);
  let celdas = "";
  for (let y = 0; y < m.alto; y++) {
    for (let x = 0; x < m.ancho; x++) {
      const px = x * S;
      const py = y * S;
      if (m.paredes[y][x]) {
        celdas += `<g><rect x="${px}" y="${py}" width="${S}" height="${S}" fill="#3a3270"/><rect x="${px + 2}" y="${py + 2}" width="${S - 4}" height="${S - 4}" rx="6" fill="#4a4090" stroke="#241d55" stroke-width="2"/><path d="M${px + 8} ${py + 10}h${S - 22}" stroke="#7a70c8" stroke-width="3" stroke-linecap="round" opacity=".55"/></g>`;
      } else {
        celdas += `<rect x="${px}" y="${py}" width="${S}" height="${S}" fill="${(x + y) % 2 ? "#221c52" : "#1c1745"}"/>`;
      }
    }
  }
  let extra = "";
  if (m.meta) {
    const px = m.meta.x * S;
    const py = m.meta.y * S;
    extra += `<g class="rb-meta"><circle cx="${px + 24}" cy="${py + 24}" r="21" fill="#da251c" opacity=".18"/><path d="M${px + 15} ${py + 41}V${py + 8}" stroke="#e8e4ff" stroke-width="3" stroke-linecap="round"/><path d="M${px + 15} ${py + 9}h22l-5 7 5 7H${px + 15}z" fill="#da251c"/><path d="M${px + 15} ${py + 9}h11v7H${px + 15}zM${px + 26} ${py + 16}h11v7H${px + 26}z" fill="#fff" opacity=".9"/></g>`;
  }
  for (const k of m.inicial.monedas) {
    const [x, y] = k.split(",").map(Number);
    extra += `<g class="rb-moneda" data-k="${k}"><circle cx="${x * S + 24}" cy="${y * S + 24}" r="10.5" fill="#f7c948" stroke="#b8860b" stroke-width="2"/><circle cx="${x * S + 24}" cy="${y * S + 24}" r="6" fill="none" stroke="#b8860b" stroke-width="1.8"/><path d="M${x * S + 20} ${y * S + 19}l2 -2" stroke="#fff" stroke-width="2" stroke-linecap="round"/></g>`;
  }
  // si el robot empieza sobre la meta o una moneda, un pequeño aviso en la esquina de su casilla (solo mientras está encima)
  const ini = m.inicial;
  let marcas = "";
  if (m.meta && m.meta.x === ini.x && m.meta.y === ini.y) marcas += `<g class="rb-marca"><path d="M${ini.x * S + 37} ${ini.y * S + 3}v17" stroke="#e8e4ff" stroke-width="2" stroke-linecap="round"/><path d="M${ini.x * S + 37} ${ini.y * S + 3}h10l-2.5 3.8 2.5 3.8H${ini.x * S + 37}z" fill="#da251c" stroke="#fff" stroke-width=".8"/></g>`;
  if (ini.monedas.includes(`${ini.x},${ini.y}`)) marcas += `<g class="rb-marca rb-moneda" data-k="${ini.x},${ini.y}"><circle cx="${ini.x * S + 39}" cy="${ini.y * S + 9}" r="7" fill="#f7c948" stroke="#b8860b" stroke-width="1.6"/></g>`;
  return `<svg class="rb-mapa" viewBox="0 0 ${m.ancho * S} ${m.alto * S}" role="img" aria-label="Mapa de ${m.ancho} por ${m.alto} casillas">${celdas}${extra}${ROBOT}${marcas}</svg>`;
}

// ---------------------------------------------------------------- la app
export const robotGalileo: AppDef = {
  id: "java-robot",
  nombre: "Robot Galileo",
  carpeta: "0485 · Programación",
  icono: ICONO,
  ancho: 1060,
  alto: 720,
  iniciar({ ventana, raiz }) {
    raiz.classList.add("rb");
    const reg = guardado.leer();
    const primera = NIVELES.findIndex((n) => !reg.hechas.includes(n.id));
    let i = primera < 0 ? 0 : primera;
    let nivel: Nivel = NIVELES[i];
    let mundo: Mundo = crearMundo(nivel.mapas[0]);
    let modo: "bloques" | "java" = "bloques";
    let texto = "";
    let prog: Sent[] = [];
    let destino: number[] = [];
    let errorJava: ErrorJava | null = null;
    let aviso = "";
    let pedidas = 0;
    let mapaSel = 0;
    let velocidad = 1;
    let angulo = 0;
    let temporizador = 0;
    let compilacion = 0;
    interface Traza {
      ver: Veredicto;
      mapa: number;
      k: number;
      jugando: boolean;
      fin: boolean;
    }
    let tr: Traza | null = null;

    raiz.innerHTML = `
      <div class="rb-barra"><span class="rb-logo">🤖 Robot Galileo</span><div class="rb-niveles" role="group" aria-label="Niveles"></div><span class="rb-estrellas" title="Estrellas conseguidas"></span></div>
      <div class="rb-split">
        <section class="rb-escena" aria-label="Escena">
          <details class="rb-mision" open><summary></summary><div class="rb-mision-txt"></div></details>
          <div class="rb-mapas" role="tablist" aria-label="Mapas del nivel"></div>
          <div class="rb-lienzo"><div class="rb-svg"></div><div class="rb-banner" hidden></div></div>
          <div class="rb-nota" aria-live="polite"></div>
          <div class="rb-mandos">
            <button data-a="jugar" class="rb-jugar" title="Ejecutar el programa (Ctrl+Intro)">▶ Jugar</button>
            <button data-a="paso" title="Un solo paso">⏭ Paso</button>
            <button data-a="reiniciar" title="Volver al principio">⏮</button>
            <input type="range" class="rb-scrub" min="0" max="0" value="0" aria-label="Posición en la ejecución" disabled>
            <span class="rb-vel" role="group" aria-label="Velocidad"></span>
          </div>
        </section>
        <section class="rb-editor" aria-label="Programa">
          <div class="rb-ed-cab"><div class="rb-vistas" role="group" aria-label="Vista"><button data-vista="bloques">🧩 Bloques</button><button data-vista="java">⌨ Java</button></div><div class="rb-meter" title="Instrucciones usadas / máximo"></div></div>
          <div class="rb-ed-cuerpo"></div>
          <div class="rb-ed-pie"><p class="rb-mensaje" aria-live="polite"></p><div class="rb-pie-botones"><button data-a="pista"></button><button data-a="cero" title="Borra tu programa de este nivel">↺ De cero</button></div></div>
        </section>
      </div>`;
    const $ = <T extends HTMLElement>(sel: string) => raiz.querySelector<T>(sel)!;

    // ---------------------------------------------------------------- estado del programa
    const inicialJava = "// Escribe aquí tu programa\n";
    function modelo(): void {
      prog = normalizarBloques(prog);
      texto = aTexto(prog);
    }
    function guardarCodigo(): void {
      reg.codigos[nivel.id] = texto;
      reg.modos[nivel.id] = modo;
      guardado.guardar(reg);
    }
    function compilarAhora(): void {
      const r = compilar(texto);
      errorJava = "error" in r ? r.error : null;
    }

    // ---------------------------------------------------------------- niveles
    function barraNiveles(): void {
      let html = "";
      for (const m of MUNDOS) {
        const ns = NIVELES.map((n, k) => ({ n, k })).filter((x) => x.n.mundo === m.n);
        if (!ns.length) continue;
        html += `<span class="rb-mundo" title="${esc(m.lema)}">${m.emoji} ${esc(m.nombre)}</span>`;
        html += ns
          .map(({ n, k }) => `<button data-n="${k}" class="${k === i ? "on" : ""}${reg.hechas.includes(n.id) ? " ok" : ""}" title="${esc(n.titulo)}" aria-label="Nivel ${k + 1}: ${esc(n.titulo)}${reg.hechas.includes(n.id) ? ", superado" : ""}">${k + 1}</button>`)
          .join("");
      }
      $(".rb-niveles").innerHTML = html;
      const total = Object.values(reg.estrellas).reduce((a, b) => a + b, 0);
      $(".rb-estrellas").textContent = `⭐ ${total} / ${NIVELES.length * 3}`;
    }

    function cargarNivel(n: number): void {
      detener();
      i = n;
      nivel = NIVELES[i];
      pedidas = 0;
      aviso = "";
      mapaSel = 0;
      tr = null;
      ocultarBanner();
      destino = [];
      const guardada = reg.codigos[nivel.id];
      modo = reg.modos[nivel.id] ?? nivel.modo;
      texto = guardada ?? (nivel.modo === "java" ? inicialJava : "");
      prog = [];
      if (modo === "bloques") {
        const r = compilar(texto);
        if ("prog" in r && sePuedeEnBloques(r.prog)) prog = r.prog;
        else if (texto.trim()) modo = "java";
        modelo();
      }
      compilarAhora();
      ventana.fijarTitulo(`Robot Galileo · nivel ${i + 1}: ${nivel.titulo}`);
      const m = MUNDOS.find((x) => x.n === nivel.mundo)!;
      $(".rb-mision summary").innerHTML = `<span class="rb-mundo-ins">${m.emoji} ${esc(m.nombre)} · nivel ${i + 1} de ${NIVELES.length}</span> <b>${esc(nivel.titulo)}</b>`;
      $(".rb-mision-txt").innerHTML = `<p>${nivel.historia}</p><p class="rb-objetivo">🎯 ${nivel.objetivo}</p>`;
      barraNiveles();
      pintarMapas();
      pintarMapa();
      pintarEditor();
      pintarMensaje();
    }

    // ---------------------------------------------------------------- mapa
    function pintarMapas(): void {
      const caja = $(".rb-mapas");
      if (nivel.mapas.length < 2) {
        caja.hidden = true;
        return;
      }
      caja.hidden = false;
      caja.innerHTML = nivel.mapas
        .map((_, k) => {
          const r = tr?.ver.mapas[k];
          return `<button role="tab" data-mapa="${k}" aria-selected="${k === mapaSel}" class="${k === mapaSel ? "on" : ""}${r ? (r.ok ? " ok" : " mal") : ""}">Mapa ${k + 1}${r ? (r.ok ? " ✓" : " ✗") : ""}</button>`;
        })
        .join("");
    }

    function pintarMapa(): void {
      mundo = crearMundo(nivel.mapas[mapaSel]);
      $(".rb-svg").innerHTML = dibujarMapa(nivel.mapas[mapaSel]);
      angulo = mundo.inicial.d * 90;
      pintarEscena();
    }

    function estadoActual(): Estado {
      if (!tr || tr.k === 0) return mundo.inicial;
      return tr.ver.mapas[tr.mapa].ejecucion.pasos[tr.k - 1].estado;
    }

    function pintarEscena(): void {
      const e = estadoActual();
      const svg = raiz.querySelector<SVGSVGElement>(".rb-mapa");
      if (svg) {
        const robot = svg.querySelector<SVGGElement>(".rb-robot")!;
        const giro = svg.querySelector<SVGGElement>(".rb-giro")!;
        robot.style.transform = `translate(${e.x * S}px, ${e.y * S}px)`;
        const objetivo = e.d * 90;
        const delta = ((objetivo - (((angulo % 360) + 360) % 360) + 540) % 360) - 180;
        angulo += delta;
        giro.style.transform = `rotate(${angulo}deg)`;
        svg.querySelectorAll<SVGGElement>(".rb-moneda").forEach((m) => m.classList.toggle("tomada", !e.monedas.includes(m.dataset.k!)));
        const enSalida = e.x === mundo.inicial.x && e.y === mundo.inicial.y;
        svg.querySelectorAll<SVGGElement>(".rb-marca").forEach((m) => (m.style.display = enSalida ? "" : "none"));
        const pasos = tr ? tr.ver.mapas[tr.mapa].ejecucion.pasos : [];
        const ultimo = tr && tr.k > 0 ? pasos[tr.k - 1] : null;
        robot.classList.toggle("fallo", ultimo?.tipo === "fallo");
      }
      pintarNota();
      pintarCodigoVivo();
      const rango = $<HTMLInputElement>(".rb-scrub");
      const total = tr ? tr.ver.mapas[tr.mapa].ejecucion.pasos.length : 0;
      rango.max = String(total);
      rango.value = String(tr?.k ?? 0);
      rango.disabled = !tr;
      const jugar = $(".rb-jugar");
      jugar.textContent = tr?.jugando ? "⏸ Pausa" : tr && !tr.fin && tr.k > 0 ? "▶ Seguir" : tr?.fin ? "▶ Otra vez" : "▶ Jugar";
    }

    function pintarNota(): void {
      const caja = $(".rb-nota");
      if (!tr) {
        caja.innerHTML = `<span class="rb-nota-vacia">Construye tu programa y pulsa <b>▶ Jugar</b> para ver cómo lo ejecuta el robot.</span>`;
        return;
      }
      if (tr.k === 0) {
        caja.innerHTML = `<span class="rb-nota-vacia">Listo para empezar…</span>`;
        return;
      }
      const p = tr.ver.mapas[tr.mapa].ejecucion.pasos[tr.k - 1];
      const chips = p.vars.map((v) => `<span class="rb-var"><i>${esc(v.n)}</i> = <b>${v.v}</b></span>`).join("");
      const vuelta = p.tipo === "cond" && p.vuelta !== undefined ? `<span class="rb-vuelta">vuelta ${p.vuelta + (p.si ? 1 : 0)}</span>` : "";
      const clase = p.tipo === "fallo" ? " mal" : p.tipo === "cond" ? (p.si ? " si" : " no") : "";
      caja.innerHTML = `<span class="rb-paso${clase}"><code>línea ${p.linea}</code> ${esc(p.nota)}</span>${vuelta}<span class="rb-vars">${chips}</span>`;
    }

    // ---------------------------------------------------------------- editor
    function opcionesCond(actual: string): string {
      const sensores = nivel.sensores;
      return sensores
        .flatMap((s) => [s, `!${s}`])
        .map((v) => `<option value="${v}"${v === actual ? " selected" : ""}>${v.startsWith("!") ? "!" : ""}${v.replace("!", "")}()</option>`)
        .join("");
    }

    function bloqueHtml(s: Sent, ruta: number[]): string {
      const r = ruta.join(".");
      const ctl = `<span class="rb-ctl"><button data-op="sube" title="Subir" aria-label="Subir">↑</button><button data-op="baja" title="Bajar" aria-label="Bajar">↓</button><button data-op="borra" title="Quitar" aria-label="Quitar">✕</button></span>`;
      const esDestino = ruta.length === destino.length && ruta.every((v, k) => v === destino[k]);
      const hijos = (lista: Sent[]) => `<div class="rb-hijos${esDestino ? " dest" : ""}" data-r="${r}">${lista.length ? lista.map((h, k) => bloqueHtml(h, [...ruta, k])).join("") : `<div class="rb-vacio">${esDestino ? "Los bloques nuevos entran aquí" : "vacío · pulsa aquí para añadir dentro"}</div>`}</div>`;
      if (s.t === "accion") {
        const b = BLOQUES[s.n as BloqueId];
        return `<div class="rb-b ${b?.clase ?? "mov"}" data-r="${r}"><span class="rb-b-txt">${b?.icono ?? ""} ${esc(s.n)}()</span>${ctl}</div>`;
      }
      if (s.t === "for") {
        const n = comoRepetir(s) ?? 1;
        return `<div class="rb-b bucle rb-cont" data-r="${r}"><div class="rb-cab"><span class="rb-b-txt">🔁 repetir <input type="number" min="1" max="99" value="${n}" data-n aria-label="Número de repeticiones"> veces</span>${ctl}</div>${hijos(s.cuerpo)}</div>`;
      }
      if (s.t === "while" || s.t === "if") {
        const c = condSimple(s.cond);
        const sel = `<select data-c aria-label="Condición">${opcionesCond(c ? (c.negado ? "!" : "") + c.sensor : "")}</select>`;
        return `<div class="rb-b ${s.t === "while" ? "bucle" : "cond"} rb-cont" data-r="${r}"><div class="rb-cab"><span class="rb-b-txt">${s.t === "while" ? "🔄 mientras" : "❓ si"} ${sel}</span>${ctl}</div>${hijos(s.cuerpo)}</div>`;
      }
      if (s.t === "dowhile") {
        const c = condSimple(s.cond);
        const sel = `<select data-c aria-label="Condición">${opcionesCond(c ? (c.negado ? "!" : "") + c.sensor : "")}</select>`;
        return `<div class="rb-b bucle rb-cont" data-r="${r}"><div class="rb-cab"><span class="rb-b-txt">🔂 hacer</span>${ctl}</div>${hijos(s.cuerpo)}<div class="rb-pie-bloque"><span class="rb-b-txt">mientras ${sel}</span></div></div>`;
      }
      return "";
    }

    function pintarEditor(): void {
      const cuerpo = $(".rb-ed-cuerpo");
      raiz.querySelectorAll<HTMLElement>("[data-vista]").forEach((b) => b.classList.toggle("on", b.dataset.vista === modo));
      const bloquesDe = nivel.bloques;
      if (modo === "bloques") {
        const paleta = bloquesDe
          .map((id) => `<button class="rb-ficha ${BLOQUES[id].clase}" data-add="${id}" title="Añadir ${esc(BLOQUES[id].texto)}">${BLOQUES[id].icono} ${esc(BLOQUES[id].texto)}</button>`)
          .join("");
        const raizDestino = destino.length === 0;
        cuerpo.innerHTML = `
          <div class="rb-paleta" aria-label="Bloques disponibles">${paleta}</div>
          <div class="rb-ws${raizDestino ? " dest" : ""}" data-r="" aria-label="Tu programa">${prog.length ? prog.map((s, k) => bloqueHtml(s, [k])).join("") : `<div class="rb-vacio">Pulsa un bloque de arriba para empezar tu programa</div>`}</div>
          <div class="rb-java-cab">Así se escribe en Java <span>(se actualiza solo)</span></div>
          <div class="rb-java"></div>`;
      } else {
        const chips = bloquesDe.map((id) => `<button class="rb-chip ${BLOQUES[id].clase}" data-ins="${id}" title="Inserta ${esc(BLOQUES[id].texto)}">${esc(PLANTILLAS[id].split("\n")[0].replace("§", "…"))}</button>`).join("");
        const sens = nivel.sensores.map((s) => `<button class="rb-chip sens" data-sen="${s}" title="${esc(SENSORES[s].doc)}">${s}()</button>`).join("");
        cuerpo.innerHTML = `
          <div class="rb-chips" aria-label="Fragmentos de código">${chips}${sens}</div>
          <div class="rb-java-cab">Tu código Java <span>· <kbd>Tab</kbd> sangra · <kbd>Ctrl</kbd>+<kbd>Intro</kbd> ejecuta</span></div>
          <div class="rb-java-zona"></div>`;
        pintarZonaJava();
      }
      pintarCodigoVivo();
      pintarMeter();
    }

    /** en modo Java: textarea, o el código resaltado mientras se ejecuta */
    function pintarZonaJava(): void {
      const zona = raiz.querySelector<HTMLElement>(".rb-java-zona");
      if (!zona) return;
      if (tr) {
        zona.innerHTML = `<div class="rb-java"></div><button class="rb-editar" data-a="editar">✎ Seguir editando</button>`;
      } else {
        zona.innerHTML = `<textarea class="rb-ed" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Código Java" rows="${Math.max(9, texto.split("\n").length + 2)}">${esc(texto)}</textarea>`;
      }
      pintarCodigoVivo();
    }

    /** código Java resaltado con la línea que se está ejecutando */
    function pintarCodigoVivo(): void {
      const caja = raiz.querySelector<HTMLElement>(".rb-java");
      if (!caja) return;
      const lineas = texto.length ? texto.split("\n") : [""];
      const activa = tr && tr.k > 0 ? tr.ver.mapas[tr.mapa].ejecucion.pasos[tr.k - 1].linea - 1 : -1;
      caja.innerHTML = bloqueJava(lineas, activa);
      const l = caja.querySelector<HTMLElement>(".jv-l.on");
      if (l) l.scrollIntoView({ block: "nearest" });
    }

    function pintarMeter(): void {
      let usadas = 0;
      let valido = true;
      if (modo === "bloques") usadas = contar(prog);
      else if (errorJava) valido = false;
      else {
        const r = compilar(texto);
        usadas = "prog" in r ? contar(r.prog) : 0;
        valido = "prog" in r;
      }
      const lim = nivel.limite;
      const pastillas = Array.from({ length: Math.max(lim, usadas) }, (_, k) => `<i class="${k < usadas ? (k >= lim ? "de-mas" : "llena") : ""}"></i>`).join("");
      $(".rb-meter").innerHTML = `<span class="rb-meter-t">🧱 Instrucciones</span><span class="rb-pastillas">${pastillas}</span><b class="${usadas > lim ? "pasa" : ""}">${valido ? usadas : "–"} / ${lim}</b>`;
    }

    function pintarMensaje(): void {
      const m = $(".rb-mensaje");
      if (errorJava && modo === "java" && texto.trim() && !tr) {
        m.className = "rb-mensaje mal";
        m.innerHTML = `⛔ <b>Error de compilación${errorJava.linea ? ` (línea ${errorJava.linea})` : ""}:</b> ${esc(errorJava.mensaje)}`;
      } else {
        m.className = "rb-mensaje";
        m.innerHTML = aviso;
      }
      $('[data-a="pista"]').textContent = pedidas === 0 ? "💡 Pista (1 de 3)" : pedidas === 1 ? "💡 Pista (2 de 3)" : "💡 Ver solución (3 de 3)";
    }

    // ---------------------------------------------------------------- ejecución
    function pasosActuales() {
      return tr ? tr.ver.mapas[tr.mapa].ejecucion.pasos : [];
    }
    function detener(): void {
      window.clearTimeout(temporizador);
      if (tr) tr.jugando = false;
    }
    function reiniciarTraza(): void {
      detener();
      const habia = !!tr;
      tr = null;
      ocultarBanner();
      pintarMapas();
      if (habia) {
        pintarEscena();
        if (modo === "java") pintarZonaJava();
      }
    }

    function preparar(): boolean {
      if (modo === "java") compilarAhora();
      const r = compilar(texto);
      if ("error" in r) {
        errorJava = r.error;
        pintarMensaje();
        return false;
      }
      errorJava = null;
      aviso = "";
      ocultarBanner();
      const ver = evaluar(nivel, r.prog);
      const fallido = ver.mapas.findIndex((m) => !m.ok);
      if (nivel.mapas.length > 1 && fallido >= 0) mapaSel = fallido;
      tr = { ver, mapa: mapaSel, k: 0, jugando: false, fin: false };
      pintarMapas();
      pintarMapa();
      if (modo === "java") pintarZonaJava();
      pintarMensaje();
      return true;
    }

    function tic(): void {
      if (!tr || !tr.jugando) return;
      const total = pasosActuales().length;
      if (tr.k >= total) return terminar();
      tr.k++;
      pintarEscena();
      if (tr.k >= total) return terminar();
      temporizador = window.setTimeout(tic, VELOCIDADES[velocidad].ms);
    }

    function jugar(): void {
      if (tr?.jugando) {
        detener();
        pintarEscena();
        return;
      }
      if (!tr && !preparar()) return;
      const t = tr!;
      if (t.fin) {
        t.k = 0;
        t.fin = false;
        ocultarBanner();
      }
      t.jugando = true;
      if (VELOCIDADES[velocidad].ms === 0) {
        t.k = pasosActuales().length;
        pintarEscena();
        return terminar();
      }
      if (pasosActuales().length === 0) return terminar();
      tic();
    }

    function paso(): void {
      if (!tr && !preparar()) return;
      const t = tr!;
      detener();
      if (t.fin) {
        t.k = 0;
        t.fin = false;
        ocultarBanner();
      }
      if (t.k < pasosActuales().length) t.k++;
      pintarEscena();
      if (t.k >= pasosActuales().length) terminar();
    }

    function terminar(): void {
      if (!tr) return;
      tr.jugando = false;
      tr.fin = true;
      pintarEscena();
      mostrarBanner();
    }

    function ocultarBanner(): void {
      $(".rb-banner").hidden = true;
    }

    function mostrarBanner(): void {
      if (!tr) return;
      const ver = tr.ver;
      const caja = $(".rb-banner");
      caja.hidden = false;
      const optimo = (() => {
        const r = compilar(nivel.solucion);
        return "prog" in r ? contar(r.prog) : nivel.limite;
      })();
      if (ver.superado) {
        const estrellas = ver.instrucciones <= optimo ? 3 : 2;
        if (!reg.hechas.includes(nivel.id)) reg.hechas.push(nivel.id);
        reg.estrellas[nivel.id] = Math.max(reg.estrellas[nivel.id] ?? 0, estrellas);
        guardarCodigo();
        barraNiveles();
        const hay = i < NIVELES.length - 1;
        caja.className = "rb-banner ganas";
        caja.innerHTML = `<div class="rb-tarjeta"><div class="rb-confeti">🎉</div><h3>¡Nivel superado!</h3><div class="rb-stars" aria-label="${estrellas} estrellas">${"⭐".repeat(estrellas)}${"☆".repeat(3 - estrellas)}</div><p class="rb-uso">${ver.instrucciones} instrucciones (máximo ${nivel.limite})${estrellas < 3 ? ` · la solución más corta usa ${optimo}` : " · ¡solución óptima!"}</p><p class="rb-aprende">${nivel.aprende}</p><div class="rb-tarjeta-bt"><button data-a="repetir">↺ Ver otra vez</button>${hay ? `<button data-a="sig" class="rb-primario">Siguiente nivel ▸</button>` : `<span class="rb-fin">🏁 ¡Has terminado todos los niveles disponibles!</span>`}</div></div>`;
        return;
      }
      const mal = ver.mapas.map((m, k) => ({ m, k })).filter((x) => !x.m.ok);
      let msg: string;
      if (mal.length) {
        const { m, k } = mal[0];
        msg = `${ver.mapas.length > 1 ? `<b>Mapa ${k + 1}:</b> ` : ""}${esc(m.motivo)}`;
        if (ver.mapas.length > 1 && mal.length < ver.mapas.length) msg += `<br><small>Funciona en ${ver.mapas.length - mal.length} de ${ver.mapas.length} mapas. Tu programa debe servir para todos.</small>`;
      } else msg = `Funciona, ¡pero usa <b>${ver.instrucciones}</b> instrucciones y el máximo es <b>${nivel.limite}</b>! Busca lo que se repite y mételo en un bucle.`;
      caja.className = "rb-banner pierdes";
      caja.innerHTML = `<div class="rb-tarjeta"><div class="rb-confeti">🔧</div><h3>Todavía no</h3><p>${msg}</p><div class="rb-tarjeta-bt"><button data-a="cerrar" class="rb-primario">Ajustar mi programa</button></div></div>`;
    }

    // ---------------------------------------------------------------- bloques: operaciones
    function listaEn(ruta: number[]): Sent[] | null {
      let cur = prog;
      for (const k of ruta) {
        const s = cur[k];
        if (!s || !("cuerpo" in s)) return null;
        cur = s.cuerpo;
      }
      return cur;
    }
    const rutaDe = (el: HTMLElement | null): number[] | null => {
      const b = el?.closest<HTMLElement>(".rb-b");
      if (!b) return null;
      return b.dataset.r!.split(".").map(Number);
    };

    function cambio(): void {
      modelo();
      if (!listaEn(destino)) destino = [];
      guardarCodigo();
      reiniciarTraza();
      aviso = "";
      pintarEditor();
      pintarMensaje();
    }

    function anadir(id: BloqueId): void {
      const lista = listaEn(destino) ?? prog;
      const sensor = nivel.sensores[0] ?? "hayPared";
      let nuevo: Sent;
      if (id === "repetir") nuevo = repetir(3, []);
      else if (id === "mientras") nuevo = { t: "while", cond: { k: "no", e: { k: "sensor", n: sensor } }, cuerpo: [], l: 0 };
      else if (id === "hacerMientras") nuevo = { t: "dowhile", cond: { k: "no", e: { k: "sensor", n: sensor } }, cuerpo: [], l: 0, lCond: 0 };
      else if (id === "si") nuevo = { t: "if", cond: { k: "sensor", n: sensor }, cuerpo: [], sino: null, l: 0, lSino: 0 };
      else nuevo = { t: "accion", n: id, l: 0 };
      lista.push(nuevo);
      const esContenedor = "cuerpo" in nuevo;
      if (esContenedor) destino = [...destino, lista.length - 1];
      cambio();
      const ws = raiz.querySelector(".rb-ws");
      if (ws) ws.scrollTop = ws.scrollHeight;
    }

    function operar(op: string, ruta: number[]): void {
      const padre = listaEn(ruta.slice(0, -1));
      if (!padre) return;
      const k = ruta[ruta.length - 1];
      if (op === "borra") {
        padre.splice(k, 1);
        if (destino.length >= ruta.length && ruta.every((v, j) => v === destino[j])) destino = ruta.slice(0, -1);
      } else if (op === "sube" && k > 0) [padre[k - 1], padre[k]] = [padre[k], padre[k - 1]];
      else if (op === "baja" && k < padre.length - 1) [padre[k + 1], padre[k]] = [padre[k], padre[k + 1]];
      destino = [];
      cambio();
    }

    function condDe(valor: string): Expr {
      const negado = valor.startsWith("!");
      const sensor = valor.replace("!", "");
      return negado ? { k: "no", e: { k: "sensor", n: sensor } } : { k: "sensor", n: sensor };
    }

    // ---------------------------------------------------------------- vistas
    function aBloques(): void {
      compilarAhora();
      const r = compilar(texto);
      if ("error" in r) {
        aviso = "No puedo pasar a bloques mientras el código tenga errores: corrígelos primero.";
        return pintarMensaje();
      }
      if (!sePuedeEnBloques(r.prog)) {
        aviso = "Tu código usa cosas que los bloques todavía no muestran (otro tipo de <code>for</code>, variables, <code>else</code>…). Sigue en Java.";
        return pintarMensaje();
      }
      reiniciarTraza();
      prog = r.prog;
      destino = [];
      modo = "bloques";
      modelo();
      aviso = "";
      guardarCodigo();
      pintarEditor();
      pintarMensaje();
    }
    function aJava(): void {
      reiniciarTraza();
      modo = "java";
      compilarAhora();
      guardarCodigo();
      aviso = "";
      pintarEditor();
      pintarMensaje();
    }

    function insertar(plantilla: string): void {
      const ed = raiz.querySelector<HTMLTextAreaElement>(".rb-ed");
      if (!ed) return;
      const pos = ed.selectionStart;
      const antes = ed.value.slice(0, pos);
      const sang = /^[ \t]*/.exec(antes.slice(antes.lastIndexOf("\n") + 1))![0];
      const frag = plantilla.replace(/\n/g, "\n" + sang);
      const marca = frag.indexOf("§");
      const lineaVacia = antes.slice(antes.lastIndexOf("\n") + 1).trim() === "";
      const pre = lineaVacia ? "" : "\n" + sang;
      const limpio = frag.replace("§", "");
      ed.setRangeText(pre + limpio, pos, ed.selectionEnd, "end");
      const nuevo = marca >= 0 ? pos + pre.length + marca : pos + pre.length + limpio.length;
      ed.setSelectionRange(nuevo, nuevo);
      ed.focus();
      ed.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // ---------------------------------------------------------------- eventos
    raiz.addEventListener("click", (e) => {
      const t = e.target as HTMLElement;
      const b = t.closest<HTMLElement>("button");
      if (!b) {
        // clic en una zona vacía o en la cabecera de un contenedor: destino de los bloques nuevos
        if (modo !== "bloques" || tr) return;
        if (t.closest("input, select")) return;
        const cont = t.closest<HTMLElement>(".rb-cont");
        const ws = t.closest<HTMLElement>(".rb-ws");
        if (cont && (t.closest(".rb-cab") || t.closest(".rb-hijos") === cont.querySelector(":scope > .rb-hijos") || t.closest(".rb-pie-bloque"))) {
          const sobreHijo = t.closest(".rb-b") !== cont;
          if (!sobreHijo) {
            destino = rutaDe(cont)!;
            pintarEditor();
          }
        } else if (ws && !t.closest(".rb-b")) {
          destino = [];
          pintarEditor();
        }
        return;
      }
      const d = b.dataset;
      if (d.n !== undefined) return cargarNivel(Number(d.n));
      if (d.mapa !== undefined) {
        detener();
        mapaSel = Number(d.mapa);
        if (tr) {
          tr.mapa = mapaSel;
          tr.k = 0;
          tr.fin = false;
          ocultarBanner();
        }
        pintarMapas();
        pintarMapa();
        return;
      }
      if (d.vista) return d.vista === modo ? undefined : d.vista === "bloques" ? aBloques() : aJava();
      if (d.add) return anadir(d.add as BloqueId);
      if (d.op) {
        const ruta = rutaDe(b);
        if (ruta) operar(d.op, ruta);
        return;
      }
      if (d.ins) return insertar(PLANTILLAS[d.ins as BloqueId]);
      if (d.sen) return insertar(`${d.sen}()`);
      if (d.vel !== undefined) {
        velocidad = Number(d.vel);
        pintarVel();
        return;
      }
      switch (d.a) {
        case "jugar":
          return jugar();
        case "paso":
          return paso();
        case "reiniciar":
          detener();
          if (tr) {
            tr.k = 0;
            tr.fin = false;
          }
          ocultarBanner();
          return pintarEscena();
        case "editar":
          return reiniciarTraza();
        case "cerrar":
          return ocultarBanner();
        case "repetir":
          ocultarBanner();
          if (tr) {
            tr.k = 0;
            tr.fin = false;
          }
          return jugar();
        case "sig":
          return cargarNivel(i + 1);
        case "cero":
          texto = nivel.modo === "java" ? inicialJava : "";
          prog = [];
          destino = [];
          modo = nivel.modo;
          delete reg.codigos[nivel.id];
          delete reg.modos[nivel.id];
          guardado.guardar(reg);
          reiniciarTraza();
          compilarAhora();
          aviso = "";
          pintarEditor();
          return pintarMensaje();
        case "pista": {
          const m = $(".rb-mensaje");
          m.className = "rb-mensaje pista";
          if (pedidas < 2) {
            m.innerHTML = `<b>Pista ${pedidas + 1}:</b> ${nivel.pistas[pedidas]}`;
            pedidas++;
          } else {
            m.innerHTML = `<b>Solución:</b><pre class="rb-sol">${esc(nivel.solucion)}</pre>`;
            pedidas = 3;
          }
          aviso = m.innerHTML;
          $('[data-a="pista"]').textContent = pedidas < 2 ? `💡 Pista (${pedidas + 1} de 3)` : pedidas === 2 ? "💡 Ver solución (3 de 3)" : "💡 Solución mostrada";
          return;
        }
      }
    });

    raiz.addEventListener("change", (e) => {
      const t = e.target as HTMLElement;
      const ruta = rutaDe(t);
      if (!ruta) return;
      const padre = listaEn(ruta.slice(0, -1));
      const s = padre?.[ruta[ruta.length - 1]];
      if (!s) return;
      if (t.hasAttribute("data-n") && s.t === "for") {
        const n = Math.max(1, Math.min(99, Number((t as HTMLInputElement).value) || 1));
        padre![ruta[ruta.length - 1]] = repetir(n, s.cuerpo);
      } else if (t.hasAttribute("data-c") && (s.t === "while" || s.t === "dowhile" || s.t === "if")) s.cond = condDe((t as HTMLSelectElement).value);
      else return;
      cambio();
    });

    raiz.addEventListener("input", (e) => {
      const t = e.target as HTMLElement;
      if (t.classList.contains("rb-scrub")) {
        if (!tr) return;
        detener();
        tr.k = Number((t as HTMLInputElement).value);
        tr.fin = false;
        ocultarBanner();
        pintarEscena();
        return;
      }
      if (!t.classList.contains("rb-ed")) return;
      texto = (t as HTMLTextAreaElement).value;
      guardarCodigo();
      window.clearTimeout(compilacion);
      compilacion = window.setTimeout(() => {
        compilarAhora();
        aviso = "";
        pintarMensaje();
        pintarMeter();
      }, 250);
    });

    raiz.addEventListener("keydown", (e) => {
      const ev = e as KeyboardEvent;
      if (ev.key === "Enter" && ev.ctrlKey) {
        ev.preventDefault();
        return jugar();
      }
      const ed = ev.target as HTMLTextAreaElement;
      if (!ed.classList?.contains("rb-ed")) return;
      if (ev.key === "Tab" && !ev.ctrlKey && !ev.altKey) {
        ev.preventDefault();
        ed.setRangeText("  ", ed.selectionStart, ed.selectionEnd, "end");
        ed.dispatchEvent(new Event("input", { bubbles: true }));
      } else if (ev.key === "Enter" && !ev.shiftKey) {
        // conserva la sangría y añade un nivel después de «{»
        ev.preventDefault();
        const pos = ed.selectionStart;
        const antes = ed.value.slice(0, pos);
        const linea = antes.slice(antes.lastIndexOf("\n") + 1);
        const sang = /^[ \t]*/.exec(linea)![0];
        const abre = linea.trimEnd().endsWith("{");
        const cierra = abre && ed.value.slice(pos).trimStart().startsWith("}");
        const ins = "\n" + sang + (abre ? "  " : "") + (cierra ? "\n" + sang : "");
        ed.setRangeText(ins, pos, ed.selectionEnd, "end");
        const nuevo = pos + 1 + sang.length + (abre ? 2 : 0);
        ed.setSelectionRange(nuevo, nuevo);
        ed.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });

    function pintarVel(): void {
      $(".rb-vel").innerHTML = VELOCIDADES.map((v, k) => `<button data-vel="${k}" class="${k === velocidad ? "on" : ""}" title="${v.titulo}" aria-label="Velocidad: ${v.titulo}" aria-pressed="${k === velocidad}">${v.etq}</button>`).join("");
    }

    pintarVel();
    cargarNivel(i);
    return () => {
      window.clearTimeout(temporizador);
      window.clearTimeout(compilacion);
    };
  },
};


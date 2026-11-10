// «CTF de Strings» (0485 · UT02 §10): nueve pruebas de «capturar la bandera». Se escribe un script de
// Java sobre la variable `s` (con autocompletado) y se transforma el mensaje interceptado hasta
// obtener la bandera. La traza enseña `s` tras cada sentencia, y avisa de las llamadas cuyo resultado
// se pierde (los String son inmutables).

import type { AppDef } from "../../../kernel/kernel";
import { esc, progreso, resaltarJava } from "../comun";
import { sugerir, type Propuesta } from "./autocompletar";
import { STRING, ejecutar, firmaDe, type Resultado } from "./interprete";
import { PRUEBAS } from "./pruebas";

interface Registro {
  hechas: string[];
  /** lo último que escribió el alumno al capturar cada bandera */
  codigos: Record<string, string>;
}
const guardado = progreso<Registro>("osg-java-ctf", { hechas: [], codigos: {} });

const q = (t: string) => `"${t}"`;

export const ctfDeStrings: AppDef = {
  id: "java-ctf",
  nombre: "CTF de Strings",
  carpeta: "0485 · Programación",
  icono: `<svg viewBox="0 0 48 48"><rect x="3" y="3" width="42" height="42" rx="8" fill="#0d0b1e" stroke="#da251c" stroke-width="2.5"/><path d="M15 8v32" stroke="#e8e4ff" stroke-width="3" stroke-linecap="round"/><path d="M15 10h22l-5 7 5 7H15z" fill="#da251c"/><text x="24" y="21" font-family="Consolas,monospace" font-size="8" font-weight="700" fill="#fff" text-anchor="middle">"…"</text></svg>`,
  ancho: 860,
  alto: 740,
  iniciar({ ventana, raiz }) {
    raiz.classList.add("cj", "jv");
    const reg = guardado.leer();
    const primera = PRUEBAS.findIndex((p) => !reg.hechas.includes(p.id));
    let i = primera < 0 ? 0 : primera;
    let pedidas = 0;
    let resuelta = false;
    let temporizador = 0;
    let propuesta: Propuesta | null = null;
    let elegida = 0;

    raiz.innerHTML = `<div class="jv-cuerpo"></div>`;
    const cuerpo = raiz.querySelector<HTMLElement>(".jv-cuerpo")!;
    const etiquetaPista = () => (pedidas === 0 ? "💡 Pista (1 de 3)" : pedidas === 1 ? "💡 Pista (2 de 3)" : "💡 Ver solución (3 de 3)");

    const fichas = () =>
      PRUEBAS.map((p, n) => `<button data-n="${n}" class="${n === i ? "on" : ""}${reg.hechas.includes(p.id) ? " ok" : ""}" title="${esc(p.titulo)}" aria-label="Prueba ${n + 1}: ${esc(p.titulo)}${reg.hechas.includes(p.id) ? ", superada" : ""}">${n + 1}</button>`).join("");

    function prueba(n: number): void {
      i = n;
      pedidas = 0;
      resuelta = false;
      propuesta = null;
      const p = PRUEBAS[i];
      const guardada = reg.hechas.includes(p.id) ? reg.codigos[p.id] : undefined;
      ventana.fijarTitulo(`CTF de Strings · prueba ${i + 1}: ${p.titulo}`);
      cuerpo.innerHTML = `
        <div class="cj-niveles" role="group" aria-label="Pruebas">${fichas()}</div>
        <div class="cj-ficha"><span class="cj-bloque">Prueba ${i + 1} de ${PRUEBAS.length}</span><h3>🚩 ${esc(p.titulo)}</h3><p>${p.historia}</p><p><b>Objetivo:</b> ${p.objetivo}</p></div>
        <div><div class="ctf-etq">Mensaje interceptado (<code>s</code> al empezar)</div><pre class="ctf-msg">${esc(q(p.entrada))}</pre></div>
        <div class="ctf-editor">
          <div class="ctf-etq">Tu script (Java) · <kbd>Tab</kbd> acepta la sugerencia · <kbd>Ctrl</kbd>+<kbd>Espacio</kbd> las muestra</div>
          <textarea class="ctf-ed" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Script de Java" rows="${Math.max(7, p.solucion.split("\n").length + 3)}">${esc(guardada ?? p.inicial)}</textarea>
          <div class="ctf-sug" role="listbox" aria-label="Sugerencias" hidden></div>
        </div>
        <div class="ctf-traza" aria-live="polite"></div>
        <p class="cj-mensaje" aria-live="polite"></p>
        <p class="cj-mensaje pista cj-ayuda" aria-live="polite" hidden></p>
        <div class="cj-pie">
          <button data-a="ant" ${i === 0 ? "disabled" : ""}>◂ Anterior</button>
          <button data-a="pista">${etiquetaPista()}</button>
          <button data-a="reiniciar" title="Vuelve al script de partida">↺ Reiniciar</button>
          <button data-a="sig" class="cj-primario" ${i === PRUEBAS.length - 1 ? "disabled" : ""} hidden>Siguiente ▸</button>
          <span class="cj-marcador">Banderas: <b>${reg.hechas.length}</b> / ${PRUEBAS.length}</span>
        </div>
        <details class="ctf-ayuda"><summary>📖 Métodos de String disponibles</summary>${STRING.map((d) => `<div class="jv-api-fila"><code>${esc(firmaDe(d))} → ${esc(d.ret)}</code><span>${esc(d.doc)}</span></div>`).join("")}</details>`;
      ejecutarYMostrar();
    }

    const editor = () => cuerpo.querySelector<HTMLTextAreaElement>(".ctf-ed")!;
    const mensaje = (html: string, clase = "") => {
      const m = cuerpo.querySelector<HTMLElement>(".cj-mensaje")!;
      m.className = `cj-mensaje ${clase}`;
      m.innerHTML = html;
    };

    /** primera posición en la que el resultado se aparta de la bandera */
    function primeraDiferencia(a: string, b: string): number {
      let k = 0;
      while (k < a.length && k < b.length && a[k] === b[k]) k++;
      return k;
    }

    function pintarTraza(r: Resultado): void {
      const p = PRUEBAS[i];
      const filas = r.pasos
        .map(
          (x) =>
            `<div class="ctf-paso"><span class="ctf-n">línea ${x.linea}</span><code>${resaltarJava(x.codigo)}</code><span class="ctf-res"><i>s =</i> <b>${x.s === null ? "(no es un String)" : esc(q(x.s))}</b>${x.vars.map((v) => ` · <i>${esc(v.nombre)} =</i> <b>${esc(v.valor)}</b>`).join("")}</span>${x.aviso ? `<span class="ctf-aviso">⚠ ${esc(x.aviso)}</span>` : ""}</div>`,
        )
        .join("");
      const inicio = `<div class="ctf-paso ctf-inicio"><span class="ctf-n">inicio</span><span class="ctf-res"><i>s =</i> <b>${esc(q(p.entrada))}</b></span></div>`;
      const error = r.error ? `<div class="ctf-error"><b>${r.error.momento === "compilación" ? "⛔ Error de compilación" : "💥 Error en ejecución"}${r.error.linea ? ` (línea ${r.error.linea})` : ""}:</b> ${esc(r.error.mensaje)}${r.error.momento === "compilación" ? "<br><small>Un programa real ni arrancaría; aquí ves hasta dónde llega.</small>" : ""}</div>` : "";
      cuerpo.querySelector(".ctf-traza")!.innerHTML = inicio + filas + error;
    }

    function ejecutarYMostrar(): void {
      const p = PRUEBAS[i];
      const r = ejecutar(editor().value, p.entrada);
      pintarTraza(r);
      const sig = cuerpo.querySelector<HTMLElement>('[data-a="sig"]')!;
      if (!r.error && r.s === p.bandera && r.pasos.length) {
        if (!resuelta) {
          resuelta = true;
          if (!reg.hechas.includes(p.id)) reg.hechas.push(p.id);
          reg.codigos[p.id] = editor().value;
          guardado.guardar(reg);
          cuerpo.querySelector<HTMLElement>(".cj-marcador b")!.textContent = String(reg.hechas.length);
          cuerpo.querySelectorAll<HTMLElement>(".cj-niveles button")[i].classList.add("ok");
        }
        const todas = PRUEBAS.every((x) => reg.hechas.includes(x.id));
        mensaje(
          `<span class="ctf-bandera">🚩 GALILEO{${esc(p.bandera)}}</span><br>¡Bandera capturada!<span class="cj-explica">${p.aprende}</span>${todas ? `<span class="cj-explica ctf-final">🏁 <b>Expediente completo.</b> Has desmontado los nueve cifrados: leetspeak, ruido, separadores, corchetes, inversión, inmutabilidad, posiciones, orden y las tres capas del jefe final. Todas las banderas: ${PRUEBAS.map((x) => `<code>GALILEO{${esc(x.bandera)}}</code>`).join(" ")}</span>` : ""}`,
          "ok",
        );
        sig.hidden = i === PRUEBAS.length - 1;
      } else {
        if (resuelta) {
          resuelta = false;
          sig.hidden = true;
        }
        if (r.error || !editor().value.trim()) mensaje("");
        else if (r.s === null) mensaje("✗ Al terminar, <code>s</code> debe seguir siendo un <code>String</code>.", "mal");
        else {
          const k = primeraDiferencia(r.s, p.bandera);
          const quedan = r.s.length === p.bandera.length ? "" : ` Tu resultado mide ${r.s.length} caracteres; la bandera, ${p.bandera.length}.`;
          mensaje(r.pasos.length ? `Todavía no es la bandera. Los primeros <b>${k}</b> caracteres coinciden.${quedan}` : "", r.pasos.length ? "mal" : "");
        }
      }
    }

    // ---- autocompletado ----
    const panel = () => cuerpo.querySelector<HTMLElement>(".ctf-sug")!;
    function ocultar(): void {
      propuesta = null;
      panel().hidden = true;
    }
    function mostrarPropuesta(forzar = false): void {
      const ed = editor();
      propuesta = sugerir(ed.value, ed.selectionStart, PRUEBAS[i].entrada, forzar);
      elegida = 0;
      pintarSugerencias();
    }
    function pintarSugerencias(): void {
      const caja = panel();
      if (!propuesta) return void (caja.hidden = true);
      caja.hidden = false;
      caja.innerHTML = propuesta.items
        .slice(0, 8)
        .map((s, k) => `<button type="button" role="option" data-s="${k}" class="${k === elegida ? "on" : ""}" aria-selected="${k === elegida}"><code>${esc(s.firma)}</code><span>${esc(s.doc)}</span></button>`)
        .join("");
    }
    function aceptar(k: number): void {
      if (!propuesta) return;
      const s = propuesta.items[k];
      const ed = editor();
      const fin = ed.selectionStart;
      ed.setRangeText(s.insertar, propuesta.desde, fin, "end");
      const nuevo = propuesta.desde + s.cursor;
      ed.setSelectionRange(nuevo, nuevo);
      ocultar();
      ed.focus();
      ed.dispatchEvent(new Event("input", { bubbles: true }));
    }

    cuerpo.addEventListener("input", (e) => {
      if (!(e.target as HTMLElement).classList.contains("ctf-ed")) return;
      window.clearTimeout(temporizador);
      temporizador = window.setTimeout(ejecutarYMostrar, 250);
      mostrarPropuesta();
    });
    cuerpo.addEventListener("keydown", (e) => {
      if (!(e.target as HTMLElement).classList.contains("ctf-ed")) return;
      const ev = e as KeyboardEvent;
      const visible = propuesta && !panel().hidden;
      if (ev.key === "Tab" && !ev.ctrlKey && !ev.altKey) {
        ev.preventDefault();
        if (visible) aceptar(elegida);
        else {
          const ed = editor();
          ed.setRangeText("  ", ed.selectionStart, ed.selectionEnd, "end");
          ed.dispatchEvent(new Event("input", { bubbles: true }));
        }
      } else if (visible && ev.key === "ArrowDown") {
        ev.preventDefault();
        elegida = (elegida + 1) % Math.min(8, propuesta!.items.length);
        pintarSugerencias();
      } else if (visible && ev.key === "ArrowUp") {
        ev.preventDefault();
        elegida = (elegida - 1 + Math.min(8, propuesta!.items.length)) % Math.min(8, propuesta!.items.length);
        pintarSugerencias();
      } else if (ev.key === ")" && editor().selectionStart === editor().selectionEnd && editor().value[editor().selectionStart] === ")") {
        // «sobrescribir» el paréntesis de cierre que puso el autocompletado
        ev.preventDefault();
        editor().setSelectionRange(editor().selectionStart + 1, editor().selectionStart + 1);
        ocultar();
      } else if (ev.key === "Escape") ocultar();
      else if (ev.key === " " && ev.ctrlKey) {
        ev.preventDefault();
        mostrarPropuesta(true);
      } else if (ev.key === "Enter" && ev.ctrlKey) {
        ev.preventDefault();
        ejecutarYMostrar();
      }
    });
    cuerpo.addEventListener("mousedown", (e) => {
      if ((e.target as HTMLElement).closest(".ctf-sug")) e.preventDefault(); // no quitar el foco al editor
    });
    cuerpo.addEventListener("focusout", (e) => {
      if ((e.target as HTMLElement).classList.contains("ctf-ed")) window.setTimeout(ocultar, 120);
    });

    cuerpo.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>("button");
      if (!b) return;
      const p = PRUEBAS[i];
      if (b.dataset.s !== undefined) aceptar(Number(b.dataset.s));
      else if (b.dataset.n !== undefined) prueba(Number(b.dataset.n));
      else if (b.dataset.a === "ant") prueba(i - 1);
      else if (b.dataset.a === "sig") prueba(i + 1);
      else if (b.dataset.a === "reiniciar") {
        editor().value = p.inicial;
        editor().focus();
        ejecutarYMostrar();
      } else if (b.dataset.a === "pista") {
        const m = cuerpo.querySelector<HTMLElement>(".cj-ayuda")!;
        m.hidden = false;
        if (pedidas < 2) {
          const t = p.pistas[pedidas];
          m.innerHTML = `<b>Pista ${pedidas + 1}:</b> ${t.includes("<code>") ? t : `<code class="cj-solucion">${esc(t)}</code>`}`;
          pedidas++;
        } else {
          m.innerHTML = `<b>Solución:</b> <code class="cj-solucion">${esc(p.solucion)}</code>`;
          pedidas = 3;
        }
        b.textContent = etiquetaPista();
      }
    });
    prueba(i);
    return () => window.clearTimeout(temporizador);
  },
};

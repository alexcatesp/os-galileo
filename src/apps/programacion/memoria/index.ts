// «Memoria de Java» (0485 · UT02 §4, §10, §12): un código corto avanza paso a paso y se dibujan la
// pila (variables y referencias) y el montón (objetos, string pool y basura).

import type { AppDef } from "../../../kernel/kernel";
import { bloqueJava, esc, progreso } from "../comun";
import type { Estado, Obj, Variable } from "./motor";
import { PROGRAMAS, estadosDe, type Programa } from "./programas";

interface Registro {
  hechos: string[];
}
const guardado = progreso<Registro>("osg-java-memoria", { hechos: [] });

const NS = "http://www.w3.org/2000/svg";

function htmlObjeto(o: Obj): string {
  const texto = o.clase === "String" ? `"${esc(o.texto)}"` : esc(o.texto);
  return `<div class="jv-obj${o.basura ? " basura" : ""}" data-o="${o.id}"><span class="jv-clase">${esc(o.clase)}</span><span class="jv-texto">${texto}</span>${o.basura ? `<span class="jv-aviso">🗑 sin referencias</span>` : ""}</div>`;
}

function htmlVariable(v: Variable, i: number): string {
  const valor =
    v.ref === undefined
      ? `<span class="jv-valor">${esc(v.prim ?? "")}</span>`
      : v.ref === null
        ? `<span class="jv-valor nulo">null</span>`
        : `<span class="jv-punto" aria-hidden="true"></span>`;
  return `<div class="jv-var" data-v="${i}"><span class="jv-nombre"><span class="jv-tipo">${esc(v.tipo)}</span> ${esc(v.nombre)}</span>${valor}</div>`;
}

function htmlEstado(e: Estado): string {
  // el marco activo es el último de la lista de marcos; se dibuja arriba (como en una pila de verdad)
  const orden = [...e.marcos].reverse();
  const pila = orden
    .map((m) => {
      const vars = e.vars.map((v, i) => ({ v, i })).filter(({ v }) => v.marco === m);
      return `<div class="jv-marco"><div class="jv-marco-t">${esc(m)}()</div>${vars.length ? vars.map(({ v, i }) => htmlVariable(v, i)).join("") : `<div class="jv-vacio">sin variables</div>`}</div>`;
    })
    .join("");
  const pool = e.monton.filter((o) => o.pool);
  const libres = e.monton.filter((o) => !o.pool);
  return `
    <div class="jv-pila"><h4>Pila <small>(stack)</small></h4>${pila}</div>
    <div class="jv-monton"><h4>Montón <small>(heap)</small></h4>
      ${pool.length ? `<div class="jv-pool"><span class="jv-pool-t">string pool</span>${pool.map(htmlObjeto).join("")}</div>` : ""}
      <div class="jv-libres">${libres.length ? libres.map(htmlObjeto).join("") : pool.length ? "" : `<div class="jv-vacio">vacío</div>`}</div>
    </div>`;
}

export const memoriaJava: AppDef = {
  id: "java-memoria",
  nombre: "Memoria de Java",
  carpeta: "0485 · Programación",
  icono: `<svg viewBox="0 0 48 48"><rect x="3" y="3" width="42" height="42" rx="8" fill="#0d0b1e" stroke="#f7e26b" stroke-width="2.5"/><rect x="8" y="10" width="13" height="8" rx="2" fill="#6fd08c"/><rect x="8" y="22" width="13" height="8" rx="2" fill="#6fd08c"/><rect x="29" y="14" width="11" height="9" rx="2" fill="#f7e26b"/><rect x="29" y="27" width="11" height="9" rx="2" fill="#f7e26b" opacity=".45" stroke="#f7e26b" stroke-dasharray="2 2"/><path d="M21 14l8 4M21 26l8 5" stroke="#da251c" stroke-width="2.4" stroke-linecap="round"/></svg>`,
  ancho: 900,
  alto: 700,
  iniciar({ ventana, raiz }) {
    raiz.classList.add("cj", "jv");
    const reg = guardado.leer();
    let p: Programa = PROGRAMAS[0];
    let estados = estadosDe(p);
    /** pasos ya mostrados: 0 = estado inicial, n = fin */
    let k = 0;
    let respondidas = new Set<number>();
    let veredicto = "";
    let observador: ResizeObserver | null = null;

    raiz.innerHTML = `
      <div class="jv-cuerpo">
        <div class="cj-niveles jv-progs" role="group" aria-label="Programas"></div>
        <div class="cj-ficha"><span class="cj-bloque"></span><h3></h3><p></p></div>
        <div class="jv-grid">
          <div class="jv-izq"><div class="jv-codigo-caja"></div><div class="jv-consola" aria-live="polite"></div></div>
          <div class="jv-mem"><svg class="jv-flechas" aria-hidden="true"><defs><marker id="jv-punta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#4a2fb5"/></marker></defs></svg><div class="jv-dibujo"></div></div>
        </div>
        <div class="jv-nota" aria-live="polite"></div>
        <div class="jv-pregunta" hidden></div>
        <div class="cj-pie">
          <button data-a="ant">◂ Anterior</button>
          <button data-a="sig" class="cj-primario">Siguiente paso ▸</button>
          <button data-a="reiniciar">↺ Desde el principio</button>
          <span class="cj-marcador">Programas vistos: <b></b> / ${PROGRAMAS.length}</span>
        </div>
      </div>`;
    const $ = <T extends HTMLElement>(s: string) => raiz.querySelector<T>(s)!;

    function pintarProgramas(): void {
      $(".jv-progs").innerHTML = PROGRAMAS.map((q, i) => `<button data-p="${q.id}" class="${q.id === p.id ? "on" : ""}${reg.hechos.includes(q.id) ? " ok" : ""}" title="${esc(q.titulo)}" aria-label="Programa ${i + 1}: ${esc(q.titulo)}${reg.hechos.includes(q.id) ? ", visto" : ""}">${i + 1}</button>`).join("");
      $(".cj-marcador b").textContent = String(reg.hechos.length);
    }

    function flechas(): void {
      const svg = $<SVGSVGElement & HTMLElement>(".jv-flechas");
      svg.querySelectorAll("path.jv-flecha").forEach((x) => x.remove());
      const caja = $(".jv-mem").getBoundingClientRect();
      const e = estados[k];
      e.vars.forEach((v, i) => {
        if (typeof v.ref !== "number") return;
        const origen = raiz.querySelector<HTMLElement>(`.jv-var[data-v="${i}"] .jv-punto`);
        const destino = raiz.querySelector<HTMLElement>(`.jv-obj[data-o="${v.ref}"]`);
        if (!origen || !destino) return;
        const a = origen.getBoundingClientRect();
        const b = destino.getBoundingClientRect();
        const x1 = a.left + a.width / 2 - caja.left;
        const y1 = a.top + a.height / 2 - caja.top;
        const x2 = b.left - caja.left;
        const y2 = b.top + Math.min(b.height / 2, 22) - caja.top;
        const d = Math.max(30, Math.abs(x2 - x1) / 2);
        const ruta = document.createElementNS(NS, "path");
        ruta.setAttribute("class", "jv-flecha");
        ruta.setAttribute("d", `M${x1},${y1} C${x1 + d},${y1} ${x2 - d},${y2} ${x2},${y2}`);
        ruta.setAttribute("marker-end", "url(#jv-punta)");
        svg.appendChild(ruta);
      });
    }

    function pintar(): void {
      const e = estados[k];
      const paso = k > 0 ? p.pasos[k - 1] : null;
      ventana.fijarTitulo(`Memoria de Java · ${p.titulo}`);
      $(".cj-bloque").textContent = p.bloque;
      $(".cj-ficha h3").textContent = p.titulo;
      $(".cj-ficha p").innerHTML = p.resumen;
      $(".jv-codigo-caja").innerHTML = bloqueJava(p.codigo, paso ? paso.linea : -1);
      $(".jv-dibujo").innerHTML = htmlEstado(e);
      $(".jv-consola").innerHTML = `<div class="jv-consola-t">Consola</div>${e.salida.map((l) => `<div>${esc(l)}</div>`).join("")}${e.error ? `<div class="jv-err">${esc(e.error)}</div>` : ""}` + (!e.salida.length && !e.error ? `<div class="jv-vacio">(sin salida todavía)</div>` : "");
      $(".jv-nota").innerHTML = (veredicto ? `<div class="jv-veredicto">${veredicto}</div>` : "") + (paso ? `<div>${paso.nota}</div>` : `<div class="cj-consigna">Pulsa «Siguiente paso» para ejecutar la primera línea. A veces te preguntaré qué va a pasar <b>antes</b> de enseñártelo.</div>`);
      const ultimo = k === p.pasos.length;
      $<HTMLButtonElement>('[data-a="ant"]').disabled = k === 0;
      $<HTMLButtonElement>('[data-a="sig"]').disabled = ultimo;
      $('[data-a="sig"]').textContent = ultimo ? "Fin del programa" : "Siguiente paso ▸";
      if (ultimo && !reg.hechos.includes(p.id)) {
        reg.hechos.push(p.id);
        guardado.guardar(reg);
        pintarProgramas();
      }
      requestAnimationFrame(flechas);
    }

    function elegirPrograma(id: string): void {
      p = PROGRAMAS.find((q) => q.id === id) ?? PROGRAMAS[0];
      estados = estadosDe(p);
      k = 0;
      respondidas = new Set();
      veredicto = "";
      $(".jv-pregunta").hidden = true;
      pintarProgramas();
      pintar();
    }

    function siguiente(): void {
      if (k >= p.pasos.length) return;
      const q = p.pasos[k].pregunta;
      if (q && !respondidas.has(k)) {
        const caja = $(".jv-pregunta");
        caja.hidden = false;
        caja.innerHTML = `<p><b>Antes de verlo:</b> ${q.texto}</p><div class="jv-opciones">${q.opciones.map((o, i) => `<button data-r="${i}">${esc(o)}</button>`).join("")}</div>`;
        $<HTMLButtonElement>('[data-a="sig"]').disabled = true;
        caja.querySelector("button")?.focus();
        return;
      }
      veredicto = "";
      k++;
      pintar();
    }

    raiz.addEventListener("click", (ev) => {
      const b = (ev.target as HTMLElement).closest<HTMLElement>("button");
      if (!b) return;
      if (b.dataset.p) elegirPrograma(b.dataset.p);
      else if (b.dataset.r !== undefined) {
        const q = p.pasos[k].pregunta!;
        const i = Number(b.dataset.r);
        veredicto = i === q.correcta ? `<span class="ok">✓ ¡Bien!</span> ${q.porque}` : `<span class="mal">✗ No exactamente.</span> ${q.porque}`;
        respondidas.add(k);
        $(".jv-pregunta").hidden = true;
        k++;
        pintar();
      } else if (b.dataset.a === "sig") siguiente();
      else if (b.dataset.a === "ant" && k > 0) {
        $(".jv-pregunta").hidden = true;
        veredicto = "";
        k--;
        pintar();
      } else if (b.dataset.a === "reiniciar") elegirPrograma(p.id);
    });

    observador = new ResizeObserver(() => flechas());
    observador.observe($(".jv-mem"));
    pintarProgramas();
    pintar();
    return () => observador?.disconnect();
  },
};

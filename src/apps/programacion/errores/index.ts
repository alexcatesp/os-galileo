// «Cazador de errores» (0485 · UT02 §3): se ve el mensaje de Eclipse (o de la JVM), se señala la línea
// culpable y se elige el arreglo correcto. Cada arreglo equivocado se explica.

import type { AppDef } from "../../../kernel/kernel";
import { bloqueJava, esc, progreso } from "../comun";
import { CASOS } from "./casos";

interface Registro {
  hechos: string[];
}
const guardado = progreso<Registro>("osg-java-errores", { hechos: [] });

function mezclar<T>(lista: T[]): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const cazadorDeErrores: AppDef = {
  id: "java-errores",
  nombre: "Cazador de errores",
  carpeta: "0485 · Programación",
  icono: `<svg viewBox="0 0 48 48"><rect x="3" y="3" width="42" height="42" rx="8" fill="#0d0b1e" stroke="#da251c" stroke-width="2.5"/><ellipse cx="24" cy="28" rx="8" ry="10" fill="#da251c"/><circle cx="24" cy="15" r="5" fill="#da251c"/><path d="M16 22l-6-3M16 29h-7M17 36l-5 4M32 22l6-3M32 29h7M31 36l5 4M20 11l-3-5M28 11l3-5" stroke="#f7e26b" stroke-width="2.4" stroke-linecap="round"/></svg>`,
  ancho: 820,
  alto: 720,
  iniciar({ ventana, raiz }) {
    raiz.classList.add("cj", "jv");
    const reg = guardado.leer();
    const primero = CASOS.findIndex((c) => !reg.hechos.includes(c.id));
    let i = primero < 0 ? 0 : primero;
    let fase: "linea" | "arreglo" | "hecho" = "linea";
    let fallos = 0;
    let arreglos = CASOS[0].arreglos;

    raiz.innerHTML = `<div class="jv-cuerpo"></div>`;
    const cuerpo = raiz.querySelector<HTMLElement>(".jv-cuerpo")!;

    const fichas = () =>
      CASOS.map((c, n) => `<button data-n="${n}" class="${n === i ? "on" : ""}${reg.hechos.includes(c.id) ? " ok" : ""}" title="${esc(c.titulo)}" aria-label="Caso ${n + 1}: ${esc(c.titulo)}${reg.hechos.includes(c.id) ? ", resuelto" : ""}">${n + 1}</button>`).join("");

    function nivel(n: number): void {
      i = n;
      fase = "linea";
      fallos = 0;
      const c = CASOS[i];
      arreglos = mezclar(c.arreglos);
      ventana.fijarTitulo(`Cazador de errores · caso ${i + 1}`);
      cuerpo.innerHTML = `
        <div class="cj-niveles" role="group" aria-label="Casos">${fichas()}</div>
        <div class="cj-ficha"><span class="cj-bloque">Error de ${c.momento}</span><h3>Caso ${i + 1} · ${esc(c.titulo)}</h3>
          <p>${c.momento === "compilación" ? "Eclipse subraya algo en rojo y en la vista <b>Problems</b> aparece este mensaje." : "El programa compila, lo ejecutas y la <b>Console</b> muestra esto."}</p></div>
        <div class="jv-ide ${c.momento === "compilación" ? "problems" : "consola"}"><span class="jv-ide-t">${c.momento === "compilación" ? "Problems" : "Console"}</span><span class="jv-ide-m">${c.momento === "compilación" ? "⛔ " : ""}${esc(c.mensaje)}</span></div>
        <p class="cj-consigna" id="jv-consigna">Haz clic en la línea ${c.momento === "compilación" ? "que Eclipse subraya en rojo" : "donde salta la excepción"}.</p>
        ${bloqueJava(c.codigo, -1, true)}
        <p class="cj-mensaje" aria-live="polite"></p>
        <div class="jv-arreglos" hidden></div>
        <div class="cj-pie">
          <button data-a="ant" ${i === 0 ? "disabled" : ""}>◂ Anterior</button>
          <button data-a="pista">💡 Pista</button>
          <button data-a="sig" class="cj-primario" ${i === CASOS.length - 1 ? "disabled" : ""} hidden>Siguiente ▸</button>
          <span class="cj-marcador">Resueltos: <b>${reg.hechos.length}</b> / ${CASOS.length}</span>
        </div>`;
    }

    const mensaje = (html: string, clase = "") => {
      const m = cuerpo.querySelector<HTMLElement>(".cj-mensaje")!;
      m.className = `cj-mensaje ${clase}`;
      m.innerHTML = html;
    };

    function elegirLinea(l: number): void {
      if (fase !== "linea") return;
      const c = CASOS[i];
      const div = cuerpo.querySelector<HTMLElement>(`.jv-l[data-l="${l}"]`)!;
      if (l !== c.linea) {
        fallos++;
        div.classList.add("mala");
        mensaje(`✗ En la línea ${l + 1} no está. ${fallos >= 2 ? "Relee el mensaje y busca dónde aparece lo que nombra." : "Prueba otra."}`, "mal");
        return;
      }
      fase = "arreglo";
      cuerpo.querySelectorAll(".jv-l.mala").forEach((x) => x.classList.remove("mala"));
      div.classList.add("buena");
      cuerpo.querySelector("#jv-consigna")!.textContent = "";
      mensaje(`✓ Sí, la línea ${l + 1}. <span class="cj-explica">${c.traduccion}</span>`, "ok");
      const caja = cuerpo.querySelector<HTMLElement>(".jv-arreglos")!;
      caja.hidden = false;
      caja.innerHTML = `<p class="jv-preg">${c.pregunta}</p>${arreglos.map((a, k) => `<div class="jv-opcion"><button data-k="${k}">${a.texto}</button><div class="jv-porque" hidden></div></div>`).join("")}`;
    }

    function elegirArreglo(k: number, boton: HTMLElement): void {
      if (fase !== "arreglo") return;
      const a = arreglos[k];
      const caja = boton.parentElement!.querySelector<HTMLElement>(".jv-porque")!;
      caja.hidden = false;
      caja.className = `jv-porque ${a.ok ? "ok" : "mal"}`;
      caja.innerHTML = `${a.ok ? "✓" : "✗"} ${a.porque}`;
      boton.classList.add(a.ok ? "ok" : "mal");
      if (!a.ok) return;
      fase = "hecho";
      const c = CASOS[i];
      if (!reg.hechos.includes(c.id)) {
        reg.hechos.push(c.id);
        guardado.guardar(reg);
      }
      cuerpo.querySelectorAll<HTMLElement>(".jv-arreglos .jv-opcion").forEach((div, n) => {
        const p = div.querySelector<HTMLElement>(".jv-porque")!;
        if (p.hidden) {
          p.hidden = false;
          p.className = "jv-porque mal suave";
          p.innerHTML = `✗ ${arreglos[n].porque}`;
        }
      });
      mensaje("✓ ¡Cazado! Recuerda la regla: arregla siempre <b>el primer error</b> de la lista; los demás suelen ser fantasmas.", "ok");
      cuerpo.querySelector<HTMLElement>('[data-a="sig"]')!.hidden = false;
      cuerpo.querySelector<HTMLElement>(".cj-marcador b")!.textContent = String(reg.hechos.length);
      cuerpo.querySelectorAll<HTMLElement>(".cj-niveles button")[i].classList.add("ok");
    }

    cuerpo.addEventListener("click", (e) => {
      const t = e.target as HTMLElement;
      const fila = t.closest<HTMLElement>(".jv-l.clic");
      if (fila) return elegirLinea(Number(fila.dataset.l));
      const b = t.closest<HTMLElement>("button");
      if (!b) return;
      if (b.dataset.n !== undefined) nivel(Number(b.dataset.n));
      else if (b.dataset.a === "ant") nivel(i - 1);
      else if (b.dataset.a === "sig") nivel(i + 1);
      else if (b.dataset.a === "pista") {
        mensaje(`<b>Pista:</b> ${CASOS[i].pista}`, "pista");
      } else if (b.dataset.k !== undefined) elegirArreglo(Number(b.dataset.k), b);
    });
    cuerpo.addEventListener("keydown", (e) => {
      const fila = (e.target as HTMLElement).closest<HTMLElement>(".jv-l.clic");
      if (fila && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        elegirLinea(Number(fila.dataset.l));
      }
    });
    nivel(i);
  },
};

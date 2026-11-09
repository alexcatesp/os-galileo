// «Javadoc en juego» (0485 · UT02, CE c–h): se enseña el Javadoc de las clases implicadas y el alumno
// elige la llamada correcta o escribe lo que imprime un código. Cada error se explica.

import type { AppDef } from "../../../kernel/kernel";
import { bloqueJava, esc, progreso, resaltarJava } from "../comun";
import { API } from "./catalogo";
import { CE, RETOS_API, type Opcion, type RetoApi } from "./retos";

interface Registro {
  hechos: string[];
}
const guardado = progreso<Registro>("osg-java-api", { hechos: [] });

const norm = (s: string) => s.trim().replace(/^"(.*)"$/, "$1").trim().toLowerCase();
/** ¿la opción es código Java o texto con formato? */
const esCodigo = (t: string) => !t.includes("<code>") && /[();=]|^[A-Z]\w*$|^[A-Za-z]\w*\.\w+/.test(t);
const htmlOpcion = (t: string) => (esCodigo(t) ? `<code class="jv-opc-cod">${resaltarJava(t)}</code>` : `<span>${t.includes("<code>") ? t : esc(t)}</span>`);

function mezclar<T>(lista: T[]): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function htmlJavadoc(r: RetoApi): string {
  return r.clases
    .map((nombre, i) => {
      const c = API[nombre];
      if (!c) return "";
      const fila = (e: { firma: string; descr: string }) => `<div class="jv-api-fila"><code>${resaltarJava(e.firma)}</code><span>${esc(e.descr)}</span></div>`;
      return `<details class="jv-api" ${i === 0 ? "open" : ""}><summary><b>${esc(c.nombre)}</b> <small>${esc(c.paquete)}</small></summary>
        <p class="jv-api-res">${esc(c.resumen)}</p>
        ${c.constructores ? `<div class="jv-api-sec">Constructores</div>${c.constructores.map(fila).join("")}` : ""}
        <div class="jv-api-sec">Métodos</div>${c.metodos.map(fila).join("")}</details>`;
    })
    .join("");
}

export const javadocEnJuego: AppDef = {
  id: "java-api",
  nombre: "Javadoc en juego",
  carpeta: "0485 · Programación",
  icono: `<svg viewBox="0 0 48 48"><rect x="3" y="3" width="42" height="42" rx="8" fill="#0d0b1e" stroke="#8fd3ff" stroke-width="2.5"/><path d="M11 14h26M11 22h18M11 30h22" stroke="#8fd3ff" stroke-width="3" stroke-linecap="round"/><circle cx="35" cy="31" r="6.5" fill="none" stroke="#f7e26b" stroke-width="2.6"/><path d="M40 36l4 4" stroke="#f7e26b" stroke-width="3" stroke-linecap="round"/></svg>`,
  ancho: 860,
  alto: 720,
  iniciar({ ventana, raiz }) {
    raiz.classList.add("cj", "jv");
    const reg = guardado.leer();
    const primero = RETOS_API.findIndex((r) => !reg.hechos.includes(r.id));
    let i = primero < 0 ? 0 : primero;
    let resuelto = false;
    let pedidas = 0;
    let orden: Opcion[] = [];

    raiz.innerHTML = `<div class="jv-cuerpo"></div>`;
    const cuerpo = raiz.querySelector<HTMLElement>(".jv-cuerpo")!;

    /** pestañas de CE y, debajo, los retos del CE actual */
    function fichas(): string {
      const ces = Object.keys(CE) as RetoApi["ce"][];
      const actual = RETOS_API[i].ce;
      const tabs = ces
        .map((ce) => {
          const suyos = RETOS_API.filter((r) => r.ce === ce);
          const hechos = suyos.filter((r) => reg.hechos.includes(r.id)).length;
          return `<button data-ce="${ce}" class="jv-ce${ce === actual ? " on" : ""}${hechos === suyos.length ? " ok" : ""}" title="${CE[ce]}">CE ${ce} <small>${hechos}/${suyos.length}</small></button>`;
        })
        .join("");
      const chips = RETOS_API.map((r, n) => ({ r, n }))
        .filter(({ r }) => r.ce === actual)
        .map(({ r, n }) => `<button data-n="${n}" class="${n === i ? "on" : ""}${reg.hechos.includes(r.id) ? " ok" : ""}" title="${esc(r.titulo)}" aria-label="Reto ${n + 1}: ${esc(r.titulo)}${reg.hechos.includes(r.id) ? ", superado" : ""}">${n + 1}</button>`)
        .join("");
      return `<div class="jv-ces" role="group" aria-label="Criterios de evaluación">${tabs}</div><div class="cj-niveles" role="group" aria-label="Retos">${chips}</div>`;
    }

    const etiquetaPista = () => (pedidas === 0 ? "💡 Pista (1 de 2)" : pedidas === 1 ? "👁 Ver respuesta (2 de 2)" : "👁 Respuesta mostrada");

    function nivel(n: number): void {
      i = n;
      resuelto = false;
      pedidas = 0;
      const r = RETOS_API[i];
      orden = r.opciones ? mezclar(r.opciones) : [];
      ventana.fijarTitulo(`Javadoc en juego · CE ${r.ce} · reto ${i + 1}`);
      cuerpo.innerHTML = `
        <div class="jv-fichas">${fichas()}</div>
        <div class="cj-ficha"><span class="cj-bloque">CE ${r.ce} · ${CE[r.ce]}</span><h3>Reto ${i + 1} · ${esc(r.titulo)}</h3><p>${r.enunciado}</p></div>
        ${r.codigo ? bloqueJava(r.codigo) : ""}
        ${
          r.tipo === "elige"
            ? `<div class="jv-opciones-v">${orden.map((o, k) => `<div class="jv-opcion" data-k="${k}"><button data-o="${k}">${htmlOpcion(o.codigo)}</button><div class="jv-porque" hidden></div></div>`).join("")}</div>`
            : `<form class="cj-form"><span class="cj-pre" aria-hidden="true">Imprime</span><input class="jv-resp" spellcheck="false" autocomplete="off" autocapitalize="off" placeholder="Lo que sale por la consola…" aria-label="Lo que imprime el código" /><button class="cj-ok">Comprobar</button></form>`
        }
        <p class="cj-mensaje" aria-live="polite"></p>
        <div class="cj-pie">
          <button data-a="ant" ${i === 0 ? "disabled" : ""}>◂ Anterior</button>
          <button data-a="pista">${etiquetaPista()}</button>
          <button data-a="sig" class="cj-primario" ${i === RETOS_API.length - 1 ? "disabled" : ""} hidden>Siguiente ▸</button>
          <span class="cj-marcador">Superados: <b>${reg.hechos.length}</b> / ${RETOS_API.length}</span>
        </div>
        <div class="jv-javadoc"><h4>📖 Javadoc</h4>${htmlJavadoc(r)}</div>`;
      cuerpo.querySelector<HTMLInputElement>(".jv-resp")?.focus();
    }

    const mensaje = (html: string, clase = "") => {
      const m = cuerpo.querySelector<HTMLElement>(".cj-mensaje")!;
      m.className = `cj-mensaje ${clase}`;
      m.innerHTML = html;
    };

    function acierto(): void {
      const r = RETOS_API[i];
      resuelto = true;
      if (!reg.hechos.includes(r.id)) {
        reg.hechos.push(r.id);
        guardado.guardar(reg);
      }
      mensaje(`✓ ¡Correcto!<span class="cj-explica">${r.explicacion}</span>`, "ok");
      const sig = cuerpo.querySelector<HTMLElement>('[data-a="sig"]')!;
      sig.hidden = false;
      cuerpo.querySelector<HTMLElement>(".cj-marcador b")!.textContent = String(reg.hechos.length);
      cuerpo.querySelector<HTMLElement>(".jv-fichas")!.innerHTML = fichas();
    }

    cuerpo.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>("button");
      if (!b) return;
      const r = RETOS_API[i];
      if (b.dataset.n !== undefined) nivel(Number(b.dataset.n));
      else if (b.dataset.ce) {
        const destino = RETOS_API.findIndex((x) => x.ce === b.dataset.ce && !reg.hechos.includes(x.id));
        nivel(destino >= 0 ? destino : RETOS_API.findIndex((x) => x.ce === b.dataset.ce));
      } else if (b.dataset.a === "ant") nivel(i - 1);
      else if (b.dataset.a === "sig") nivel(i + 1);
      else if (b.dataset.a === "pista") {
        if (pedidas === 0) {
          mensaje(`<b>Pista:</b> ${r.pista}`, "pista");
          pedidas = 1;
        } else {
          const sol = r.tipo === "elige" ? (r.opciones!.find((o) => o.ok)?.codigo ?? "") : (r.respuestas?.[0] ?? "");
          mensaje(`<b>Respuesta:</b> ${r.tipo === "elige" ? htmlOpcion(sol) : `<code class="cj-solucion">${esc(sol)}</code>`}<span class="cj-explica">${r.explicacion}</span>`, "pista");
          pedidas = 2;
        }
        b.textContent = etiquetaPista();
      } else if (b.dataset.o !== undefined && !resuelto) {
        const o = orden[Number(b.dataset.o)];
        const caja = b.parentElement!.querySelector<HTMLElement>(".jv-porque")!;
        caja.hidden = false;
        caja.innerHTML = `${o.ok ? "✓" : "✗"} ${o.porque}`;
        caja.className = `jv-porque ${o.ok ? "ok" : "mal"}`;
        b.classList.add(o.ok ? "ok" : "mal");
        if (o.ok) {
          acierto();
          // al acertar, se explica por qué fallan las demás
          cuerpo.querySelectorAll<HTMLElement>(".jv-opcion").forEach((div, k) => {
            const q = orden[k];
            const p = div.querySelector<HTMLElement>(".jv-porque")!;
            if (p.hidden) {
              p.hidden = false;
              p.className = "jv-porque mal suave";
              p.innerHTML = `✗ ${q.porque}`;
            }
          });
        } else mensaje("✗ Esa no. Lee por qué y prueba otra.", "mal");
      }
    });
    cuerpo.addEventListener("submit", (e) => {
      e.preventDefault();
      if (resuelto) return;
      const r = RETOS_API[i];
      const v = norm(cuerpo.querySelector<HTMLInputElement>(".jv-resp")!.value);
      if (!v) return;
      if (r.respuestas!.some((x) => norm(x) === v)) acierto();
      else mensaje("✗ Todavía no. Ejecuta el código en tu cabeza, línea a línea (¿qué tipo devuelve cada método?). Puedes pedir una pista.", "mal");
    });
    nivel(i);
  },
};

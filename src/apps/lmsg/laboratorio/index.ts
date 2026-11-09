import type { AppDef } from "../../../kernel/kernel";
import { ARCHIVO_CSS, componer, crearMarco, enlazaEstilos, sujetar } from "./documento";
import { PAGINA_LIBRE, RETOS, evaluar, type Reto } from "./retos";
import { revisarHtml } from "./revisar";

const CLAVE = "osg-lmsg-lab";
const RUTA_INICIAL = "/home/invitado/Documentos/pagina.html";

interface Trabajo { html: string; css: string }
interface Guardado {
  libre: Trabajo;
  retos: Record<string, Trabajo>;
  hechos: string[];
}

function cargar(): Guardado {
  const vacio: Guardado = { libre: { ...PAGINA_LIBRE }, retos: {}, hechos: [] };
  try {
    return { ...vacio, ...(JSON.parse(localStorage.getItem(CLAVE) ?? "{}") as Partial<Guardado>) };
  } catch {
    return vacio;
  }
}
function guardarTodo(g: Guardado): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(g));
  } catch {
    /* sin almacenamiento */
  }
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const laboratorioHtmlCss: AppDef = {
  id: "lmsg-laboratorio",
  nombre: "Laboratorio HTML/CSS",
  carpeta: "0373 - LMSG",
  icono: `<svg viewBox="0 0 48 48"><rect x="3" y="5" width="42" height="38" rx="6" fill="#f4f1ff" stroke="#2a1770" stroke-width="2.5"/><path d="M3 15h42" stroke="#2a1770" stroke-width="2.5"/><circle cx="9" cy="10" r="1.7" fill="#da251c"/><circle cx="15" cy="10" r="1.7" fill="#f2b705"/><circle cx="21" cy="10" r="1.7" fill="#1f9d4d"/><path d="M19 24l-6 5 6 5M29 24l6 5-6 5M26 22l-4 14" fill="none" stroke="#da251c" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  ancho: 1100,
  alto: 700,
  iniciar({ so, ventana, raiz, args }) {
    raiz.classList.add("lab");
    raiz.innerHTML = `
      <div class="lab-barra">
        <select data-a="modo" aria-label="Página libre o reto"></select>
        <button data-a="revisar" title="Busca etiquetas sin cerrar y faltas habituales">🔍 Revisar HTML</button>
        <button data-a="comprobar" class="lab-primario" hidden>✔ Comprobar el reto</button>
        <button data-a="solucion" hidden>💡 Ver solución</button>
        <button data-a="reiniciar" hidden title="Vuelve al punto de partida de este reto">↺ Reiniciar</button>
        <span class="lab-sep"></span>
        <input class="lab-ruta" spellcheck="false" aria-label="Ruta del archivo HTML" />
        <button data-a="guardar">Guardar</button>
        <button data-a="abrir">Abrir</button>
      </div>
      <div class="lab-cuerpo">
        <section class="lab-editor">
          <div class="lab-tabs" role="tablist">
            <button data-t="html" role="tab">index.html</button><button data-t="css" role="tab">${ARCHIVO_CSS}</button>
          </div>
          <textarea class="lab-texto" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Código"></textarea>
        </section>
        <section class="lab-vista">
          <div class="lab-tabs" role="tablist">
            <button data-v="alumno" role="tab">Tu página</button><button data-v="objetivo" role="tab" hidden>Objetivo</button>
          </div>
          <div class="lab-marco"></div>
        </section>
      </div>
      <div class="lab-panel" aria-live="polite"></div>`;

    const q = <T extends HTMLElement>(s: string) => raiz.querySelector<T>(s)!;
    const g = cargar();
    const selModo = q<HTMLSelectElement>('[data-a="modo"]');
    const texto = q<HTMLTextAreaElement>(".lab-texto");
    const panel = q(".lab-panel");
    const caja = q(".lab-marco");
    const ruta = q<HTMLInputElement>(".lab-ruta");
    ruta.value = RUTA_INICIAL;

    let reto: Reto | null = null;
    let pestana: "html" | "css" = "html";
    let vista: "alumno" | "objetivo" = "alumno";
    let trabajo: Trabajo = g.libre;
    let temporizador = 0;

    const marcoAlumno = crearMarco();
    const marcoObjetivo = crearMarco();
    for (const [m, titulo] of [[marcoAlumno, "Vista previa de tu página"], [marcoObjetivo, "Página objetivo"]] as const) {
      m.title = titulo;
      m.addEventListener("load", () => sujetar(m));
    }
    caja.append(marcoAlumno, marcoObjetivo);

    function opciones(): void {
      selModo.innerHTML =
        `<option value="">Página libre</option>` +
        [1, 2, 3]
          .map(
            (n) =>
              `<optgroup label="Retos · nivel ${n}">${RETOS.filter((r) => r.nivel === n)
                .map((r) => `<option value="${r.id}">${g.hechos.includes(r.id) ? "✓ " : ""}${r.titulo}</option>`)
                .join("")}</optgroup>`,
          )
          .join("");
      selModo.value = reto?.id ?? "";
    }

    function titular(): void {
      ventana.fijarTitulo(`${reto ? `Reto: ${reto.titulo}` : "Página libre"} — Laboratorio HTML/CSS`);
    }

    function persistir(): void {
      if (reto) g.retos[reto.id] = { ...trabajo };
      else g.libre = { ...trabajo };
      guardarTodo(g);
    }

    function pintarVista(): void {
      marcoAlumno.hidden = vista !== "alumno";
      marcoObjetivo.hidden = vista !== "objetivo";
      raiz.querySelectorAll<HTMLElement>("[data-v]").forEach((b) => b.classList.toggle("on", b.dataset.v === vista));
    }

    function refrescarVista(): void {
      marcoAlumno.srcdoc = componer(trabajo.html, trabajo.css);
    }

    function pintarPestana(): void {
      raiz.querySelectorAll<HTMLElement>("[data-t]").forEach((b) => b.classList.toggle("on", b.dataset.t === pestana));
      texto.value = pestana === "html" ? trabajo.html : trabajo.css;
      texto.setAttribute("aria-label", pestana === "html" ? "Código HTML" : "Código CSS");
    }

    function mensaje(html: string): void {
      panel.innerHTML = html;
    }

    function pintarModo(): void {
      raiz.querySelector<HTMLElement>('[data-a="comprobar"]')!.hidden = !reto;
      raiz.querySelector<HTMLElement>('[data-a="solucion"]')!.hidden = !reto;
      raiz.querySelector<HTMLElement>('[data-a="reiniciar"]')!.hidden = !reto;
      raiz.querySelector<HTMLElement>('[data-v="objetivo"]')!.hidden = !reto;
      if (!reto) vista = "alumno";
      if (reto) marcoObjetivo.srcdoc = componer(reto.solHtml, reto.solCss);
      pintarVista();
      titular();
      if (reto) {
        mensaje(`<div class="lab-enunciado"><b>${esc(reto.titulo)}</b> · nivel ${reto.nivel}<p>${reto.enunciado}</p><p class="lab-tenue">Mira la pestaña «Objetivo» y pulsa «Comprobar el reto» cuando creas que está igual.</p></div>`);
      } else {
        mensaje(`<p class="lab-tenue">Página libre: escribe HTML y CSS y mira el resultado al instante. El HTML debe enlazar <code>&lt;link rel="stylesheet" href="${ARCHIVO_CSS}"&gt;</code> para que se aplique el CSS. Elige un reto en la lista de arriba para practicar con objetivo y comprobación automática.</p>`);
      }
    }

    function abrirModo(id: string): void {
      persistir();
      reto = RETOS.find((r) => r.id === id) ?? null;
      trabajo = reto ? { ...(g.retos[reto.id] ?? { html: reto.html, css: reto.css }) } : { ...g.libre };
      pestana = "html";
      pintarModo();
      pintarPestana();
      refrescarVista();
    }

    // ---------- edición ----------
    texto.addEventListener("input", () => {
      trabajo[pestana] = texto.value;
      window.clearTimeout(temporizador);
      temporizador = window.setTimeout(() => {
        refrescarVista();
        persistir();
      }, 300);
    });
    texto.addEventListener("keydown", (e) => {
      if (e.key === "Tab" && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        texto.setRangeText("  ", texto.selectionStart, texto.selectionEnd, "end");
        texto.dispatchEvent(new Event("input"));
      }
    });
    raiz.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>("button");
      if (!b) return;
      if (b.dataset.t) {
        pestana = b.dataset.t as typeof pestana;
        pintarPestana();
        texto.focus();
      } else if (b.dataset.v) {
        vista = b.dataset.v as typeof vista;
        pintarVista();
      } else if (b.dataset.a) accion(b.dataset.a);
    });
    selModo.addEventListener("change", () => abrirModo(selModo.value));

    // ---------- acciones ----------
    async function accion(a: string): Promise<void> {
      if (a === "revisar") {
        const avisos = revisarHtml(trabajo.html);
        const extra = enlazaEstilos(trabajo.html) ? [] : [{ nivel: "aviso" as const, texto: `El HTML no enlaza ${ARCHIVO_CSS}: añade <link rel="stylesheet" href="${ARCHIVO_CSS}"> dentro del <head> o el CSS no se aplicará.`, linea: undefined }];
        const todos = [...avisos, ...extra];
        mensaje(
          todos.length
            ? `<p><b>${todos.length}</b> ${todos.length === 1 ? "cosa por revisar" : "cosas por revisar"}:</p><ul class="lab-lista">${todos
                .map((x) => `<li class="${x.nivel}">${x.nivel === "error" ? "✗" : "⚠"} ${x.linea ? `<span class="lab-linea">línea ${x.linea}</span> ` : ""}${esc(x.texto)}</li>`)
                .join("")}</ul>`
            : `<p class="lab-ok">✓ No he encontrado nada que corregir. Buen trabajo.</p>`,
        );
      } else if (a === "comprobar" && reto) {
        mensaje(`<p class="lab-tenue">Comprobando…</p>`);
        const res = await evaluar(reto, trabajo.html, trabajo.css);
        const bien = res.filter((r) => r.ok).length;
        const completo = bien === res.length;
        if (completo && !g.hechos.includes(reto.id)) {
          g.hechos.push(reto.id);
          persistir();
          opciones();
        }
        mensaje(
          `<p class="${completo ? "lab-ok" : ""}"><b>${bien} de ${res.length}</b> comprobaciones superadas${completo ? " · 🎉 ¡Reto resuelto!" : ""}</p><ul class="lab-lista">${res
            .map((r) => `<li class="${r.ok ? "ok" : "error"}">${r.ok ? "✓" : "✗"} ${esc(r.texto)}${r.detalle ? `<small>${esc(r.detalle)}</small>` : ""}</li>`)
            .join("")}</ul>`,
        );
      } else if (a === "solucion" && reto) {
        mensaje(`<p><b>Una solución posible</b> (hay muchas formas correctas; compara con la tuya):</p><div class="lab-sol"><pre>${esc(reto.solHtml.replace(/^[\s\S]*?<body>\n?/, "").replace(/\n?<\/body>[\s\S]*$/, ""))}</pre>${reto.solCss.trim() ? `<pre>${esc(reto.solCss)}</pre>` : ""}</div>`);
      } else if (a === "reiniciar" && reto) {
        trabajo = { html: reto.html, css: reto.css };
        persistir();
        pintarPestana();
        refrescarVista();
        pintarModo();
      } else if (a === "guardar") {
        try {
          const dir = ruta.value.replace(/\/[^/]*$/, "") || "/";
          so.vfs.escribir(ruta.value, trabajo.html);
          so.vfs.escribir(`${dir}/${ARCHIVO_CSS}`, trabajo.css);
          mensaje(`<p class="lab-ok">Guardado: <code>${esc(ruta.value)}</code> y <code>${esc(`${dir}/${ARCHIVO_CSS}`)}</code></p>`);
        } catch (e) {
          mensaje(`<p class="lab-mal">${esc((e as Error).message)}</p>`);
        }
      } else if (a === "abrir") abrirArchivo(ruta.value);
    }

    function abrirArchivo(r: string): void {
      try {
        const dir = r.replace(/\/[^/]*$/, "") || "/";
        if (/\.css$/i.test(r)) {
          const hermano = r.replace(/\.css$/i, ".html");
          if (so.vfs.existe(hermano)) {
            ruta.value = hermano;
            return abrirArchivo(hermano);
          }
          reto = null;
          trabajo = { html: g.libre.html, css: so.vfs.leer(r) };
        } else {
          reto = null;
          trabajo = { html: so.vfs.leer(r), css: so.vfs.existe(`${dir}/${ARCHIVO_CSS}`) ? so.vfs.leer(`${dir}/${ARCHIVO_CSS}`) : "" };
        }
        opciones();
        pestana = "html";
        pintarModo();
        pintarPestana();
        refrescarVista();
        mensaje(`<p class="lab-ok">Abierto <code>${esc(r)}</code>. ${enlazaEstilos(trabajo.html) ? "" : `Recuerda enlazar <code>${ARCHIVO_CSS}</code> en el HTML para ver el CSS.`}</p>`);
      } catch (e) {
        mensaje(`<p class="lab-mal">${esc((e as Error).message)}</p>`);
      }
    }

    opciones();
    if (args.ruta) {
      ruta.value = args.ruta;
      abrirArchivo(args.ruta);
    } else {
      pintarModo();
      pintarPestana();
      refrescarVista();
    }

    return () => {
      window.clearTimeout(temporizador);
      persistir();
    };
  },
};

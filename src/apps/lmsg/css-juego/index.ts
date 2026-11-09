import type { AppDef } from "../../../kernel/kernel";
import { crearMarco } from "../laboratorio/documento";
import { AYUDAS_FLEX, AYUDAS_GRID, type Ayuda } from "./ayudas";
import { AYUDAS_SELECTOR } from "./ayudas-selectores";
import { NIVELES_FLEX, documentoFlex, medir, mismaDisposicion, type NivelFlex } from "./flexbox";
import { NIVELES_GRID } from "./grid";
import { NIVELES_SELECTOR, mismosElementos, montarEscena, type Escena } from "./selectores";

const CLAVE = "osg-css-juego";

interface Registro {
  selectores: number[];
  flexbox: number[];
  grid: number[];
}

function cargar(): Registro {
  const vacio: Registro = { selectores: [], flexbox: [], grid: [] };
  try {
    return { ...vacio, ...(JSON.parse(localStorage.getItem(CLAVE) ?? "{}") as Partial<Registro>) };
  } catch {
    return vacio;
  }
}
function guardar(r: Registro): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(r));
  } catch {
    /* sin almacenamiento */
  }
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const primerPendiente = (hechos: number[], total: number) => {
  for (let i = 0; i < total; i++) if (!hechos.includes(i)) return i;
  return total - 1;
};

type Modo = "selectores" | "flexbox" | "grid";

export const cssEnJuego: AppDef = {
  id: "css-juego",
  nombre: "CSS en juego",
  carpeta: "0373 - LMSG",
  icono: `<svg viewBox="0 0 48 48"><rect x="3" y="3" width="42" height="42" rx="8" fill="#0d0b1e" stroke="#da251c" stroke-width="2.5"/><rect x="9" y="11" width="9" height="9" rx="2" fill="#f7e26b"/><rect x="21" y="11" width="9" height="9" rx="2" fill="#6fd08c"/><rect x="33" y="11" width="6" height="9" rx="2" fill="#f7e26b" opacity=".45"/><path d="M9 33h30M31 28l8 5-8 5" fill="none" stroke="#da251c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  ancho: 760,
  alto: 700,
  iniciar({ ventana, raiz }) {
    raiz.classList.add("cj");
    raiz.innerHTML = `
      <div class="cj-tabs" role="tablist">
        <button data-m="selectores" role="tab">🎯 Selectores</button><button data-m="flexbox" role="tab">📐 Flexbox</button><button data-m="grid" role="tab">▦ Grid</button>
      </div>
      <div class="cj-cuerpo"></div>`;
    const cuerpo = raiz.querySelector<HTMLElement>(".cj-cuerpo")!;
    const reg = cargar();
    let limpiar: (() => void) | null = null;

    function abrir(m: Modo): void {
      limpiar?.();
      limpiar = null;
      raiz.querySelectorAll<HTMLElement>("[data-m]").forEach((b) => b.classList.toggle("on", b.dataset.m === m));
      const caja = document.createElement("div");
      caja.className = "cj-modo";
      cuerpo.replaceChildren(caja);
      limpiar = m === "selectores" ? selectores(caja) : m === "flexbox" ? maqueta(caja, "flexbox", "Flexbox", NIVELES_FLEX, AYUDAS_FLEX) : maqueta(caja, "grid", "Grid", NIVELES_GRID, AYUDAS_GRID);
    }
    raiz.querySelector(".cj-tabs")!.addEventListener("click", (e) => {
      const m = (e.target as HTMLElement).dataset.m as Modo | undefined;
      if (m) abrir(m);
    });

    /** fila de números de nivel */
    function fichas(total: number, actual: number, hechos: number[]): string {
      return `<div class="cj-niveles" role="group" aria-label="Niveles">${Array.from(
        { length: total },
        (_, i) => `<button data-n="${i}" class="${i === actual ? "on" : ""}${hechos.includes(i) ? " ok" : ""}" aria-label="Nivel ${i + 1}${hechos.includes(i) ? ", superado" : ""}">${i + 1}</button>`,
      ).join("")}</div>`;
    }

    // ============ 1. Selectores ============
    function selectores(caja: HTMLElement): () => void {
      const total = NIVELES_SELECTOR.length;
      let i = primerPendiente(reg.selectores, total);
      let escena: Escena;
      let resuelto = false;
      /** pistas ya pedidas en este nivel: 0, 1, 2 y, con la tercera, se enseña la solución */
      let pedidas = 0;
      const etiquetaPista = () => (pedidas === 0 ? "💡 Pista (1 de 3)" : pedidas === 1 ? "💡 Pista (2 de 3)" : "💡 Ver solución (3 de 3)");

      function nivel(n: number): void {
        i = n;
        resuelto = false;
        pedidas = 0;
        const niv = NIVELES_SELECTOR[i];
        ventana.fijarTitulo(`CSS en juego · Selectores · nivel ${i + 1}`);
        caja.innerHTML = `
          ${fichas(total, i, reg.selectores)}
          <div class="cj-ficha"><span class="cj-bloque">${niv.bloque}</span><h3>Nivel ${i + 1} · ${niv.titulo}</h3><p>${AYUDAS_SELECTOR[i].teoria}</p></div>
          <p class="cj-consigna">Escribe un selector que elija los elementos que <b>parpadean</b> (y solo esos).</p>
          <div class="cj-escena"></div>
          <form class="cj-form"><span class="cj-pre" aria-hidden="true">CSS</span><input class="cj-sel" spellcheck="false" autocomplete="off" autocapitalize="off" placeholder="Tu selector…" aria-label="Selector CSS" /><button class="cj-ok">Probar</button></form>
          <p class="cj-mensaje" aria-live="polite"></p>
          <p class="cj-mensaje pista cj-ayuda" aria-live="polite" hidden></p>
          <div class="cj-pie">
            <button data-a="ant" ${i === 0 ? "disabled" : ""}>◂ Anterior</button>
            <button data-a="sol">${etiquetaPista()}</button>
            <button data-a="sig" class="cj-primario" ${i === total - 1 ? "disabled" : ""} hidden>Siguiente ▸</button>
            <span class="cj-marcador">Superados: <b>${reg.selectores.length}</b> / ${total}</span>
          </div>`;
        escena = montarEscena(caja.querySelector<HTMLElement>(".cj-escena")!, niv);
        entrada().focus();
      }
      const entrada = () => caja.querySelector<HTMLInputElement>(".cj-sel")!;
      const mensaje = (html: string, clase = "") => {
        const m = caja.querySelector<HTMLElement>(".cj-mensaje")!;
        m.className = `cj-mensaje ${clase}`;
        m.innerHTML = html;
      };

      /** elige y marca; devuelve null si el selector no es válido o está vacío */
      function probar(): Element[] | null {
        const t = entrada().value.trim();
        if (!t) {
          escena.marcar([]);
          mensaje("");
          return null;
        }
        try {
          const elegidos = escena.elegir(t);
          escena.marcar(elegidos);
          const obj = escena.objetivo.length;
          mensaje(`Eliges <b>${elegidos.length}</b> ${elegidos.length === 1 ? "elemento" : "elementos"}; el objetivo son <b>${obj}</b>.`);
          return elegidos;
        } catch {
          escena.marcar([]);
          mensaje("Eso todavía no es un selector CSS válido.", "mal");
          return null;
        }
      }

      caja.addEventListener("input", (e) => {
        if ((e.target as HTMLElement).classList.contains("cj-sel") && !resuelto) probar();
      });
      caja.addEventListener("submit", (e) => {
        e.preventDefault();
        if (resuelto) return;
        const elegidos = probar();
        if (!elegidos) return;
        if (mismosElementos(elegidos, escena.objetivo)) {
          resuelto = true;
          if (!reg.selectores.includes(i)) {
            reg.selectores.push(i);
            guardar(reg);
          }
          const mia = NIVELES_SELECTOR[i].solucion;
          const igual = entrada().value.trim().replace(/\s+/g, " ") === mia;
          mensaje(
            `✓ ¡Correcto!${igual ? "" : ` Mi solución era <code>${esc(mia)}</code>; la tuya también sirve si elige lo mismo.`}<span class="cj-explica">${AYUDAS_SELECTOR[i].explicacion}</span>`,
            "ok",
          );
          caja.querySelector<HTMLElement>('[data-a="sig"]')!.hidden = false;
          caja.querySelector<HTMLElement>('[data-a="sig"]')!.focus();
          caja.querySelector<HTMLElement>(".cj-marcador b")!.textContent = String(reg.selectores.length);
          caja.querySelectorAll<HTMLElement>(".cj-niveles button")[i].classList.add("ok");
        } else {
          const obj = escena.objetivo.length;
          const sobran = elegidos.filter((x) => !escena.objetivo.includes(x)).length;
          const faltan = escena.objetivo.filter((x) => !elegidos.includes(x)).length;
          mensaje(
            `✗ Todavía no: ${sobran ? `sobran <b>${sobran}</b> (en rojo)` : ""}${sobran && faltan ? " y " : ""}${faltan ? `faltan <b>${faltan}</b> de los ${obj} del objetivo` : ""}.`,
            "mal",
          );
        }
      });
      caja.addEventListener("click", (e) => {
        const b = (e.target as HTMLElement).closest<HTMLElement>("button");
        if (!b) return;
        if (b.dataset.n !== undefined) nivel(Number(b.dataset.n));
        else if (b.dataset.a === "ant") nivel(i - 1);
        else if (b.dataset.a === "sig") nivel(i + 1);
        else if (b.dataset.a === "sol") {
          const ayuda = AYUDAS_SELECTOR[i];
          const lugar = caja.querySelector<HTMLElement>(".cj-ayuda")!;
          lugar.hidden = false;
          if (pedidas < 2) {
            lugar.innerHTML = `<b>Pista ${pedidas + 1}:</b> ${ayuda.pistas[pedidas]}`;
            pedidas++;
          } else {
            lugar.innerHTML = `<b>Solución:</b> <code class="cj-solucion">${esc(NIVELES_SELECTOR[i].solucion)}</code>`;
            pedidas = 3;
          }
          b.textContent = etiquetaPista();
        }
      });
      nivel(i);
      return () => {};
    }

    // ============ 2. Flexbox y Grid (mismo motor) ============
    function maqueta(caja: HTMLElement, clave: "flexbox" | "grid", nombre: string, NIVELES: NivelFlex[], AYUDAS: Ayuda[]): () => void {
      const total = NIVELES.length;
      const hechos = reg[clave];
      let i = primerPendiente(hechos, total);
      let resuelto = false;
      /** pistas ya pedidas en este nivel: 0, 1, 2 y, con la tercera, se enseña la solución */
      let pedidas = 0;
      const etiquetaPista = () => (pedidas === 0 ? "💡 Pista (1 de 3)" : pedidas === 1 ? "💡 Pista (2 de 3)" : "💡 Ver solución (3 de 3)");
      let temporizador = 0;
      const objetivo = crearMarco();
      const tuyo = crearMarco();
      objetivo.title = "Disposición objetivo";
      tuyo.title = "Tu resultado";

      function nivel(n: number): void {
        i = n;
        resuelto = false;
        pedidas = 0;
        const niv = NIVELES[i];
        ventana.fijarTitulo(`CSS en juego · ${nombre} · nivel ${i + 1}`);
        caja.innerHTML = `
          ${fichas(total, i, hechos)}
          <div class="cj-ficha"><span class="cj-bloque">${niv.bloque}</span><h3>Nivel ${i + 1} · ${niv.titulo}</h3><p>${AYUDAS[i].teoria}</p></div>
          <p class="cj-consigna">Escribe el CSS para que <b>tus cajas</b> queden donde están en el <b>objetivo</b>.</p>
          <div class="cj-marcos">
            <figure><figcaption>Objetivo</figcaption><div class="cj-marco" data-q="objetivo"></div></figure>
            <figure><figcaption>Tu resultado <span class="cj-estado" aria-live="polite"></span></figcaption><div class="cj-marco" data-q="tuyo"></div></figure>
          </div>
          ${niv.base ? `<pre class="cj-base" aria-label="CSS que ya viene dado">${esc(niv.base)}</pre>` : ""}
          <textarea class="cj-css" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Tu CSS" rows="${Math.max(5, niv.inicial.split("\n").length + 1)}">${esc(niv.inicial)}</textarea>
          <p class="cj-mensaje" aria-live="polite"></p>
          <div class="cj-pie">
            <button data-a="ant" ${i === 0 ? "disabled" : ""}>◂ Anterior</button>
            <button data-a="sol">${etiquetaPista()}</button>
            <button data-a="sig" class="cj-primario" ${i === total - 1 ? "disabled" : ""} hidden>Siguiente ▸</button>
            <span class="cj-marcador">Superados: <b>${hechos.length}</b> / ${total}</span>
          </div>`;
        caja.querySelector('[data-q="objetivo"]')!.append(objetivo);
        caja.querySelector('[data-q="tuyo"]')!.append(tuyo);
        const doc = documentoFlex(niv);
        objetivo.srcdoc = doc;
        tuyo.srcdoc = doc;
      }

      const editor = () => caja.querySelector<HTMLTextAreaElement>(".cj-css")!;
      const mensaje = (html: string, clase = "") => {
        const m = caja.querySelector<HTMLElement>(".cj-mensaje");
        if (!m) return;
        m.className = `cj-mensaje ${clase}`;
        m.innerHTML = html;
      };

      function aplicar(): void {
        const niv = NIVELES[i];
        const estiloO = objetivo.contentDocument?.getElementById("u");
        const estiloT = tuyo.contentDocument?.getElementById("u");
        if (!estiloO || !estiloT) return;
        estiloO.textContent = niv.solucion;
        estiloT.textContent = editor().value;
        const ok = mismaDisposicion(medir(objetivo), medir(tuyo));
        const estado = caja.querySelector<HTMLElement>(".cj-estado");
        if (estado) estado.textContent = ok ? "✓ igual" : "";
        if (ok && !resuelto) {
          resuelto = true;
          if (!hechos.includes(i)) {
            hechos.push(i);
            guardar(reg);
          }
          mensaje(`✓ ¡Correcto! Las cajas están donde toca.<span class="cj-explica">${AYUDAS[i].explicacion}</span>`, "ok");
          const sig = caja.querySelector<HTMLElement>('[data-a="sig"]')!;
          sig.hidden = false;
          caja.querySelector<HTMLElement>(".cj-marcador b")!.textContent = String(hechos.length);
          caja.querySelectorAll<HTMLElement>(".cj-niveles button")[i].classList.add("ok");
        } else if (!ok && resuelto) {
          resuelto = false; // ha seguido tocando y ya no coincide
          mensaje("");
          caja.querySelector<HTMLElement>('[data-a="sig"]')!.hidden = true;
        }
      }

      // aplicar() espera a que estén cargados los dos documentos (si falta uno, no hace nada)
      for (const m of [objetivo, tuyo]) m.addEventListener("load", aplicar);
      caja.addEventListener("input", (e) => {
        if (!(e.target as HTMLElement).classList.contains("cj-css")) return;
        window.clearTimeout(temporizador);
        temporizador = window.setTimeout(aplicar, 120);
      });
      caja.addEventListener("keydown", (e) => {
        const t = e.target as HTMLTextAreaElement;
        if (e.key === "Tab" && t.classList?.contains("cj-css") && !e.ctrlKey && !e.altKey) {
          e.preventDefault();
          t.setRangeText("  ", t.selectionStart, t.selectionEnd, "end");
          t.dispatchEvent(new Event("input", { bubbles: true }));
        }
      });
      caja.addEventListener("click", (e) => {
        const b = (e.target as HTMLElement).closest<HTMLElement>("button");
        if (!b) return;
        if (b.dataset.n !== undefined) nivel(Number(b.dataset.n));
        else if (b.dataset.a === "ant") nivel(i - 1);
        else if (b.dataset.a === "sig") nivel(i + 1);
        else if (b.dataset.a === "sol") {
          const ayuda = AYUDAS[i];
          if (pedidas < 2) {
            mensaje(`<b>Pista ${pedidas + 1}:</b> ${ayuda.pistas[pedidas]}`, "pista");
            pedidas++;
          } else {
            mensaje(`<b>Solución:</b> <code class="cj-solucion">${esc(NIVELES[i].solucion)}</code>`, "pista");
            pedidas = 3;
          }
          b.textContent = etiquetaPista();
        }
      });
      nivel(i);
      return () => window.clearTimeout(temporizador);
    }

    abrir("selectores");
    return () => limpiar?.();
  },
};

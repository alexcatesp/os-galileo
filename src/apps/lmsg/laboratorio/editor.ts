// Editor de código del Laboratorio: números de línea, sugerencias junto al cursor, cierre
// automático de llaves/comillas/etiquetas, Emmet con Tab, sangría y comentar con Ctrl+/.

import type { Propuesta } from "./autocompletar";
import { expandirCss, expandirHtml } from "./emmet";

export interface OpcionesEditor {
  lenguaje: "html" | "css";
  etiqueta: string;
  /** sugerencias para el texto y la posición dados */
  sugerir: (texto: string, pos: number, forzar: boolean) => Propuesta | null;
  alCambiar: (texto: string) => void;
}

export interface Editor {
  el: HTMLElement;
  valor(): string;
  poner(texto: string): void;
  foco(): void;
  ocultar(): void;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const VACIAS = new Set(["br", "hr", "img", "input", "link", "meta", "area", "base", "col", "embed", "source", "track", "wbr"]);
const MAX_SUG = 8;
const PARES_CSS: Record<string, string> = { "{": "}", "(": ")", "[": "]", '"': '"', "'": "'" };
const PARES_HTML: Record<string, string> = { '"': '"', "'": "'" };

export function crearEditor(op: OpcionesEditor): Editor {
  const html = op.lenguaje === "html";
  const pares = html ? PARES_HTML : PARES_CSS;
  const el = document.createElement("div");
  el.className = "ed";
  el.innerHTML = `<div class="ed-num" aria-hidden="true"></div>
    <div class="ed-zona">
      <pre class="ed-espejo" aria-hidden="true"></pre>
      <textarea class="ed-texto" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="${op.etiqueta}"></textarea>
      <div class="ed-sug" role="listbox" aria-label="Sugerencias" hidden></div>
    </div>`;
  const num = el.querySelector<HTMLElement>(".ed-num")!;
  const zona = el.querySelector<HTMLElement>(".ed-zona")!;
  const espejo = el.querySelector<HTMLElement>(".ed-espejo")!;
  const ta = el.querySelector<HTMLTextAreaElement>(".ed-texto")!;
  const caja = el.querySelector<HTMLElement>(".ed-sug")!;

  let propuesta: Propuesta | null = null;
  let elegida = 0;
  let lineas = 0;

  // ---------- números de línea ----------
  function numerar(): void {
    const n = ta.value.split("\n").length;
    if (n === lineas) return;
    lineas = n;
    num.textContent = Array.from({ length: n }, (_, k) => k + 1).join("\n");
  }
  ta.addEventListener("scroll", () => {
    num.scrollTop = ta.scrollTop;
    ocultar();
  });

  // ---------- edición que conserva el deshacer ----------
  function editar(desde: number, hasta: number, nuevo: string, cursor?: number): void {
    ta.focus();
    ta.setSelectionRange(desde, hasta);
    let ok = false;
    try {
      ok = nuevo === "" ? document.execCommand("delete") : document.execCommand("insertText", false, nuevo);
    } catch {
      ok = false;
    }
    if (!ok) {
      ta.setRangeText(nuevo, desde, hasta, "end");
      ta.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (cursor !== undefined) ta.setSelectionRange(desde + cursor, desde + cursor);
  }

  // ---------- sugerencias junto al cursor ----------
  function ocultar(): void {
    propuesta = null;
    caja.hidden = true;
  }
  function colocar(): void {
    const pos = ta.selectionStart;
    espejo.innerHTML = `${esc(ta.value.slice(0, pos))}<span class="ed-m"></span>`;
    const m = espejo.querySelector<HTMLElement>(".ed-m")!;
    const alto = parseFloat(getComputedStyle(ta).lineHeight) || 20;
    const x = m.offsetLeft - ta.scrollLeft;
    const y = m.offsetTop - ta.scrollTop;
    caja.style.maxWidth = `${Math.max(180, zona.clientWidth - 8)}px`;
    const ancho = caja.offsetWidth;
    const altoCaja = caja.offsetHeight;
    let izq = Math.min(x, zona.clientWidth - ancho - 4);
    izq = Math.max(4, izq);
    let arriba = y + alto + 2;
    if (arriba + altoCaja > zona.clientHeight && y - altoCaja - 2 > 0) arriba = y - altoCaja - 2;
    caja.style.left = `${izq}px`;
    caja.style.top = `${Math.max(0, arriba)}px`;
  }
  function pintarSugerencias(): void {
    if (!propuesta) return void (caja.hidden = true);
    caja.hidden = false;
    caja.innerHTML = propuesta.items
      .slice(0, MAX_SUG)
      .map((s, k) => `<button type="button" role="option" data-s="${k}" class="${k === elegida ? "on" : ""}" aria-selected="${k === elegida}"><code>${esc(s.firma)}</code><span>${esc(s.doc)}</span></button>`)
      .join("");
    colocar();
    caja.querySelector(".on")?.scrollIntoView({ block: "nearest" });
  }
  function mostrar(forzar = false): void {
    if (ta.selectionStart !== ta.selectionEnd) return ocultar();
    propuesta = op.sugerir(ta.value, ta.selectionStart, forzar);
    elegida = 0;
    pintarSugerencias();
  }
  function aceptar(k: number): void {
    if (!propuesta) return;
    const s = propuesta.items[k];
    const desde = propuesta.desde;
    const hasta = propuesta.hasta ?? ta.selectionStart;
    editar(desde, hasta, s.insertar, s.cursor);
    ocultar();
  }
  const visible = () => !!propuesta && !caja.hidden;

  // ---------- ayudas de escritura ----------
  const dentroDeEtiqueta = (antes: string) => antes.lastIndexOf("<") > antes.lastIndexOf(">") && antes.lastIndexOf("<!--") <= antes.lastIndexOf("-->");

  /** etiqueta que acaba de abrirse justo antes del cursor (para cerrarla al escribir «>») */
  function etiquetaPorCerrar(antes: string): string | null {
    const lt = antes.lastIndexOf("<");
    if (lt < 0 || !dentroDeEtiqueta(antes)) return null;
    const seg = antes.slice(lt);
    const m = /^<([A-Za-z][\w-]*)(\s[^<>]*)?$/.exec(seg);
    if (!m || seg.endsWith("/") || (seg.match(/["']/g)?.length ?? 0) % 2) return null;
    const nombre = m[1].toLowerCase();
    return VACIAS.has(nombre) ? null : nombre;
  }

  function alTecla(e: KeyboardEvent): void {
    const pos = ta.selectionStart;
    const fin = ta.selectionEnd;
    const v = ta.value;
    const antes = v.slice(0, pos);
    const sinMod = !e.ctrlKey && !e.altKey && !e.metaKey;

    // sugerencias abiertas
    if (visible()) {
      const n = Math.min(MAX_SUG, propuesta!.items.length);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        elegida = (elegida + (e.key === "ArrowDown" ? 1 : n - 1)) % n;
        return pintarSugerencias();
      }
      if ((e.key === "Tab" && !e.shiftKey && sinMod) || (e.key === "Enter" && sinMod && !e.shiftKey)) {
        e.preventDefault();
        return aceptar(elegida);
      }
    }
    if (e.key === "Escape") return ocultar();
    if (e.key === " " && e.ctrlKey) {
      e.preventDefault();
      return mostrar(true);
    }

    // comentar / descomentar
    if ((e.key === "/" || e.code === "Slash") && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const ini = v.lastIndexOf("\n", pos - 1) + 1;
      let finLinea = v.indexOf("\n", fin);
      if (finLinea < 0) finLinea = v.length;
      const bloque = v.slice(ini, finLinea).split("\n");
      const [a, z] = html ? ["<!-- ", " -->"] : ["/* ", " */"];
      const re = html ? /^(\s*)<!--\s?([\s\S]*?)\s?-->\s*$/ : /^(\s*)\/\*\s?([\s\S]*?)\s?\*\/\s*$/;
      const todasComentadas = bloque.filter((l) => l.trim()).every((l) => re.test(l));
      const nuevo = bloque.map((l) => (!l.trim() ? l : todasComentadas ? l.replace(re, "$1$2") : l.replace(/^(\s*)([\s\S]*)$/, `$1${a}$2${z}`))).join("\n");
      editar(ini, finLinea, nuevo);
      ta.setSelectionRange(ini, ini + nuevo.length);
      return;
    }

    // Tab: Emmet, sangría
    if (e.key === "Tab" && sinMod) {
      e.preventDefault();
      const multilinea = pos !== fin && v.slice(pos, fin).includes("\n");
      if (e.shiftKey || multilinea) {
        const ini = v.lastIndexOf("\n", pos - 1) + 1;
        let finLinea = v.indexOf("\n", fin > pos && v[fin - 1] === "\n" ? fin - 1 : fin);
        if (finLinea < 0) finLinea = v.length;
        const nuevo = v
          .slice(ini, finLinea)
          .split("\n")
          .map((l) => (e.shiftKey ? l.replace(/^( {1,2}|\t)/, "") : `  ${l}`))
          .join("\n");
        editar(ini, finLinea, nuevo);
        ta.setSelectionRange(ini, ini + nuevo.length);
        return;
      }
      if (pos === fin) {
        const x = html ? expandirHtml(v, pos) : expandirCss(v, pos);
        if (x) {
          editar(x.desde, x.hasta, x.insertar, x.cursor);
          return ocultar();
        }
      }
      return editar(pos, fin, "  ");
    }

    // Intro: conserva la sangría y abre el bloque entre {} o <etiqueta></etiqueta>
    if (e.key === "Enter" && sinMod && pos === fin) {
      const ini = antes.lastIndexOf("\n") + 1;
      const linea = antes.slice(ini);
      const sangria = /^[ \t]*/.exec(linea)![0];
      const prev = v[pos - 1];
      const sig = v.slice(pos);
      const ult = /^<([A-Za-z][\w-]*)(\s[^<>]*)?>$/.exec(linea.slice(linea.lastIndexOf("<")));
      const abreEtiqueta = html && !!ult && !VACIAS.has(ult[1].toLowerCase());
      const entre = (prev === "{" && sig[0] === "}") || (abreEtiqueta && /^<\/[A-Za-z]/.test(sig));
      const abre = prev === "{" || abreEtiqueta;
      e.preventDefault();
      if (entre) {
        const hueco = `\n${sangria}  `;
        return editar(pos, pos, `${hueco}\n${sangria}`, hueco.length);
      }
      return editar(pos, pos, `\n${sangria}${abre ? "  " : ""}`);
    }

    // Retroceso entre un par: borra los dos
    if (e.key === "Backspace" && sinMod && pos === fin && pos > 0) {
      const a = v[pos - 1];
      if (pares[a] && v[pos] === pares[a]) {
        e.preventDefault();
        ta.setSelectionRange(pos - 1, pos + 1);
        return void (document.execCommand("delete") || editar(pos - 1, pos + 1, ""));
      }
      return;
    }

    if (e.key.length !== 1 || !sinMod || e.isComposing) return;

    // saltar un cierre que ya está puesto
    const cierres = new Set(Object.values(pares));
    if (pos === fin && cierres.has(e.key) && v[pos] === e.key) {
      e.preventDefault();
      return ta.setSelectionRange(pos + 1, pos + 1);
    }
    // abrir un par
    const cierre = pares[e.key];
    if (cierre && !(html && !dentroDeEtiqueta(antes))) {
      const esComilla = e.key === cierre;
      if (esComilla && (/\w$/.test(antes) || /^\w/.test(v.slice(pos)))) return;
      e.preventDefault();
      if (pos !== fin) {
        const sel = v.slice(pos, fin);
        return editar(pos, fin, e.key + sel + cierre, 1 + sel.length);
      }
      return editar(pos, pos, e.key + cierre, 1), mostrar();
    }
    // HTML: «>» cierra la etiqueta recién abierta
    if (html && e.key === ">" && pos === fin) {
      const nombre = etiquetaPorCerrar(antes);
      if (nombre && !new RegExp(`^</${nombre}\\s*>`, "i").test(v.slice(pos))) {
        e.preventDefault();
        return editar(pos, pos, `></${nombre}>`, 1), ocultar();
      }
    }
  }

  ta.addEventListener("keydown", alTecla);
  ta.addEventListener("input", () => {
    numerar();
    op.alCambiar(ta.value);
    mostrar();
  });
  ta.addEventListener("click", ocultar);
  ta.addEventListener("blur", () => window.setTimeout(ocultar, 150));
  caja.addEventListener("mousedown", (e) => e.preventDefault()); // no quitar el foco al editor
  caja.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>("button[data-s]");
    if (b) aceptar(Number(b.dataset.s));
  });

  return {
    el,
    valor: () => ta.value,
    poner(texto) {
      ta.value = texto;
      ta.scrollTop = ta.scrollLeft = 0;
      lineas = 0;
      numerar();
      ocultar();
    },
    foco: () => ta.focus(),
    ocultar,
  };
}

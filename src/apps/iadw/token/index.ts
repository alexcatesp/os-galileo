import type { AppDef } from "../../../kernel/kernel";
import { Entrenador, bytesDe, entrenar, trocear, visible, type Ficha, type Fusion, type Metodo } from "./bpe";
import { CORPUS_EN, CORPUS_ES, CORPUS_MINI, TEXTO_INICIAL } from "./textos";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const METODOS: Record<Metodo, { nombre: string; idea: string }> = {
  caracteres: { nombre: "Caracteres", idea: "Un token por carácter. Vocabulario enorme (todo Unicode) y textos larguísimos." },
  palabras: { nombre: "Palabras", idea: "Un token por palabra o signo. Cualquier palabra nueva o con errata no estaría en el vocabulario." },
  bytes: { nombre: "Bytes UTF-8", idea: "Un token por byte (solo 256 posibles). Nunca falla, pero la «ñ», los acentos y los emojis ocupan 2–4 tokens." },
  bpe: { nombre: "BPE", idea: "Parte de los bytes y une los pares más frecuentes del texto de entrenamiento. Es lo que usan los modelos actuales." },
};

type Corpus = "es" | "en" | "mio";
const NOMBRE_CORPUS: Record<Corpus, string> = { es: "texto de ejemplo en español", en: "texto de ejemplo en inglés", mio: "mi propio texto" };

const VENTANAS: [string, number][] = [["4 mil", 4096], ["8 mil", 8192], ["32 mil", 32768], ["128 mil", 128000], ["200 mil", 200000], ["1 millón", 1000000]];

type Pestana = "tokenizar" | "paso" | "coste";

/** Color de cada ficha (rotan para distinguir dónde acaba una y empieza la siguiente) */
const color = (i: number) => `tk-c${i % 6}`;

function fichas(lista: Ficha[], ids: boolean): string {
  if (!lista.length) return `<span class="tk-vacio">Escribe algo arriba para verlo troceado.</span>`;
  return lista
    .map((f, i) => `<span class="tk-ficha ${color(i)}" title="id ${f.id} · ${f.bytes} ${f.bytes === 1 ? "byte" : "bytes"}">${esc(f.texto)}${ids ? `<sub>${f.id}</sub>` : ""}</span>`)
    .join("");
}

export const token: AppDef = {
  id: "token",
  nombre: "Token",
  carpeta: "IADW",
  icono: `<svg viewBox="0 0 48 48"><rect x="4" y="9" width="40" height="30" rx="7" fill="#0d0b1e" stroke="#da251c" stroke-width="2.5"/><rect x="9" y="15" width="12" height="9" rx="3" fill="#ffd54a"/><rect x="23" y="15" width="16" height="9" rx="3" fill="#6fd08c"/><rect x="9" y="27" width="18" height="9" rx="3" fill="#8fb4ff"/><rect x="29" y="27" width="10" height="9" rx="3" fill="#ff9aa2"/></svg>`,
  ancho: 640,
  alto: 640,
  iniciar({ ventana, raiz }) {
    raiz.classList.add("tk");
    raiz.innerHTML = `
      <div class="tk-tabs" role="tablist">
        <button data-p="tokenizar">🔤 Tokenizar</button><button data-p="paso">🧩 Paso a paso</button><button data-p="coste">💶 Contexto y coste</button>
      </div>
      <div class="tk-cuerpo"></div>`;
    const cuerpo = raiz.querySelector<HTMLElement>(".tk-cuerpo")!;

    // estado compartido entre pestañas
    let texto = TEXTO_INICIAL;
    let metodo: Metodo = "bpe";
    let corpus: Corpus = "es";
    let nFusiones = 150;
    let verIds = true;
    const aprendidas = new Map<string, Fusion[]>();

    /** fusiones del BPE actual (se entrenan una vez por combinación; con «mi texto» se reentrena al escribir) */
    function vocabulario(c: Corpus = corpus, n = nFusiones): Fusion[] {
      const base = c === "es" ? CORPUS_ES : c === "en" ? CORPUS_EN : texto;
      const clave = c === "mio" ? `mio|${n}|${texto}` : `${c}|${n}`;
      let f = aprendidas.get(clave);
      if (!f) {
        f = entrenar(base, n);
        if (aprendidas.size > 40) aprendidas.clear();
        aprendidas.set(clave, f);
      }
      return f;
    }

    function abrir(p: Pestana): void {
      raiz.querySelectorAll<HTMLElement>("[data-p]").forEach((b) => b.classList.toggle("on", b.dataset.p === p));
      const caja = document.createElement("div");
      caja.className = "tk-modo";
      cuerpo.replaceChildren(caja);
      ventana.fijarTitulo(`Token · ${p === "tokenizar" ? "Tokenizar" : p === "paso" ? "Paso a paso" : "Contexto y coste"}`);
      if (p === "tokenizar") tokenizar(caja);
      else if (p === "paso") pasoAPaso(caja);
      else coste(caja);
    }
    raiz.querySelector(".tk-tabs")!.addEventListener("click", (e) => {
      const p = (e.target as HTMLElement).dataset.p as Pestana | undefined;
      if (p) abrir(p);
    });

    // ============ 1. Tokenizar ============
    function tokenizar(caja: HTMLElement): void {
      caja.innerHTML = `
        <label class="tk-etq">Texto a tokenizar
          <textarea class="tk-texto" rows="4" spellcheck="false" aria-label="Texto a tokenizar"></textarea>
        </label>
        <div class="tk-opciones">
          <label>Método <select data-t="metodo">${(Object.keys(METODOS) as Metodo[]).map((m) => `<option value="${m}">${METODOS[m].nombre}</option>`).join("")}</select></label>
          <span data-t="bpe-opc" class="tk-bpe-opc">
            <label>Entrenado con <select data-t="corpus">${(Object.keys(NOMBRE_CORPUS) as Corpus[]).map((c) => `<option value="${c}">${NOMBRE_CORPUS[c]}</option>`).join("")}</select></label>
            <label>Fusiones <input type="range" min="0" max="250" step="5" data-t="fusiones" aria-label="Número de fusiones" /> <b data-t="fusiones-n"></b></label>
          </span>
          <label class="tk-check"><input type="checkbox" data-t="ids" /> ver ids</label>
        </div>
        <p class="tk-idea" data-t="idea"></p>
        <div class="tk-salida" data-t="salida" aria-live="polite"></div>
        <div class="tk-datos" data-t="datos"></div>
        <details class="tk-ayuda"><summary>¿Cómo leer esto?</summary>
          <p>Cada recuadro de color es <b>un token</b>; el número pequeño es su <b>id</b>, que es lo único que recibe el modelo. «·» es un espacio, «↵» un salto de línea y <code>&lt;E2&gt;</code> un byte suelto de un carácter que se ha partido.</p>
          <p>Prueba: pasa de <b>0</b> a <b>250 fusiones</b> y mira cómo bajan los tokens. Después entrena con el texto en <b>inglés</b> y tokeniza una frase en español: sale peor, porque ese vocabulario nunca vio «ción» ni «ñ».</p>
        </details>`;
      const area = caja.querySelector<HTMLTextAreaElement>(".tk-texto")!;
      area.value = texto;
      const q = <T extends HTMLElement>(k: string) => caja.querySelector<T>(`[data-t="${k}"]`)!;
      q<HTMLSelectElement>("metodo").value = metodo;
      q<HTMLSelectElement>("corpus").value = corpus;
      q<HTMLInputElement>("fusiones").value = String(nFusiones);
      q<HTMLInputElement>("ids").checked = verIds;

      function actualizar(): void {
        q("bpe-opc").hidden = metodo !== "bpe";
        q("fusiones-n").textContent = String(nFusiones);
        q("idea").textContent = METODOS[metodo].idea;
        const lista = trocear(texto, metodo, metodo === "bpe" ? vocabulario() : []);
        q("salida").innerHTML = fichas(lista, verIds);
        const bytes = new TextEncoder().encode(texto).length;
        const car = Array.from(texto).length;
        q("datos").innerHTML = `
          <span><b>${lista.length}</b> tokens</span><span><b>${car}</b> caracteres</span><span><b>${bytes}</b> bytes</span>
          <span><b>${lista.length ? (car / lista.length).toFixed(2) : "0"}</b> caracteres por token</span>
          ${metodo === "bpe" ? `<span>vocabulario: <b>${256 + vocabulario().length}</b> tokens</span>` : ""}`;
      }
      area.addEventListener("input", () => {
        texto = area.value;
        actualizar();
      });
      caja.addEventListener("input", (e) => {
        const t = e.target as HTMLInputElement;
        if (t.dataset.t === "fusiones") {
          nFusiones = Number(t.value);
          actualizar();
        }
      });
      caja.addEventListener("change", (e) => {
        const t = e.target as HTMLInputElement | HTMLSelectElement;
        if (t.dataset.t === "metodo") metodo = t.value as Metodo;
        else if (t.dataset.t === "corpus") corpus = t.value as Corpus;
        else if (t.dataset.t === "ids") verIds = (t as HTMLInputElement).checked;
        else return;
        actualizar();
      });
      actualizar();
    }

    // ============ 2. Paso a paso ============
    function pasoAPaso(caja: HTMLElement): void {
      let base = CORPUS_MINI;
      let ent = new Entrenador(base);
      let ultima: string | null = null;
      let fin = false;

      /** nombre legible de un id */
      const nombre = (id: number) => visible(bytesDe(id, ent.fusiones));

      function pintar(): void {
        const filas = ent
          .estado()
          .slice(0, 12)
          .map((w) => `<div class="tk-palabra"><span class="tk-frec">×${w.frec}</span>${w.ids.map((id, i) => `<span class="tk-ficha ${color(i)}">${esc(nombre(id))}</span>`).join("")}</div>`)
          .join("");
        const pares = ent
          .pares()
          .map((p, i) => `<tr class="${i === 0 ? "top" : ""}"><td><code>${esc(nombre(p.a))}</code> + <code>${esc(nombre(p.b))}</code></td><td>${p.veces}</td></tr>`)
          .join("");
        const hechas = ent.fusiones.map((f) => `<li><code>${esc(nombre(f.a))}</code> + <code>${esc(nombre(f.b))}</code> → <b><code>${esc(nombre(f.id))}</code></b> <small>(id ${f.id})</small></li>`).join("");
        caja.innerHTML = `
          <label class="tk-etq">Texto de entrenamiento (pequeño, para ver el algoritmo)
            <textarea class="tk-texto" rows="2" spellcheck="false" aria-label="Texto de entrenamiento">${esc(base)}</textarea>
          </label>
          <p class="tk-idea">Empieza con un token por byte. En cada paso se busca el <b>par de tokens vecinos más repetido</b> y se funde en un token nuevo. Eso se repite hasta tener el vocabulario deseado.</p>
          <div class="tk-botones">
            <button class="tk-primario" data-s="paso" ${fin ? "disabled" : ""}>Siguiente fusión ▸</button>
            <button data-s="cinco" ${fin ? "disabled" : ""}>+5</button>
            <button data-s="reiniciar">Reiniciar</button>
            <span class="tk-marcador">Fusiones: <b>${ent.fusiones.length}</b> · vocabulario: <b>${256 + ent.fusiones.length}</b></span>
          </div>
          <p class="tk-mensaje">${ultima ?? "Pulsa «Siguiente fusión» para empezar."}</p>
          <div class="tk-dos">
            <div><h4>Palabras ahora</h4><div class="tk-palabras">${filas || "<i>(texto vacío)</i>"}</div></div>
            <div><h4>Pares más repetidos</h4><table class="tk-pares"><thead><tr><th>Par</th><th>Veces</th></tr></thead><tbody>${pares || `<tr><td colspan="2"><i>ninguno</i></td></tr>`}</tbody></table></div>
          </div>
          ${hechas ? `<h4>Fusiones aprendidas</h4><ol class="tk-fusiones">${hechas}</ol>` : ""}`;
      }

      function dar(n: number): void {
        for (let i = 0; i < n; i++) {
          const f = ent.paso();
          if (!f) {
            fin = true;
            ultima = "No quedan pares que fundir: cada palabra ya es un único token.";
            break;
          }
          ultima = `Se fundió <code>${esc(nombre(f.a))}</code> + <code>${esc(nombre(f.b))}</code> → <b><code>${esc(nombre(f.id))}</code></b> (aparecía ${f.veces} ${f.veces === 1 ? "vez" : "veces"}).`;
        }
        pintar();
      }
      function reiniciar(): void {
        ent = new Entrenador(base);
        ultima = null;
        fin = false;
        pintar();
      }

      caja.addEventListener("click", (e) => {
        const a = (e.target as HTMLElement).dataset.s;
        if (a === "paso") dar(1);
        else if (a === "cinco") dar(5);
        else if (a === "reiniciar") reiniciar();
      });
      caja.addEventListener("change", (e) => {
        const t = e.target as HTMLTextAreaElement;
        if (t.classList.contains("tk-texto")) {
          base = t.value.slice(0, 600);
          reiniciar();
        }
      });
      pintar();
    }

    // ============ 3. Contexto y coste ============
    function coste(caja: HTMLElement): void {
      let ventanaCtx = 8192;
      let precio = 3;
      caja.innerHTML = `
        <label class="tk-etq">Texto (el mismo de la pestaña Tokenizar)
          <textarea class="tk-texto" rows="4" spellcheck="false" aria-label="Texto"></textarea>
        </label>
        <div class="tk-opciones">
          <label>Ventana de contexto <select data-c="ventana">${VENTANAS.map(([n, v]) => `<option value="${v}">${n} tokens</option>`).join("")}</select></label>
          <label>Precio <input type="number" min="0" step="0.5" data-c="precio" class="tk-num" aria-label="Precio por millón de tokens" /> € por millón de tokens</label>
        </div>
        <div class="tk-salida-c" data-c="salida" aria-live="polite"></div>
        <p class="tk-nota">Es una <b>estimación</b>: usa el BPE de juguete de esta app. Cada modelo real tiene su propio tokenizador, así que el número exacto cambia de un modelo a otro. Para saber el consumo real, mira siempre el campo <code>usage</code> que devuelve la API.</p>`;
      const area = caja.querySelector<HTMLTextAreaElement>(".tk-texto")!;
      area.value = texto;
      const q = <T extends HTMLElement>(k: string) => caja.querySelector<T>(`[data-c="${k}"]`)!;
      q<HTMLSelectElement>("ventana").value = String(ventanaCtx);
      q<HTMLInputElement>("precio").value = String(precio);

      function actualizar(): void {
        const car = Array.from(texto).length;
        const bytes = new TextEncoder().encode(texto).length;
        const nBpe = trocear(texto, "bpe", vocabulario("es", 250)).length;
        const pct = (nBpe / ventanaCtx) * 100;
        const euros = (nBpe / 1e6) * precio;
        const caben = nBpe ? Math.floor(ventanaCtx / nBpe) : 0;
        q("salida").innerHTML = `
          <div class="tk-tarjetas">
            <div><span>Tokens (BPE 250 fusiones)</span><b>${nBpe}</b></div>
            <div><span>Bytes UTF-8</span><b>${bytes}</b></div>
            <div><span>Regla «car. ÷ 4»</span><b>${Math.ceil(car / 4)}</b></div>
            <div><span>Coste de enviarlo</span><b>${euros < 0.01 ? euros.toFixed(5) : euros.toFixed(3)} €</b></div>
          </div>
          <div class="tk-medidor" role="img" aria-label="${pct.toFixed(1)} % de la ventana de contexto"><i style="width:${Math.min(100, pct)}%"></i></div>
          <p class="tk-mensaje">${pct > 100 ? "⚠ No cabe: supera la ventana de contexto." : `Ocupa el <b>${pct < 0.1 && nBpe ? "<0,1" : pct.toFixed(1).replace(".", ",")} %</b> de la ventana.`}${caben > 1 ? ` Caben unas <b>${caben}</b> copias de este texto.` : ""}</p>
          <p class="tk-mensaje">Enviarlo <b>1 000 veces</b> al día costaría unos <b>${((euros * 1000)).toFixed(2).replace(".", ",")} €</b> al día, solo en entrada.</p>`;
      }
      area.addEventListener("input", () => {
        texto = area.value;
        actualizar();
      });
      caja.addEventListener("input", (e) => {
        const t = e.target as HTMLInputElement;
        if (t.dataset.c === "precio") {
          precio = Math.max(0, Number(t.value) || 0);
          actualizar();
        }
      });
      caja.addEventListener("change", (e) => {
        const t = e.target as HTMLSelectElement;
        if (t.dataset.c === "ventana") {
          ventanaCtx = Number(t.value);
          actualizar();
        }
      });
      actualizar();
    }

    abrir("tokenizar");
  },
};

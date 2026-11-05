import type { AppDef } from "../../../kernel/kernel";
import { Entrenador, bytesDe, entrenar, trocear, visible, type Ficha, type Fusion, type Metodo } from "./bpe";
import { CORPUS_EN, CORPUS_ES, CORPUS_MINI, TEXTO_INICIAL } from "./textos";
import { CODIFICACIONES, CODIFS, FRASES_IDIOMAS, MB_REMOTAS, MODELOS, REMOTAS, cargar, listo, type Codificacion } from "./real";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const METODOS: Record<Metodo, { nombre: string; idea: string }> = {
  caracteres: { nombre: "Caracteres", idea: "Un token por carácter. Vocabulario enorme (todo Unicode) y textos larguísimos." },
  palabras: { nombre: "Palabras", idea: "Un token por palabra o signo. Cualquier palabra nueva o con errata no estaría en el vocabulario." },
  bytes: { nombre: "Bytes UTF-8", idea: "Un token por byte (solo 256 posibles). Nunca falla, pero la «ñ», los acentos y los emojis ocupan 2–4 tokens." },
  bpe: { nombre: "BPE", idea: "Parte de los bytes y une los pares más frecuentes del texto de entrenamiento. Es lo que usan los modelos actuales." },
};

type Corpus = "es" | "en" | "mio";
const NOMBRE_CORPUS: Record<Corpus, string> = { es: "texto de ejemplo en español", en: "texto de ejemplo en inglés", mio: "mi propio texto" };

type Pestana = "reales" | "idiomas" | "tokenizar" | "paso";

const TITULOS: Record<Pestana, string> = { reales: "Modelos reales", idiomas: "Idiomas", tokenizar: "Métodos", paso: "BPE paso a paso" };

/** Botón para descargar los tokenizadores de DeepSeek y GLM (pesan mucho: solo si el alumno lo pide) */
const botonRemotos = () =>
  `<div class="tk-remotos" data-remotos><button data-descargar>⬇ Cargar ${REMOTAS.map((c) => CODIFICACIONES[c].nombre).join(" y ")} (≈ ${MB_REMOTAS} MB)</button> <small data-estado-remotos>Se descargan de Hugging Face la primera vez.</small></div>`;

const todosRemotos = () => REMOTAS.every((c) => listo(c));

const usd = (v: number, dec = 2) => (v < 0.01 && v > 0 ? v.toFixed(5) : v.toFixed(dec)).replace(".", ",");

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
        <button data-p="reales">🌐 Modelos reales</button><button data-p="idiomas">🗣️ Idiomas</button><button data-p="tokenizar">🔤 Métodos</button><button data-p="paso">🧩 BPE paso a paso</button>
      </div>
      <div class="tk-cuerpo"></div>`;
    const cuerpo = raiz.querySelector<HTMLElement>(".tk-cuerpo")!;

    // estado compartido entre pestañas
    let texto = TEXTO_INICIAL;
    let metodo: Metodo = "bpe";
    let corpus: Corpus = "es";
    let nFusiones = 150;
    let verIds = true;
    let codif: Codificacion = "o200k_base";
    const precios = new Map(MODELOS.map((m) => [m.id, m.precio]));
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
      ventana.fijarTitulo(`Token · ${TITULOS[p]}`);
      if (p === "reales") reales(caja);
      else if (p === "idiomas") idiomas(caja);
      else if (p === "tokenizar") tokenizar(caja);
      else pasoAPaso(caja);
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

    /** conecta el botón de descarga de DeepSeek/GLM; `alCargar` repinta la pestaña cuando terminan */
    function enlazarRemotos(caja: HTMLElement, alCargar: () => void): void {
      const zona = caja.querySelector<HTMLElement>("[data-remotos]");
      if (!zona) return;
      if (todosRemotos()) {
        zona.hidden = true;
        return;
      }
      const boton = zona.querySelector<HTMLButtonElement>("button")!;
      const estado = zona.querySelector<HTMLElement>("[data-estado-remotos]")!;
      boton.addEventListener("click", () => {
        boton.disabled = true;
        estado.textContent = "Descargando…";
        Promise.all(REMOTAS.map((c) => cargar(c)))
          .then(() => {
            zona.hidden = true;
            alCargar();
          })
          .catch(() => {
            boton.disabled = false;
            estado.textContent = "No se pudo descargar (¿sin conexión?). Inténtalo de nuevo.";
          });
      });
    }

    const cargarOpenAi = () => Promise.all([cargar("cl100k_base"), cargar("o200k_base")]);

    // ============ Modelos reales ============
    function reales(caja: HTMLElement): void {
      caja.innerHTML = `
        <label class="tk-etq">Texto a tokenizar
          <textarea class="tk-texto" rows="4" spellcheck="false" aria-label="Texto a tokenizar"></textarea>
        </label>
        <div class="tk-opciones">
          <label>Vocabulario <select data-r="codif">${CODIFS.map((c) => `<option value="${c}">${CODIFICACIONES[c].nombre} · ${CODIFICACIONES[c].modelos}</option>`).join("")}</select></label>
          <label class="tk-check"><input type="checkbox" data-r="ids" /> ver ids</label>
        </div>
        ${botonRemotos()}
        <div class="tk-salida" data-r="salida" aria-live="polite"><span class="tk-vacio">Cargando el vocabulario real…</span></div>
        <div class="tk-datos" data-r="datos"></div>
        <h4>Qué cuesta enviarlo a cada modelo</h4>
        <table class="tk-pares tk-modelos" data-r="tabla"></table>
        <p class="tk-nota">Vocabularios <b>oficiales</b>: tiktoken de OpenAI y el <code>tokenizer.json</code> de DeepSeek V4 y GLM-5.3 (Hugging Face). Todos los GPT-4o, GPT-4.1 y GPT-5 comparten <code>o200k_base</code>; según fuentes externas, GPT-5.6 Sol, Terra y Luna también (OpenAI no lo documenta oficialmente). Los <b>precios son orientativos y editables</b> (cambian a menudo; mira la página del proveedor; con precio 0 no se calcula coste). Anthropic y Google no publican su vocabulario: solo se pueden contar sus tokens con su API. Para el consumo real, mira siempre el campo <code>usage</code> de la respuesta.</p>`;
      const area = caja.querySelector<HTMLTextAreaElement>(".tk-texto")!;
      area.value = texto;
      const q = <T extends HTMLElement>(k: string) => caja.querySelector<T>(`[data-r="${k}"]`)!;
      q<HTMLSelectElement>("codif").value = codif;
      q<HTMLInputElement>("ids").checked = verIds;
      q("tabla").innerHTML = `<thead><tr><th>Modelo</th><th>Tokens</th><th>% ventana</th><th>$ por envío</th><th>$ por 1 000 envíos</th><th>$ / M tokens</th></tr></thead><tbody>${MODELOS.map(
        (m) =>
          `<tr><td>${m.nombre}<br><small>${CODIFICACIONES[m.codif].nombre} · ventana ${m.ventana >= 1e6 ? Math.round(m.ventana / 1e6) + " M" : Math.round(m.ventana / 1000) + " mil"}</small></td><td data-n="${m.id}"></td><td data-v="${m.id}"></td><td data-e="${m.id}"></td><td data-d="${m.id}"></td><td><input type="number" min="0" step="0.1" class="tk-num" data-pr="${m.id}" value="${precios.get(m.id)}" aria-label="Precio de ${m.nombre} en dólares por millón de tokens" /></td></tr>`,
      ).join("")}</tbody>`;

      function actualizar(): void {
        const m = listo(codif);
        if (!m) {
          q("salida").innerHTML = `<span class="tk-vacio">${CODIFICACIONES[codif].remoto ? "Pulsa «Cargar» para descargar este vocabulario." : "Cargando el vocabulario real…"}</span>`;
          q("datos").innerHTML = "";
        } else {
          const lista = m.trocear(texto);
          q("salida").innerHTML = fichas(lista, verIds);
          const car = Array.from(texto).length;
          const bytes = new TextEncoder().encode(texto).length;
          q("datos").innerHTML = `<span><b>${lista.length}</b> tokens</span><span><b>${car}</b> caracteres</span><span><b>${bytes}</b> bytes</span><span><b>${lista.length ? (car / lista.length).toFixed(2).replace(".", ",") : "0"}</b> caracteres por token</span>`;
        }
        for (const mod of MODELOS) {
          const celda = (k: string) => caja.querySelector<HTMLElement>(`[data-${k}="${mod.id}"]`)!;
          const mt = listo(mod.codif);
          if (!mt) {
            for (const k of ["n", "v", "e", "d"]) celda(k).textContent = "—";
            continue;
          }
          const n = mt.contar(texto);
          const precio = precios.get(mod.id) ?? 0;
          const coste = (n / 1e6) * precio;
          const pct = (n / mod.ventana) * 100;
          celda("n").textContent = String(n);
          celda("v").textContent = pct > 100 ? "⚠ no cabe" : pct < 0.01 && n ? "<0,01 %" : `${pct.toFixed(2).replace(".", ",")} %`;
          celda("e").textContent = precio ? `$${usd(coste, 4)}` : "—";
          celda("d").textContent = precio ? `$${usd(coste * 1000)}` : "—";
        }
      }

      cargarOpenAi().then(actualizar).catch(() => {
        q("salida").innerHTML = `<span class="tk-vacio">No se pudo cargar el vocabulario. Recarga la app e inténtalo de nuevo.</span>`;
      });
      enlazarRemotos(caja, actualizar);
      actualizar();

      area.addEventListener("input", () => {
        texto = area.value;
        actualizar();
      });
      caja.addEventListener("input", (e) => {
        const t = e.target as HTMLInputElement;
        if (t.dataset.pr) {
          precios.set(t.dataset.pr, Math.max(0, Number(t.value) || 0));
          actualizar();
        }
      });
      caja.addEventListener("change", (e) => {
        const t = e.target as HTMLInputElement | HTMLSelectElement;
        if (t.dataset.r === "codif") codif = t.value as Codificacion;
        else if (t.dataset.r === "ids") verIds = (t as HTMLInputElement).checked;
        else return;
        actualizar();
      });
    }

    // ============ Idiomas ============
    function idiomas(caja: HTMLElement): void {
      let elegida = 1; // español
      caja.innerHTML = `
        <p class="tk-idea">La <b>misma frase</b> en varios idiomas. Los vocabularios se aprenden sobre todo con texto en inglés, así que otros idiomas (y otros alfabetos) suelen necesitar <b>más tokens para decir lo mismo</b>… y por tanto cuestan más y llenan antes la ventana de contexto. Los modelos chinos lo hacen mejor con el chino.</p>
        <div class="tk-opciones"><label>Ver los tokens con <select data-i="codif">${CODIFS.map((c) => `<option value="${c}">${CODIFICACIONES[c].nombre}</option>`).join("")}</select></label></div>
        ${botonRemotos()}
        <div class="tk-tabla-scroll"><table class="tk-pares tk-idiomas" data-i="tabla"><tbody><tr><td><span class="tk-vacio">Cargando el vocabulario real…</span></td></tr></tbody></table></div>
        <div class="tk-salida" data-i="salida" aria-live="polite"></div>
        <p class="tk-nota">Pulsa un idioma para ver cómo trocea su frase. «Respecto al inglés» compara cada idioma con el inglés <b>en el vocabulario elegido</b>: ×1,5 significa que paga un 50 % más por el mismo mensaje. «—» = vocabulario sin descargar.</p>`;
      const q = <T extends HTMLElement>(k: string) => caja.querySelector<T>(`[data-i="${k}"]`)!;
      q<HTMLSelectElement>("codif").value = codif;

      function pintar(): void {
        if (!listo("cl100k_base") || !listo("o200k_base")) return;
        const filas = FRASES_IDIOMAS.map((f) => ({
          ...f,
          car: Array.from(f.texto).length,
          bytes: new TextEncoder().encode(f.texto).length,
          n: CODIFS.map((c) => listo(c)?.contar(f.texto)),
        }));
        const k = CODIFS.indexOf(codif);
        const ref = filas[0].n[k];
        const max = Math.max(...filas.map((f) => f.n[k] ?? 0), 1);
        q("tabla").innerHTML = `<thead><tr><th>Idioma</th><th>Car.</th><th>Bytes</th>${CODIFS.map((c) => `<th class="${c === codif ? "sel" : ""}">${CODIFICACIONES[c].nombre}</th>`).join("")}<th>Respecto al inglés</th></tr></thead><tbody>${filas
          .map(
            (f, i) =>
              `<tr class="${i === elegida ? "top" : ""}"><td><button class="tk-idioma" data-idioma="${i}">${f.idioma}</button></td><td>${f.car}</td><td>${f.bytes}</td>${f.n.map((n, j) => `<td class="${j === k ? "sel" : ""}">${n ?? "—"}</td>`).join("")}<td>${f.n[k] === undefined || !ref ? "—" : `<span class="tk-barra"><i style="width:${(f.n[k]! / max) * 100}%"></i></span> ×${(f.n[k]! / ref).toFixed(2).replace(".", ",")}`}</td></tr>`,
          )
          .join("")}</tbody>`;
        const motor = listo(codif);
        q("salida").innerHTML = `<p class="tk-mensaje"><b>${FRASES_IDIOMAS[elegida].idioma}:</b> ${esc(FRASES_IDIOMAS[elegida].texto)}</p>${motor ? fichas(motor.trocear(FRASES_IDIOMAS[elegida].texto), verIds) : `<span class="tk-vacio">Pulsa «Cargar» para descargar este vocabulario.</span>`}`;
      }

      cargarOpenAi().then(pintar).catch(() => {
        q("tabla").innerHTML = `<tbody><tr><td><span class="tk-vacio">No se pudo cargar el vocabulario. Recarga la app e inténtalo de nuevo.</span></td></tr></tbody>`;
      });
      enlazarRemotos(caja, pintar);
      pintar();

      caja.addEventListener("click", (e) => {
        const i = (e.target as HTMLElement).dataset.idioma;
        if (i !== undefined) {
          elegida = Number(i);
          pintar();
        }
      });
      caja.addEventListener("change", (e) => {
        const t = e.target as HTMLSelectElement;
        if (t.dataset.i === "codif") {
          codif = t.value as Codificacion;
          pintar();
        }
      });
    }

    abrir("reales");
  },
};

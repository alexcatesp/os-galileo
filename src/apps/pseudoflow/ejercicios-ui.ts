// Interfaz de los ejercicios dentro de PseudoFlow: listado por dificultad, tarjeta del ejercicio,
// corrección con los datos de prueba (sin mostrar nunca la solución) y progreso guardado.

import { juzgar, revisarEstructura, type Estructura, type Prueba } from "./comprobar";
import { BLOQUES, EJERCICIOS, type Ejercicio, type Nivel, type Parte, type Pregunta, type TipoEjercicio } from "./ejercicios";
import { dibujar } from "./layout";
import { analizar, normalizar } from "./parser";

export interface EditorApi {
  /** pone el código en el editor y fija el modo de texto libre */
  cargar(codigo: string, libre: boolean): void;
  texto(): string;
  /** el editor avisa de cada cambio del texto (para guardar el borrador) */
  alEscribir(cb: () => void): void;
  /** modo de texto libre del ejercicio abierto */
  libre(): boolean;
}

const ETIQUETA_NIVEL: Record<Nivel, string> = { base: "Base", medio: "Medio", avanzado: "Avanzado" };
const ETIQUETA_TIPO: Record<TipoEjercicio, string> = { diseno: "Diseño", traza: "Traza", error: "Error", traduccion: "Traducción", razona: "Razona" };
const ORDEN_NIVEL: Nivel[] = ["base", "medio", "avanzado"];
const VACIO = "INICIO\n  \nFIN\n";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** texto del enunciado → HTML: ¦código¦ en línea, párrafos y listas */
function formatoTexto(s: string): string {
  const linea = (t: string) => esc(t).replace(/¦([^¦]+)¦/g, "<code>$1</code>");
  return s
    .split("\n\n")
    .map((bloque) => {
      const ls = bloque.split("\n");
      if (ls.every((l) => l.startsWith("- "))) return `<ul>${ls.map((l) => `<li>${linea(l.slice(2))}</li>`).join("")}</ul>`;
      return `<p>${ls.map(linea).join("<br>")}</p>`;
    })
    .join("");
}

// ---------- progreso guardado (solo en este navegador) ----------
interface Avance {
  hecho?: boolean;
  partes?: boolean[];
}
const CLAVE_PROGRESO = "osg-pf-progreso";
function leer<T>(clave: string, por: T): T {
  try {
    const v = localStorage.getItem(clave);
    return v ? (JSON.parse(v) as T) : por;
  } catch {
    return por;
  }
}
function guardar(clave: string, valor: unknown): void {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    /* sin almacenamiento: el progreso dura lo que la sesión */
  }
}

function numerosDe(s: string): number[] {
  return (s.match(/-?\d+(?:[.,]\d+)?/g) ?? []).map((x) => parseFloat(x.replace(",", ".")));
}

/** ¿coincide la respuesta con alguna de las aceptadas? Números por valor; texto sin tildes ni signos */
function respuestaCorrecta(dada: string, aceptadas: string[]): boolean {
  const limpia = (s: string) => normalizar(s).replace(/[^A-Z0-9]+/g, " ").trim();
  return aceptadas.some((a) => {
    if (/^[-\d.,\s]+$/.test(a)) {
      const x = numerosDe(a), y = numerosDe(dada);
      return x.length === y.length && x.every((v, i) => Math.abs(v - y[i]) < 1e-9) && !/[a-zA-ZáéíóúñÁÉÍÓÚÑ]/.test(dada);
    }
    return limpia(a) === limpia(dada);
  });
}

export function montarEjercicios(
  raiz: HTMLElement,
  lista: HTMLElement,
  tarjeta: HTMLElement,
  editor: EditorApi,
  alCambiarVista: (abierto: boolean) => void,
): { abrir(id: string): void; cerrar(): void } {
  let avance: Record<string, Avance> = leer(CLAVE_PROGRESO, {});
  let actual: Ejercicio | null = null;
  let parteSel = 0;
  let filtroBloque = 0;
  let filtroTipo: TipoEjercicio | "" = "";
  /** borrador del editor libre, para devolverlo al cerrar el ejercicio */
  let borradorLibre: string | null = null;
  let borradorLibreModo = false;

  const hechos = () => EJERCICIOS.filter((e) => avance[e.id]?.hecho).length;
  const claveCodigo = (id: string) => `osg-pf-codigo-${id}`;
  const claveResp = (id: string) => `osg-pf-resp-${id}`;

  // ---------- listado por dificultad ----------
  function pintarLista(): void {
    const visibles = EJERCICIOS.filter((e) => (!filtroBloque || e.bloque === filtroBloque) && (!filtroTipo || e.tipo === filtroTipo));
    const porNivel = ORDEN_NIVEL.map((n) => ({ n, items: visibles.filter((e) => e.nivel === n) }));
    lista.innerHTML = `
      <div class="ej-cab"><b>Ejercicios</b><span>${hechos()} / ${EJERCICIOS.length} hechos</span></div>
      <div class="ej-barra"><i style="width:${(hechos() / EJERCICIOS.length) * 100}%"></i></div>
      <div class="ej-filtros">
        <select data-f="bloque" aria-label="Bloque"><option value="0">Todos los bloques</option>${Object.entries(BLOQUES)
          .map(([k, v]) => `<option value="${k}" ${Number(k) === filtroBloque ? "selected" : ""}>${k}. ${v}</option>`)
          .join("")}</select>
        <select data-f="tipo" aria-label="Tipo"><option value="">Todos los tipos</option>${(Object.keys(ETIQUETA_TIPO) as TipoEjercicio[])
          .map((t) => `<option value="${t}" ${t === filtroTipo ? "selected" : ""}>${ETIQUETA_TIPO[t]}</option>`)
          .join("")}</select>
      </div>
      ${porNivel
        .map(
          ({ n, items }) =>
            `<h4 class="ej-nivel ${n}">${ETIQUETA_NIVEL[n]} <small>${items.filter((e) => avance[e.id]?.hecho).length}/${items.length}</small></h4>` +
            items
              .map((e) => {
                const hecho = avance[e.id]?.hecho;
                const enCurso = !hecho && leer<string | null>(claveCodigo(e.id), null) !== null;
                return `<button class="ej-item${actual?.id === e.id ? " sel" : ""}${hecho ? " hecho" : ""}" data-id="${e.id}"><span class="ej-marca">${hecho ? "✓" : enCurso ? "●" : ""}</span><span class="ej-id">${e.id}</span><span class="ej-tit">${esc(e.titulo)}</span><small>${ETIQUETA_TIPO[e.tipo]}</small></button>`;
              })
              .join("") || `<p class="ej-vacio">Ninguno con estos filtros</p>`,
        )
        .join("")}`;
  }

  lista.addEventListener("change", (e) => {
    const s = e.target as HTMLSelectElement;
    if (s.dataset.f === "bloque") filtroBloque = Number(s.value);
    else if (s.dataset.f === "tipo") filtroTipo = s.value as TipoEjercicio | "";
    pintarLista();
  });
  lista.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>(".ej-item");
    if (b) abrir(b.dataset.id!);
  });

  // ---------- tarjeta del ejercicio ----------
  function partes(e: Ejercicio): Parte[] {
    return e.partes ?? [{ nombre: "", pruebas: e.pruebas, estructura: e.estructura }];
  }

  function pintarTarjeta(): void {
    const e = actual;
    if (!e) {
      tarjeta.hidden = true;
      tarjeta.innerHTML = "";
      return;
    }
    tarjeta.hidden = false;
    const ps = partes(e);
    const av = avance[e.id] ?? {};
    const resp = leer<Record<string, string>>(claveResp(e.id), {});
    const hayCorreccion = !!(e.preguntas || ps.some((p) => p.pruebas?.length || p.estructura || e.estructura));
    tarjeta.innerHTML = `
      <div class="ej-t-cab">
        <div><b>Ejercicio ${e.id}</b> · ${esc(e.titulo)}</div>
        <span class="ej-chip ${e.nivel}">${ETIQUETA_NIVEL[e.nivel]}</span><span class="ej-chip">${ETIQUETA_TIPO[e.tipo]}</span>
        ${av.hecho ? `<span class="ej-chip ok">✓ Hecho</span>` : ""}
        <button class="ej-x" data-ej="cerrar" aria-label="Cerrar ejercicio" title="Volver al editor libre">✕</button>
      </div>
      <div class="ej-t-cuerpo">
        ${formatoTexto(e.enunciado)}
        ${e.datos ? `<div class="ej-datos"><b>Datos de prueba:</b> ${esc(e.datos)}</div>` : ""}
        ${e.pista ? `<details class="ej-pista"><summary>Ver una pista</summary>${formatoTexto(e.pista)}</details>` : ""}
        ${e.libre ? `<p class="ej-nota">Este ejercicio admite pasos en lenguaje natural («Coger el cepillo»): se dibujan como rectángulos.</p>` : ""}
        ${ps.length > 1 ? `<div class="ej-partes">${ps.map((p, i) => `<label><input type="radio" name="parte" value="${i}" ${i === parteSel ? "checked" : ""}/> ${esc(p.nombre)} ${av.partes?.[i] ? "✓" : ""}</label>`).join("")}</div>` : ""}
        ${e.preguntas ? `<div class="ej-preguntas">${e.preguntas.map((q, i) => pintarPregunta(q, i, resp)).join("")}</div>` : ""}
      </div>
      <div class="ej-t-pie">
        ${hayCorreccion ? `<button class="ej-comprobar" data-ej="comprobar">Comprobar</button>` : ""}
        ${e.diagrama ? `<button data-ej="diagrama">Ver diagrama del enunciado</button>` : ""}
        ${e.inicial !== undefined || e.tipo !== "razona" ? `<button data-ej="reiniciar">Empezar de nuevo</button>` : ""}
        <span class="ej-aviso">En PseudoFlow el diagrama se dibuja al escribir: úsalo para comparar con el que harías en papel.</span>
      </div>
      <div class="ej-res" hidden></div>`;
  }

  function pintarPregunta(q: Pregunta, i: number, resp: Record<string, string>): string {
    const v = resp[i] ?? "";
    if (q.tipo === "texto") return `<label class="ej-q">${formatoTexto(q.texto).replace(/<\/?p>/g, "")}<input data-q="${i}" value="${esc(v)}" spellcheck="false" autocomplete="off" /></label>`;
    if (q.tipo === "vf") {
      return `<div class="ej-q vf"><code>${esc(q.texto)}</code><span><button data-vf="${i}" data-v="1" class="${v === "1" ? "on" : ""}">Verdadero</button><button data-vf="${i}" data-v="0" class="${v === "0" ? "on" : ""}">Falso</button></span></div>`;
    }
    return `<label class="ej-q">${esc(q.texto)}<textarea data-q="${i}" rows="5" spellcheck="true">${esc(v)}</textarea></label>`;
  }

  tarjeta.addEventListener("input", (e) => {
    const t = e.target as HTMLInputElement | HTMLTextAreaElement;
    if (!actual || t.dataset.q === undefined) return;
    const resp = leer<Record<string, string>>(claveResp(actual.id), {});
    resp[t.dataset.q] = t.value;
    guardar(claveResp(actual.id), resp);
  });
  tarjeta.addEventListener("change", (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name === "parte") parteSel = Number(t.value);
  });
  tarjeta.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>("button");
    if (!b || !actual) return;
    if (b.dataset.vf !== undefined) {
      const resp = leer<Record<string, string>>(claveResp(actual.id), {});
      resp[b.dataset.vf] = b.dataset.v!;
      guardar(claveResp(actual.id), resp);
      tarjeta.querySelectorAll<HTMLElement>(`[data-vf="${b.dataset.vf}"]`).forEach((x) => x.classList.toggle("on", x === b));
      return;
    }
    switch (b.dataset.ej) {
      case "cerrar": return cerrar();
      case "comprobar": return comprobar();
      case "reiniciar": return reiniciar();
      case "diagrama": return verDiagrama();
    }
  });

  // ---------- abrir, cerrar, reiniciar ----------
  function abrir(id: string): void {
    const e = EJERCICIOS.find((x) => x.id === id);
    if (!e) return;
    if (!actual) {
      borradorLibre = editor.texto();
      borradorLibreModo = editor.libre();
    }
    actual = e;
    parteSel = 0;
    const guardado = leer<string | null>(claveCodigo(e.id), null);
    editor.cargar(guardado ?? e.inicial ?? VACIO, !!e.libre);
    pintarTarjeta();
    pintarLista();
    alCambiarVista(true);
  }

  function cerrar(): void {
    actual = null;
    if (borradorLibre !== null) editor.cargar(borradorLibre, borradorLibreModo);
    borradorLibre = null;
    pintarTarjeta();
    pintarLista();
    alCambiarVista(false);
  }

  function reiniciar(): void {
    if (!actual) return;
    try {
      localStorage.removeItem(claveCodigo(actual.id));
    } catch {
      /* nada */
    }
    editor.cargar(actual.inicial ?? VACIO, !!actual.libre);
    mostrar("");
    pintarLista();
  }

  editor.alEscribir(() => {
    if (!actual) return;
    guardar(claveCodigo(actual.id), editor.texto());
  });

  // ---------- diagrama del enunciado (traducción) ----------
  function verDiagrama(): void {
    if (!actual?.diagrama) return;
    const r = analizar(actual.diagrama);
    if (!r.programa) return;
    const d = dibujar(r.programa.cuerpo);
    const svg = d.svg.replace(/<g class="mas"[^>]*>.*?<\/g>/g, "");
    const ov = document.createElement("div");
    ov.className = "ej-overlay";
    ov.innerHTML = `<div class="ej-ov-caja"><div class="ej-ov-cab"><b>Diagrama del ejercicio ${actual.id}</b><button aria-label="Cerrar">✕</button></div><div class="ej-ov-svg">${svg}</div></div>`;
    ov.addEventListener("click", (e) => {
      if (e.target === ov || (e.target as HTMLElement).closest("button")) ov.remove();
    });
    raiz.appendChild(ov);
  }

  // ---------- corrección ----------
  function mostrar(html: string, clase = ""): void {
    const r = tarjeta.querySelector<HTMLElement>(".ej-res");
    if (!r) return;
    r.hidden = !html;
    r.className = `ej-res ${clase}`;
    r.innerHTML = html;
    r.scrollIntoView({ block: "nearest" });
  }

  function marcarHecho(parte: number | null): void {
    if (!actual) return;
    const av = (avance[actual.id] ??= {});
    const ps = partes(actual);
    if (parte !== null && ps.length > 1) {
      av.partes = ps.map((_, i) => av.partes?.[i] || i === parte);
      av.hecho = av.partes.every(Boolean);
    } else av.hecho = true;
    guardar(CLAVE_PROGRESO, avance);
    pintarLista();
    const cab = tarjeta.querySelector(".ej-t-cab");
    if (av.hecho && cab && !cab.querySelector(".ej-chip.ok")) cab.querySelector(".ej-x")!.insertAdjacentHTML("beforebegin", `<span class="ej-chip ok">✓ Hecho</span>`);
    if (ps.length > 1) {
      tarjeta.querySelectorAll<HTMLElement>(".ej-partes label").forEach((l, i) => {
        l.lastChild!.textContent = ` ${ps[i].nombre} ${av.partes?.[i] ? "✓" : ""}`;
      });
    }
  }

  function comprobar(): void {
    const e = actual;
    if (!e) return;
    if (e.preguntas) return comprobarPreguntas(e);
    const ps = partes(e);
    const parte = ps[parteSel] ?? ps[0];
    const a = analizar(editor.texto(), { libre: !!e.libre });
    if (!a.programa) {
      return mostrar(`<b>✗ Antes de comprobar, corrige el pseudocódigo</b><p>Línea ${a.error!.linea}: ${esc(a.error!.mensaje)}</p>`, "mal");
    }
    mostrar("<p>Comprobando…</p>");
    // un instante para que se pinte «Comprobando…» antes de ejecutar las pruebas pesadas
    setTimeout(() => {
      const programa = a.programa!;
      const est: Estructura[] = [e.estructura, e.partes ? parte.estructura : undefined].filter((x): x is Estructura => !!x);
      const fallosForma = est.flatMap((x) => revisarEstructura(programa, x));
      const pruebas: Prueba[] = parte.pruebas ?? [];
      const res = pruebas.map((p) => juzgar(programa, p));
      const malas = res.filter((r) => !r.ok);
      const todoBien = !fallosForma.length && !malas.length;
      let html = "";
      if (todoBien) {
        html += `<b>✓ ¡Correcto!${pruebas.length ? ` Superadas las ${pruebas.length} pruebas.` : ""}</b>`;
        if (!pruebas.length) html += `<p>La estructura es la que pide el ejercicio. Revisa tú que el orden y el contenido de los pasos tengan sentido.</p>`;
        if (e.partes && e.partes.length > 1) html += `<p>Esta versión está hecha. ${ps.length > 1 ? "Elige la otra versión para completar el ejercicio." : ""}</p>`;
      } else {
        html += `<b>✗ Todavía no${pruebas.length ? `: pasan ${res.length - malas.length} de ${res.length} pruebas` : ""}</b>`;
        if (fallosForma.length) html += `<ul>${fallosForma.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>`;
        for (const m of malas.slice(0, 4)) {
          html += `<div class="ej-fallo"><div>Con los datos <code>${esc(m.prueba.entrada.map(String).join(", ") || "(sin datos)")}</code>:</div><ul>${m.problemas.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>${m.salida ? `<pre>${esc(m.salida.length > 240 ? m.salida.slice(0, 240) + "…" : m.salida)}</pre>` : `<pre class="vacio">No escribió nada</pre>`}</div>`;
        }
        if (malas.length > 4) html += `<p>… y ${malas.length - 4} pruebas más con problemas.</p>`;
        html += `<p class="ej-ayuda">Haz la prueba de escritorio con esos datos (o pulsa «▶ Ejecutar» para ver el trazado paso a paso).</p>`;
      }
      mostrar(html, todoBien ? "ok" : "mal");
      if (todoBien) marcarHecho(e.partes ? parteSel : null);
    }, 30);
  }

  function comprobarPreguntas(e: Ejercicio): void {
    const resp = leer<Record<string, string>>(claveResp(e.id), {});
    const qs = e.preguntas!;
    const estado = qs.map((q, i): "ok" | "mal" | "vacio" => {
      const v = (resp[i] ?? "").trim();
      if (!v) return "vacio";
      if (q.tipo === "texto") return respuestaCorrecta(v, q.aceptadas) ? "ok" : "mal";
      if (q.tipo === "vf") return (v === "1") === q.correcta ? "ok" : "mal";
      return v.split(/\s+/).length >= 25 ? "ok" : "mal";
    });
    const todas = estado.every((s) => s === "ok");
    const filas = qs
      .map((q, i) => {
        const texto = q.tipo === "libre" ? "Respuesta razonada" : q.texto.replace(/¦/g, "");
        const m = estado[i] === "ok" ? "✓" : estado[i] === "vacio" ? "·" : "✗";
        const nota =
          estado[i] === "vacio" ? "sin responder" : estado[i] === "ok" ? "bien" : q.tipo === "libre" ? "escribe al menos 25 palabras justificando cada caso" : "revísala con la prueba de escritorio";
        return `<li class="${estado[i]}"><span>${m}</span> ${esc(texto)} <small>${nota}</small></li>`;
      })
      .join("");
    mostrar(
      todas
        ? `<b>✓ ¡Correcto!</b><ul class="ej-lista-q">${filas}</ul>`
        : `<b>✗ ${estado.filter((s) => s === "ok").length} de ${qs.length} bien</b><ul class="ej-lista-q">${filas}</ul><p class="ej-ayuda">No te damos la respuesta: repite la prueba de escritorio fila a fila.</p>`,
      todas ? "ok" : "mal",
    );
    if (todas) marcarHecho(null);
  }

  pintarLista();
  pintarTarjeta();
  return { abrir, cerrar };
}

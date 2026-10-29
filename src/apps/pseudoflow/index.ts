import type { AppDef } from "../../kernel/kernel";
import { aTexto, aXml, deXml } from "./formato";
import { dibujar, type Resultado } from "./layout";
import { contar, esListaReal, nuevoNodo, programaVacio, raices, recorrer, ubicar, type Nodo, type Programa, type TipoNuevo } from "./modelo";
import { analizar, normalizar, type ErrorSintaxis } from "./parser";
import { Maquina, ErrorEjecucion, formatear, type Evento } from "./ejecutor";
import { EJEMPLOS, FICHAS, PALETA } from "./paleta";
import { montarEjercicios } from "./ejercicios-ui";

const RUTA_INICIAL = "/home/invitado/Documentos/algoritmo.psc";
const PALABRAS = new Set(
  ["INICIO", "FIN", "LEER", "ESCRIBIR", "SI", "ENTONCES", "MIENTRAS", "HACER", "REPETIR", "HASTA", "PARA", "DESDE", "CON", "PASO",
    "SEGUN", "CASO", "OTRO", "MOSTRAR", "IMPRIMIR", "ALGORITMO"],
);
const OPERADORES = new Set(["Y", "O", "NO", "MOD", "DIV", "VERDADERO", "FALSO"]);
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** HTML de una línea de pseudocódigo con las palabras clave coloreadas */
function resaltarLinea(l: string): string {
  const re = /(\/\/.*$)|("[^"]*")|(‹[^›]*›)|([A-Za-zÁÉÍÓÚÜÑáéíóúüñ_][A-Za-zÁÉÍÓÚÜÑáéíóúüñ_0-9]*)|(<-|←|<>|<=|>=)|(\d+(?:\.\d+)?)/g;
  let out = "", ult = 0, m: RegExpExecArray | null;
  while ((m = re.exec(l))) {
    out += esc(l.slice(ult, m.index));
    const t = esc(m[0]);
    if (m[1]) out += `<span class="c">${t}</span>`;
    else if (m[2]) out += `<span class="s">${t}</span>`;
    else if (m[3]) out += `<span class="h">${t}</span>`;
    else if (m[4]) {
      const n = normalizar(m[4]);
      out += PALABRAS.has(n) ? `<span class="k">${t}</span>` : OPERADORES.has(n) ? `<span class="o">${t}</span>` : t;
    } else if (m[5]) out += `<span class="o">${t}</span>`;
    else out += `<span class="n">${t}</span>`;
    ult = m.index + m[0].length;
  }
  return out + esc(l.slice(ult));
}

function descargar(nombre: string, contenido: Blob): void {
  const url = URL.createObjectURL(contenido);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const pseudoFlow: AppDef = {
  id: "pseudoflow",
  nombre: "PseudoFlow",
  carpeta: "0485 · Programación",
  icono: `<svg viewBox="0 0 48 48"><rect x="3" y="3" width="42" height="42" rx="7" fill="#f4f1ff"/><rect x="15" y="6" width="18" height="8" rx="4" fill="#2a1770"/><path d="M24 14v5" stroke="#4a4470" stroke-width="2"/><path d="M24 19l9 7-9 7-9-7z" fill="#fff1c4" stroke="#b8860b" stroke-width="2"/><path d="M24 33v4M15 26H9v11h15" fill="none" stroke="#4a4470" stroke-width="2"/><rect x="17" y="37" width="14" height="6" rx="1.5" fill="#ebe7ff" stroke="#2a1770" stroke-width="1.6"/></svg>`,
  ancho: 1080,
  alto: 680,
  iniciar({ so, ventana, raiz, args }) {
    raiz.classList.add("dg");
    raiz.innerHTML = `
      <div class="dg-barra">
        <button data-a="nuevo">Nuevo</button>
        <select data-a="ejemplo" aria-label="Ejemplos"><option value="">Ejemplos…</option>${EJEMPLOS.map((e, i) => `<option value="${i}">${e.titulo}</option>`).join("")}</select>
        <span class="dg-sep"></span>
        <div class="dg-vistas" role="tablist" aria-label="Vista">
          <button data-modo="texto">Pseudocódigo</button><button data-modo="dividida">Las dos</button><button data-modo="diagrama">Diagrama</button>
        </div>
        <span class="dg-sep"></span>
        <button data-a="ejecutar" class="dg-ejecutar">▶ Ejecutar</button>
        <button data-a="ejercicios" class="dg-btn-ej" title="Ejercicios ordenados por dificultad">📚 Ejercicios</button>
      </div>
      <div class="dg-barra dg-archivo">
        <input class="dg-ruta" spellcheck="false" aria-label="Ruta del archivo" />
        <button data-a="abrir">Abrir</button><button data-a="guardar">Guardar</button>
        <span class="dg-sep"></span>
        <button data-a="importar">Importar…</button>
        <button data-a="txt">Descargar TXT</button><button data-a="png">PNG</button><button data-a="xml">XML</button>
        <span class="dg-sep"></span>
        <label class="dg-libre" title="Admite pasos en lenguaje natural («Coger el cepillo») y condiciones como «la tierra está seca»"><input type="checkbox" data-a="libre" /> Texto libre</label>
        <input type="file" class="dg-fichero" accept=".xml,.psc,.txt,.diag" hidden />
      </div>
      <div class="dg-centro">
        <aside class="dg-paleta" aria-label="Estructuras y ejercicios">
          <div class="dg-lado-tabs"><button data-lado="est">Estructuras</button><button data-lado="ej">Ejercicios</button></div>
          <div class="dg-lado-est"></div>
          <div class="dg-lado-ej"></div>
        </aside>
        <section class="dg-texto">
          <div class="dg-ejer" hidden></div>
          <div class="pc-editor"><pre class="pc-fondo" aria-hidden="true"><div class="pc-lineas"></div></pre><textarea class="pc-texto" spellcheck="false" wrap="off" aria-label="Pseudocódigo"></textarea></div>
          <div class="dg-estado"></div>
        </section>
        <section class="dg-diagrama">
          <div class="dg-pestanas" role="tablist" aria-label="Diagramas"></div>
          <div class="dg-lienzo" tabindex="0" aria-label="Diagrama de flujo"></div>
          <div class="dg-edicion"></div>
        </section>
      </div>
      <div class="dg-ejec" hidden>
        <div class="dg-ejec-botones">
          <button data-e="paso">Paso</button><button data-e="auto">Automático</button><button data-e="reiniciar">Reiniciar</button>
          <span class="dg-ejec-estado"></span>
          <form class="dg-entrada" hidden><label>Valor para <b></b>: <input autocomplete="off" /></label><button>Enviar</button></form>
          <div class="dg-pregunta" hidden><span></span> <button data-r="si">Sí</button><button data-r="no">No</button></div>
        </div>
        <div class="dg-ejec-paneles">
          <div><h4>Variables</h4><table class="dg-vars"></table></div>
          <div><h4>Salida</h4><pre class="dg-salida"></pre></div>
        </div>
      </div>`;
    const q = <T extends HTMLElement>(s: string) => raiz.querySelector<T>(s)!;
    const ta = q<HTMLTextAreaElement>(".pc-texto");
    const lineasEl = q(".pc-lineas");
    const estado = q(".dg-estado");
    const lienzo = q(".dg-lienzo");
    const edicion = q(".dg-edicion");
    const ruta = q<HTMLInputElement>(".dg-ruta");
    const ejec = q(".dg-ejec");
    ruta.value = RUTA_INICIAL;

    // ---------- estado ----------
    let programa: Programa = programaVacio();
    let error: ErrorSintaxis | null = null;
    let seleccion: Nodo | null = null;
    let modo: "texto" | "dividida" | "diagrama" = "dividida";
    let res: Resultado = dibujar([]);
    /** modo de texto libre (ejercicios cotidianos) */
    let libre = false;
    /** diagrama que se ve: 0 = algoritmo principal, k = subproceso k */
    let vista = 0;
    const pestanas = q(".dg-pestanas");
    let lineaActiva = 0;
    let sucio = false;
    /** quien guarda el borrador (los ejercicios) se entera de cada cambio hecho por la persona */
    let alEscribirCb: (() => void) | null = null;
    const notificar = () => alEscribirCb?.();
    /** panel lateral: estructuras, ejercicios o ninguno (en pantallas estrechas, para ver el editor) */
    let lado: "est" | "ej" | "no" = "est";
    function fijarLado(l: typeof lado): void {
      lado = l;
      raiz.dataset.lado = l;
      raiz.querySelectorAll<HTMLElement>("[data-lado]").forEach((b) => b.classList.toggle("on", b.dataset.lado === l));
      raiz.querySelector('[data-a="ejercicios"]')?.classList.toggle("on", l === "ej");
    }

    const titular = () => ventana.fijarTitulo(`${sucio ? "● " : ""}${ruta.value.split("/").pop()} — PseudoFlow`);
    const aviso = (m: string, mal = false) => {
      estado.textContent = m;
      estado.classList.toggle("error", mal);
    };

    // ---------- vista de texto ----------
    function pintarTexto(): void {
      const lineas = ta.value.split("\n");
      lineasEl.innerHTML = lineas
        .map((l, i) => `<div class="ln${i + 1 === lineaActiva ? " act" : ""}${error && error.linea === i + 1 ? " err" : ""}">${resaltarLinea(l) || " "}</div>`)
        .join("");
    }
    const sincronizarScroll = () => (lineasEl.style.transform = `translate(${-ta.scrollLeft}px, ${-ta.scrollTop}px)`);
    ta.addEventListener("scroll", sincronizarScroll);

    function informar(): void {
      if (error) aviso(`Línea ${error.linea}: ${error.mensaje}`, true);
      else aviso(`✓ Pseudocódigo correcto · ${contar(programa)} instrucciones`);
    }

    // ---------- diagrama ----------
    function pintarDiagrama(): void {
      if (vista > programa.subprocesos.length) vista = 0;
      const antes = { x: lienzo.scrollLeft, y: lienzo.scrollTop };
      const lista = raices(programa)[vista];
      res = vista === 0 ? dibujar(lista) : dibujar(lista, programa.subprocesos[vista - 1].nombre, "Volver");
      lienzo.innerHTML = res.svg;
      lienzo.scrollLeft = antes.x;
      lienzo.scrollTop = antes.y;
      pintarPestanas();
      marcar();
    }

    /** pestañas del diagrama: el algoritmo y cada subproceso */
    function pintarPestanas(): void {
      pestanas.innerHTML =
        [`<button class="${vista === 0 ? "on" : ""}" data-v="0">Algoritmo</button>`]
          .concat(programa.subprocesos.map((s, i) => `<button class="${vista === i + 1 ? "on" : ""}" data-v="${i + 1}">${esc(s.nombre)}</button>`))
          .join("") +
        (vista > 0 ? `<button class="quitar" data-v="quitar" title="Eliminar este subproceso">✕</button>` : "") +
        `<button class="nuevo" data-v="nuevo">+ Subproceso</button>`;
    }
    pestanas.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>("button");
      if (!b) return;
      const v = b.dataset.v!;
      if (v === "nuevo") {
        b.outerHTML = `<form class="nuevo-sub"><input placeholder="NombreSinEspacios" spellcheck="false" aria-label="Nombre del subproceso" /></form>`;
        pestanas.querySelector("input")!.focus();
        pestanas.querySelector("form")!.addEventListener("submit", (ev) => {
          ev.preventDefault();
          const nombre = pestanas.querySelector("input")!.value.trim();
          if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ_][A-Za-zÁÉÍÓÚÜÑáéíóúüñ_0-9]*$/.test(nombre)) return aviso("El nombre no puede tener espacios ni empezar por un número", true);
          if (programa.subprocesos.some((s) => normalizar(s.nombre) === normalizar(nombre))) return aviso(`Ya existe «${nombre}»`, true);
          programa.subprocesos.push({ nombre, cuerpo: [] });
          vista = programa.subprocesos.length;
          seleccion = null;
          desdeModelo();
          pintarFormulario();
        });
        return;
      }
      if (v === "quitar") {
        const s = programa.subprocesos[vista - 1];
        let usado = false;
        recorrer(programa, (n) => {
          if (n.t === "llamar" && normalizar(n.nombre) === normalizar(s.nombre)) usado = true;
        });
        if (usado) return aviso(`«${s.nombre}» se usa en el algoritmo: quita antes las llamadas`, true);
        programa.subprocesos.splice(vista - 1, 1);
        vista = 0;
        seleccion = null;
        desdeModelo();
        pintarFormulario();
        return;
      }
      vista = Number(v);
      seleccion = null;
      pintarDiagrama();
      pintarFormulario();
    });
    /** aplica las clases de selección y de paso actual a los símbolos */
    function marcar(): void {
      lienzo.querySelectorAll<SVGGElement>(".forma").forEach((g) => {
        const it = res.items[Number(g.dataset.id)];
        g.classList.toggle("sel", !!seleccion && it.nodo === seleccion);
        g.classList.toggle("act", !!activo && it.nodo === activo.nodo && it.fase === activo.fase);
      });
    }

    /** cambió el modelo desde el diagrama: se regenera el pseudocódigo */
    function desdeModelo(): void {
      ta.value = aTexto(programa);
      error = null;
      sucio = true;
      titular();
      pintarTexto();
      pintarDiagrama();
      informar();
      reiniciarEjecucion();
      notificar();
    }

    /** cambió el texto: se analiza y, si es correcto, se redibuja el diagrama */
    let temporizador: number | undefined;
    function desdeTexto(): void {
      const r = analizar(ta.value, { libre });
      error = r.error;
      if (r.programa) {
        programa = r.programa;
        seleccion = null;
        pintarDiagrama();
        pintarFormulario();
      }
      sucio = true;
      titular();
      pintarTexto();
      informar();
      reiniciarEjecucion();
    }
    ta.addEventListener("input", () => {
      pintarTexto();
      notificar();
      window.clearTimeout(temporizador);
      temporizador = window.setTimeout(desdeTexto, 200);
    });

    function cargarTexto(t: string): void {
      ta.value = t;
      lineaActiva = 0;
      desdeTexto();
      sucio = false;
      titular();
    }

    // ---------- ejercicios ----------
    const casillaLibre = q<HTMLInputElement>('input[data-a="libre"]');
    const ejer = montarEjercicios(
      raiz,
      q(".dg-lado-ej"),
      q(".dg-ejer"),
      {
        cargar(codigo, l) {
          libre = l;
          casillaLibre.checked = l;
          vista = 0;
          seleccion = null;
          cargarTexto(codigo);
          pintarFormulario();
        },
        texto: () => ta.value,
        alEscribir: (cb) => (alEscribirCb = cb),
        libre: () => libre,
      },
      (abierto) => {
        // en pantallas estrechas el ejercicio ocupa el sitio del listado
        if (abierto && raiz.classList.contains("estrecho")) fijarLado("no");
      },
    );

    // ---------- paleta lateral ----------
    const ladoEst = q(".dg-lado-est");
    ladoEst.innerHTML =
      PALETA.map(
        (g) => `<h4>${g.titulo}</h4>${g.items.map((f, i) => `<button class="frag" data-g="${g.titulo}" data-i="${i}" title="${f.ayuda}">${f.etiqueta}</button>`).join("")}`,
      ).join("") +
      `<h4>Operadores y funciones</h4><div class="fichas">${FICHAS.map((f) => `<button class="ficha" data-ficha="${f}">${f}</button>`).join("")}</div>`;

    const ABRE = /(ENTONCES|HACER|REPETIR|SI NO|SINO|OTRO:?|:)\s*$/i;
    function insertar(texto: string, fragmento: boolean): void {
      const v = ta.value;
      const ini = ta.selectionStart, fin = ta.selectionEnd;
      const iniL = v.lastIndexOf("\n", ini - 1) + 1;
      let finL = v.indexOf("\n", ini);
      if (finL < 0) finL = v.length;
      const linea = v.slice(iniL, finL);
      const sangria = linea.match(/^\s*/)![0];
      let desde: number, longitud: number;
      const esFinFinal = /^FIN$/i.test(linea.trim()) && !v.slice(finL).trim();
      if (fragmento && esFinFinal) {
        // el cursor está en el FIN del algoritmo: el fragmento va justo antes, dentro de INICIO … FIN
        const bloque = texto.split("\n").map((l) => sangria + "  " + l).join("\n");
        ta.value = v.slice(0, iniL) + bloque + "\n" + v.slice(iniL);
        desde = iniL;
        longitud = bloque.length;
      } else if (fragmento && linea.trim()) {
        // la línea ya tiene contenido: el fragmento va debajo, con la sangría que corresponda
        const ind = sangria + (ABRE.test(linea.trim()) ? "  " : "");
        const bloque = texto.split("\n").map((l) => ind + l).join("\n");
        ta.value = v.slice(0, finL) + "\n" + bloque + v.slice(finL);
        desde = finL + 1;
        longitud = bloque.length;
      } else {
        const bloque = texto.split("\n").map((l, i) => (i ? sangria + l : l)).join("\n");
        ta.value = v.slice(0, ini) + bloque + v.slice(fin);
        desde = ini;
        longitud = bloque.length;
      }
      const a = fragmento ? ta.value.indexOf("‹", desde) : -1;
      if (a >= 0 && a < desde + longitud) ta.setSelectionRange(a, ta.value.indexOf("›", a) + 1);
      else ta.setSelectionRange(desde + longitud, desde + longitud);
      ta.focus();
      ta.dispatchEvent(new Event("input"));
    }
    ladoEst.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>("button");
      if (!b) return;
      if (b.dataset.ficha) return insertar(b.dataset.ficha, false);
      const g = PALETA.find((x) => x.titulo === b.dataset.g);
      if (g) insertar(g.items[Number(b.dataset.i)].codigo, true);
    });

    // sangría automática, Tab entre huecos
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Tab" && !e.shiftKey) {
        e.preventDefault();
        const desde = ta.selectionEnd;
        let a = ta.value.indexOf("‹", desde);
        if (a < 0) a = ta.value.indexOf("‹");
        if (a >= 0) ta.setSelectionRange(a, ta.value.indexOf("›", a) + 1);
        else insertar("  ", false);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const v = ta.value, pos = ta.selectionStart;
        const iniL = v.lastIndexOf("\n", pos - 1) + 1;
        const linea = v.slice(iniL, pos);
        const sangria = linea.match(/^\s*/)![0] + (ABRE.test(linea.trim()) ? "  " : "");
        ta.setRangeText("\n" + sangria, pos, ta.selectionEnd, "end");
        ta.dispatchEvent(new Event("input"));
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        guardar();
      }
    });

    // ---------- selección y edición en el diagrama ----------
    function menuMas(boton: SVGGElement, lista: Nodo[], idx: number): void {
      q(".dg-menu")?.remove();
      if (!esListaReal(programa, lista)) return aviso("Este hueco pertenece a un SEGÚN: añade los casos en el pseudocódigo", true);
      const m = document.createElement("div");
      m.className = "dg-menu";
      const tipos: [TipoNuevo, string, string?][] = [
        ["leer", "Leer (entrada)"], ["escribir", "Escribir (salida)"], ["asignar", "Asignar (proceso)"],
        ["si", "Decisión SI"], ["mientras", "MIENTRAS"], ["repetir", "REPETIR … HASTA"], ["para", "PARA"],
      ];
      if (libre) tipos.unshift(["accion", "Acción (texto libre)"]);
      // un subproceso no puede llamarse a sí mismo desde su propio diagrama
      for (const s of programa.subprocesos) if (vista === 0 || programa.subprocesos[vista - 1] !== s) tipos.push(["llamar", `Llamar a ${s.nombre}`, s.nombre]);
      m.innerHTML = tipos.map(([t, n, d]) => `<button data-t="${t}"${d ? ` data-n="${esc(d)}"` : ""}>${esc(n)}</button>`).join("");
      const rb = boton.getBoundingClientRect(), rl = lienzo.getBoundingClientRect();
      m.style.left = `${rb.left - rl.left + lienzo.scrollLeft + 22}px`;
      m.style.top = `${rb.top - rl.top + lienzo.scrollTop - 10}px`;
      lienzo.appendChild(m);
      m.addEventListener("click", (e) => {
        const boton = e.target as HTMLElement;
        const t = boton.dataset.t as TipoNuevo | undefined;
        if (!t) return;
        const n = nuevoNodo(t, boton.dataset.n ?? "");
        lista.splice(idx, 0, n);
        seleccion = n;
        m.remove();
        desdeModelo();
        pintarFormulario();
      });
    }

    lienzo.addEventListener("click", (e) => {
      const el = e.target as Element;
      if (el.closest(".dg-menu")) return; // el menú gestiona su propio clic
      const mas = el.closest<SVGGElement>(".mas");
      if (mas) {
        const p = res.mas[Number(mas.dataset.mas)];
        e.stopPropagation();
        return menuMas(mas, p.lista, p.idx);
      }
      q(".dg-menu")?.remove();
      const g = el.closest<SVGGElement>(".forma");
      const it = g ? res.items[Number(g.dataset.id)] : null;
      seleccion = it?.nodo ?? null;
      marcar();
      pintarFormulario();
    });
    lienzo.addEventListener("keydown", (e) => {
      if (e.key === "Delete" || e.key === "Backspace") borrarSeleccion();
      else if (e.key === "Escape") q(".dg-menu")?.remove();
    });

    function borrarSeleccion(): void {
      if (!seleccion) return;
      const u = ubicar(programa, seleccion);
      if (!u) return;
      u.lista.splice(u.idx, 1);
      seleccion = null;
      desdeModelo();
      pintarFormulario();
    }
    function mover(delta: number): void {
      if (!seleccion) return;
      const u = ubicar(programa, seleccion);
      if (!u) return;
      const j = u.idx + delta;
      if (j < 0 || j >= u.lista.length) return;
      [u.lista[u.idx], u.lista[j]] = [u.lista[j], u.lista[u.idx]];
      desdeModelo();
    }

    type Campo = { etiqueta: string; valor: string; poner: (v: string) => void };
    function camposDe(n: Nodo): Campo[] {
      switch (n.t) {
        case "leer": return [{ etiqueta: "Variables (separadas por comas)", valor: n.vars, poner: (v) => (n.vars = v) }];
        case "escribir": return [{ etiqueta: "Texto o expresión", valor: n.expr, poner: (v) => (n.expr = v) }];
        case "asignar": return [
          { etiqueta: "Variable", valor: n.variable, poner: (v) => (n.variable = v) },
          { etiqueta: "Valor", valor: n.expr, poner: (v) => (n.expr = v) },
        ];
        case "si": case "mientras": return [{ etiqueta: "Condición", valor: n.cond, poner: (v) => (n.cond = v) }];
        case "repetir": return [{ etiqueta: "Hasta que…", valor: n.hasta, poner: (v) => (n.hasta = v) }];
        case "para": return [
          { etiqueta: "Variable", valor: n.variable, poner: (v) => (n.variable = v) },
          { etiqueta: "Desde", valor: n.desde, poner: (v) => (n.desde = v) },
          { etiqueta: "Hasta", valor: n.hasta, poner: (v) => (n.hasta = v) },
          { etiqueta: "Paso (opcional)", valor: n.paso, poner: (v) => (n.paso = v) },
        ];
        case "segun": return [{ etiqueta: "Expresión", valor: n.expr, poner: (v) => (n.expr = v) }];
        case "accion": return [{ etiqueta: "Texto de la acción", valor: n.texto, poner: (v) => (n.texto = v) }];
        case "llamar": return [{ etiqueta: "Subproceso", valor: n.nombre, poner: (v) => (n.nombre = v) }];
      }
    }

    function pintarFormulario(): void {
      if (!seleccion || !ubicar(programa, seleccion)) {
        edicion.innerHTML = `<span class="dg-pista">Pulsa un símbolo para editarlo, o el <b>+</b> de una flecha para añadir uno nuevo.</span>`;
        return;
      }
      const campos = camposDe(seleccion);
      edicion.innerHTML =
        campos.map((c, i) => `<label>${c.etiqueta}<input data-c="${i}" spellcheck="false" /></label>`).join("") +
        `<button data-b="arriba" title="Subir">↑</button><button data-b="abajo" title="Bajar">↓</button><button data-b="borrar" class="peligro">Eliminar</button>` +
        (seleccion.t === "segun" ? `<span class="dg-pista">Los casos se editan en el pseudocódigo.</span>` : "");
      edicion.querySelectorAll<HTMLInputElement>("input").forEach((inp) => {
        const c = campos[Number(inp.dataset.c)];
        inp.value = c.valor;
        inp.addEventListener("input", () => {
          c.poner(inp.value);
          notificar();
          ta.value = aTexto(programa);
          error = null;
          sucio = true;
          titular();
          pintarTexto();
          pintarDiagrama();
          informar();
          reiniciarEjecucion();
        });
      });
    }
    edicion.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).dataset.b;
      if (b === "borrar") borrarSeleccion();
      else if (b === "arriba") mover(-1), pintarFormulario();
      else if (b === "abajo") mover(1), pintarFormulario();
    });

    // ---------- vistas ----------
    function aplicarModo(): void {
      raiz.dataset.modo = modo;
      raiz.querySelectorAll<HTMLElement>("[data-modo]").forEach((b) => b.classList.toggle("on", b.dataset.modo === modo));
    }
    const observador = new ResizeObserver(() => raiz.classList.toggle("estrecho", raiz.clientWidth < 760));
    observador.observe(raiz);
    aplicarModo();

    // ---------- ejecución paso a paso ----------
    let maquina: Maquina | null = null;
    let activo: { nodo: Nodo; fase?: string } | null = null;
    let auto: number | undefined;
    const lblEstado = q(".dg-ejec-estado");
    const formEntrada = q<HTMLFormElement>(".dg-entrada");
    const preguntaEl = q(".dg-pregunta");
    preguntaEl.addEventListener("click", (e) => {
      const r = (e.target as HTMLElement).dataset.r;
      if (!r) return;
      preguntaEl.hidden = true;
      avanzar(r === "si" ? "Sí" : "No");
    });
    const salida = q(".dg-salida");
    const tablaVars = q<HTMLTableElement>(".dg-vars");

    function pintarMaquina(): void {
      tablaVars.innerHTML = maquina && maquina.vars.size
        ? [...maquina.vars].map(([k, v]) => `<tr class="${k === maquina!.cambiada ? "cambio" : ""}"><th>${esc(k)}</th><td>${esc(formatear(v))}</td></tr>`).join("")
        : `<tr><td class="dg-pista">Sin variables todavía</td></tr>`;
      salida.textContent = maquina ? maquina.salida.join("\n") : "";
      salida.scrollTop = salida.scrollHeight;
    }
    function pararAuto(): void {
      window.clearInterval(auto);
      auto = undefined;
      q('[data-e="auto"]').textContent = "Automático";
    }
    function reiniciarEjecucion(): void {
      pararAuto();
      maquina = null;
      activo = null;
      lineaActiva = 0;
      formEntrada.hidden = true;
      preguntaEl.hidden = true;
      lblEstado.textContent = error ? "Corrige el pseudocódigo para ejecutar" : "Listo para ejecutar";
      lblEstado.classList.remove("error");
      pintarMaquina();
      marcar();
      pintarTexto();
    }
    function mostrar(ev: Evento): void {
      if (ev.tipo === "fin") {
        activo = null;
        lineaActiva = 0;
        lblEstado.textContent = "✓ Algoritmo terminado";
        pararAuto();
      } else {
        activo = { nodo: ev.nodo, fase: ev.tipo === "paso" ? ev.fase : undefined };
        lineaActiva = ev.nodo.linea ?? 0;
        lblEstado.textContent =
          ev.tipo === "leer" ? `Esperando un valor para ${ev.nombre}` : ev.tipo === "pregunta" ? `Responde: ¿${ev.texto}?` : `Línea ${lineaActiva}`;
        // si el paso está en otro diagrama (un subproceso), se muestra ese
        const u = ubicar(programa, ev.nodo);
        if (u && u.raiz !== vista) {
          vista = u.raiz;
          pintarDiagrama();
        }
      }
      lblEstado.classList.remove("error");
      marcar();
      pintarTexto();
      lienzo.querySelector(".forma.act")?.scrollIntoView({ block: "nearest", inline: "nearest" });
      pintarMaquina();
    }
    function avanzar(entrada?: string): void {
      if (error) return void (lblEstado.textContent = "Corrige el pseudocódigo para ejecutar");
      if (!maquina) maquina = new Maquina(programa, libre);
      try {
        const ev = maquina.siguiente(entrada);
        mostrar(ev);
        formEntrada.hidden = ev.tipo !== "leer";
        preguntaEl.hidden = ev.tipo !== "pregunta";
        if (ev.tipo === "leer") {
          pararAuto();
          formEntrada.querySelector("b")!.textContent = ev.nombre;
          const inp = formEntrada.querySelector("input")!;
          inp.value = "";
          inp.focus();
        } else if (ev.tipo === "pregunta") {
          pararAuto();
          preguntaEl.querySelector("span")!.textContent = `¿${ev.texto}?`;
        }
        if (ev.tipo === "fin") maquina = null;
      } catch (err) {
        pararAuto();
        const mensaje = err instanceof ErrorEjecucion ? err.message : String(err);
        lblEstado.textContent = `Error: ${mensaje}`;
        lblEstado.classList.add("error");
        maquina = null;
        pintarMaquina();
      }
    }
    formEntrada.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = formEntrada.querySelector("input")!.value;
      formEntrada.hidden = true;
      avanzar(v);
    });
    ejec.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).dataset.e;
      if (b === "paso") avanzar();
      else if (b === "reiniciar") reiniciarEjecucion();
      else if (b === "auto") {
        if (auto) return pararAuto();
        q('[data-e="auto"]').textContent = "Pausar";
        auto = window.setInterval(() => avanzar(), 450);
      }
    });

    // ---------- archivos ----------
    function textoParaGuardar(): string {
      return /\.(diag|xml)$/i.test(ruta.value) && !error ? aXml(programa) : ta.value;
    }
    function guardar(): void {
      try {
        so.vfs.escribir(ruta.value, textoParaGuardar());
        sucio = false;
        titular();
        aviso(`Guardado en ${ruta.value}`);
      } catch (e) {
        aviso((e as Error).message, true);
      }
    }
    function abrirContenido(contenido: string, nombre: string): void {
      if (contenido.trimStart().startsWith("<")) {
        try {
          programa = deXml(contenido);
          cargarTexto(aTexto(programa));
        } catch (e) {
          return aviso(`${nombre}: ${(e as Error).message}`, true);
        }
      } else cargarTexto(contenido);
      aviso(`Abierto ${nombre}`);
    }
    function abrir(): void {
      try {
        abrirContenido(so.vfs.leer(ruta.value), ruta.value);
      } catch (e) {
        aviso((e as Error).message, true);
      }
    }
    const fichero = q<HTMLInputElement>(".dg-fichero");
    fichero.addEventListener("change", async () => {
      const f = fichero.files?.[0];
      if (!f) return;
      ejer.cerrar();
      abrirContenido(await f.text(), f.name);
      fichero.value = "";
    });

    function svgLimpio(): string {
      return res.svg.replace(/<g class="mas"[^>]*>.*?<\/g>/g, "").replace("</defs>", '</defs><rect width="100%" height="100%" fill="#ffffff"/>');
    }
    function exportarPng(): void {
      if (error) return aviso("Corrige el pseudocódigo antes de exportar el diagrama", true);
      const img = new Image();
      img.onload = () => {
        const k = 2;
        const c = document.createElement("canvas");
        c.width = res.ancho * k;
        c.height = res.alto * k;
        const g = c.getContext("2d")!;
        g.scale(k, k);
        g.drawImage(img, 0, 0, res.ancho, res.alto);
        c.toBlob((b) => b && descargar("diagrama.png", b), "image/png");
      };
      img.onerror = () => aviso("No se pudo generar la imagen", true);
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgLimpio());
    }

    raiz.addEventListener("click", (e) => {
      const b = e.target as HTMLElement;
      if (b.dataset.modo) {
        modo = b.dataset.modo as typeof modo;
        aplicarModo();
        return;
      }
      if (b.dataset.lado) return fijarLado(b.dataset.lado as typeof lado);
      switch (b.dataset.a) {
        case "libre":
          libre = (b as HTMLInputElement).checked;
          return desdeTexto();
        case "ejercicios": return fijarLado(lado === "ej" ? "est" : "ej");
        case "nuevo": ejer.cerrar(); vista = 0; return cargarTexto("INICIO\nFIN\n");
        case "ejecutar": ejec.hidden = !ejec.hidden; b.classList.toggle("on", !ejec.hidden); if (!ejec.hidden) reiniciarEjecucion(); return;
        case "abrir": ejer.cerrar(); return abrir();
        case "guardar": return guardar();
        case "importar": return fichero.click();
        case "txt": return descargar(`${ruta.value.split("/").pop()!.replace(/\.[^.]+$/, "")}.txt`, new Blob([ta.value], { type: "text/plain;charset=utf-8" }));
        case "xml":
          if (error) return aviso("Corrige el pseudocódigo antes de exportar el XML", true);
          return descargar("diagrama.xml", new Blob([aXml(programa)], { type: "application/xml;charset=utf-8" }));
        case "png": return exportarPng();
      }
    });
    raiz.querySelector<HTMLSelectElement>('[data-a="ejemplo"]')!.addEventListener("change", (e) => {
      const s = e.target as HTMLSelectElement;
      if (s.value !== "") {
        ejer.cerrar();
        vista = 0;
        cargarTexto(EJEMPLOS[Number(s.value)].codigo);
      }
      s.value = "";
    });

    // ---------- arranque ----------
    fijarLado("est");
    if (args.ruta) {
      ruta.value = args.ruta;
      abrir();
    } else cargarTexto(EJEMPLOS[0].codigo);
    pintarFormulario();
    pintarMaquina();
    titular();
    return () => {
      observador.disconnect();
      pararAuto();
    };
  },
};

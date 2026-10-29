import type { AppDef } from "../kernel/kernel";

const ICONO_CARPETA = `<svg viewBox="0 0 48 48"><path d="M4 12a4 4 0 0 1 4-4h12l4 5h16a4 4 0 0 1 4 4v21a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#f2b632"/><path d="M4 18h40v19a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#ffd45e"/></svg>`;
const ICONO_ARCHIVO = `<svg viewBox="0 0 48 48"><path d="M11 4h18l10 10v28a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="#f4f1ff"/><path d="M29 4l10 10H31a2 2 0 0 1-2-2z" fill="#b3acd9"/><path d="M15 24h18M15 30h18M15 36h11" stroke="#2a1770" stroke-width="2.2" stroke-linecap="round"/></svg>`;

export const explorador: AppDef = {
  id: "explorador",
  nombre: "Archivos",
  icono: ICONO_CARPETA,
  ancho: 640,
  alto: 420,
  iniciar({ so, ventana, raiz, args }) {
    raiz.classList.add("expl");
    raiz.innerHTML = `
      <div class="expl-barra">
        <button data-acc="subir" aria-label="Carpeta superior" title="Carpeta superior">↑</button>
        <input class="expl-ruta" spellcheck="false" aria-label="Ruta" />
        <button data-acc="nuevo-archivo">+ Archivo</button>
        <button data-acc="nueva-carpeta">+ Carpeta</button>
      </div>
      <div class="expl-lista" role="listbox" aria-label="Contenido"></div>
      <div class="expl-pie"></div>`;
    const ruta = raiz.querySelector<HTMLInputElement>(".expl-ruta")!;
    const lista = raiz.querySelector<HTMLElement>(".expl-lista")!;
    const pie = raiz.querySelector<HTMLElement>(".expl-pie")!;

    let actual = so.usuario.home;
    let seleccion: string | null = null;
    /** Mini-formulario en línea (nuevo nombre, renombrar, confirmar borrado) */
    let editor: { tipo: "archivo" | "carpeta" | "renombrar" | "borrar"; objetivo?: string } | null = null;

    const unir = (dir: string, nombre: string) => (dir === "/" ? "" : dir) + "/" + nombre;
    const aviso = (m: string, error = false) => {
      pie.textContent = m;
      pie.classList.toggle("error", error);
    };

    function pintar() {
      ruta.value = actual;
      ventana.fijarTitulo(`${actual.split("/").pop() || "/"} — Archivos`);
      lista.innerHTML = "";
      let entradas;
      try {
        entradas = so.vfs.listar(actual);
      } catch (e) {
        aviso((e as Error).message, true);
        return;
      }
      if (editor && (editor.tipo === "archivo" || editor.tipo === "carpeta")) {
        lista.appendChild(formulario(editor.tipo === "archivo" ? "Nombre del archivo:" : "Nombre de la carpeta:", ""));
      }
      for (const e of entradas) {
        const p = unir(actual, e.nombre);
        if (editor?.tipo === "renombrar" && editor.objetivo === p) {
          lista.appendChild(formulario("Nuevo nombre:", e.nombre));
          continue;
        }
        const fila = document.createElement("div");
        fila.className = "expl-fila" + (p === seleccion ? " sel" : "");
        fila.dataset.ruta = p;
        fila.setAttribute("role", "option");
        fila.tabIndex = 0;
        fila.innerHTML = `${e.tipo === "dir" ? ICONO_CARPETA : ICONO_ARCHIVO}<span class="nombre"></span><small>${
          e.tipo === "dir" ? "Carpeta" : `${e.tam} car.`
        }</small>`;
        fila.querySelector<HTMLElement>(".nombre")!.textContent = e.nombre;
        lista.appendChild(fila);
      }
      if (!entradas.length && !editor) {
        const v = document.createElement("p");
        v.className = "expl-vacia";
        v.textContent = "Carpeta vacía";
        lista.appendChild(v);
      }
      if (editor?.tipo === "borrar" && editor.objetivo) {
        const c = document.createElement("div");
        c.className = "expl-confirmar";
        c.innerHTML = `<span></span><button data-acc="si-borrar">Borrar</button><button data-acc="no-borrar">Cancelar</button>`;
        c.querySelector("span")!.textContent = `¿Borrar «${editor.objetivo.split("/").pop()}»?`;
        lista.appendChild(c);
      }
      if (!pie.classList.contains("error")) {
        aviso(`${entradas.length} elemento${entradas.length === 1 ? "" : "s"}${seleccion ? ` · ${seleccion.split("/").pop()} seleccionado` : ""}`);
      }
    }

    function formulario(etiqueta: string, valor: string): HTMLElement {
      const f = document.createElement("form");
      f.className = "expl-form";
      f.innerHTML = `<label><span></span><input name="n" spellcheck="false" /></label><button>Aceptar</button><button type="button" data-acc="cancelar">Cancelar</button>`;
      f.querySelector("span")!.textContent = etiqueta;
      const input = f.querySelector<HTMLInputElement>("input")!;
      input.value = valor;
      queueMicrotask(() => {
        input.focus();
        input.select();
      });
      f.addEventListener("submit", (ev) => {
        ev.preventDefault();
        confirmar(input.value.trim());
      });
      return f;
    }

    function confirmar(nombre: string) {
      if (!editor) return;
      try {
        if (!nombre || nombre.includes("/")) throw new Error("Nombre no válido");
        const destino = unir(actual, nombre);
        if (editor.tipo !== "renombrar" && so.vfs.existe(destino)) throw new Error(`Ya existe «${nombre}»`);
        if (editor.tipo === "archivo") so.vfs.escribir(destino, "");
        else if (editor.tipo === "carpeta") so.vfs.mkdir(destino);
        else if (editor.tipo === "renombrar" && editor.objetivo) {
          so.vfs.mover(editor.objetivo, destino);
          seleccion = destino;
        }
        editor = null;
        aviso("Hecho");
      } catch (e) {
        aviso((e as Error).message, true);
      }
      pintar();
    }

    function ir(destino: string) {
      if (!so.vfs.esDir(destino)) return aviso(`No es una carpeta: ${destino}`, true);
      actual = "/" + destino.split("/").filter(Boolean).join("/");
      seleccion = null;
      editor = null;
      aviso("");
      pintar();
    }

    function abrir(p: string) {
      if (so.vfs.esDir(p)) return ir(p);
      so.abrirApp(so.appParaArchivo(p), { ruta: p });
    }

    const acciones: Record<string, () => void> = {
      subir: () => ir(actual.split("/").slice(0, -1).join("/") || "/"),
      "nuevo-archivo": () => ((editor = { tipo: "archivo" }), aviso(""), pintar()),
      "nueva-carpeta": () => ((editor = { tipo: "carpeta" }), aviso(""), pintar()),
      cancelar: () => ((editor = null), aviso(""), pintar()),
      "no-borrar": () => ((editor = null), aviso(""), pintar()),
      "si-borrar": () => {
        if (!editor?.objetivo) return;
        try {
          so.vfs.borrar(editor.objetivo);
          if (seleccion === editor.objetivo) seleccion = null;
          aviso("Borrado");
        } catch (e) {
          aviso((e as Error).message, true);
        }
        editor = null;
        pintar();
      },
    };

    raiz.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>("[data-acc]");
      if (b) return acciones[b.dataset.acc!]?.();
      const fila = (e.target as HTMLElement).closest<HTMLElement>(".expl-fila");
      if (fila) {
        // se marca sin redibujar la lista: si no, el doble clic pierde su objetivo
        seleccion = fila.dataset.ruta!;
        lista.querySelectorAll(".expl-fila.sel").forEach((x) => x.classList.remove("sel"));
        fila.classList.add("sel");
        aviso(`${seleccion.split("/").pop()} seleccionado`);
        // en táctil un toque abre
        if ((e as PointerEvent).pointerType === "touch") abrir(seleccion);
      }
    });
    raiz.addEventListener("dblclick", (e) => {
      const fila = (e.target as HTMLElement).closest<HTMLElement>(".expl-fila");
      if (fila) abrir(fila.dataset.ruta!);
    });
    lista.addEventListener("keydown", (e) => {
      const fila = (e.target as HTMLElement).closest<HTMLElement>(".expl-fila");
      if (!fila || (e.target as HTMLElement).tagName === "INPUT") return;
      const p = fila.dataset.ruta!;
      if (e.key === "Enter") abrir(p);
      else if (e.key === "F2") (seleccion = p), (editor = { tipo: "renombrar", objetivo: p }), pintar();
      else if (e.key === "Delete") (seleccion = p), (editor = { tipo: "borrar", objetivo: p }), pintar();
    });
    // menú contextual mínimo: clic derecho = renombrar; Supr = borrar (también por botones al seleccionar)
    lista.addEventListener("contextmenu", (e) => {
      const fila = (e.target as HTMLElement).closest<HTMLElement>(".expl-fila");
      if (!fila) return;
      e.preventDefault();
      seleccion = fila.dataset.ruta!;
      editor = { tipo: "renombrar", objetivo: seleccion };
      pintar();
    });
    ruta.addEventListener("keydown", (e) => {
      if (e.key === "Enter") ir(ruta.value);
    });

    // botones que dependen de la selección
    const extra = document.createElement("div");
    extra.className = "expl-extra";
    extra.innerHTML = `<button data-x="abrir">Abrir</button><button data-x="renombrar">Renombrar</button><button data-x="borrar">Borrar</button>`;
    raiz.querySelector(".expl-barra")!.after(extra);
    extra.addEventListener("click", (e) => {
      const x = (e.target as HTMLElement).dataset.x;
      if (!x) return;
      if (!seleccion) return aviso("Selecciona un elemento primero", true);
      if (x === "abrir") abrir(seleccion);
      else editor = { tipo: x === "borrar" ? "borrar" : "renombrar", objetivo: seleccion };
      aviso("");
      pintar();
    });

    ir(args.ruta && so.vfs.esDir(args.ruta) ? args.ruta : actual);
  },
};

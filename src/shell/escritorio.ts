// Shell de escritorio: iconos, ventanas arrastrables, barra de tareas y menú de inicio.

import type { AppDef, Kernel, Ventana } from "../kernel/kernel";

interface VentanaViva {
  el: HTMLElement;
  app: AppDef;
  pid: number;
  boton: HTMLButtonElement;
  minimizada: boolean;
  maximizada: boolean;
  previa?: { x: number; y: number; w: number; h: number };
  limpiar?: () => void;
}

export function montarEscritorio(raiz: HTMLElement, so: Kernel, alApagar: () => void): () => void {
  raiz.innerHTML = `
    <div class="escritorio">
      <div class="iconos"></div>
      <div class="ventanas"></div>
      <div class="inicio" hidden>
        <input class="inicio-buscar" placeholder="Buscar aplicaciones…" aria-label="Buscar aplicaciones" />
        <div class="inicio-apps"></div>
        <div class="inicio-pie"><span class="inicio-usuario"></span><button class="apagar">⏻ Cerrar sesión</button></div>
      </div>
      <div class="barra">
        <button class="boton-inicio" aria-label="Inicio"><img src="./logo.svg" alt="" /></button>
        <div class="tareas"></div>
        <div class="reloj" aria-label="Hora"></div>
      </div>
    </div>`;
  const q = <T extends HTMLElement>(s: string) => raiz.querySelector<T>(s)!;
  const iconos = q(".iconos");
  const capa = q(".ventanas");
  const menu = q(".inicio");
  const tareas = q(".tareas");
  const vivas = new Map<number, VentanaViva>();
  let z = 10;
  let activa: number | null = null;

  q(".inicio-usuario").textContent = so.usuario.visible;

  // --- reloj ---
  const reloj = q(".reloj");
  const pintarReloj = () => {
    const d = new Date();
    reloj.innerHTML = `${d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}<small>${d.toLocaleDateString("es-ES")}</small>`;
  };
  pintarReloj();
  const relojId = setInterval(pintarReloj, 15000);

  // --- iconos de escritorio y menú ---
  const tarjeta = (app: AppDef, clase: string) => {
    const b = document.createElement("button");
    b.className = clase;
    b.dataset.app = app.id;
    b.innerHTML = `${app.icono}<span>${app.nombre}</span>`;
    return b;
  };
  const apps = so.listaApps();
  for (const app of apps) {
    const i = tarjeta(app, "icono");
    i.addEventListener("dblclick", () => abrir(app));
    // en pantallas táctiles un toque basta
    i.addEventListener("click", (e) => {
      if ((e as PointerEvent).pointerType === "touch") abrir(app);
    });
    iconos.appendChild(i);
  }
  const lista = q(".inicio-apps");
  const pintarMenu = (filtro = "") => {
    lista.innerHTML = "";
    for (const app of apps.filter((a) => a.nombre.toLowerCase().includes(filtro.toLowerCase()))) {
      const b = tarjeta(app, "inicio-app");
      b.addEventListener("click", () => {
        cerrarMenu();
        abrir(app);
      });
      lista.appendChild(b);
    }
  };
  pintarMenu();
  q<HTMLInputElement>(".inicio-buscar").addEventListener("input", (e) => pintarMenu((e.target as HTMLInputElement).value));

  const cerrarMenu = () => (menu.hidden = true);
  q(".boton-inicio").addEventListener("click", (e) => {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
    if (!menu.hidden) q<HTMLInputElement>(".inicio-buscar").focus();
  });
  menu.addEventListener("pointerdown", (e) => e.stopPropagation());
  const fuera = () => cerrarMenu();
  raiz.addEventListener("pointerdown", fuera);
  q(".apagar").addEventListener("click", () => {
    cerrar_todo();
    alApagar();
  });

  // --- ventanas ---
  function enfocar(pid: number) {
    const v = vivas.get(pid);
    if (!v) return;
    v.el.style.zIndex = String(++z);
    activa = pid;
    vivas.forEach((o, id) => {
      o.el.classList.toggle("activa", id === pid);
      o.boton.classList.toggle("activa", id === pid && !o.minimizada);
    });
  }

  function abrir(app: AppDef) {
    const proc = so.iniciarProceso(app.id);
    const desplazamiento = (vivas.size % 6) * 28;
    const el = document.createElement("section");
    el.className = "ventana";
    el.style.cssText = `left:${70 + desplazamiento}px;top:${40 + desplazamiento}px;width:${app.ancho}px;height:${app.alto}px`;
    el.innerHTML = `
      <header class="ventana-cab">
        <img src="./logo.svg" alt="" />
        <span class="ventana-titulo">${app.nombre}</span>
        <button data-v="min" aria-label="Minimizar">–</button>
        <button data-v="max" aria-label="Maximizar">▢</button>
        <button data-v="cerrar" aria-label="Cerrar" class="cerrar">✕</button>
      </header>
      <div class="ventana-cuerpo"></div>
      <div class="ventana-esquina"></div>`;
    capa.appendChild(el);

    const boton = document.createElement("button");
    boton.className = "tarea";
    boton.innerHTML = `${app.icono}<span>${app.nombre}</span>`;
    tareas.appendChild(boton);

    const v: VentanaViva = { el, app, pid: proc.pid, boton, minimizada: false, maximizada: false };
    vivas.set(proc.pid, v);

    const titulo = el.querySelector<HTMLElement>(".ventana-titulo")!;
    const api: Ventana = {
      titulo: app.nombre,
      fijarTitulo(t) {
        titulo.textContent = t;
        boton.querySelector("span")!.textContent = t;
      },
      cerrar: () => cerrar(proc.pid),
    };
    const limpiar = app.iniciar({ so, ventana: api, raiz: el.querySelector<HTMLElement>(".ventana-cuerpo")! });
    if (typeof limpiar === "function") v.limpiar = limpiar;

    el.addEventListener("pointerdown", () => enfocar(proc.pid));
    boton.addEventListener("click", () => {
      if (v.minimizada) restaurar(v);
      else if (activa === proc.pid) minimizar(v);
      else enfocar(proc.pid);
    });
    el.querySelector('[data-v="min"]')!.addEventListener("click", () => minimizar(v));
    el.querySelector('[data-v="max"]')!.addEventListener("click", () => alternarMax(v));
    el.querySelector('[data-v="cerrar"]')!.addEventListener("click", () => cerrar(proc.pid));
    el.querySelector(".ventana-cab")!.addEventListener("dblclick", () => alternarMax(v));
    arrastrable(v);
    redimensionable(v);
    enfocar(proc.pid);
  }

  function minimizar(v: VentanaViva) {
    v.minimizada = true;
    v.el.hidden = true;
    v.boton.classList.remove("activa");
    if (activa === v.pid) activa = null;
  }
  function restaurar(v: VentanaViva) {
    v.minimizada = false;
    v.el.hidden = false;
    enfocar(v.pid);
  }
  function alternarMax(v: VentanaViva) {
    const e = v.el;
    if (!v.maximizada) {
      v.previa = { x: e.offsetLeft, y: e.offsetTop, w: e.offsetWidth, h: e.offsetHeight };
      e.classList.add("maximizada");
    } else {
      e.classList.remove("maximizada");
      if (v.previa) e.style.cssText = `left:${v.previa.x}px;top:${v.previa.y}px;width:${v.previa.w}px;height:${v.previa.h}px;z-index:${e.style.zIndex}`;
    }
    v.maximizada = !v.maximizada;
  }
  function cerrar(pid: number) {
    const v = vivas.get(pid);
    if (!v) return;
    v.limpiar?.();
    v.el.remove();
    v.boton.remove();
    vivas.delete(pid);
    so.terminarProceso(pid);
    if (activa === pid) activa = null;
  }
  function cerrar_todo() {
    [...vivas.keys()].forEach(cerrar);
  }

  function arrastrable(v: VentanaViva) {
    const cab = v.el.querySelector<HTMLElement>(".ventana-cab")!;
    cab.addEventListener("pointerdown", (e) => {
      if ((e.target as HTMLElement).closest("button") || v.maximizada) return;
      const dx = e.clientX - v.el.offsetLeft;
      const dy = e.clientY - v.el.offsetTop;
      cab.setPointerCapture(e.pointerId);
      const mover = (m: PointerEvent) => {
        v.el.style.left = `${Math.max(0, m.clientX - dx)}px`;
        v.el.style.top = `${Math.max(0, m.clientY - dy)}px`;
      };
      const soltar = () => {
        cab.removeEventListener("pointermove", mover);
        cab.removeEventListener("pointerup", soltar);
      };
      cab.addEventListener("pointermove", mover);
      cab.addEventListener("pointerup", soltar);
    });
  }

  function redimensionable(v: VentanaViva) {
    const esq = v.el.querySelector<HTMLElement>(".ventana-esquina")!;
    esq.addEventListener("pointerdown", (e) => {
      if (v.maximizada) return;
      e.stopPropagation();
      const x0 = e.clientX, y0 = e.clientY, w0 = v.el.offsetWidth, h0 = v.el.offsetHeight;
      esq.setPointerCapture(e.pointerId);
      const mover = (m: PointerEvent) => {
        v.el.style.width = `${Math.max(240, w0 + m.clientX - x0)}px`;
        v.el.style.height = `${Math.max(160, h0 + m.clientY - y0)}px`;
      };
      const soltar = () => {
        esq.removeEventListener("pointermove", mover);
        esq.removeEventListener("pointerup", soltar);
      };
      esq.addEventListener("pointermove", mover);
      esq.addEventListener("pointerup", soltar);
    });
  }

  return () => {
    clearInterval(relojId);
    cerrar_todo();
  };
}

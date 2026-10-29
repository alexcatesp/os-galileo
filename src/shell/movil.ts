// Shell móvil: pantalla de inicio con cuadrícula de iconos, apps a pantalla completa
// y reordenación de iconos (mantener pulsado, arrastrar y soltar).

import type { Kernel, Ventana } from "../kernel/kernel";

const CLAVE_ORDEN = "osg-movil-orden";

function leerOrden(): string[] {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_ORDEN) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function montarMovil(raiz: HTMLElement, so: Kernel, alApagar: () => void): () => void {
  raiz.innerHTML = `
    <div class="movil">
      <div class="movil-estado"><span class="movil-hora"></span><button class="movil-salir" aria-label="Cerrar sesión">⏻</button></div>
      <div class="movil-inicio"><div class="movil-rejilla"></div><p class="movil-ayuda" hidden>Arrastra los iconos para ordenarlos. Toca fuera para terminar.</p></div>
      <div class="movil-app" hidden>
        <div class="movil-app-barra"><span class="movil-app-titulo"></span></div>
        <div class="movil-app-cuerpo"></div>
      </div>
      <button class="movil-home" aria-label="Inicio"><i></i></button>
    </div>`;
  const q = <T extends HTMLElement>(s: string) => raiz.querySelector<T>(s)!;
  const rejilla = q(".movil-rejilla");
  const inicio = q(".movil-inicio");
  const ayuda = q(".movil-ayuda");
  const contApp = q(".movil-app");
  const cuerpo = q(".movil-app-cuerpo");
  const tituloApp = q(".movil-app-titulo");

  const hora = q(".movil-hora");
  const pintarHora = () => (hora.textContent = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }));
  pintarHora();
  const horaId = setInterval(pintarHora, 15000);

  // orden guardado de los iconos
  const todas = so.listaApps();
  const orden = leerOrden();
  const apps = [...todas].sort((a, b) => {
    const ia = orden.indexOf(a.id), ib = orden.indexOf(b.id);
    return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
  });
  let edicion = false;

  const pintar = () => {
    rejilla.innerHTML = "";
    for (const app of apps) {
      const b = document.createElement("button");
      b.className = "movil-icono";
      b.dataset.app = app.id;
      b.innerHTML = `${app.icono}<span>${app.nombre}</span>`;
      rejilla.appendChild(b);
    }
    rejilla.classList.toggle("edicion", edicion);
    ayuda.hidden = !edicion;
  };
  pintar();

  // --- apps a pantalla completa (una a la vez, como en un móvil) ---
  let pidActual: number | null = null;
  let limpiarActual: (() => void) | undefined;

  function abrir(id: string) {
    const app = so.app(id);
    if (!app) return;
    cerrarApp();
    pidActual = so.iniciarProceso(id).pid;
    tituloApp.textContent = app.nombre;
    cuerpo.innerHTML = "";
    const api: Ventana = {
      titulo: app.nombre,
      fijarTitulo: (t) => (tituloApp.textContent = t),
      cerrar: cerrarApp,
    };
    const l = app.iniciar({ so, ventana: api, raiz: cuerpo });
    limpiarActual = typeof l === "function" ? l : undefined;
    contApp.hidden = false;
  }
  function cerrarApp() {
    limpiarActual?.();
    limpiarActual = undefined;
    if (pidActual !== null) so.terminarProceso(pidActual);
    pidActual = null;
    contApp.hidden = true;
    cuerpo.innerHTML = "";
  }
  q(".movil-home").addEventListener("click", cerrarApp);
  q(".movil-salir").addEventListener("click", () => {
    cerrarApp();
    alApagar();
  });

  // --- toque, pulsación larga y reordenación ---
  let temporizador: number | undefined;
  let arrastrando: { el: HTMLElement; fantasma: HTMLElement; id: string } | null = null;

  rejilla.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>(".movil-icono");
    if (b && !edicion) abrir(b.dataset.app!);
  });

  rejilla.addEventListener("pointerdown", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>(".movil-icono");
    if (!b) return;
    if (!edicion) {
      temporizador = window.setTimeout(() => {
        edicion = true;
        pintar();
      }, 450);
      return;
    }
    // ya en edición: empieza el arrastre
    e.preventDefault();
    const r = b.getBoundingClientRect();
    const fantasma = b.cloneNode(true) as HTMLElement;
    fantasma.classList.add("fantasma");
    fantasma.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px`;
    document.body.appendChild(fantasma);
    b.classList.add("levantado");
    arrastrando = { el: b, fantasma, id: b.dataset.app! };
    b.setPointerCapture?.(e.pointerId);
    const dx = e.clientX - r.left, dy = e.clientY - r.top;

    const mover = (m: PointerEvent) => {
      fantasma.style.left = `${m.clientX - dx}px`;
      fantasma.style.top = `${m.clientY - dy}px`;
      const destino = document.elementsFromPoint(m.clientX, m.clientY).find(
        (x) => x.classList.contains("movil-icono") && x !== arrastrando!.el,
      ) as HTMLElement | undefined;
      if (destino) {
        const de = apps.findIndex((a) => a.id === arrastrando!.id);
        const a = apps.findIndex((x) => x.id === destino.dataset.app);
        const [quitada] = apps.splice(de, 1);
        apps.splice(a, 0, quitada);
        pintar();
        arrastrando!.el = rejilla.querySelector<HTMLElement>(`[data-app="${arrastrando!.id}"]`)!;
        arrastrando!.el.classList.add("levantado");
      }
    };
    const soltar = () => {
      document.removeEventListener("pointermove", mover);
      document.removeEventListener("pointerup", soltar);
      fantasma.remove();
      arrastrando = null;
      pintar();
      try {
        localStorage.setItem(CLAVE_ORDEN, JSON.stringify(apps.map((a) => a.id)));
      } catch {
        /* sin almacenamiento */
      }
    };
    document.addEventListener("pointermove", mover);
    document.addEventListener("pointerup", soltar);
  });
  const cancelarPulsacion = () => window.clearTimeout(temporizador);
  rejilla.addEventListener("pointerup", cancelarPulsacion);
  rejilla.addEventListener("pointerleave", cancelarPulsacion);
  // tocar fuera de un icono termina la edición
  inicio.addEventListener("pointerdown", (e) => {
    if (edicion && !arrastrando && !(e.target as HTMLElement).closest(".movil-icono")) {
      edicion = false;
      pintar();
    }
  });

  return () => {
    clearInterval(horaId);
    cerrarApp();
  };
}

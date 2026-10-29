// Núcleo de OS Galileo: sistema de archivos, usuario, procesos y registro de aplicaciones.
// Los «shells» (escritorio, móvil) y las apps solo hablan con este objeto.

import { Vfs } from "./vfs";

export interface Ventana {
  titulo: string;
  fijarTitulo(texto: string): void;
  cerrar(): void;
}

export interface ArgsApp {
  /** archivo del sistema virtual que la app debe abrir */
  ruta?: string;
}

export interface ContextoApp {
  so: Kernel;
  ventana: Ventana;
  raiz: HTMLElement;
  args: ArgsApp;
}

export interface AppDef {
  id: string;
  nombre: string;
  /** módulo al que pertenece («0485 · Programación»); sin módulo = aplicación del sistema */
  modulo?: string;
  /** SVG de 48×48 */
  icono: string;
  ancho: number;
  alto: number;
  iniciar(ctx: ContextoApp): void | (() => void);
}

export interface Proceso {
  pid: number;
  app: string;
  inicio: number;
}

type Oyente = () => void;

export class Kernel {
  readonly vfs = new Vfs();
  readonly usuario = { nombre: "invitado", visible: "Invitado", home: "/home/invitado" };
  private apps = new Map<string, AppDef>();
  private procesos = new Map<number, Proceso>();
  private siguientePid = 1;
  private oyentes = new Set<Oyente>();

  /** Lo asigna el shell activo: abre una app (nueva ventana o pantalla completa) */
  lanzador: (id: string, args: ArgsApp) => void = () => {};

  abrirApp(id: string, args: ArgsApp = {}): void {
    this.lanzador(id, args);
  }

  /** Qué app abre cada tipo de archivo */
  appParaArchivo(ruta: string): string {
    const ext = ruta.split(".").pop()?.toLowerCase();
    if (ext === "psc" || ext === "diag") return "pseudoflow";
    return "bloc-de-notas";
  }

  registrar(app: AppDef): void {
    this.apps.set(app.id, app);
  }

  listaApps(): AppDef[] {
    return [...this.apps.values()];
  }

  app(id: string): AppDef | undefined {
    return this.apps.get(id);
  }

  iniciarProceso(app: string): Proceso {
    const p = { pid: this.siguientePid++, app, inicio: Date.now() };
    this.procesos.set(p.pid, p);
    this.avisar();
    return p;
  }

  terminarProceso(pid: number): void {
    this.procesos.delete(pid);
    this.avisar();
  }

  procesosActivos(): Proceso[] {
    return [...this.procesos.values()];
  }

  alCambiar(oyente: Oyente): () => void {
    this.oyentes.add(oyente);
    return () => this.oyentes.delete(oyente);
  }

  private avisar(): void {
    this.oyentes.forEach((o) => o());
  }
}

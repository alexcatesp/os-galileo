// Sistema de archivos virtual. Árbol en memoria persistido en localStorage;
// la interfaz es asíncrona-compatible para poder pasar a IndexedDB más adelante.

type Nodo = Dir | Archivo;
interface Dir { tipo: "dir"; hijos: Record<string, Nodo> }
interface Archivo { tipo: "archivo"; contenido: string; modificado: number }

export interface Entrada { nombre: string; tipo: "dir" | "archivo"; tam: number }

const CLAVE = "osg-vfs";

function dir(hijos: Record<string, Nodo> = {}): Dir {
  return { tipo: "dir", hijos };
}
function archivo(contenido: string): Archivo {
  return { tipo: "archivo", contenido, modificado: Date.now() };
}

function inicial(): Dir {
  return dir({
    home: dir({
      invitado: dir({
        Escritorio: dir(),
        Documentos: dir({
          "bienvenida.txt": archivo(
            "Bienvenido a OS Galileo.\n\nEsto es un sistema operativo simulado.\nPuedes guardar archivos en esta carpeta con el Bloc de notas.\n",
          ),
        }),
        Descargas: dir(),
      }),
    }),
    etc: dir({ "os-release": archivo('NAME="OS Galileo"\nVERSION="0.1"\nID=galileo\n') }),
    tmp: dir(),
  });
}

export class Vfs {
  private raiz: Dir;

  constructor() {
    this.raiz = this.cargar();
  }

  private cargar(): Dir {
    try {
      const guardado = localStorage.getItem(CLAVE);
      if (guardado) return JSON.parse(guardado) as Dir;
    } catch {
      /* sin almacenamiento: partida en memoria */
    }
    return inicial();
  }

  private guardar(): void {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(this.raiz));
    } catch {
      /* cuota o modo privado: se mantiene en memoria */
    }
  }

  reiniciar(): void {
    this.raiz = inicial();
    this.guardar();
  }

  static normalizar(ruta: string): string[] {
    const partes: string[] = [];
    for (const p of ruta.split("/")) {
      if (!p || p === ".") continue;
      if (p === "..") partes.pop();
      else partes.push(p);
    }
    return partes;
  }

  private nodo(ruta: string): Nodo | undefined {
    let actual: Nodo = this.raiz;
    for (const p of Vfs.normalizar(ruta)) {
      if (actual.tipo !== "dir") return undefined;
      const siguiente: Nodo | undefined = actual.hijos[p];
      if (!siguiente) return undefined;
      actual = siguiente;
    }
    return actual;
  }

  existe(ruta: string): boolean {
    return this.nodo(ruta) !== undefined;
  }

  esDir(ruta: string): boolean {
    return this.nodo(ruta)?.tipo === "dir";
  }

  leer(ruta: string): string {
    const n = this.nodo(ruta);
    if (!n) throw new Error(`No existe: ${ruta}`);
    if (n.tipo !== "archivo") throw new Error(`Es una carpeta: ${ruta}`);
    return n.contenido;
  }

  listar(ruta: string): Entrada[] {
    const n = this.nodo(ruta);
    if (!n || n.tipo !== "dir") throw new Error(`No es una carpeta: ${ruta}`);
    return Object.entries(n.hijos)
      .map(([nombre, h]) => ({
        nombre,
        tipo: h.tipo,
        tam: h.tipo === "archivo" ? h.contenido.length : 0,
      }))
      .sort((a, b) => (a.tipo === b.tipo ? a.nombre.localeCompare(b.nombre) : a.tipo === "dir" ? -1 : 1));
  }

  mkdir(ruta: string): void {
    let actual = this.raiz;
    for (const p of Vfs.normalizar(ruta)) {
      let h: Nodo | undefined = actual.hijos[p];
      if (!h) {
        h = dir();
        actual.hijos[p] = h;
      }
      if (h.tipo !== "dir") throw new Error(`${p} es un archivo`);
      actual = h;
    }
    this.guardar();
  }

  escribir(ruta: string, contenido: string): void {
    const partes = Vfs.normalizar(ruta);
    const nombre = partes.pop();
    if (!nombre) throw new Error("Ruta no válida");
    this.mkdir("/" + partes.join("/"));
    const padre = this.nodo("/" + partes.join("/")) as Dir;
    const previo = padre.hijos[nombre];
    if (previo?.tipo === "dir") throw new Error(`${nombre} es una carpeta`);
    padre.hijos[nombre] = archivo(contenido);
    this.guardar();
  }

  borrar(ruta: string): void {
    const partes = Vfs.normalizar(ruta);
    const nombre = partes.pop();
    const padre = this.nodo("/" + partes.join("/"));
    if (!nombre || !padre || padre.tipo !== "dir" || !padre.hijos[nombre]) {
      throw new Error(`No existe: ${ruta}`);
    }
    delete padre.hijos[nombre];
    this.guardar();
  }
}

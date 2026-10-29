import type { AppDef, Kernel } from "../kernel/kernel";

type Salida = (texto: string, clase?: "error" | "info") => void;

interface Sesion {
  so: Kernel;
  cwd: string;
  salida: Salida;
  limpiar: () => void;
}

class ErrorCmd extends Error {}

function resolver(s: Sesion, ruta: string): string {
  const base = ruta.startsWith("/") ? ruta : ruta.startsWith("~") ? s.so.usuario.home + ruta.slice(1) : `${s.cwd}/${ruta}`;
  return "/" + (base.split("/").filter(Boolean).reduce<string[]>((a, p) => {
    if (p === "..") a.pop();
    else if (p !== ".") a.push(p);
    return a;
  }, []).join("/"));
}

function requerido(args: string[], n: number, uso: string): void {
  if (args.length < n) throw new ErrorCmd(`uso: ${uso}`);
}

/** Cada comando recibe los argumentos ya separados (sin las opciones, que van aparte). */
const COMANDOS: Record<string, { ayuda: string; ejecutar(s: Sesion, args: string[], opc: Set<string>): void }> = {
  help: {
    ayuda: "muestra esta ayuda",
    ejecutar(s) {
      for (const [n, c] of Object.entries(COMANDOS)) s.salida(`  ${n.padEnd(8)} ${c.ayuda}`);
    },
  },
  pwd: { ayuda: "carpeta actual", ejecutar: (s) => s.salida(s.cwd) },
  whoami: { ayuda: "usuario actual", ejecutar: (s) => s.salida(s.so.usuario.nombre) },
  date: { ayuda: "fecha y hora", ejecutar: (s) => s.salida(new Date().toLocaleString("es-ES")) },
  uname: { ayuda: "información del sistema", ejecutar: (s) => s.salida("OS Galileo 0.1 (simulado)") },
  clear: { ayuda: "limpia la pantalla", ejecutar: (s) => s.limpiar() },
  echo: { ayuda: "escribe texto (admite > y >> para guardarlo)", ejecutar: (s, a) => s.salida(a.join(" ")) },
  ls: {
    ayuda: "lista una carpeta (-l: detalle)",
    ejecutar(s, a, o) {
      const destino = resolver(s, a[0] ?? ".");
      if (!s.so.vfs.existe(destino)) throw new ErrorCmd(`ls: no existe ${a[0]}`);
      if (!s.so.vfs.esDir(destino)) return s.salida(destino.split("/").pop()!);
      for (const e of s.so.vfs.listar(destino)) {
        const n = e.tipo === "dir" ? e.nombre + "/" : e.nombre;
        s.salida(o.has("l") ? `${e.tipo === "dir" ? "d" : "-"}  ${String(e.tam).padStart(6)}  ${n}` : n);
      }
    },
  },
  cd: {
    ayuda: "cambia de carpeta",
    ejecutar(s, a) {
      const destino = resolver(s, a[0] ?? "~");
      if (!s.so.vfs.esDir(destino)) throw new ErrorCmd(`cd: no es una carpeta: ${a[0]}`);
      s.cwd = destino;
    },
  },
  cat: {
    ayuda: "muestra un archivo",
    ejecutar(s, a) {
      requerido(a, 1, "cat archivo");
      for (const f of a) {
        try {
          s.salida(s.so.vfs.leer(resolver(s, f)));
        } catch (e) {
          throw new ErrorCmd(`cat: ${(e as Error).message}`);
        }
      }
    },
  },
  mkdir: {
    ayuda: "crea carpetas",
    ejecutar(s, a) {
      requerido(a, 1, "mkdir carpeta…");
      a.forEach((c) => s.so.vfs.mkdir(resolver(s, c)));
    },
  },
  touch: {
    ayuda: "crea un archivo vacío",
    ejecutar(s, a) {
      requerido(a, 1, "touch archivo…");
      for (const f of a) {
        const r = resolver(s, f);
        if (!s.so.vfs.existe(r)) s.so.vfs.escribir(r, "");
      }
    },
  },
  rm: {
    ayuda: "borra (-r: carpetas)",
    ejecutar(s, a, o) {
      requerido(a, 1, "rm [-r] ruta…");
      for (const f of a) {
        const r = resolver(s, f);
        if (!s.so.vfs.existe(r)) throw new ErrorCmd(`rm: no existe ${f}`);
        if (s.so.vfs.esDir(r) && !o.has("r")) throw new ErrorCmd(`rm: ${f} es una carpeta (usa -r)`);
        if (r === "/") throw new ErrorCmd("rm: no se puede borrar la raíz");
        s.so.vfs.borrar(r);
      }
    },
  },
  mv: {
    ayuda: "mueve o renombra",
    ejecutar(s, a) {
      requerido(a, 2, "mv origen destino");
      s.so.vfs.mover(resolver(s, a[0]), resolver(s, a[1]));
    },
  },
  cp: {
    ayuda: "copia",
    ejecutar(s, a) {
      requerido(a, 2, "cp origen destino");
      s.so.vfs.copiar(resolver(s, a[0]), resolver(s, a[1]));
    },
  },
  tree: {
    ayuda: "árbol de carpetas",
    ejecutar(s, a) {
      const raiz = resolver(s, a[0] ?? ".");
      if (!s.so.vfs.esDir(raiz)) throw new ErrorCmd("tree: no es una carpeta");
      s.salida(raiz);
      const rec = (dir: string, prefijo: string) => {
        const hijos = s.so.vfs.listar(dir);
        hijos.forEach((h, i) => {
          const ultimo = i === hijos.length - 1;
          s.salida(`${prefijo}${ultimo ? "└── " : "├── "}${h.nombre}${h.tipo === "dir" ? "/" : ""}`);
          if (h.tipo === "dir") rec(`${dir === "/" ? "" : dir}/${h.nombre}`, prefijo + (ultimo ? "    " : "│   "));
        });
      };
      rec(raiz, "");
    },
  },
  ps: {
    ayuda: "procesos en ejecución",
    ejecutar(s) {
      s.salida("  PID  APP");
      for (const p of s.so.procesosActivos()) s.salida(`${String(p.pid).padStart(5)}  ${p.app}`);
    },
  },
  open: {
    ayuda: "abre un archivo o una app (open notas.txt, open calculadora)",
    ejecutar(s, a) {
      requerido(a, 1, "open archivo|app");
      if (s.so.app(a[0])) return s.so.abrirApp(a[0]);
      const r = resolver(s, a[0]);
      if (!s.so.vfs.existe(r)) throw new ErrorCmd(`open: no existe ${a[0]}`);
      s.so.abrirApp(s.so.vfs.esDir(r) ? "explorador" : s.so.appParaArchivo(r), { ruta: r });
    },
  },
};

/** Separa por espacios respetando comillas simples y dobles */
function separar(linea: string): string[] {
  return [...linea.matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g)].map((m) => m[1] ?? m[2] ?? m[3]);
}

function ejecutarLinea(s: Sesion, linea: string): void {
  const partes = separar(linea);
  if (!partes.length) return;
  // redirección: echo hola > archivo   /   >> para añadir
  let redir: { ruta: string; anadir: boolean } | null = null;
  const i = partes.findIndex((p) => p === ">" || p === ">>");
  if (i >= 0) {
    if (!partes[i + 1]) throw new ErrorCmd("falta el archivo tras la redirección");
    redir = { ruta: resolver(s, partes[i + 1]), anadir: partes[i] === ">>" };
    partes.splice(i, 2);
  }
  const [nombre, ...resto] = partes;
  const cmd = COMANDOS[nombre];
  if (!cmd) throw new ErrorCmd(`${nombre}: orden no encontrada (prueba help)`);
  const opc = new Set(resto.filter((x) => /^-[a-zA-Z]+$/.test(x)).flatMap((x) => [...x.slice(1)]));
  const args = resto.filter((x) => !/^-[a-zA-Z]+$/.test(x));
  if (!redir) return cmd.ejecutar(s, args, opc);
  const capturado: string[] = [];
  const original = s.salida;
  s.salida = (t) => capturado.push(t);
  try {
    cmd.ejecutar(s, args, opc);
  } finally {
    s.salida = original;
  }
  const previo = redir.anadir && s.so.vfs.existe(redir.ruta) ? s.so.vfs.leer(redir.ruta) : "";
  s.so.vfs.escribir(redir.ruta, previo + capturado.join("\n") + "\n");
}

export const terminal: AppDef = {
  id: "terminal",
  nombre: "Terminal",
  icono: `<svg viewBox="0 0 48 48"><rect x="4" y="7" width="40" height="34" rx="5" fill="#0d0b1e" stroke="#6fd08c" stroke-width="2.4"/><path d="M12 18l8 6-8 6" fill="none" stroke="#6fd08c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 31h12" stroke="#f7e26b" stroke-width="3" stroke-linecap="round"/></svg>`,
  ancho: 640,
  alto: 400,
  iniciar({ so, raiz }) {
    raiz.classList.add("term");
    raiz.innerHTML = `<div class="term-pantalla" tabindex="-1"></div>
      <form class="term-linea"><span class="term-prompt"></span><input autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Orden" /></form>`;
    const pantalla = raiz.querySelector<HTMLElement>(".term-pantalla")!;
    const form = raiz.querySelector<HTMLFormElement>(".term-linea")!;
    const entrada = form.querySelector("input")!;
    const prompt = form.querySelector<HTMLElement>(".term-prompt")!;

    const escribir: Salida = (texto, clase) => {
      const l = document.createElement("div");
      l.className = "term-sal" + (clase ? " " + clase : "");
      l.textContent = texto;
      pantalla.appendChild(l);
      pantalla.scrollTop = pantalla.scrollHeight;
    };
    const s: Sesion = {
      so,
      cwd: so.usuario.home,
      salida: escribir,
      limpiar: () => (pantalla.innerHTML = ""),
    };
    const pintarPrompt = () => {
      const corto = s.cwd === so.usuario.home ? "~" : s.cwd.startsWith(so.usuario.home + "/") ? "~" + s.cwd.slice(so.usuario.home.length) : s.cwd;
      prompt.textContent = `${so.usuario.nombre}@galileo:${corto}$ `;
    };
    pintarPrompt();
    escribir("OS Galileo 0.1 — escribe «help» para ver las órdenes.", "info");

    const historial: string[] = [];
    let pos = 0;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const linea = entrada.value;
      escribir(`${prompt.textContent}${linea}`, "info");
      entrada.value = "";
      if (linea.trim()) {
        historial.push(linea);
        pos = historial.length;
      }
      try {
        ejecutarLinea(s, linea);
      } catch (err) {
        escribir((err as Error).message, "error");
      }
      pintarPrompt();
    });
    entrada.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp" && pos > 0) {
        e.preventDefault();
        entrada.value = historial[--pos];
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        entrada.value = pos < historial.length - 1 ? historial[++pos] : ((pos = historial.length), "");
      } else if (e.key === "Tab") {
        e.preventDefault();
        // completa el último fragmento con archivos de la carpeta actual
        const m = entrada.value.match(/(\S*)$/)!;
        const frag = m[1];
        const cand = (() => {
          try {
            const dir = frag.includes("/") ? resolver(s, frag.slice(0, frag.lastIndexOf("/") + 1)) : s.cwd;
            const pref = frag.slice(frag.lastIndexOf("/") + 1);
            return so.vfs.listar(dir).filter((x) => x.nombre.startsWith(pref)).map((x) => x.nombre + (x.tipo === "dir" ? "/" : ""));
          } catch {
            return [];
          }
        })();
        if (cand.length === 1) entrada.value = entrada.value.slice(0, entrada.value.length - frag.length + frag.lastIndexOf("/") + 1) + cand[0];
        else if (cand.length > 1) escribir(cand.join("  "), "info");
      }
    });
    raiz.addEventListener("pointerdown", (e) => {
      if (!(e.target as HTMLElement).closest("input")) setTimeout(() => entrada.focus(), 0);
    });
    entrada.focus();
  },
};

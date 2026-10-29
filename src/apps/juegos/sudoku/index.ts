import type { AppDef } from "../../../kernel/kernel";
import { NIVELES, caja, generar, vecinas, type Nivel, type Partida, type Tamano } from "./generador";

const CLAVE_PARTIDA = "osg-sudoku-partida";
const CLAVE_ESTADISTICAS = "osg-sudoku-estadisticas";

interface Guardada {
  partida: Partida;
  /** lo que ha puesto la persona (0 = vacía) */
  entradas: number[];
  segundos: number;
  terminada: boolean;
}
interface Marca {
  ganadas: number;
  mejor: number;
  total: number;
}
type Estadisticas = Record<string, Marca>;

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
    /* sin almacenamiento: no se guarda */
  }
}

const tiempo = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export const sudoku: AppDef = {
  id: "sudoku",
  nombre: "Sudoku",
  carpeta: "Juegos",
  icono: `<svg viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="5" fill="#fff" stroke="#2a1770" stroke-width="2.5"/><path d="M17.3 4v40M30.7 4v40M4 17.3h40M4 30.7h40" stroke="#2a1770" stroke-width="1.6"/><g font-family="Segoe UI, sans-serif" font-weight="700" font-size="11" fill="#2a1770" text-anchor="middle"><text x="11" y="14">5</text><text x="24" y="27">3</text><text x="37" y="40">9</text></g><g font-family="Segoe UI, sans-serif" font-weight="700" font-size="11" fill="#da251c" text-anchor="middle"><text x="37" y="14">7</text><text x="11" y="40">2</text></g></svg>`,
  ancho: 520,
  alto: 700,
  iniciar({ ventana, raiz }) {
    raiz.classList.add("sdk");
    raiz.tabIndex = 0;
    raiz.innerHTML = `
      <div class="sdk-barra">
        <label>Tamaño <select data-s="tamano"><option value="4">4 × 4</option><option value="9" selected>9 × 9</option></select></label>
        <label>Nivel <select data-s="nivel">${NIVELES.map((n) => `<option value="${n.id}">${n.nombre}</option>`).join("")}</select></label>
        <button data-s="nueva" class="sdk-primario">Nueva partida</button>
        <button data-s="stats" aria-pressed="false">📊</button>
      </div>
      <div class="sdk-info"><span class="sdk-reloj">0:00</span><span class="sdk-mensaje"></span></div>
      <div class="sdk-zona"><div class="sdk-tablero" role="grid" aria-label="Tablero de Sudoku"></div></div>
      <div class="sdk-teclado"></div>
      <div class="sdk-acciones">
        <button data-s="deshacer">↶ Deshacer</button><button data-s="rehacer">↷ Rehacer</button>
        <button data-s="comprobar">✔ Comprobar</button>
        <label class="sdk-opcion"><input type="checkbox" data-s="errores" checked /> Marcar repetidos</label>
      </div>
      <div class="sdk-stats" hidden></div>`;
    const q = <T extends HTMLElement>(s: string) => raiz.querySelector<T>(s)!;
    const tablero = q(".sdk-tablero");
    const teclado = q(".sdk-teclado");
    const reloj = q(".sdk-reloj");
    const mensaje = q(".sdk-mensaje");
    const panelStats = q(".sdk-stats");
    const selTamano = q<HTMLSelectElement>('[data-s="tamano"]');
    const selNivel = q<HTMLSelectElement>('[data-s="nivel"]');
    const casErrores = q<HTMLInputElement>('[data-s="errores"]');

    let juego: Guardada | null = null;
    let sel = -1;
    let deshacer: { i: number; antes: number; despues: number }[] = [];
    let rehacer: typeof deshacer = [];
    let malas = new Set<number>();
    let vec: number[][] = [];
    let celdas: HTMLButtonElement[] = [];

    // ---------- partida ----------
    function empezar(p: Partida, previa?: Guardada): void {
      juego = previa ?? { partida: p, entradas: p.puzzle.map(() => 0), segundos: 0, terminada: false };
      vec = vecinas(p.n);
      sel = -1;
      deshacer = [];
      rehacer = [];
      malas = new Set();
      reloj.textContent = tiempo(juego.segundos);
      selTamano.value = String(p.n);
      selNivel.value = p.nivel;
      construir();
      pintar();
      avisar(juego.terminada ? "¡Resuelto!" : "");
      guardar(CLAVE_PARTIDA, juego);
    }

    function nueva(): void {
      const n = Number(selTamano.value) as Tamano;
      const nivel = selNivel.value as Nivel;
      mensaje.textContent = "Creando tablero…";
      // se cede el turno al navegador para que pinte el aviso antes de generar
      setTimeout(() => empezar(generar(n, nivel)), 20);
    }

    const valor = (i: number) => juego!.partida.puzzle[i] || juego!.entradas[i];
    const esDada = (i: number) => juego!.partida.puzzle[i] !== 0;

    // ---------- tablero ----------
    function construir(): void {
      const p = juego!.partida;
      const n = p.n;
      const [br, bc] = caja(n);
      tablero.style.setProperty("--n", String(n));
      tablero.dataset.n = String(n);
      tablero.innerHTML = "";
      celdas = [];
      for (let i = 0; i < n * n; i++) {
        const f = Math.floor(i / n), c = i % n;
        const b = document.createElement("button");
        b.className = "sdk-celda";
        b.dataset.i = String(i);
        b.setAttribute("role", "gridcell");
        if ((c + 1) % bc === 0 && c < n - 1) b.classList.add("caja-d");
        if ((f + 1) % br === 0 && f < n - 1) b.classList.add("caja-b");
        tablero.appendChild(b);
        celdas.push(b);
      }
      const t = [];
      for (let v = 1; v <= n; v++) t.push(`<button data-v="${v}">${v}</button>`);
      t.push(`<button data-v="0" aria-label="Borrar" class="borrar">⌫</button>`);
      teclado.innerHTML = t.join("");
      teclado.style.setProperty("--k", String(n + 1));
    }

    /** repeticiones: casillas con otra igual en su fila, columna o caja */
    function repetidas(): Set<number> {
      const r = new Set<number>();
      for (let i = 0; i < celdas.length; i++) {
        const v = valor(i);
        if (v && vec[i].some((j) => valor(j) === v)) r.add(i);
      }
      return r;
    }

    function pintar(): void {
      if (!juego) return;
      const rep = casErrores.checked ? repetidas() : new Set<number>();
      const vsel = sel >= 0 ? valor(sel) : 0;
      celdas.forEach((b, i) => {
        const v = valor(i);
        b.textContent = v ? String(v) : "";
        b.classList.toggle("dada", esDada(i));
        b.classList.toggle("sel", i === sel);
        b.classList.toggle("rel", sel >= 0 && i !== sel && vec[sel].includes(i));
        b.classList.toggle("igual", !!vsel && v === vsel && i !== sel);
        b.classList.toggle("repe", rep.has(i) && !esDada(i));
        b.classList.toggle("mala", malas.has(i));
        b.setAttribute("aria-label", `Fila ${Math.floor(i / juego!.partida.n) + 1}, columna ${(i % juego!.partida.n) + 1}: ${v || "vacía"}`);
      });
      q('[data-s="deshacer"]').toggleAttribute("disabled", !deshacer.length);
      q('[data-s="rehacer"]').toggleAttribute("disabled", !rehacer.length);
      ventana.fijarTitulo(`Sudoku ${juego.partida.n}×${juego.partida.n} · ${NIVELES.find((x) => x.id === juego!.partida.nivel)!.nombre}`);
    }

    function avisar(t: string, clase = ""): void {
      mensaje.textContent = t;
      mensaje.className = `sdk-mensaje ${clase}`;
    }

    // ---------- jugadas ----------
    function poner(i: number, v: number, registrar = true): void {
      if (!juego || juego.terminada || esDada(i)) return;
      const antes = juego.entradas[i];
      if (antes === v) return;
      juego.entradas[i] = v;
      if (registrar) {
        deshacer.push({ i, antes, despues: v });
        rehacer = [];
      }
      malas.clear();
      avisar("");
      pintar();
      guardar(CLAVE_PARTIDA, juego);
      comprobarFin();
    }

    function comprobarFin(): void {
      if (!juego || juego.terminada) return;
      const p = juego.partida;
      if (p.solucion.every((v, i) => valor(i) === v)) {
        juego.terminada = true;
        guardar(CLAVE_PARTIDA, juego);
        const e = leer<Estadisticas>(CLAVE_ESTADISTICAS, {});
        const k = `${p.n}-${p.nivel}`;
        const m = (e[k] ??= { ganadas: 0, mejor: 0, total: 0 });
        m.ganadas++;
        m.total += juego.segundos;
        const record = m.mejor === 0 || juego.segundos < m.mejor;
        if (record) m.mejor = juego.segundos;
        guardar(CLAVE_ESTADISTICAS, e);
        avisar(`🎉 ¡Resuelto en ${tiempo(juego.segundos)}!${record && m.ganadas > 1 ? " Nuevo récord." : ""}`, "ok");
        pintarStats();
      }
    }

    function deshacerJugada(): void {
      const j = deshacer.pop();
      if (!j || !juego || juego.terminada) return;
      juego.entradas[j.i] = j.antes;
      rehacer.push(j);
      sel = j.i;
      malas.clear();
      pintar();
      guardar(CLAVE_PARTIDA, juego);
    }
    function rehacerJugada(): void {
      const j = rehacer.pop();
      if (!j || !juego || juego.terminada) return;
      juego.entradas[j.i] = j.despues;
      deshacer.push(j);
      sel = j.i;
      malas.clear();
      pintar();
      guardar(CLAVE_PARTIDA, juego);
      comprobarFin();
    }

    /** marca las casillas puestas por la persona que no coinciden con la solución */
    function comprobar(): void {
      if (!juego || juego.terminada) return;
      malas = new Set(juego.entradas.map((v, i) => (v && v !== juego!.partida.solucion[i] ? i : -1)).filter((i) => i >= 0));
      pintar();
      if (malas.size) avisar(`${malas.size} casilla${malas.size === 1 ? "" : "s"} mal. Se quitan al cambiarlas.`, "mal");
      else avisar("Todo lo que has puesto está bien hasta ahora.", "ok");
    }

    // ---------- estadísticas ----------
    function pintarStats(): void {
      const e = leer<Estadisticas>(CLAVE_ESTADISTICAS, {});
      const filas = ([4, 9] as Tamano[])
        .flatMap((n) =>
          NIVELES.map((nv) => {
            const m = e[`${n}-${nv.id}`];
            return `<tr><th>${n}×${n}</th><td>${nv.nombre}</td><td>${m?.ganadas ?? 0}</td><td>${m ? tiempo(m.mejor) : "—"}</td><td>${m ? tiempo(Math.round(m.total / m.ganadas)) : "—"}</td></tr>`;
          }),
        )
        .join("");
      panelStats.innerHTML = `<table><thead><tr><th>Tablero</th><th>Nivel</th><th>Ganadas</th><th>Mejor</th><th>Media</th></tr></thead><tbody>${filas}</tbody></table>`;
    }

    // ---------- eventos ----------
    tablero.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>(".sdk-celda");
      if (!b) return;
      sel = Number(b.dataset.i);
      pintar();
      raiz.focus();
    });
    teclado.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>("button");
      if (b && sel >= 0) poner(sel, Number(b.dataset.v));
    });
    raiz.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>("[data-s]");
      if (!b) return;
      switch (b.dataset.s) {
        case "nueva": return nueva();
        case "deshacer": return deshacerJugada();
        case "rehacer": return rehacerJugada();
        case "comprobar": return comprobar();
        case "errores": return pintar();
        case "stats": {
          const abierto = panelStats.hidden;
          panelStats.hidden = !abierto;
          b.setAttribute("aria-pressed", String(abierto));
          if (abierto) pintarStats();
        }
      }
    });
    raiz.addEventListener("keydown", (e) => {
      if (!juego) return;
      const n = juego.partida.n;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        return e.shiftKey ? rehacerJugada() : deshacerJugada();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        return rehacerJugada();
      }
      if ((e.target as HTMLElement).tagName === "SELECT") return;
      const mover: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -n, ArrowDown: n };
      if (e.key in mover) {
        e.preventDefault();
        const destino = sel < 0 ? 0 : sel + mover[e.key];
        const col = sel % n;
        if (destino >= 0 && destino < n * n && !(e.key === "ArrowLeft" && col === 0) && !(e.key === "ArrowRight" && col === n - 1)) {
          sel = destino;
          pintar();
        }
      } else if (sel >= 0 && /^[1-9]$/.test(e.key) && Number(e.key) <= n) poner(sel, Number(e.key));
      else if (sel >= 0 && ["0", "Backspace", "Delete"].includes(e.key)) {
        e.preventDefault();
        poner(sel, 0);
      }
    });
    selTamano.addEventListener("change", nueva);
    selNivel.addEventListener("change", nueva);

    // ---------- reloj ----------
    const id = window.setInterval(() => {
      if (!juego || juego.terminada) return;
      juego.segundos++;
      reloj.textContent = tiempo(juego.segundos);
      if (juego.segundos % 5 === 0) guardar(CLAVE_PARTIDA, juego);
    }, 1000);

    // ---------- arranque: continúa la partida guardada o crea una ----------
    const previa = leer<Guardada | null>(CLAVE_PARTIDA, null);
    if (previa?.partida?.puzzle?.length && !previa.terminada) {
      empezar(previa.partida, previa);
      reloj.textContent = tiempo(previa.segundos);
      avisar("Partida recuperada");
    } else nueva();
    pintarStats();
    raiz.focus();
    return () => {
      window.clearInterval(id);
      if (juego) guardar(CLAVE_PARTIDA, juego);
    };
  },
};

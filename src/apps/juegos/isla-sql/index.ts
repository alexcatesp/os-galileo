import type { AppDef } from "../../../kernel/kernel";
import type { Database, SqlJsStatic } from "sql.js";
import { escena, retrato } from "./escenas";
import { ISLA } from "./isla";
import { cargarSql, consultar, crearMundo, type Celda, type Resultado } from "./motor";
import { comprobar, probar, type Veredicto } from "./partida";
import { NOMBRES, type Mision } from "./tipos";

const CLAVE = "osg-isla-sql";
const MAX_FILAS = 100;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

interface Avance {
  hechas: Record<string, { ayuda: boolean; sql?: string }>;
  actual: string;
  /** capítulos cuya presentación ya se ha visto */
  vistos: number[];
}

function cargarAvance(): Avance {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE) ?? "null") as Avance | null;
    if (v?.hechas) return v;
  } catch {
    /* sin datos guardados */
  }
  return { hechas: {}, actual: ISLA.misiones[0].id, vistos: [] };
}
function guardarAvance(a: Avance): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(a));
  } catch {
    /* sin almacenamiento */
  }
}

function celda(v: Celda): string {
  if (v === null) return `<i class="nulo">NULL</i>`;
  if (typeof v === "number") return String(Number.isInteger(v) ? v : Number(v.toFixed(4)));
  if (v instanceof Uint8Array) return "[bytes]";
  return esc(v);
}

function tabla(r: Resultado): string {
  const filas = r.filas.slice(0, MAX_FILAS);
  return `<div class="isla-tabla"><table><thead><tr>${r.columnas.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${filas
    .map((f) => `<tr>${f.map((v) => `<td class="${typeof v === "number" ? "num" : ""}">${celda(v)}</td>`).join("")}</tr>`)
    .join("")}</tbody></table></div><p class="isla-nota">${r.filas.length} fila${r.filas.length === 1 ? "" : "s"}${r.filas.length > MAX_FILAS ? ` (se muestran ${MAX_FILAS})` : ""}</p>`;
}

export const islaSql: AppDef = {
  id: "isla-sql",
  nombre: "La isla de los datos",
  carpeta: "Juegos",
  icono: `<svg viewBox="0 0 48 48"><rect x="3" y="3" width="42" height="42" rx="8" fill="#8fd3ff"/><path d="M3 30q10 -6 20 0t22 -2v17H3z" fill="#2aa8d8"/><ellipse cx="24" cy="33" rx="15" ry="6" fill="#f3d58a"/><path d="M24 33q-2 -10 3 -17" stroke="#7b5a33" stroke-width="2.5" fill="none"/><g fill="#2f9d4a"><ellipse cx="27" cy="15" rx="8" ry="2.6" transform="rotate(-20 27 15)"/><ellipse cx="27" cy="15" rx="8" ry="2.6" transform="rotate(35 27 15)"/></g><circle cx="38" cy="11" r="4" fill="#ffd54a"/><g font-family="Consolas, monospace" font-weight="700" font-size="7" fill="#2a1770"><text x="8" y="14">SQL</text></g></svg>`,
  ancho: 760,
  alto: 780,
  iniciar({ ventana, raiz }) {
    raiz.classList.add("isla");
    raiz.innerHTML = `<p class="isla-carga">Cargando el Libro de la isla…</p>`;
    const ep = ISLA;
    let av = cargarAvance();
    let SQL: SqlJsStatic;
    let db: Database;
    let fallos = 0;
    let pistasVistas = 0;
    let solucionVista = false;

    const jugadasHechas = () => ep.misiones.filter((m) => m.tipo === "modifica" && av.hechas[m.id]?.sql).map((m) => av.hechas[m.id].sql!);
    const primeraPendiente = () => {
      const i = ep.misiones.findIndex((m) => !av.hechas[m.id]);
      return i < 0 ? ep.misiones.length : i;
    };
    const indiceActual = () => Math.max(0, ep.misiones.findIndex((m) => m.id === av.actual));
    const mision = (): Mision => ep.misiones[indiceActual()];
    const capitulo = (m = mision()) => ep.capitulos.find((c) => c.id === m.capitulo)!;
    const hecha = (m = mision()) => !!av.hechas[m.id];

    function reconstruir(): void {
      db?.close();
      db = crearMundo(SQL, ep.semilla, jugadasHechas());
    }

    // ---------- estructura ----------
    function esqueleto(): void {
      raiz.innerHTML = `
        <div class="isla-escena"></div>
        <div class="isla-dialogo"></div>
        <div class="isla-panel">
          <textarea class="isla-sql" spellcheck="false" autocomplete="off" aria-label="Consulta SQL" placeholder="Escribe aquí tu SQL…  (Ctrl + Intro para probar)"></textarea>
          <div class="isla-botones">
            <button data-i="probar" title="Ejecuta sin guardar cambios (Ctrl+Intro)">▶ Probar</button>
            <button data-i="comprobar" class="isla-primario">✓ Comprobar</button>
            <button data-i="pista">💡 Pista</button>
            <button data-i="solucion" hidden>👁 Ver la solución</button>
          </div>
          <div class="isla-ayudas"></div>
          <div class="isla-resultado"></div>
        </div>
        <div class="isla-barra">
          <button data-i="ant" aria-label="Misión anterior">◀</button>
          <select data-i="ir" aria-label="Ir a una misión"></select>
          <button data-i="sig" aria-label="Misión siguiente">▶</button>
          <span class="isla-espacio"></span>
          <button data-i="chuleta">📋 Chuleta</button><button data-i="mapa">🗺 Mapa de datos</button><button data-i="menu">⚙</button>
        </div>
        <div class="isla-modal" hidden></div>`;
    }
    const q = <T extends HTMLElement>(s: string) => raiz.querySelector<T>(s)!;

    // ---------- pintar ----------
    function pintar(): void {
      const m = mision();
      const c = capitulo(m);
      q(".isla-escena").innerHTML = `${escena(c.escena, m.personaje)}<div class="isla-capitulo">Capítulo ${c.id} · ${esc(c.titulo)} <small>${esc(c.tema)}</small></div>`;
      pintarDialogo(m);
      const sel = q<HTMLSelectElement>('[data-i="ir"]');
      const limite = primeraPendiente();
      sel.innerHTML = ep.capitulos
        .map(
          (cap) =>
            `<optgroup label="Cap. ${cap.id} · ${esc(cap.titulo)}">${ep.misiones
              .map((x, i) => ({ x, i }))
              .filter(({ x }) => x.capitulo === cap.id)
              .map(({ x, i }) => `<option value="${x.id}" ${i > limite ? "disabled" : ""}>${hecha(x) ? "✓ " : ""}Misión ${x.id}</option>`)
              .join("")}</optgroup>`,
        )
        .join("");
      sel.value = m.id;
      q('[data-i="ant"]').toggleAttribute("disabled", indiceActual() === 0);
      q('[data-i="sig"]').toggleAttribute("disabled", indiceActual() >= Math.min(limite, ep.misiones.length - 1));
      q('[data-i="solucion"]').hidden = !(fallos >= 3 && !hecha(m));
      q('[data-i="comprobar"]').toggleAttribute("disabled", hecha(m) && m.tipo === "modifica");
      ventana.fijarTitulo(`La isla de los datos · Misión ${m.id} (${Object.keys(av.hechas).length}/${ep.misiones.length})`);
    }

    function pintarDialogo(m: Mision, texto?: string): void {
      q(".isla-dialogo").innerHTML = `
        <div class="isla-retrato">${retrato(m.personaje)}</div>
        <div class="isla-texto">
          <b>${NOMBRES[m.personaje]}</b>${hecha(m) ? ` <span class="isla-hecha">✓ resuelta${av.hechas[m.id].ayuda ? " con ayuda" : ""}</span>` : ""}
          <p>${esc(texto ?? m.historia)}</p>
          <p class="isla-reto">🎯 ${esc(m.reto)}</p>
        </div>`;
    }

    function limpiarMision(): void {
      fallos = 0;
      pistasVistas = 0;
      solucionVista = false;
      q(".isla-ayudas").innerHTML = "";
      q(".isla-resultado").innerHTML = "";
      const m = mision();
      q<HTMLTextAreaElement>(".isla-sql").value = m.tipo === "modifica" ? (av.hechas[m.id]?.sql ?? "") : "";
    }

    function ir(id: string): void {
      av.actual = id;
      guardarAvance(av);
      limpiarMision();
      pintar();
      presentarCapitulo();
    }

    /** la primera vez que se entra en un capítulo se enseña su presentación */
    function presentarCapitulo(): void {
      const c = capitulo();
      if (av.vistos.includes(c.id)) return;
      av.vistos.push(c.id);
      guardarAvance(av);
      const m: Mision = { ...mision(), personaje: c.intro.personaje };
      modal(`
        <div class="isla-intro">${escena(c.escena, c.intro.personaje)}</div>
        <h3>Capítulo ${c.id} · ${esc(c.titulo)}</h3>
        <div class="isla-dialogo en-modal"><div class="isla-retrato">${retrato(m.personaje)}</div><div class="isla-texto"><b>${NOMBRES[m.personaje]}</b><p>${esc(c.intro.texto)}</p></div></div>
        <button class="isla-primario" data-i="cerrar">Empezar</button>`);
    }

    // ---------- modal ----------
    function modal(html: string): void {
      const m = q(".isla-modal");
      m.hidden = false;
      m.innerHTML = `<div class="isla-caja">${html}</div>`;
    }
    const cerrarModal = () => (q(".isla-modal").hidden = true);

    // ---------- resultados ----------
    function mostrar(v: Veredicto, modo: "probar" | "comprobar"): void {
      const r = q(".isla-resultado");
      if (v.error) {
        r.innerHTML = `<div class="isla-error">⚠ ${esc(v.error)}</div>`;
        return;
      }
      let html = "";
      if (modo === "comprobar") {
        html += v.ok
          ? `<div class="isla-ok">✓ ¡Correcto!</div>`
          : `<div class="isla-mal">✗ ${esc(v.motivo ?? "No es lo que se pedía.")}${fallos >= 3 ? " Si te atascas, puedes ver la solución." : ""}</div>`;
      } else if (v.modificadas) {
        html += `<div class="isla-info">Prueba: se modificarían ${v.modificadas} fila${v.modificadas === 1 ? "" : "s"}. No se ha guardado nada: pulsa <b>Comprobar</b> para aplicarlo.</div>`;
      }
      if (v.resultado) html += tabla(v.resultado);
      else if (!v.modificadas && modo === "probar") html += `<div class="isla-info">La sentencia se ha ejecutado y no devuelve filas.</div>`;
      r.innerHTML = html;
    }

    function ejecutarProbar(): void {
      const sql = q<HTMLTextAreaElement>(".isla-sql").value;
      mostrar(probar(db, sql), "probar");
    }

    function ejecutarComprobar(): void {
      const m = mision();
      const sql = q<HTMLTextAreaElement>(".isla-sql").value;
      if (!sql.trim()) return mostrar({ ok: false, error: "Escribe una consulta primero." }, "comprobar");
      const v = comprobar(SQL, ep, m, db, jugadasHechas(), sql);
      if (v.error) return mostrar(v, "comprobar");
      if (!v.ok) {
        fallos++;
        mostrar(v, "comprobar");
        q('[data-i="solucion"]').hidden = !(fallos >= 3);
        return;
      }
      // acierto
      const nueva = !hecha(m);
      if (nueva) av.hechas[m.id] = { ayuda: solucionVista || pistasVistas >= m.pistas.length, sql: m.tipo === "modifica" ? sql : undefined };
      guardarAvance(av);
      const codigo = m.exito.includes("{codigo}") && v.resultado?.filas[0] ? String(Math.round(Number(v.resultado.filas[0][0]) * 100) / 100) : "";
      mostrar(v, "comprobar");
      pintar();
      pintarDialogo(m, m.exito.replace("{codigo}", codigo));
      const fin = ep.misiones.every((x) => av.hechas[x.id]);
      q(".isla-resultado").insertAdjacentHTML(
        "beforeend",
        fin && nueva
          ? `<button class="isla-primario" data-i="fin">🎉 Terminar la aventura</button>`
          : indiceActual() < ep.misiones.length - 1
            ? `<button class="isla-primario" data-i="sig">Siguiente misión ▸</button>`
            : "",
      );
      if (fin && nueva) setTimeout(final, 0);
    }

    function final(): void {
      const ayudas = Object.values(av.hechas).filter((x) => x.ayuda).length;
      modal(`
        <div class="isla-intro">${escena("observatorio", "irene")}</div>
        <h3>🎉 ¡Has escapado de la isla!</h3>
        <p>Completaste las <b>${ep.misiones.length} misiones</b>${ayudas ? `, ${ayudas} de ellas con alguna ayuda` : " sin ninguna ayuda"}. Has aprendido a consultar, filtrar, ordenar, agrupar, combinar tablas, modificar datos y crear tus propias tablas.</p>
        <p class="isla-nota">Pronto habrá nuevos episodios. Mientras tanto, puedes repasar cualquier misión desde el selector.</p>
        <button class="isla-primario" data-i="cerrar">Seguir en la isla</button>`);
    }

    // ---------- pistas y solución ----------
    function pista(): void {
      const m = mision();
      if (pistasVistas < m.pistas.length) pistasVistas++;
      q(".isla-ayudas").innerHTML =
        m.pistas.slice(0, pistasVistas).map((p, i) => `<div class="isla-pista"><b>Pista ${i + 1}:</b> ${esc(p)}</div>`).join("") +
        (solucionVista ? `<div class="isla-solucion"><b>Solución:</b><pre>${esc(m.solucion)}</pre><button data-i="copiar">Copiar al editor</button></div>` : "");
      if (pistasVistas >= m.pistas.length) q('[data-i="pista"]').setAttribute("disabled", "");
    }
    function verSolucion(): void {
      solucionVista = true;
      pista();
      q<HTMLElement>(".isla-ayudas").scrollIntoView({ block: "nearest" });
    }

    // ---------- chuleta, mapa y menú ----------
    function chuleta(): void {
      const c = capitulo();
      modal(`
        <h3>📋 Chuleta · ${esc(c.tema)}</h3>
        <ul class="isla-chuleta">${c.chuleta.map((l) => `<li><code>${esc(l)}</code></li>`).join("")}</ul>
        <p class="isla-nota">Aquí se usa SQLite. En PostgreSQL casi todo es igual; algunas diferencias: LIKE distingue mayúsculas (allí se usa ILIKE) y los tipos tienen otros nombres (SERIAL, VARCHAR…).</p>
        <button data-i="cerrar">Cerrar</button>`);
    }

    function mapa(): void {
      const tablas = consultar(db, "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")?.filas.map((f) => String(f[0])) ?? [];
      const bloques = tablas.map((t) => {
        const cols = consultar(db, `SELECT name, type, "notnull", pk FROM pragma_table_info('${t}') ORDER BY cid`)?.filas ?? [];
        const fks = new Map((consultar(db, `SELECT "from", "table", "to" FROM pragma_foreign_key_list('${t}')`)?.filas ?? []).map((f) => [String(f[0]), `${f[1]}.${f[2]}`]));
        const n = consultar(db, `SELECT COUNT(*) FROM "${t}"`)?.filas[0][0];
        return `<div class="isla-esq"><div class="isla-esq-cab"><b>${esc(t)}</b><span>${n} filas</span><button data-i="ver" data-t="${esc(t)}">Ver datos</button></div><ul>${cols
          .map(
            (c) =>
              `<li><code>${esc(String(c[0]))}</code> <small>${esc(String(c[1]))}${c[3] ? " · 🔑 clave primaria" : ""}${c[2] ? " · obligatoria" : ""}${fks.has(String(c[0])) ? ` · ↗ apunta a ${esc(fks.get(String(c[0]))!)}` : ""}</small></li>`,
          )
          .join("")}</ul></div>`;
      });
      modal(`<h3>🗺 Mapa de datos</h3><p class="isla-nota">Las tablas que forman el Gran Libro de la isla.</p>${bloques.join("")}<button data-i="cerrar">Cerrar</button>`);
    }

    function menu(): void {
      modal(`
        <h3>⚙ Opciones</h3>
        <p><button data-i="reiniciar-isla">↺ Reiniciar la isla</button><br><small>Los datos vuelven a su estado inicial y se rehacen tus cambios ya aceptados. Tu progreso se conserva.</small></p>
        <p><button class="peligro" data-i="borrar-todo">🗑 Empezar la aventura desde cero</button><br><small>Borra todo tu progreso.</small></p>
        <button data-i="cerrar">Cerrar</button>`);
    }

    // ---------- eventos ----------
    raiz.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>("[data-i]");
      if (!b || !SQL) return;
      switch (b.dataset.i) {
        case "probar": return ejecutarProbar();
        case "comprobar": return ejecutarComprobar();
        case "pista": return pista();
        case "solucion": return verSolucion();
        case "copiar": q<HTMLTextAreaElement>(".isla-sql").value = mision().solucion; return;
        case "ant": return ir(ep.misiones[Math.max(0, indiceActual() - 1)].id);
        case "sig": return ir(ep.misiones[Math.min(ep.misiones.length - 1, indiceActual() + 1)].id);
        case "chuleta": return chuleta();
        case "mapa": return mapa();
        case "menu": return menu();
        case "cerrar": return cerrarModal();
        case "fin": return final();
        case "ver": {
          cerrarModal();
          q<HTMLTextAreaElement>(".isla-sql").value = `SELECT * FROM ${b.dataset.t};`;
          return ejecutarProbar();
        }
        case "reiniciar-isla":
          reconstruir();
          cerrarModal();
          q(".isla-resultado").innerHTML = `<div class="isla-info">La isla ha vuelto a su estado inicial (con tus cambios ya aceptados).</div>`;
          return;
        case "borrar-todo":
          av = { hechas: {}, actual: ep.misiones[0].id, vistos: [] };
          guardarAvance(av);
          reconstruir();
          cerrarModal();
          limpiarMision();
          pintar();
          presentarCapitulo();
      }
    });
    raiz.addEventListener("change", (e) => {
      const s = e.target as HTMLSelectElement;
      if (s.dataset.i === "ir") ir(s.value);
    });
    raiz.addEventListener("keydown", (e) => {
      const t = e.target as HTMLElement;
      if (!t.classList.contains("isla-sql")) return;
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        ejecutarProbar();
      } else if (e.key === "Tab") {
        e.preventDefault();
        const ta = t as HTMLTextAreaElement;
        ta.setRangeText("  ", ta.selectionStart, ta.selectionEnd, "end");
      }
    });

    // ---------- arranque ----------
    cargarSql()
      .then((sql) => {
        SQL = sql;
        // al volver se retoma la primera misión pendiente (y no se salta nada de lo anterior)
        av.actual = ep.misiones[Math.min(primeraPendiente(), ep.misiones.length - 1)].id;
        reconstruir();
        esqueleto();
        limpiarMision();
        pintar();
        presentarCapitulo();
      })
      .catch((err: Error) => {
        raiz.innerHTML = `<p class="isla-carga">No se pudo cargar el motor SQL: ${esc(err.message)}. Comprueba la conexión y vuelve a abrir el juego.</p>`;
      });
    return () => db?.close();
  },
};

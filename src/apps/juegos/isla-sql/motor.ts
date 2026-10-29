// Motor SQL de «Isla de los datos»: SQLite real (sql.js) cargado solo al abrir el juego,
// creación del mundo, ejecución segura de lo que escribe el alumno y comparación de resultados.

import type { Database, QueryExecResult, SqlJsStatic } from "sql.js";

declare global {
  interface Window {
    initSqlJs?: (config: { locateFile: (f: string) => string }) => Promise<SqlJsStatic>;
  }
}

let cargando: Promise<SqlJsStatic> | null = null;

function cargarScript(src: string): Promise<void> {
  return new Promise((ok, mal) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => ok();
    s.onerror = () => mal(new Error("No se pudo cargar el motor SQL"));
    document.head.appendChild(s);
  });
}

/** Carga sql.js una sola vez (ruta relativa a la página, para publicarlo en cualquier carpeta) */
export function cargarSql(base = "./sql/"): Promise<SqlJsStatic> {
  cargando ??= (async () => {
    if (!window.initSqlJs) await cargarScript(`${base}sql-wasm.js`);
    return window.initSqlJs!({ locateFile: (f) => `${base}${f}` });
  })();
  return cargando;
}

export type Celda = number | string | Uint8Array | null;
export interface Resultado {
  columnas: string[];
  filas: Celda[][];
}

/**
 * Capa de compatibilidad con MySQL (el SGBD del módulo): el motor es SQLite, pero lo que se escribe como en MySQL
 * se entiende. Convierte AUTO_INCREMENT, ENGINE=…, UNSIGNED, ENUM, NOW(), IF(), SHOW TABLES, DESCRIBE y USE.
 * Los textos entre comillas simples no se tocan.
 */
export function traducirMySql(sql: string): string {
  const t = sql.trim().replace(/;+\s*$/, "");
  let m: RegExpMatchArray | null;
  if (/^SHOW\s+(?:FULL\s+)?TABLES$/i.test(t)) {
    return "SELECT name AS Tables_in_isla FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name;";
  }
  if ((m = t.match(/^(?:DESCRIBE|DESC|EXPLAIN|SHOW\s+(?:FULL\s+)?COLUMNS\s+FROM)\s+`?(\w+)`?$/i))) {
    return `SELECT name AS Field, CASE WHEN UPPER(type) = 'INTEGER' THEN 'int' WHEN UPPER(type) = 'TEXT' THEN 'varchar(255)' WHEN UPPER(type) = 'REAL' THEN 'double' ELSE LOWER(type) END AS Type, CASE WHEN "notnull" OR pk THEN 'NO' ELSE 'YES' END AS "Null", CASE WHEN pk THEN 'PRI' ELSE '' END AS "Key", dflt_value AS "Default", CASE WHEN pk AND UPPER(type) = 'INTEGER' THEN 'auto_increment' ELSE '' END AS Extra FROM pragma_table_info('${m[1]}') ORDER BY cid;`;
  }
  if (/^USE\s+`?\w+`?$/i.test(t)) return "SELECT 'Database changed' AS Aviso;";

  // se protegen los textos entre comillas simples
  const textos: string[] = [];
  let x = sql.replace(/'(?:[^']|'')*'/g, (s) => {
    textos.push(s);
    return `\u0001${textos.length - 1}\u0002`;
  });
  // opciones de tabla: ENGINE=InnoDB, DEFAULT CHARSET=utf8mb4, COLLATE=…, AUTO_INCREMENT=100
  x = x.replace(/\b(?:ENGINE|DEFAULT\s+CHARSET|DEFAULT\s+CHARACTER\s+SET|CHARACTER\s+SET|CHARSET|COLLATE|ROW_FORMAT)\s*=\s*\w+/gi, "");
  x = x.replace(/\bAUTO_INCREMENT\s*=\s*\d+/gi, "");
  x = x.replace(/\s+UNSIGNED\b/gi, "");
  // columna entera con AUTO_INCREMENT → clave de SQLite que se numera sola
  const claves: string[] = [];
  const entero = "(?:TINYINT|SMALLINT|MEDIUMINT|BIGINT|INT|INTEGER)(?:\\(\\d+\\))?";
  x = x.replace(new RegExp(`([\`"]?\\w+[\`"]?)\\s+${entero}(?:\\s+NOT\\s+NULL)?\\s+(?:PRIMARY\\s+KEY\\s+AUTO_INCREMENT|AUTO_INCREMENT(?:\\s+PRIMARY\\s+KEY)?)`, "gi"), (_, nombre: string) => {
    claves.push(nombre.replace(/[`"]/g, ""));
    return `${nombre} INTEGER PRIMARY KEY`;
  });
  x = x.replace(new RegExp(`([\`"]?\\w+[\`"]?)\\s+${entero}\\s+PRIMARY\\s+KEY`, "gi"), (_, nombre: string) => {
    claves.push(nombre.replace(/[`"]/g, ""));
    return `${nombre} INTEGER PRIMARY KEY`;
  });
  // si la clave ya está declarada en la columna, sobra la cláusula PRIMARY KEY (col) de la tabla
  for (const c of new Set(claves)) {
    x = x.replace(new RegExp(`\\s*,\\s*PRIMARY\\s+KEY\\s*\\(\\s*[\`"]?${c}[\`"]?\\s*\\)`, "gi"), "");
  }
  x = x.replace(/\bAUTO_INCREMENT\b/gi, "");
  x = x.replace(/\bENUM\s*\([^)]*\)/gi, "TEXT");
  x = x.replace(/\bNOW\s*\(\s*\)/gi, "datetime('now')").replace(/\bCURDATE\s*\(\s*\)/gi, "date('now')").replace(/\bCURRENT_TIMESTAMP\s*\(\s*\)/gi, "CURRENT_TIMESTAMP");
  x = x.replace(/\bIF\s*\(/gi, "IIF(");
  x = x.replace(/\bINSERT\s+IGNORE\b/gi, "INSERT OR IGNORE");
  x = x.replace(/\bTRUNCATE\s+(?:TABLE\s+)?(\w+)/gi, "DELETE FROM $1");
  return x.replace(/\u0001(\d+)\u0002/g, (_, i: string) => textos[Number(i)]);
}

/** Crea el mundo: el esquema y los datos del episodio, más las jugadas ya aceptadas (INSERT, UPDATE…) */
export function crearMundo(SQL: SqlJsStatic, semilla: string, jugadas: string[]): Database {
  const db = new SQL.Database();
  db.run("PRAGMA foreign_keys = ON;");
  db.run(semilla);
  for (const j of jugadas) db.run(traducirMySql(j));
  return db;
}

const PROHIBIDO = /\b(ATTACH|DETACH|PRAGMA|VACUUM|DROP|BEGIN|COMMIT|ROLLBACK|SAVEPOINT|RELEASE)\b/i;

/** Quita comentarios y textos entre comillas para buscar palabras prohibidas sin falsos positivos */
function sinTextos(sql: string): string {
  return sql.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/'(?:[^']|'')*'/g, "''");
}

export function revisarSql(sql: string): string | null {
  if (!sql.trim()) return "Escribe una consulta primero.";
  const m = sinTextos(sql).match(PROHIBIDO);
  return m ? `En este juego no se puede usar ${m[1].toUpperCase()}.` : null;
}

export interface Ejecucion {
  /** el último conjunto de resultados (null si la sentencia no devuelve filas) */
  resultado: Resultado | null;
  /** filas modificadas por INSERT, UPDATE o DELETE */
  modificadas: number;
  error: string | null;
}

/**
 * Ejecuta dentro de un punto de guardado. Con `conservar` los cambios se mantienen;
 * si no, se deshacen siempre (para probar sin estropear la isla).
 */
export function ejecutar(db: Database, sql: string, conservar: boolean): Ejecucion {
  const aviso = revisarSql(sql);
  if (aviso) return { resultado: null, modificadas: 0, error: aviso };
  db.run("SAVEPOINT intento;");
  try {
    const r: QueryExecResult[] = db.exec(traducirMySql(sql));
    const modificadas = db.getRowsModified();
    if (conservar) db.run("RELEASE intento;");
    else db.run("ROLLBACK TO intento; RELEASE intento;");
    const ultimo = r[r.length - 1];
    return { resultado: ultimo ? { columnas: ultimo.columns, filas: ultimo.values as Celda[][] } : null, modificadas, error: null };
  } catch (e) {
    try {
      db.run("ROLLBACK TO intento; RELEASE intento;");
    } catch {
      /* ya deshecho */
    }
    return { resultado: null, modificadas: 0, error: traducirError((e as Error).message) };
  }
}

/** Ejecuta una consulta propia del juego (sin las restricciones del alumno) y devuelve su resultado */
export function consultar(db: Database, sql: string): Resultado | null {
  const r = db.exec(traducirMySql(sql));
  const u = r[r.length - 1];
  return u ? { columnas: u.columns, filas: u.values as Celda[][] } : null;
}

function traducirError(m: string): string {
  const t = m.replace(/^Error:\s*/, "");
  if (/syntax error/i.test(t)) return `Error de sintaxis: ${t}. Revisa comas, paréntesis, comillas y el orden de las palabras.`;
  if (/no such table/i.test(t)) return `${t}. Mira el esquema de la isla (botón «Mapa de datos»).`;
  if (/no such column/i.test(t)) return `${t}. Comprueba el nombre de la columna en el esquema.`;
  if (/ambiguous column/i.test(t)) return `${t}. Usa el alias de la tabla delante: por ejemplo h.nombre.`;
  if (/FOREIGN KEY/i.test(t)) return `${t}. La fila a la que apuntas no existe.`;
  if (/NOT NULL/i.test(t)) return `${t}. Esa columna es obligatoria.`;
  return t;
}

// ---------- comparación ----------
function celda(v: Celda): string {
  if (v === null) return "∅";
  if (typeof v === "number") return String(Number(v.toFixed(3)));
  if (v instanceof Uint8Array) return "[bytes]";
  return v.trim();
}

export interface Comparacion {
  ok: boolean;
  motivo?: string;
}

export function comparar(tuyo: Resultado | null, esperado: Resultado | null, ordenado: boolean): Comparacion {
  if (!tuyo) return { ok: false, motivo: "Tu sentencia no devuelve ninguna fila: ¿has escrito un SELECT?" };
  if (!esperado) return { ok: true };
  if (tuyo.columnas.length !== esperado.columnas.length) {
    return { ok: false, motivo: `Pides ${tuyo.columnas.length} columna${tuyo.columnas.length === 1 ? "" : "s"} y la respuesta tiene ${esperado.columnas.length}.` };
  }
  const a = tuyo.filas.map((f) => f.map(celda).join("¦"));
  const b = esperado.filas.map((f) => f.map(celda).join("¦"));
  if (a.length !== b.length) return { ok: false, motivo: `Tu consulta devuelve ${a.length} fila${a.length === 1 ? "" : "s"} y se esperaban ${b.length}.` };
  const x = ordenado ? a : [...a].sort();
  const y = ordenado ? b : [...b].sort();
  if (x.some((v, i) => v !== y[i])) {
    return { ok: false, motivo: ordenado && [...a].sort().every((v, i) => v === [...b].sort()[i]) ? "Tienes los datos correctos, pero en otro orden." : "El número de filas y columnas es correcto, pero los datos no coinciden." };
  }
  return { ok: true };
}

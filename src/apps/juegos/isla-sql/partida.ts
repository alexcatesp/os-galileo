// Comprobación de una misión: sin interfaz, para poder probarla con SQLite real.

import type { Database, SqlJsStatic } from "sql.js";
import { comparar, consultar, crearMundo, ejecutar, traducirMySql, type Resultado } from "./motor";
import type { Episodio, Mision } from "./tipos";

export interface Veredicto {
  ok: boolean;
  motivo?: string;
  error?: string;
  /** lo que devolvió la sentencia del alumno (para enseñarlo) */
  resultado?: Resultado | null;
  modificadas?: number;
}

/** «Probar»: ejecuta sin guardar nada, para ver qué devuelve */
export function probar(db: Database, sql: string): Veredicto {
  const e = ejecutar(db, sql, false);
  if (e.error) return { ok: false, error: e.error };
  return { ok: true, resultado: e.resultado, modificadas: e.modificadas };
}

/**
 * «Comprobar». En una consulta se compara lo que devuelve con la respuesta de referencia sobre la isla actual.
 * En una misión que modifica, se prueba primero en una isla de ensayo (la isla actual rehecha desde cero)
 * y se compara con otra isla donde se ha aplicado la solución; solo si coinciden se aplica a la isla real.
 */
export function comprobar(SQL: SqlJsStatic, ep: Episodio, m: Mision, db: Database, jugadas: string[], sql: string): Veredicto {
  if (m.tipo === "consulta") {
    const e = ejecutar(db, sql, false);
    if (e.error) return { ok: false, error: e.error };
    const esperado = consultar(db, m.solucion);
    const c = comparar(e.resultado, esperado, !!m.ordenado);
    return { ok: c.ok, motivo: c.motivo, resultado: e.resultado };
  }

  const ensayo = crearMundo(SQL, ep.semilla, jugadas);
  const referencia = crearMundo(SQL, ep.semilla, jugadas);
  try {
    referencia.run(traducirMySql(m.solucion));
    const e = ejecutar(ensayo, sql, true);
    if (e.error) return { ok: false, error: e.error };
    for (const q of m.verificar ?? []) {
      const c = comparar(consultar(ensayo, q), consultar(referencia, q), true);
      if (!c.ok) {
        return {
          ok: false,
          motivo:
            e.modificadas === 0 && !/create/i.test(sql)
              ? "Tu sentencia no ha cambiado ninguna fila. Revisa la condición o los datos."
              : "Tu sentencia se ha ejecutado, pero la isla no ha quedado como se pedía. Revisa los valores y la condición.",
          resultado: e.resultado,
          modificadas: e.modificadas,
        };
      }
    }
    const real = ejecutar(db, sql, true);
    return { ok: !real.error, error: real.error ?? undefined, resultado: real.resultado, modificadas: real.modificadas };
  } finally {
    ensayo.close();
    referencia.close();
  }
}

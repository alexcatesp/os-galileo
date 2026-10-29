// Prueba automática de «La isla de los datos» con SQLite real: cada solución se acepta, las alternativas
// también, las respuestas incorrectas se rechazan y una sentencia que no hace nada no vale.
// Uso: npm run probar:isla

import initSqlJs from "sql.js";
import { ISLA } from "../src/apps/juegos/isla-sql/isla";
import { consultar, crearMundo } from "../src/apps/juegos/isla-sql/motor";
import { comprobar } from "../src/apps/juegos/isla-sql/partida";

async function main(): Promise<void> {
  const SQL = await (initSqlJs as unknown as (c: object) => Promise<never>)({ locateFile: (f: string) => `node_modules/sql.js/dist/${f}` });
  let jugadas: string[] = [];
  let incidencias = 0;
  let comprobaciones = 0;
  const mal = (m: string) => {
    incidencias++;
    console.log(`✗ ${m}`);
  };
  const isla = () => crearMundo(SQL, ISLA.semilla, jugadas);

  for (const m of ISLA.misiones) {
    comprobaciones++;
    const v = comprobar(SQL, ISLA, m, isla(), jugadas, m.solucion);
    if (!v.ok) {
      mal(`${m.id}: la solución no se acepta: ${v.error ?? v.motivo}`);
      continue;
    }
    for (const alt of m.alternativas ?? []) {
      comprobaciones++;
      const a = comprobar(SQL, ISLA, m, isla(), jugadas, alt);
      if (!a.ok) mal(`${m.id}: alternativa rechazada: ${alt} → ${a.error ?? a.motivo}`);
    }
    for (const inc of m.incorrectas ?? []) {
      comprobaciones++;
      if (comprobar(SQL, ISLA, m, isla(), jugadas, inc).ok) mal(`${m.id}: se acepta una respuesta incorrecta: ${inc}`);
    }
    comprobaciones++;
    if (comprobar(SQL, ISLA, m, isla(), jugadas, "SELECT 1;").ok) mal(`${m.id}: «SELECT 1;» se acepta`);
    if (m.tipo === "consulta") {
      const esperado = consultar(isla(), m.solucion);
      if (!esperado || !esperado.filas.length) mal(`${m.id}: la respuesta de referencia está vacía`);
    } else jugadas = [...jugadas, m.solucion];
  }
  const ultima = ISLA.misiones[ISLA.misiones.length - 1];
  console.log(`Código final del cofre: ${JSON.stringify(consultar(isla(), ultima.solucion)?.filas[0])}`);
  console.log(`Misiones: ${ISLA.misiones.length} · comprobaciones: ${comprobaciones} · incidencias: ${incidencias}`);
  if (incidencias) process.exit(1);
}

void main();

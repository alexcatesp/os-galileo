// Prueba automática de «La isla de los datos» con SQLite real: cada solución se acepta, las alternativas
// también, las respuestas incorrectas se rechazan y una sentencia que no hace nada no vale.
// Uso: npm run probar:isla

import initSqlJs from "sql.js";
import { ISLA } from "../src/apps/juegos/isla-sql/isla";
import { consultar, crearMundo, ejecutar } from "../src/apps/juegos/isla-sql/motor";
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
  // capa de compatibilidad MySQL: cada sentencia debe ejecutarse y devolver las filas esperadas (null = sin filas)
  const casos: [string, number | null][] = [
    ["SHOW TABLES;", 5],
    ["DESCRIBE habitante;", 6],
    ["DESC objeto", 6],
    ["USE isla;", 1],
    ["SELECT IF(edad > 30, 'mayor', 'joven') FROM habitante LIMIT 2;", 2],
    ["SELECT CONCAT(nombre, ' (', oficio, ')') FROM habitante LIMIT 2;", 2],
    ["SELECT NOW();", 1],
    ["SELECT CURDATE();", 1],
    ["CREATE TABLE t1 (id INT UNSIGNED NOT NULL AUTO_INCREMENT, nombre VARCHAR(20), PRIMARY KEY (id)) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4; INSERT INTO t1 (nombre) VALUES ('AUTO_INCREMENT'), ('b'); SELECT id, nombre FROM t1;", 2],
    ["CREATE TABLE t2 (`id` BIGINT AUTO_INCREMENT PRIMARY KEY, `tipo` ENUM('a','b'), precio DECIMAL(8,2)); INSERT INTO t2 (tipo, precio) VALUES ('a', 1.5); SELECT * FROM t2;", 1],
    ["INSERT IGNORE INTO aldea (id, nombre, zona) VALUES (1, 'Repetida', 'costa'); SELECT COUNT(*) FROM aldea;", 1],
  ];
  for (const [sql, filas] of casos) {
    comprobaciones++;
    const e = ejecutar(isla(), sql, false);
    if (e.error) mal(`MySQL: «${sql.slice(0, 60)}…» da error: ${e.error}`);
    else if (filas !== null && e.resultado?.filas.length !== filas) mal(`MySQL: «${sql.slice(0, 60)}…» devuelve ${e.resultado?.filas.length} filas y se esperaban ${filas}`);
  }
  const ultima = ISLA.misiones[ISLA.misiones.length - 1];
  console.log(`Código final del cofre: ${JSON.stringify(consultar(isla(), ultima.solucion)?.filas[0])}`);
  console.log(`Misiones: ${ISLA.misiones.length} · comprobaciones: ${comprobaciones} · incidencias: ${incidencias}`);
  if (incidencias) process.exit(1);
}

void main();

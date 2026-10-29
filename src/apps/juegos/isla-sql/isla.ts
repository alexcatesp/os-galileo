// Episodio 1 — «La isla de los datos». Historia y datos originales de OS Galileo.

import type { Episodio } from "./tipos";

const SEMILLA = `
CREATE TABLE aldea (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  zona TEXT NOT NULL
);
CREATE TABLE habitante (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  oficio TEXT,
  edad INTEGER,
  amistad INTEGER,
  aldea_id INTEGER REFERENCES aldea(id)
);
CREATE TABLE objeto (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo TEXT,
  valor INTEGER,
  peso REAL,
  dueno_id INTEGER REFERENCES habitante(id)
);
CREATE TABLE cosecha (
  id INTEGER PRIMARY KEY,
  fruta TEXT,
  aldea_id INTEGER REFERENCES aldea(id),
  kilos INTEGER,
  dia INTEGER
);

INSERT INTO aldea (id, nombre, zona) VALUES
  (1, 'Playa Coral', 'costa'),
  (2, 'Valle Verde', 'interior'),
  (3, 'Pico Humo', 'montaña'),
  (4, 'Bahía Luna', 'costa');

INSERT INTO habitante (id, nombre, oficio, edad, amistad, aldea_id) VALUES
  (1, 'Coralina', 'pescador', 34, 80, 1),
  (2, 'Mateo', 'pescador', 52, 40, 1),
  (3, 'Nerea', 'cocinero', 29, 65, 1),
  (4, 'Bruno', 'constructor', 47, 20, 1),
  (5, 'Olivia', 'curandero', 61, 90, 2),
  (6, 'Hugo', 'agricultor', 38, 55, 2),
  (7, 'Lucía', 'agricultor', 26, 70, 2),
  (8, 'Sabino', 'herrero', 58, 10, 2),
  (9, 'Marina', 'mercader', 44, 45, 2),
  (10, 'Tomás', 'guía', 31, 60, 3),
  (11, 'Ada', 'jefe', 70, 30, 3),
  (12, 'Rubén', 'minero', 49, 15, 3),
  (13, 'Irene', 'astrónomo', 36, 85, 3),
  (14, 'Pablo', 'pescador', 23, 50, 4),
  (15, 'Julia', 'mercader', 41, 75, 4),
  (16, 'Gael', 'aprendiz', 17, 95, 4),
  (17, 'Elena', 'curandero', 55, 35, 4),
  (18, 'Samuel', 'agricultor', 33, 58, 2),
  (19, 'Misterioso', NULL, 40, 0, NULL);

INSERT INTO objeto (id, nombre, tipo, valor, peso, dueno_id) VALUES
  (1, 'Red de pesca', 'herramienta', 25, 3.5, 2),
  (2, 'Brújula', 'herramienta', 80, 0.2, NULL),
  (3, 'Mapa del tesoro', 'mapa', 300, 0.1, 11),
  (4, 'Hacha de piedra', 'herramienta', 40, 2.5, 4),
  (5, 'Pócima de sol', 'pocion', 55, 0.4, 5),
  (6, 'Collar de perlas', 'joya', 220, 0.1, 15),
  (7, 'Cuerda larga', 'herramienta', 15, 1.2, NULL),
  (8, 'Telescopio', 'instrumento', 150, 4, 13),
  (9, 'Cuchillo de obsidiana', 'arma', 90, 0.8, 12),
  (10, 'Cesta de frutas', 'comida', 12, 3, 7),
  (11, 'Espada oxidada', 'arma', 35, 2.2, NULL),
  (12, 'Lámpara de aceite', 'herramienta', 30, 1, 12),
  (13, 'Cofre cerrado', 'tesoro', 1000, 18, NULL),
  (14, 'Llave de coral', 'llave', 500, 0.1, 16),
  (15, 'Pergamino antiguo', 'mapa', 280, 0.1, 17),
  (16, 'Anzuelo dorado', 'herramienta', 120, 0.05, 14),
  (17, 'Hamaca', 'mueble', 28, 2, 3),
  (18, 'Yesquero', 'herramienta', 18, 0.1, NULL),
  (19, 'Barril de agua', 'comida', 20, 15, 1),
  (20, 'Pluma de fénix', 'rareza', 400, 0.01, 13);

INSERT INTO cosecha (fruta, aldea_id, kilos, dia) VALUES
  ('coco', 1, 40, 1), ('coco', 1, 35, 2), ('coco', 4, 28, 1), ('coco', 4, 30, 3), ('coco', 2, 12, 2),
  ('mango', 2, 60, 1), ('mango', 2, 72, 2), ('mango', 3, 25, 3), ('mango', 4, 18, 2), ('mango', 2, 55, 4),
  ('piña', 2, 45, 1), ('piña', 2, 38, 3), ('piña', 3, 52, 2), ('piña', 3, 48, 4), ('piña', 1, 10, 3),
  ('plátano', 1, 22, 1), ('plátano', 1, 26, 2), ('plátano', 4, 31, 2), ('plátano', 4, 29, 4), ('plátano', 2, 20, 3), ('plátano', 3, 15, 1);
`;

export const ISLA: Episodio = {
  id: "isla",
  titulo: "La isla de los datos",
  semilla: SEMILLA,
  capitulos: [
    {
      id: 1,
      titulo: "Náufrago en Playa Coral",
      tema: "SELECT",
      escena: "playa",
      intro: {
        personaje: "coralina",
        texto:
          "Despiertas en la arena, con la ropa rota y la boca seca. Una pescadora te ofrece agua. «Soy Coralina. Estás en la Isla de los Datos: aquí todo se apunta en el Gran Libro, y el Libro solo responde a quien sabe preguntar en SQL. Aprende y te ayudaremos a salir de la isla.»",
      },
      chuleta: [
        "SELECT columna1, columna2 FROM tabla;  → muestra esas columnas.",
        "SELECT * FROM tabla;  → muestra todas las columnas.",
        "SELECT DISTINCT columna FROM tabla;  → sin valores repetidos.",
        "Cada sentencia acaba en punto y coma.",
        "SHOW TABLES;  → lista las tablas · DESCRIBE tabla;  → muestra sus columnas (como en MySQL).",
      ],
    },
    {
      id: 2,
      titulo: "El valle de las preguntas",
      tema: "WHERE",
      escena: "valle",
      intro: {
        personaje: "olivia",
        texto:
          "En Valle Verde vive Olivia, la curandera. «Si quieres mi ayuda, aprende a preguntar con precisión. Con WHERE le dices al Libro qué filas quieres; las demás no le importan.»",
      },
      chuleta: [
        "SELECT ... FROM tabla WHERE condición;",
        "Comparar: =  <>  <  >  <=  >=   · Combinar: AND, OR, NOT",
        "Varios valores: WHERE col IN ('a', 'b')   · Rango: WHERE col BETWEEN 10 AND 20",
        "Texto: WHERE nombre LIKE 'M%'  (% = cualquier cosa)   · Los textos van entre comillas simples.",
        "Valores vacíos: WHERE col IS NULL  /  IS NOT NULL",
      ],
    },
    {
      id: 3,
      titulo: "El mercado de Valle Verde",
      tema: "ORDER BY y LIMIT",
      escena: "mercado",
      intro: {
        personaje: "marina",
        texto:
          "Marina vende de todo en su puesto. «Aquí el que sabe ordenar, sabe vender. Ponme las cosas en orden y quédate solo con lo que importa.»",
      },
      chuleta: [
        "ORDER BY columna ASC  (de menor a mayor, por defecto)   · ORDER BY columna DESC  (de mayor a menor).",
        "Varios criterios: ORDER BY col1, col2 DESC",
        "LIMIT n  → solo las n primeras filas (va al final).",
      ],
    },
    {
      id: 4,
      titulo: "La gran cosecha",
      tema: "Funciones y GROUP BY",
      escena: "campos",
      intro: {
        personaje: "hugo",
        texto:
          "Hugo cuida los campos de fruta. «Contar fruta de una en una es de locos. Pídele al Libro que cuente, sume y agrupe por ti.»",
      },
      chuleta: [
        "COUNT(*) cuenta filas · SUM(col) suma · AVG(col) media · MIN(col) y MAX(col).",
        "GROUP BY col  → un resultado por cada valor distinto de col.",
        "HAVING condición  → filtra los grupos (WHERE filtra las filas, antes de agrupar).",
        "Puedes ponerle nombre a una columna: SUM(kilos) AS total.",
      ],
    },
    {
      id: 5,
      titulo: "El archivo de la jefa",
      tema: "JOIN y subconsultas",
      escena: "archivo",
      intro: {
        personaje: "ada",
        texto:
          "Ada, la jefa de la isla, guarda los registros en su cabaña de Pico Humo. «Los datos están repartidos en varias tablas. Quien sabe unirlas, sabe leer el Libro entero.»",
      },
      chuleta: [
        "FROM tabla1 t1 JOIN tabla2 t2 ON t1.col = t2.id   (INNER JOIN: solo las filas que encajan).",
        "LEFT JOIN: todas las filas de la tabla de la izquierda, tengan pareja o no.",
        "Si dos tablas tienen una columna con el mismo nombre, usa el alias: t1.nombre.",
        "Subconsulta: WHERE col > (SELECT AVG(col) FROM tabla)   ·   WHERE id IN (SELECT ...)",
      ],
    },
    {
      id: 6,
      titulo: "Reescribiendo el Libro",
      tema: "INSERT, UPDATE y DELETE",
      escena: "aldea",
      intro: {
        personaje: "ada",
        texto:
          "«Ya sabes leer el Libro. Ahora te dejo escribir en él. Pero cuidado: lo que escribes, queda escrito. Si borras sin WHERE, desaparece todo.» (Si algo sale mal, puedes reiniciar la isla.)",
      },
      chuleta: [
        "INSERT INTO tabla (col1, col2) VALUES (valor1, valor2);",
        "UPDATE tabla SET col = valor WHERE condición;   ← sin WHERE cambia TODAS las filas.",
        "DELETE FROM tabla WHERE condición;   ← sin WHERE borra TODAS las filas.",
        "Textos entre comillas simples; el valor vacío se escribe NULL.",
      ],
    },
    {
      id: 7,
      titulo: "El observatorio",
      tema: "CREATE TABLE",
      escena: "observatorio",
      intro: {
        personaje: "irene",
        texto:
          "Irene, la astrónoma, te recibe junto a su telescopio. «Para salir de la isla necesitas un lugar donde vivir y un código para abrir el cofre del barco. Primero, diseña tu propia tabla.»",
      },
      chuleta: [
        "CREATE TABLE nombre (col TIPO restricciones, ...);",
        "Tipos: INT (enteros), VARCHAR(n) (texto de hasta n caracteres), DECIMAL(p,s) o DOUBLE (decimales), DATE (fechas).",
        "PRIMARY KEY identifica cada fila · AUTO_INCREMENT la numera sola · NOT NULL la hace obligatoria.",
        "FOREIGN KEY (col) REFERENCES otra_tabla(id)  → apunta a una fila de otra tabla.",
      ],
    },
  ],
  misiones: [
    // ───────── 1. SELECT ─────────
    {
      id: "1.1", capitulo: 1, personaje: "coralina", tipo: "consulta",
      historia: "«Lo primero es saber con quién cuentas. Pregúntale al Libro por todos los habitantes de la isla.»",
      reto: "Muestra todas las columnas de todos los habitantes (tabla habitante).",
      solucion: "SELECT * FROM habitante;",
      pistas: ["Para pedir todas las columnas se usa el asterisco: *.", "La forma es SELECT * FROM nombre_de_la_tabla;"],
      exito: "«¡Eso es! Mira cuánta gente vive aquí. Ahora aprenderás a pedir solo lo que necesitas.»",
      incorrectas: ["SELECT nombre FROM habitante;"],
    },
    {
      id: "1.2", capitulo: 1, personaje: "coralina", tipo: "consulta",
      historia: "«Demasiada información de golpe. A mí solo me interesan los nombres.»",
      reto: "Muestra solo la columna nombre de los habitantes.",
      solucion: "SELECT nombre FROM habitante;",
      pistas: ["En vez de *, escribe el nombre de la columna que quieres.", "SELECT nombre FROM habitante;"],
      exito: "«Perfecto. Pedir solo lo necesario es de sabios.»",
      incorrectas: ["SELECT * FROM habitante;"],
    },
    {
      id: "1.3", capitulo: 1, personaje: "coralina", tipo: "consulta",
      historia: "«Para pedir ayuda necesito saber a qué se dedica cada uno. Dame nombre y oficio.»",
      reto: "Muestra las columnas nombre y oficio de los habitantes.",
      solucion: "SELECT nombre, oficio FROM habitante;",
      pistas: ["Varias columnas se separan con comas.", "SELECT nombre, oficio FROM habitante;"],
      exito: "«Muy bien. ¡Hay de todo en esta isla!»",
    },
    {
      id: "1.4", capitulo: 1, personaje: "coralina", tipo: "consulta",
      historia: "«Hay muchos oficios repetidos en la lista. Quiero saber qué oficios distintos existen en la isla.»",
      reto: "Muestra la lista de oficios sin repetir ninguno.",
      solucion: "SELECT DISTINCT oficio FROM habitante;",
      pistas: ["Existe una palabra que elimina las repeticiones: DISTINCT.", "Va justo después de SELECT: SELECT DISTINCT oficio ..."],
      exito: "«Así de claro. Ya sabes preguntar. Sigue hacia Valle Verde: Olivia te espera.»",
    },
    // ───────── 2. WHERE ─────────
    {
      id: "2.1", capitulo: 2, personaje: "olivia", tipo: "consulta",
      historia: "«Necesito ayuda para preparar remedios. Empecemos por la gente de Playa Coral, que es la aldea número 1.»",
      reto: "Muestra el nombre de los habitantes cuyo aldea_id sea 1.",
      solucion: "SELECT nombre FROM habitante WHERE aldea_id = 1;",
      pistas: ["Se filtra con WHERE, que va después de FROM.", "WHERE aldea_id = 1"],
      exito: "«Gracias. Conozco a esa gente: buena gente de mar.»",
      incorrectas: ["SELECT nombre FROM habitante WHERE aldea_id = 2;"],
    },
    {
      id: "2.2", capitulo: 2, personaje: "olivia", tipo: "consulta",
      historia: "«Los mayores de 50 años conocen los remedios de siempre. ¿Quiénes son?»",
      reto: "Muestra nombre y edad de los habitantes con más de 50 años.",
      solucion: "SELECT nombre, edad FROM habitante WHERE edad > 50;",
      pistas: ["Para «más de» se usa el símbolo >.", "WHERE edad > 50"],
      exito: "«Justo los que pensaba. Con tanta edad, tienen mucho que enseñar.»",
      incorrectas: ["SELECT nombre, edad FROM habitante WHERE edad < 50;", "SELECT nombre, edad FROM habitante WHERE edad > 60;"],
    },
    {
      id: "2.3", capitulo: 2, personaje: "olivia", tipo: "consulta",
      historia: "«Necesito pescado fresco y una cesta nueva. Búscame a los pescadores y a los mercaderes.»",
      reto: "Muestra nombre y oficio de quienes son 'pescador' o 'mercader'.",
      solucion: "SELECT nombre, oficio FROM habitante WHERE oficio IN ('pescador', 'mercader');",
      alternativas: ["SELECT nombre, oficio FROM habitante WHERE oficio = 'pescador' OR oficio = 'mercader';"],
      pistas: ["Puedes combinar condiciones con OR, o usar IN ('a', 'b').", "Los textos van entre comillas simples: 'pescador'."],
      exito: "«Ahí los tengo. ¡Y todos en las aldeas de costa y mercado!»",
    },
    {
      id: "2.4", capitulo: 2, personaje: "olivia", tipo: "consulta",
      historia: "«Para recoger hierbas en la montaña hacen falta jóvenes con ganas: menos de 40 años y una amistad contigo de entre 50 y 80.»",
      reto: "Muestra el nombre de los habitantes con edad menor de 40 y amistad entre 50 y 80 (ambos incluidos).",
      solucion: "SELECT nombre FROM habitante WHERE edad < 40 AND amistad BETWEEN 50 AND 80;",
      alternativas: ["SELECT nombre FROM habitante WHERE edad < 40 AND amistad >= 50 AND amistad <= 80;"],
      pistas: ["Las dos condiciones deben cumplirse a la vez: AND.", "Para un rango existe BETWEEN a AND b, o puedes usar >= y <=."],
      exito: "«¡Qué buen equipo! Con ellos tendremos las hierbas en un día.»",
    },
    {
      id: "2.5", capitulo: 2, personaje: "olivia", tipo: "consulta",
      historia: "«Me caen bien las personas cuyo nombre empieza por M. Encuéntramelas.»",
      reto: "Muestra el nombre de los habitantes cuyo nombre empieza por la letra M.",
      solucion: "SELECT nombre FROM habitante WHERE nombre LIKE 'M%';",
      pistas: ["Para buscar por patrones se usa LIKE.", "El símbolo % significa «cualquier cosa»: 'M%' son los textos que empiezan por M."],
      exito: "«Marina, Mateo… y alguien muy misterioso. Gracias.»",
    },
    {
      id: "2.6", capitulo: 2, personaje: "olivia", tipo: "consulta",
      historia: "«Hay un viajero del que nadie sabe a qué se dedica: su oficio no está apuntado en el Libro. Encuéntralo.»",
      reto: "Muestra el nombre de los habitantes cuyo oficio es NULL (no tiene valor).",
      solucion: "SELECT nombre FROM habitante WHERE oficio IS NULL;",
      pistas: ["NULL no se compara con =: se usa IS NULL.", "WHERE oficio IS NULL"],
      exito: "«Lo sospechaba. Ve al mercado: Marina te espera.»",
      incorrectas: ["SELECT nombre FROM habitante WHERE oficio = NULL;"],
    },
    // ───────── 3. ORDER BY y LIMIT ─────────
    {
      id: "3.1", capitulo: 3, personaje: "marina", tipo: "consulta", ordenado: true,
      historia: "«Mi puesto es un caos. Ordena el inventario: los objetos por valor, del más caro al más barato.»",
      reto: "Muestra nombre y valor de los objetos, del más caro al más barato.",
      solucion: "SELECT nombre, valor FROM objeto ORDER BY valor DESC;",
      pistas: ["Se ordena con ORDER BY, al final de la consulta.", "DESC ordena de mayor a menor: ORDER BY valor DESC"],
      exito: "«¡Mucho mejor! Ahora sé dónde está lo bueno.»",
      incorrectas: ["SELECT nombre, valor FROM objeto ORDER BY valor;"],
    },
    {
      id: "3.2", capitulo: 3, personaje: "marina", tipo: "consulta", ordenado: true,
      historia: "«Solo me interesan los 3 objetos más valiosos. Con esos hago mi anuncio.»",
      reto: "Muestra nombre y valor de los 3 objetos más valiosos, del más caro al más barato.",
      solucion: "SELECT nombre, valor FROM objeto ORDER BY valor DESC LIMIT 3;",
      pistas: ["LIMIT n limita el número de filas del resultado.", "ORDER BY valor DESC LIMIT 3"],
      exito: "«El cofre, la llave de coral y el pergamino… ¡cuánta riqueza!»",
    },
    {
      id: "3.3", capitulo: 3, personaje: "marina", tipo: "consulta", ordenado: true,
      historia: "«Quiero ver a la gente por aldea y, dentro de cada aldea, de la persona mayor a la más joven.»",
      reto: "Muestra nombre, aldea_id y edad ordenados por aldea_id y, dentro de cada aldea, por edad de mayor a menor.",
      solucion: "SELECT nombre, aldea_id, edad FROM habitante ORDER BY aldea_id, edad DESC;",
      pistas: ["Puedes ordenar por varias columnas separándolas con comas.", "ORDER BY aldea_id, edad DESC"],
      exito: "«Así sí que se entiende quién manda en cada aldea.»",
    },
    {
      id: "3.4", capitulo: 3, personaje: "marina", tipo: "consulta", ordenado: true,
      historia: "«Y una última curiosidad: ¿quién es la persona más joven de toda la isla?»",
      reto: "Muestra nombre y edad de la persona más joven (una sola fila).",
      solucion: "SELECT nombre, edad FROM habitante ORDER BY edad LIMIT 1;",
      alternativas: ["SELECT nombre, edad FROM habitante ORDER BY edad ASC LIMIT 1;"],
      pistas: ["Ordena por edad y quédate con una sola fila.", "ORDER BY edad LIMIT 1"],
      exito: "«Gael, un aprendiz de Bahía Luna. Ve a los campos: Hugo tiene trabajo para ti.»",
    },
    // ───────── 4. Funciones y GROUP BY ─────────
    {
      id: "4.1", capitulo: 4, personaje: "hugo", tipo: "consulta",
      historia: "«Empecemos por lo básico: ¿cuánta gente vive en la isla? Que cuente el Libro, no tú.»",
      reto: "Muestra cuántos habitantes hay en total.",
      solucion: "SELECT COUNT(*) FROM habitante;",
      pistas: ["Existe una función que cuenta filas: COUNT.", "SELECT COUNT(*) FROM habitante;"],
      exito: "«Diecinueve almas. Con ellas cultivamos toda esta fruta.»",
    },
    {
      id: "4.2", capitulo: 4, personaje: "hugo", tipo: "consulta",
      historia: "«Esta semana hemos cosechado de todo. ¿Cuántos kilos de fruta hay en total?»",
      reto: "Muestra la suma de todos los kilos de la tabla cosecha.",
      solucion: "SELECT SUM(kilos) FROM cosecha;",
      pistas: ["La función SUM suma los valores de una columna.", "SELECT SUM(kilos) FROM cosecha;"],
      exito: "«¡Menuda cosecha! Hay para repartir.»",
    },
    {
      id: "4.3", capitulo: 4, personaje: "hugo", tipo: "consulta",
      historia: "«Dime la edad media de los habitantes, y también la menor y la mayor.»",
      reto: "Muestra la edad media, la edad mínima y la edad máxima en una sola fila.",
      solucion: "SELECT AVG(edad), MIN(edad), MAX(edad) FROM habitante;",
      pistas: ["Puedes usar varias funciones en el mismo SELECT: AVG, MIN y MAX.", "SELECT AVG(edad), MIN(edad), MAX(edad) FROM habitante;"],
      exito: "«De los diecisiete a los setenta. ¡Todas las generaciones!»",
    },
    {
      id: "4.4", capitulo: 4, personaje: "hugo", tipo: "consulta",
      historia: "«¿Cuántos kilos tenemos de cada fruta? Quiero una fila por fruta.»",
      reto: "Muestra cada fruta con la suma de sus kilos.",
      solucion: "SELECT fruta, SUM(kilos) FROM cosecha GROUP BY fruta;",
      pistas: ["Para obtener un resultado por grupo se usa GROUP BY.", "SELECT fruta, SUM(kilos) FROM cosecha GROUP BY fruta;"],
      exito: "«Así se hace: un resultado por cada fruta.»",
      incorrectas: ["SELECT fruta, SUM(kilos) FROM cosecha;"],
    },
    {
      id: "4.5", capitulo: 4, personaje: "hugo", tipo: "consulta",
      historia: "«Ahora cuenta cuántos habitantes tiene cada aldea. Agrupa por aldea_id.»",
      reto: "Muestra aldea_id y el número de habitantes de cada aldea.",
      solucion: "SELECT aldea_id, COUNT(*) FROM habitante GROUP BY aldea_id;",
      pistas: ["Agrupa por aldea_id y cuenta las filas de cada grupo.", "SELECT aldea_id, COUNT(*) FROM habitante GROUP BY aldea_id;"],
      exito: "«Valle Verde es la más poblada… y hay alguien sin aldea: el misterioso.»",
    },
    {
      id: "4.6", capitulo: 4, personaje: "hugo", tipo: "consulta",
      historia: "«Solo me interesan las frutas con mucha producción: las que sumen más de 150 kilos.»",
      reto: "Muestra cada fruta con su suma de kilos, solo si esa suma es mayor que 150.",
      solucion: "SELECT fruta, SUM(kilos) FROM cosecha GROUP BY fruta HAVING SUM(kilos) > 150;",
      pistas: ["Para filtrar grupos (no filas) se usa HAVING, después de GROUP BY.", "HAVING SUM(kilos) > 150"],
      exito: "«Mango y piña: nuestras reinas. Ve a Pico Humo: la jefa quiere verte.»",
      incorrectas: ["SELECT fruta, SUM(kilos) FROM cosecha WHERE kilos > 150 GROUP BY fruta;"],
    },
    // ───────── 5. JOIN y subconsultas ─────────
    {
      id: "5.1", capitulo: 5, personaje: "ada", tipo: "consulta",
      historia: "«Los habitantes guardan solo el número de su aldea. Yo quiero ver a cada habitante junto al nombre de su aldea.»",
      reto: "Muestra el nombre de cada habitante y el nombre de su aldea (une habitante con aldea).",
      solucion: "SELECT h.nombre, a.nombre FROM habitante h JOIN aldea a ON h.aldea_id = a.id;",
      alternativas: ["SELECT h.nombre, a.nombre FROM habitante h INNER JOIN aldea a ON a.id = h.aldea_id;"],
      pistas: ["Une las dos tablas con JOIN ... ON y compara la clave: h.aldea_id = a.id.", "SELECT h.nombre, a.nombre FROM habitante h JOIN aldea a ON h.aldea_id = a.id;"],
      exito: "«Muy bien. Fíjate: el misterioso no aparece, porque no tiene aldea.»",
    },
    {
      id: "5.2", capitulo: 5, personaje: "ada", tipo: "consulta",
      historia: "«Los objetos guardan el número de su dueño. ¿Quién posee cada objeto? Quiero objeto y dueño.»",
      reto: "Muestra el nombre de cada objeto y el nombre de su dueño (solo los que tienen dueño).",
      solucion: "SELECT o.nombre, h.nombre FROM objeto o JOIN habitante h ON o.dueno_id = h.id;",
      pistas: ["La clave es dueno_id (en objeto) = id (en habitante).", "FROM objeto o JOIN habitante h ON o.dueno_id = h.id"],
      exito: "«Así se reparte la riqueza de la isla.»",
    },
    {
      id: "5.3", capitulo: 5, personaje: "ada", tipo: "consulta",
      historia: "«Faltan los objetos que nadie posee. Quiero TODOS los objetos, tengan dueño o no.»",
      reto: "Muestra el nombre de todos los objetos y el de su dueño (NULL si no tiene).",
      solucion: "SELECT o.nombre, h.nombre FROM objeto o LEFT JOIN habitante h ON o.dueno_id = h.id;",
      pistas: ["LEFT JOIN conserva todas las filas de la tabla de la izquierda.", "FROM objeto o LEFT JOIN habitante h ON o.dueno_id = h.id"],
      exito: "«Ahí están: la brújula, la cuerda, el cofre… esperando dueño.»",
      incorrectas: ["SELECT o.nombre, h.nombre FROM objeto o JOIN habitante h ON o.dueno_id = h.id;"],
    },
    {
      id: "5.4", capitulo: 5, personaje: "ada", tipo: "consulta",
      historia: "«Dime cuántos kilos de fruta ha cosechado cada aldea, pero con el nombre de la aldea, no con el número.»",
      reto: "Muestra el nombre de cada aldea y la suma de kilos de su cosecha.",
      solucion: "SELECT a.nombre, SUM(c.kilos) FROM cosecha c JOIN aldea a ON a.id = c.aldea_id GROUP BY a.nombre;",
      pistas: ["Une cosecha con aldea y después agrupa por el nombre de la aldea.", "JOIN aldea a ON a.id = c.aldea_id ... GROUP BY a.nombre"],
      exito: "«Valle Verde, con diferencia. Sabía que sus campos eran buenos.»",
    },
    {
      id: "5.5", capitulo: 5, personaje: "ada", tipo: "consulta",
      historia: "«Quiero conocer a los habitantes más mayores que la edad media de la isla. Sin calcular la media a mano, claro.»",
      reto: "Muestra el nombre de los habitantes cuya edad es mayor que la edad media (usa una subconsulta).",
      solucion: "SELECT nombre FROM habitante WHERE edad > (SELECT AVG(edad) FROM habitante);",
      pistas: ["Una subconsulta es un SELECT entre paréntesis dentro de otra consulta.", "WHERE edad > (SELECT AVG(edad) FROM habitante)"],
      exito: "«Los sabios de la isla. Gracias.»",
    },
    {
      id: "5.6", capitulo: 5, personaje: "ada", tipo: "consulta",
      historia: "«¿Quiénes poseen algún objeto de valor superior a 200? Quiero solo sus nombres.»",
      reto: "Muestra el nombre de los habitantes que poseen algún objeto con valor mayor que 200.",
      solucion: "SELECT nombre FROM habitante WHERE id IN (SELECT dueno_id FROM objeto WHERE valor > 200);",
      alternativas: ["SELECT DISTINCT h.nombre FROM habitante h JOIN objeto o ON o.dueno_id = h.id WHERE o.valor > 200;"],
      pistas: ["Puedes usar IN con una subconsulta que devuelva los dueño_id, o un JOIN con DISTINCT.", "WHERE id IN (SELECT dueno_id FROM objeto WHERE valor > 200)"],
      exito: "«Esos son los poderosos de la isla. Bien hecho: ahora podrás escribir en el Libro.»",
    },
    // ───────── 6. INSERT, UPDATE, DELETE ─────────
    {
      id: "6.1", capitulo: 6, personaje: "ada", tipo: "modifica",
      historia: "«Para quedarte necesito apuntarte en el Libro. Eres aprendiz, tienes 25 años, tu amistad es 10 y vives en Playa Coral (la aldea 1). El nombre lo eliges tú.»",
      reto: "Inserta un nuevo habitante: oficio 'aprendiz', edad 25, amistad 10 y aldea_id 1 (con el nombre que quieras).",
      solucion: "INSERT INTO habitante (nombre, oficio, edad, amistad, aldea_id) VALUES ('Náufrago', 'aprendiz', 25, 10, 1);",
      verificar: [
        "SELECT COUNT(*) FROM habitante",
        "SELECT oficio, edad, amistad, aldea_id FROM habitante WHERE id > 19",
      ],
      pistas: ["Se usa INSERT INTO tabla (columnas) VALUES (valores);", "No hace falta dar el id: se numera solo (la columna es AUTO_INCREMENT)."],
      exito: "«Ya estás en el Libro. Bienvenido, de verdad, a la isla.»",
    },
    {
      id: "6.2", capitulo: 6, personaje: "ada", tipo: "modifica",
      historia: "«Con todo lo que has hecho, mi opinión de ti ha cambiado. Sube mi amistad (la de Ada) a 60.»",
      reto: "Actualiza la amistad de Ada a 60 (solo la de ella).",
      solucion: "UPDATE habitante SET amistad = 60 WHERE nombre = 'Ada';",
      verificar: ["SELECT id, nombre, amistad FROM habitante ORDER BY id"],
      pistas: ["UPDATE tabla SET columna = valor WHERE condición;", "Sin WHERE cambiarías la amistad de todos."],
      exito: "«Así me gusta. Un cambio pequeño, bien hecho.»",
    },
    {
      id: "6.3", capitulo: 6, personaje: "ada", tipo: "modifica",
      historia: "«El naufragio ha encarecido las herramientas: sube un 10 % el valor de todas las que sean del tipo 'herramienta'.»",
      reto: "Multiplica por 1.1 el valor de los objetos cuyo tipo es 'herramienta'.",
      solucion: "UPDATE objeto SET valor = valor * 1.1 WHERE tipo = 'herramienta';",
      verificar: ["SELECT id, ROUND(valor, 2) FROM objeto ORDER BY id"],
      pistas: ["En SET puedes usar la propia columna: valor = valor * 1.1.", "No olvides el WHERE tipo = 'herramienta'."],
      exito: "«Las herramientas valen más. Los mercaderes me odiarán.»",
    },
    {
      id: "6.4", capitulo: 6, personaje: "ada", tipo: "modifica",
      historia: "«La espada oxidada se ha deshecho en polvo. Bórrala del Libro. Con cuidado: solo esa.»",
      reto: "Borra el objeto llamado 'Espada oxidada'.",
      solucion: "DELETE FROM objeto WHERE nombre = 'Espada oxidada';",
      verificar: ["SELECT COUNT(*) FROM objeto", "SELECT id FROM objeto ORDER BY id"],
      pistas: ["DELETE FROM tabla WHERE condición;", "Sin WHERE se borrarían todos los objetos."],
      exito: "«Descansa en paz, vieja espada.»",
    },
    {
      id: "6.5", capitulo: 6, personaje: "ada", tipo: "modifica",
      historia: "«Han aparecido dos objetos en la playa. Apúntalos de una vez: una 'Concha mágica' (tipo 'rareza', valor 60, peso 0.3) y una 'Perla negra' (tipo 'joya', valor 350, peso 0.05). Ninguno tiene dueño.»",
      reto: "Inserta los dos objetos con una sola sentencia INSERT; el dueño es NULL en ambos.",
      solucion: "INSERT INTO objeto (nombre, tipo, valor, peso, dueno_id) VALUES ('Concha mágica', 'rareza', 60, 0.3, NULL), ('Perla negra', 'joya', 350, 0.05, NULL);",
      alternativas: [
        "INSERT INTO objeto (nombre, tipo, valor, peso, dueno_id) VALUES ('Concha mágica', 'rareza', 60, 0.3, NULL); INSERT INTO objeto (nombre, tipo, valor, peso, dueno_id) VALUES ('Perla negra', 'joya', 350, 0.05, NULL);",
      ],
      verificar: ["SELECT COUNT(*) FROM objeto", "SELECT nombre, tipo, valor, peso, dueno_id FROM objeto WHERE id > 20 ORDER BY nombre"],
      pistas: ["VALUES admite varias filas separadas por comas: VALUES (...), (...).", "El texto 'Concha mágica' va entre comillas simples."],
      exito: "«Un tesoro más para la isla. Ve al observatorio: Irene te espera.»",
    },
    // ───────── 7. CREATE TABLE ─────────
    {
      id: "7.1", capitulo: 7, personaje: "irene", tipo: "modifica",
      historia: "«Necesitas una cabaña y el Libro no tiene tabla para ellas. Créala al estilo MySQL: se llamará cabana, con id (INT, clave primaria que se numera sola con AUTO_INCREMENT), nombre (VARCHAR(50), obligatorio), habitaciones (INT) y aldea_id (INT), que apunta a la tabla aldea.»",
      reto: "Crea la tabla cabana: id INT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(50) NOT NULL, habitaciones INT y aldea_id INT con clave foránea a aldea(id).",
      solucion: "CREATE TABLE cabana (id INT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(50) NOT NULL, habitaciones INT, aldea_id INT, FOREIGN KEY (aldea_id) REFERENCES aldea(id));",
      alternativas: [
        "CREATE TABLE cabana (id INT AUTO_INCREMENT, nombre VARCHAR(50) NOT NULL, habitaciones INT, aldea_id INT, PRIMARY KEY (id), FOREIGN KEY (aldea_id) REFERENCES aldea(id)) ENGINE=InnoDB;",
        "CREATE TABLE `cabana` (`id` INT NOT NULL AUTO_INCREMENT, `nombre` VARCHAR(30) NOT NULL, `habitaciones` INT, `aldea_id` INT, PRIMARY KEY (`id`), CONSTRAINT fk_cabana_aldea FOREIGN KEY (`aldea_id`) REFERENCES `aldea` (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
        "CREATE TABLE cabana (id INT PRIMARY KEY AUTO_INCREMENT, nombre VARCHAR(50) NOT NULL, habitaciones INT, aldea_id INT REFERENCES aldea(id));",
      ],
      incorrectas: [
        "CREATE TABLE cabana (id INT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(50), habitaciones INT, aldea_id INT, FOREIGN KEY (aldea_id) REFERENCES aldea(id));",
        "CREATE TABLE cabana (id INT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(50) NOT NULL, habitaciones INT, aldea_id INT);",
      ],
      verificar: [
        "SELECT name, CASE WHEN UPPER(type) LIKE '%INT%' THEN 'entero' WHEN UPPER(type) LIKE '%CHAR%' OR UPPER(type) LIKE '%TEXT%' THEN 'texto' ELSE LOWER(type) END, \"notnull\", pk FROM pragma_table_info('cabana') ORDER BY cid",
        "SELECT \"table\", \"from\", \"to\" FROM pragma_foreign_key_list('cabana')",
      ],
      pistas: ["CREATE TABLE nombre (columna TIPO, ...);  La clave que se numera sola es: id INT AUTO_INCREMENT PRIMARY KEY.", "La clave foránea: FOREIGN KEY (aldea_id) REFERENCES aldea(id), o REFERENCES aldea(id) justo después de la columna."],
      exito: "«Tabla creada. Ahora el Libro sabe que existen las cabañas.»",
    },
    {
      id: "7.2", capitulo: 7, personaje: "irene", tipo: "modifica",
      historia: "«Apunta tu cabaña: se llama 'Cabaña del Náufrago', tiene 2 habitaciones y está en Playa Coral (aldea 1).»",
      reto: "Inserta una fila en cabana con nombre 'Cabaña del Náufrago', 2 habitaciones y aldea_id 1.",
      solucion: "INSERT INTO cabana (nombre, habitaciones, aldea_id) VALUES ('Cabaña del Náufrago', 2, 1);",
      verificar: ["SELECT COUNT(*) FROM cabana", "SELECT nombre, habitaciones, aldea_id FROM cabana"],
      pistas: ["INSERT INTO cabana (columnas) VALUES (valores);", "No hace falta dar el id."],
      exito: "«Ya tienes casa. Ahora, comprobemos que el Libro la entiende.»",
    },
    {
      id: "7.3", capitulo: 7, personaje: "irene", tipo: "consulta",
      historia: "«Muéstrame tu cabaña junto al nombre de la aldea donde está. Quiero comprobar que las dos tablas están bien unidas.»",
      reto: "Muestra el nombre de cada cabaña y el nombre de su aldea (JOIN entre cabana y aldea).",
      solucion: "SELECT c.nombre, a.nombre FROM cabana c JOIN aldea a ON a.id = c.aldea_id;",
      pistas: ["Es un JOIN como los del archivo de Ada.", "FROM cabana c JOIN aldea a ON a.id = c.aldea_id"],
      exito: "«Perfecto: tu cabaña, en Playa Coral. Solo queda abrir el cofre del barco.»",
    },
    {
      id: "7.4", capitulo: 7, personaje: "irene", tipo: "consulta",
      historia: "«El cofre del barco se abre con un código: el valor total de todos los objetos que poseen los habitantes de Pico Humo. Calcúlalo y podrás escapar de la isla.»",
      reto: "Muestra la suma del valor de los objetos cuyos dueños viven en la aldea llamada 'Pico Humo'.",
      solucion: "SELECT SUM(o.valor) FROM objeto o JOIN habitante h ON o.dueno_id = h.id JOIN aldea a ON a.id = h.aldea_id WHERE a.nombre = 'Pico Humo';",
      pistas: ["Necesitas unir tres tablas: objeto, habitante y aldea.", "FROM objeto o JOIN habitante h ON ... JOIN aldea a ON ... WHERE a.nombre = 'Pico Humo'"],
      exito: "«¡El código es {codigo}! El cofre se abre… Has aprendido a preguntar, a combinar y a escribir en el Libro. Ya puedes salir de la isla, náufrago. Aquí siempre tendrás amigos.»",
    },
  ],
};

# OS Galileo

Sistema operativo **simulado** que corre en el navegador, para el alumnado del IES Galileo. Se publicará en la raíz de `iesgalileo.alejandrocatalaespi.es`.

## Objetivos
- Punto de entrada único a GASA, materiales y herramientas del curso.
- Aprender cómo funciona un SO (archivos, procesos, terminal, usuarios, permisos).
- Simulaciones de aplicaciones reales, sin instalar nada.
- Práctica de comandos y administración.
- Prueba de concepto de `ai-os` (SO para Raspberry Pi 5): los dos proyectos son independientes por ahora.

## Estado (v0.1)
- Arranque simulado y pantalla de acceso como **invitado** (sin cuenta), con su foto de perfil (`public/avatar-invitado.jpg`, también en el menú de Inicio).
- **Escritorio** con identidad Galileo (morado `#2a1770`, rojo `#da251c`): iconos, ventanas arrastrables, redimensionables, minimizables y maximizables, barra de tareas, menú de inicio con buscador y reloj.
- **Móvil** (< 760 px): cuadrícula de iconos, apps a pantalla completa, pulsación larga para reordenar (el orden se guarda).
- Núcleo: sistema de archivos virtual persistente (`localStorage`), procesos y registro de apps.
- Apps: **Archivos** (explorador: navegar, crear, renombrar, borrar, abrir con doble clic), **Terminal** (`help`, `ls`, `cd`, `cat`, `mkdir`, `touch`, `rm [-r]`, `mv`, `cp`, `tree`, `echo > / >>`, `ps`, `open`; historial con flechas y Tab), **Bloc de notas**, **Calculadora****PseudoFlow** y los juegos (**Sudoku**, **Binario**, **La isla de los datos** y GASA). **GASA** (la web hermana en `/gasa/`) se abre en una ventana desde Juegos con `apps/app-web.ts`, que sirve para cualquier web del mismo dominio.
- Fondos de escritorio en `public/fondos/` (`src/kernel/fondos.ts`): cambia en cada entrada y cada 10 minutos; para añadir más, copiar la imagen y listarla en `FONDOS`.

![Escritorio](docs/escritorio.png) ![Móvil](docs/movil.png)

## PseudoFlow (`src/apps/pseudoflow/`)
Pseudocódigo y diagrama de flujo como **dos vistas del mismo modelo** (`modelo.ts`): se ven por separado o las dos a la vez, y lo que se hace en una aparece en la otra.
- **Pseudocódigo** (el de las diapositivas de Programación UT03 §1): `LEER`, `ESCRIBIR`, `x <- valor`, `SI…ENTONCES…SI NO…FIN SI`, `SEGÚN…CASO…OTRO…FIN SEGÚN`, `MIENTRAS…HACER…FIN MIENTRAS`, `REPETIR…HASTA`, `PARA…DESDE…HASTA…[CON PASO]…HACER…FIN PARA`. Resaltado de palabras clave, sangría automática y errores con su línea.
- **Listado lateral**: al pulsar una estructura se escribe en el cursor con huecos ‹…›; **Tab** salta al siguiente hueco y no se puede ejecutar hasta rellenarlos. Hay también fichas de operadores y funciones.
- **Diagrama**: óvalo, rectángulo, rombo y paralelogramo. Se edita con el **+** de cada flecha (añadir), pulsando un símbolo (editar sus campos, subir, bajar, eliminar). Como es estructurado, una decisión siempre tiene dos salidas que se reúnen: no puede haber ramas colgando. El pseudocódigo se regenera solo.
- **Ejecutar** (trazado): paso a paso o automático, símbolo y línea resaltados, tabla de variables, salida y entrada con `LEER`. Detecta división entre cero, variables sin valor, comparar texto con número y bucles infinitos (20 000 pasos).
- **Archivos**: guardar/abrir en el sistema virtual (`.psc` texto, `.diag` XML), descargar **TXT**, **PNG** (fondo blanco, sin botones) y **XML**, e importar TXT/XML.
- Ejemplos de la UT03 §1: aprobado/suspenso, tres rangos, notas hasta −1, traza de `x`, tabla con `PARA`, `REPETIR`, `SEGÚN`.
- Los casos de un `SEGÚN` solo se editan en el pseudocódigo (en el diagrama se ven como una cadena de decisiones).
- **Subprocesos:** `SUBPROCESO Nombre … FIN SUBPROCESO` y se llaman escribiendo su nombre. Cada uno tiene su diagrama en una pestaña (empieza con su nombre y acaba en «Volver») y se pueden crear desde «+ Subproceso». El trazado salta al subproceso.
- **Texto libre** (casilla «Texto libre»): una línea que no es una instrucción es una acción en lenguaje natural («Coger el cepillo») y una condición como «la tierra está seca» se pregunta al ejecutar («¿Se cumple? Sí / No»). Fuera de este modo una errata sigue dando error.
- **Dialecto propio, solo el del departamento.** No se admite el estilo PSeInt (`Algoritmo`, `SiNo`, `Hasta Que`…). Los huecos de los fragmentos del listado se escriben `‹así›` (no `«»`, que se usan en los textos libres).

### Ejercicios de PseudoFlow
Botón «📚 Ejercicios»: **75 ejercicios de «Pensar antes de programar»** (serie de apuntes de un compañero) ordenados por dificultad (Base 27 · Medio 32 · Avanzado 16), con filtros por bloque (10) y por tipo (diseño, traza, error, traducción, razona). Cada uno abre una tarjeta con enunciado, datos de prueba y pista (oculta hasta pedirla); el editor se carga con el código de partida si lo hay y guarda el borrador de cada ejercicio.
- **Comprobar** ejecuta el algoritmo del alumno con los datos de prueba y revisa lo que escribe (números, textos, en orden) y la forma (`Estructura`: usa/no usa tal estructura, subprocesos, orden de pasos…). Dice qué datos fallan y por qué, pero **nunca muestra la solución**.
- Traza y razona: respuestas cortas, verdadero/falso o texto razonado. Traducción: «Ver diagrama del enunciado» dibuja el diagrama y el alumno escribe el pseudocódigo. Los ejercicios con dos versiones (7.4, 7.9, 5.2, 10.3) tienen una pestaña por versión.
- El progreso (✓) y los borradores se guardan en el navegador (`localStorage`); con cuentas de alumnado pasará a la base de datos.
- Datos en `ejercicios.ts`, corrector en `comprobar.ts`, interfaz en `ejercicios-ui.ts`. Las soluciones del compañero (Parte 3 de sus apuntes) **no están en el repositorio**: se usaron fuera de él para validar los 75 ejercicios (las 282 pruebas las superan y los 4 ejercicios de corrección fallan con su código inicial).

## Desarrollo
```
npm install
npm run dev      # servidor de desarrollo
npm run build    # tsc + vite build → dist/
```
`dist/` es estático y usa rutas relativas. **Publicación:** se copia a `public/iesgalileo/` del repositorio `web-personal-gemini3` (`D:Developmentweb-personal-gemini3`, Firebase App Hosting; `server.mjs` sirve esa carpeta en el subdominio). Hay que borrar antes `assets/index-*` antiguos y no tocar `gasa/` ni `materiales/`; después commit «OS Galileo: …» y push.

## Juegos (`src/apps/juegos/`)
Carpeta **Inicio → Aplicaciones → Juegos** con juegos educativos.
- **Sudoku** (`sudoku/`): tableros **4×4** (cajas 2×2) y **9×9** (3×3), cuatro niveles (Fácil, Medio, Difícil, Experto). Todos los tableros tienen **solución única**; Fácil y Medio se resuelven solo con «únicos» (candidato único y único lugar posible) y Difícil/Experto dejan menos pistas (9×9: 42 · 34 · 28 · 24). Resaltado de fila, columna, caja y número igual; **marcar repetidos**; **Comprobar** (marca lo que no coincide con la solución); deshacer y rehacer (Ctrl+Z / Ctrl+Y); teclado numérico en pantalla y teclado físico con flechas; temporizador y **estadísticas** (ganadas, mejor tiempo y media por tamaño y nivel). Guarda la partida en curso y las estadísticas en el navegador.
- El generador (`generador.ts`) usa un resolutor con *backtracking* y la casilla con menos candidatos primero: el mismo algoritmo que puede acabar siendo un ejercicio de programación.
- **Binario** (`binario/`), con tres modos:
  - **Bombillas:** ocho (o cuatro) bombillas con su valor (128, 64… 1). Retos de *formar un número* y de *leer el número* que muestran; niveles Fácil (4 bombillas con la suma a la vista), Medio (8 con suma) y Difícil (8 sin suma). Racha y mejor racha.
  - **Pruebas rápidas:** rondas de 10 preguntas cronometradas de decimal ↔ binario (4 u 8 bits) y, en Difícil, hexadecimal; se compara el valor, así que no hace falta rellenar con ceros. Guarda la mejor ronda por nivel.
  - **Puertas lógicas:** se elige AND, OR, XOR, NAND o NOR en cada hueco de una fórmula (con `NO` fijos) para que la salida coincida con la tabla de verdad esperada; la tabla indica en vivo qué filas fallan. Tres niveles (2, 3 y 4 entradas) con circuitos generados al azar y siempre con solución.
- **La isla de los datos** (`isla-sql/`): aventura gráfica para aprender SQL escribiendo **SQL de verdad** sobre una base de datos **SQLite real** (`sql.js`, ~0,7 MB, solo se descarga al abrir el juego, en `public/sql/`). Historia original (no es una copia de SQL Island). **Episodio 1: 7 capítulos y 35 misiones**: SELECT/DISTINCT, WHERE (comparaciones, AND/OR, IN, BETWEEN, LIKE, IS NULL), ORDER BY y LIMIT, funciones y GROUP BY/HAVING, JOIN y subconsultas, INSERT/UPDATE/DELETE y CREATE TABLE con claves. Cada capítulo tiene su **escena ilustrada en SVG** y personaje, presentación, **chuleta** de sintaxis y el **mapa de datos** (esquema vivo con claves y «Ver datos»). Ayudas: dos pistas por misión y, tras **tres fallos**, la solución. Comprueba el **resultado** (no el texto del SQL): admite varias formas de resolver cada misión; las que modifican datos se prueban en una isla de ensayo y solo se aplican si dejan la base como se pedía. «Probar» ejecuta sin guardar nada; «Reiniciar la isla» rehace los datos con los cambios ya aceptados. El progreso se guarda en el navegador y siempre se retoma en la primera misión pendiente. Se bloquean `PRAGMA`, `DROP`, `ATTACH`, `VACUUM` y las transacciones.
  - Los episodios son datos (`tipos.ts` define `Episodio`, `Capitulo` y `Mision`); para añadir uno basta con crear otro fichero como `isla.ts`. `npm run probar:isla` ejecuta las 102 comprobaciones del episodio 1 contra SQLite (soluciones, alternativas, respuestas incorrectas, «sentencias que no hacen nada» y la capa MySQL).
  - **Sintaxis MySQL** (el SGBD del módulo 0484 según la profesora): el motor es SQLite, pero `motor.ts` incluye una capa de compatibilidad (`traducirMySql`) que entiende `INT`, `VARCHAR(n)`, `AUTO_INCREMENT`, `ENGINE=InnoDB`, `UNSIGNED`, `ENUM`, `NOW()`, `CURDATE()`, `IF()`, `CONCAT`, `SHOW TABLES`, `DESCRIBE`, `USE`, `INSERT IGNORE` y `TRUNCATE`. El «Mapa de datos» muestra los tipos al estilo MySQL. Diferencias que avisa la chuleta: la división entera (`5/2` da 2 en SQLite y 2,5 en MySQL), el `GROUP BY` estricto y que MySQL no tiene `FULL JOIN`.
- Pensado para añadir **control por el profesorado** (activar o desactivar la carpeta por grupo o franja horaria) cuando haya cuentas de alumnado; hoy no hay ninguno.

## Menú Inicio (escritorio)
Las aplicaciones del sistema (Archivos, Terminal, Bloc de notas, Calculadora) están en el escritorio y en el menú. Las de cada módulo están en **Inicio → Aplicaciones → módulo** (submenú en cascada); se declaran con `carpeta: "0485 · Programación"` en su `AppDef` (los juegos usan `carpeta: "Juegos"`; con `"Juegos/Bases de Datos"` o `"Juegos/Sistemas"` se añade un tercer nivel: La isla de los datos está en Juegos → Bases de Datos y Binario en Juegos → Sistemas) y la búsqueda las encuentra todas. En el móvil siguen todas en la pantalla de inicio.

## Arquitectura (`src/`)
- `kernel/vfs.ts` — árbol de archivos y carpetas (`leer`, `escribir`, `listar`, `mkdir`, `borrar`). Interfaz preparada para migrar a IndexedDB.
- `kernel/kernel.ts` — usuario, procesos y registro de apps (`AppDef`: `id`, `nombre`, `icono`, tamaño e `iniciar(ctx)`).
- `shell/escritorio.ts` y `shell/movil.ts` — dos «shells» sobre el mismo núcleo; `main.ts` elige uno según el ancho.
- `shell/arranque.ts` — arranque y acceso.
- `apps/` — una app por fichero. Para añadir una: exportar un `AppDef` y registrarlo en `main.ts`.

## IADW (`src/apps/iadw/`)
Carpeta **Inicio → Aplicaciones → IADW** (IA aplicada al desarrollo web).
- **Token** (`token/`): tokenizadores **reales** y didácticos, en cuatro pestañas. *Modelos reales* tokeniza con los vocabularios oficiales (`js-tiktoken`: `cl100k_base` de GPT-3.5/4 y `o200k_base` de GPT-4o/4.1/5 y GPT-5.6 Sol, Terra y Luna; `@huggingface/tokenizers` con el `tokenizer.json` de DeepSeek V4 y GLM-5.3) y calcula tokens, % de ventana y coste por modelo (precios en dólares por millón, **editables**: son orientativos). *Idiomas* compara la misma frase en 10 idiomas. *Métodos* compara caracteres, palabras, bytes y un BPE de juguete. *BPE paso a paso* enseña el algoritmo (`bpe.ts`, sin dependencias). Los vocabularios de OpenAI se cargan bajo demanda (trozos aparte en el build); los de DeepSeek (6 MB) y GLM (20 MB) se descargan de Hugging Face solo si el alumno pulsa el botón (no se guardan en el repositorio). Anthropic y Google no publican su vocabulario, así que no están.
- **Prompt o no prompt** (`prompt/`): rondas de 10 prompts (de 22, en `datos.ts`); se decide si es bueno o mejorable y, si es mejorable, qué criterios le fallan (objetivo, contexto, datos, formato, restricciones, privacidad). Hasta 2 puntos por prompt; explica el fallo y propone una versión mejor. Guarda la mejor ronda.
- **Descenso** (`descenso/`): app didáctica del descenso del gradiente, con tres pestañas. *Qué es* (`explica.ts`): recorrido guiado de 7 pasos (la idea, para qué sirve, la pendiente, dar un paso, la tasa de aprendizaje, mínimos locales y resumen con mini test), cada uno con una demo interactiva y un recuadro opcional «Ver las matemáticas». *Ejemplos* (`ejemplos.ts`): montaña a ciegas (niebla), ajustar una recta, ¿spam o no spam? (regresión logística) y precio de un piso (dos variables, con y sin normalizar los datos). *Laboratorio*: el simulador libre anterior (cuatro funciones de dos variables con SGD, momento y Adam). Las curvas de una variable están en `curvas.ts`, utilidades en `util.ts` y las matemáticas del laboratorio en `matematica.ts`.

## 0373 - LMSG (`src/apps/lmsg/`)
Carpeta **Inicio → Aplicaciones → 0373 - LMSG** (Lenguajes de marcas y sistemas de gestión de información).
- **Laboratorio HTML/CSS** (`laboratorio/`): editor de `index.html` y `estilos.css` con vista previa en vivo (iframe sin scripts, mismo origen). El CSS solo se aplica si el HTML enlaza `<link rel="stylesheet" href="estilos.css">`, como en un navegador real. *Revisar HTML* (`revisar.ts`) señala etiquetas sin cerrar, falta de `<!DOCTYPE>`, `lang`, `charset`, `title`, `alt`, ids repetidos, saltos de título y etiquetas sin `label`. Nueve **retos** (`retos.ts`, niveles 1–3) con pestaña «Objetivo»: no se compara el código sino el resultado (estructura, textos, atributos y estilos calculados en iframes ocultos del mismo tamaño), así que vale cualquier solución correcta. Guarda/abre `.html` y su `estilos.css` hermano en el sistema de archivos (los `.html`, `.htm` y `.css` del explorador se abren aquí).
- **CSS en juego** (`css-juego/`): dos pestañas. *Selectores* (23 niveles en `selectores.ts`): escena de HTML real dentro de un shadow root; se escribe un selector y se resaltan los elementos elegidos; gana al elegir exactamente los que parpadean (vale cualquier selector equivalente). *Flexbox* (18 niveles en `flexbox.ts`): se escribe CSS y las cajas deben quedar como en el objetivo; se comparan las posiciones calculadas en dos iframes. Progreso en `localStorage` (`osg-css-juego`).

## Hoja de ruta
1. Logo definitivo en el arranque.
2. Terminal: tuberías, permisos y usuarios; explorador: mover/copiar arrastrando.
3. Acceso real: correo del alumno + código por correo, altas y apps por módulo en una base de datos administrada (como el panel del profesorado).
4. Simulaciones de aplicaciones (IDE, bases de datos, redes…) y procesos, permisos y usuarios.

# CLAUDE.md — OS Galileo

SO simulado en el navegador para el alumnado del IES Galileo (Vite + TypeScript, sin framework de UI). Descripción y arquitectura en `README.md`.

## Reglas de trabajo
- Responder y escribir en **español** (con tildes), también identificadores y comentarios.
- Ante cualquier duda, usar **AskUserQuestion** con opciones concretas.
- Actualizar `README.md` y este fichero con cada cambio importante.
- Tras una construcción correcta (`npm run build`): commit y push.
- Probar en el navegador (Playwright MCP) escritorio y móvil.
- Los commits terminan con las líneas de atribución que indique el sistema.

## Decisiones
- Stack: Vite + TypeScript estricto, sin dependencias de UI; `dist/` estático con rutas relativas.
- Publicación: raíz de `iesgalileo.alejandrocatalaespi.es`.
- Dos shells (escritorio ≥ 760 px y móvil) sobre el mismo núcleo; las apps no dependen del shell.
- Acceso: solo invitado por ahora. El acceso real (correo + código, apps por módulo en una base de datos con el propietario como administrador) queda para más adelante.
- Independiente de `ai-os` (SO de Raspberry Pi 5) por ahora.
- Identidad: morado `#2a1770`, rojo `#da251c`, logo en `public/logo.svg`; fondos en `public/fondos/` (aportados por Alejandro, con el logo centrado y adornos en las esquinas), rotados por `src/kernel/fondos.ts`.
- La simulación debe poder crecer hacia procesos, permisos y usuarios: el acceso al almacenamiento va siempre por `Vfs`.
- **PseudoFlow** (nombre de la app de diagramas y pseudocódigo, `src/apps/pseudoflow/`): un único modelo (`modelo.ts`) con dos vistas; el diagrama es **estructurado** (nada de dibujo libre) para poder generar siempre pseudocódigo correcto. Dialecto del pseudocódigo = el de las diapositivas de Programación DAM UT03 §1 (`analizar` en `parser.ts`, `aTexto` en `formato.ts`). Los estilos del SVG van como atributos para que el PNG exportado se vea igual. Si se amplía el dialecto, tocar parser, formato, XML, ejecutor y layout a la vez.
- Las apps se abren entre sí con `so.abrirApp(id, { ruta })`; el shell activo asigna `so.lanzador`. `so.appParaArchivo` decide qué app abre cada extensión (`.psc`/`.diag` → PseudoFlow).
- En las pruebas con Playwright no usar `taskkill /IM node.exe`: matar solo el PID del puerto del servidor de prueba.
- GASA **no** aparece entre las apps de momento (decisión de Alejandro, 29-10-2026); `apps/app-web.ts` queda listo para añadirla.
- Móvil: sin zoom (meta viewport, `touch-action`, eventos `gesture*` y campos de 16 px); debe comportarse como un SO móvil real.
- **Ejercicios de PseudoFlow (29-10-2026):** 75 ejercicios de la serie «Pensar antes de programar» de un compañero de Alejandro, solo con enunciados, datos de prueba y criterios. **Nunca incluir sus soluciones en el repositorio (es público).** Para validar cambios en el motor, el dialecto o los criterios hay que volver a pedir las soluciones (Parte 3A/3B) y pasarlas por `analizar` + `juzgar`: la última validación dio 282/282 pruebas y 0 incidencias.
- Dialecto: **solo el propio** (decisión de Alejandro); sin tolerancia al estilo PSeInt. Texto libre, subprocesos y `SEGÚN` con `CASO a, b:` incluidos. Los huecos del listado son `‹…›`.
- Menú Inicio con submenú **Aplicaciones → módulo** (`AppDef.carpeta`); las apps de módulo no van en el escritorio. Cada módulo tendrá sus apps.
- Al editar con la herramienta Edit: no pasar código con barras invertidas por scripts de Python/Bash (se estropean los escapes); usar Edit/Write.
- **Juegos (29-10-2026):** carpeta «Juegos» del menú (`carpeta: "Juegos"`); primero Sudoku 4×4 y 9×9 con niveles, errores, deshacer, estadísticas y temporizador (sin notas de lápiz ni pistas por decisión de Alejandro). Riesgo asumido: que jueguen en clase; control de profesorado pendiente hasta tener cuentas.

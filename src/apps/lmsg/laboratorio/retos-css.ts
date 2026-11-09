// Retos de CSS del Laboratorio, agrupados por tema. Mismo formato que los de `retos.ts`:
// se comparan los estilos CALCULADOS por el navegador en la página del alumno y en la solución.

import { LOGO, plantilla } from "./plantilla";
import type { Reto } from "./retos";

const BASE = `body { font-family: Arial, sans-serif; margin: 16px; }
`;

const LOREM = "El diseño web separa el contenido, que se escribe en HTML, de la presentación, que se escribe en CSS. Así se puede cambiar el aspecto de todo un sitio tocando un solo archivo.";

export const RETOS_CSS: Reto[] = [
  // ===================================== Texto y color =====================================
  {
    id: "texto-css",
    titulo: "Espaciado, mayúsculas y alineación",
    tema: "Texto y color",
    enunciado: `Con CSS: el <code>h1</code> en mayúsculas (<code>text-transform: uppercase</code>) con <code>letter-spacing: 2px</code>; los párrafos con <code>line-height: 1.6</code>, justificados (<code>text-align: justify</code>) y con sangría de <code>1.5em</code> (<code>text-indent</code>); la clase <code>.nota</code> en cursiva y de <code>0.875rem</code>; y los enlaces sin subrayado.`,
    html: plantilla(`  <h1>Lenguajes de marcas</h1>
  <p>${LOREM}</p>
  <p class="nota">Una nota al margen del texto.</p>
  <a href="#">Un enlace</a>`, "Texto"),
    css: BASE,
    solHtml: plantilla(`  <h1>Lenguajes de marcas</h1>
  <p>${LOREM}</p>
  <p class="nota">Una nota al margen del texto.</p>
  <a href="#">Un enlace</a>`, "Texto"),
    solCss: `${BASE}h1 { text-transform: uppercase; letter-spacing: 2px; }
p { line-height: 1.6; text-align: justify; text-indent: 1.5em; }
.nota { font-style: italic; font-size: 0.875rem; }
a { text-decoration: none; }
`,
    comprobar: [
      { texto: "El h1 va en mayúsculas con 2px de separación entre letras", sel: "h1", estilo: ["text-transform", "letter-spacing"] },
      { texto: "Los párrafos: interlineado 1.6 y texto justificado", sel: "p", estilo: ["line-height", "text-align"] },
      { texto: "Los párrafos tienen sangría de 1.5em", sel: "p", estilo: ["text-indent"] },
      { texto: ".nota en cursiva y de 0.875rem", sel: ".nota", estilo: ["font-style", "font-size"] },
      { texto: "Enlaces sin subrayado", sel: "a", estilo: ["text-decoration-line"] },
    ],
  },
  {
    id: "unidades",
    titulo: "Unidades: px, rem, em, % y vh",
    tema: "Texto y color",
    enunciado: `Usa la unidad que se pide. <code>.grande</code>: <code>font-size: 2rem</code>. <code>.media</code> (dentro de <code>.caja</code>, que mide 20px de letra): <code>font-size: 1.25em</code>. <code>.mitad</code>: la mitad del ancho de su contenedor (<code>width: 50%</code>) y una altura del <code>10vh</code> (<code>height</code>).`,
    html: plantilla(`  <div class="contenedor">
    <p class="grande">Texto grande</p>
    <div class="caja">
      <p class="media">Texto mediano</p>
    </div>
    <div class="mitad">Mitad</div>
  </div>`, "Unidades"),
    css: `${BASE}.contenedor { width: 400px; }
.caja { font-size: 20px; }
.mitad { background: #f4f1ff; border: 1px solid #2a1770; box-sizing: border-box; }
`,
    solHtml: plantilla(`  <div class="contenedor">
    <p class="grande">Texto grande</p>
    <div class="caja">
      <p class="media">Texto mediano</p>
    </div>
    <div class="mitad">Mitad</div>
  </div>`, "Unidades"),
    solCss: `${BASE}.contenedor { width: 400px; }
.caja { font-size: 20px; }
.mitad { background: #f4f1ff; border: 1px solid #2a1770; box-sizing: border-box; width: 50%; height: 10vh; }
.grande { font-size: 2rem; }
.media { font-size: 1.25em; }
`,
    comprobar: [
      { texto: ".grande mide 2rem (32px)", sel: ".grande", estilo: ["font-size"] },
      { texto: ".media mide 1.25em de su contenedor (25px)", sel: ".media", estilo: ["font-size"] },
      { texto: ".mitad ocupa el 50% del ancho", sel: ".mitad", estilo: ["width"] },
      { texto: ".mitad mide 10vh de alto", sel: ".mitad", estilo: ["height"] },
    ],
  },
  {
    id: "colores",
    titulo: "Formatos de color",
    tema: "Texto y color",
    enunciado: `Un color se puede escribir de muchas formas. <code>h1</code>: <code>rgb(42, 23, 112)</code>. <code>.alerta</code>: fondo rojo semitransparente <code>rgba(218, 37, 28, 0.15)</code>, borde izquierdo de <code>6px solid #da251c</code> y <code>padding: 8px 12px</code>. <code>.ok</code>: color <code>hsl(140, 60%, 30%)</code>. <code>.apagado</code>: <code>opacity: 0.6</code>.`,
    html: plantilla(`  <h1>Avisos</h1>
  <p class="alerta">Alerta importante</p>
  <p class="ok">Todo correcto</p>
  <p class="apagado">Texto apagado</p>`, "Colores"),
    css: BASE,
    solHtml: plantilla(`  <h1>Avisos</h1>
  <p class="alerta">Alerta importante</p>
  <p class="ok">Todo correcto</p>
  <p class="apagado">Texto apagado</p>`, "Colores"),
    solCss: `${BASE}h1 { color: rgb(42, 23, 112); }
.alerta { background-color: rgba(218, 37, 28, 0.15); border-left: 6px solid #da251c; padding: 8px 12px; }
.ok { color: hsl(140, 60%, 30%); }
.apagado { opacity: 0.6; }
`,
    comprobar: [
      { texto: "El h1 es de color rgb(42, 23, 112)", sel: "h1", estilo: ["color"] },
      { texto: ".alerta tiene el fondo rojo semitransparente", sel: ".alerta", estilo: ["background-color"] },
      { texto: ".alerta: borde izquierdo de 6px sólido #da251c", sel: ".alerta", estilo: ["border-left-width", "border-left-style", "border-left-color"] },
      { texto: ".alerta: relleno de 8px 12px", sel: ".alerta", estilo: ["padding-top", "padding-left"] },
      { texto: ".ok usa hsl(140, 60%, 30%)", sel: ".ok", estilo: ["color"] },
      { texto: ".apagado tiene opacidad 0.6", sel: ".apagado", estilo: ["opacity"] },
    ],
  },
  {
    id: "fondos",
    titulo: "Fondos y degradados",
    tema: "Texto y color",
    enunciado: `<code>.cabecera</code>: fondo con degradado lineal de <code>135deg</code> de <code>#2a1770</code> a <code>#da251c</code> (<code>linear-gradient</code>), texto blanco y <code>padding: 40px 24px</code>; su <code>h1</code> sin margen. <code>.panel</code>: fondo <code>#f4f1ff</code>, borde doble (<code>3px double #2a1770</code>), <code>padding: 16px</code> y <code>margin-top: 16px</code>.`,
    html: plantilla(`  <header class="cabecera">
    <h1>IES Galileo</h1>
  </header>
  <div class="panel">Panel con borde doble</div>`, "Fondos"),
    css: `body { font-family: Arial, sans-serif; margin: 0; }
`,
    solHtml: plantilla(`  <header class="cabecera">
    <h1>IES Galileo</h1>
  </header>
  <div class="panel">Panel con borde doble</div>`, "Fondos"),
    solCss: `body { font-family: Arial, sans-serif; margin: 0; }
.cabecera { background: linear-gradient(135deg, #2a1770, #da251c); color: #fff; padding: 40px 24px; }
.cabecera h1 { margin: 0; }
.panel { background-color: #f4f1ff; border: 3px double #2a1770; padding: 16px; margin-top: 16px; }
`,
    comprobar: [
      { texto: "La cabecera tiene el degradado de 135deg", sel: ".cabecera", estilo: ["background-image"] },
      { texto: "Texto blanco y relleno de 40px 24px", sel: ".cabecera", estilo: ["color", "padding-top", "padding-left"] },
      { texto: "El h1 de la cabecera no tiene margen", sel: ".cabecera h1", estilo: ["margin-top", "margin-bottom"] },
      { texto: ".panel: fondo #f4f1ff y borde doble de 3px", sel: ".panel", estilo: ["background-color", "border-top-style", "border-top-width", "border-top-color"] },
      { texto: ".panel: relleno de 16px y margen superior de 16px", sel: ".panel", estilo: ["padding-top", "margin-top"] },
    ],
  },
  {
    id: "sombras",
    titulo: "Sombras y formas",
    tema: "Texto y color",
    enunciado: `<code>.tarjeta</code>: <code>box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2)</code>, esquinas de <code>12px</code>. Su <code>h2</code>: <code>text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3)</code>. <code>.circulo</code>: un círculo de 80 × 80 px (<code>border-radius: 50%</code>) con fondo <code>#da251c</code>.`,
    html: plantilla(`  <div class="tarjeta">
    <h2>Sombras</h2>
    <p>Dan sensación de profundidad.</p>
  </div>
  <div class="circulo"></div>`, "Sombras"),
    css: `${BASE}.tarjeta { width: 240px; padding: 16px; background: #fff; }
.circulo { margin-top: 20px; }
`,
    solHtml: plantilla(`  <div class="tarjeta">
    <h2>Sombras</h2>
    <p>Dan sensación de profundidad.</p>
  </div>
  <div class="circulo"></div>`, "Sombras"),
    solCss: `${BASE}.tarjeta { width: 240px; padding: 16px; background: #fff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); border-radius: 12px; }
.tarjeta h2 { text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); }
.circulo { margin-top: 20px; width: 80px; height: 80px; border-radius: 50%; background: #da251c; }
`,
    comprobar: [
      { texto: "La tarjeta tiene sombra", sel: ".tarjeta", estilo: ["box-shadow"] },
      { texto: "La tarjeta tiene las esquinas de 12px", sel: ".tarjeta", estilo: ["border-top-left-radius"] },
      { texto: "El h2 tiene sombra de texto", sel: ".tarjeta h2", estilo: ["text-shadow"] },
      { texto: "El círculo mide 80 × 80 px y es redondo", sel: ".circulo", estilo: ["width", "height", "border-top-left-radius"] },
      { texto: "El círculo es de color #da251c", sel: ".circulo", estilo: ["background-color"] },
    ],
  },

  // ===================================== Modelo de caja =====================================
  {
    id: "box-sizing",
    titulo: "box-sizing: el ancho real",
    tema: "Modelo de caja",
    enunciado: `Las cajas <code>.a</code> y <code>.b</code> miden 200 px de ancho <em>más</em> relleno y borde, y se salen de lo previsto. Haz que el ancho incluya relleno y borde aplicando <code>box-sizing: border-box</code> a <b>todos</b> los elementos con el selector universal <code>*</code>.`,
    html: plantilla(`  <div class="a">Caja A</div>
  <div class="b">Caja B</div>`, "box-sizing"),
    css: `${BASE}.a, .b { width: 200px; padding: 20px; border: 5px solid #2a1770; margin-bottom: 12px; }
.b { background: #f4f1ff; }
`,
    solHtml: plantilla(`  <div class="a">Caja A</div>
  <div class="b">Caja B</div>`, "box-sizing"),
    solCss: `* { box-sizing: border-box; }
${BASE}.a, .b { width: 200px; padding: 20px; border: 5px solid #2a1770; margin-bottom: 12px; }
.b { background: #f4f1ff; }
`,
    comprobar: [
      { texto: "Las cajas usan box-sizing: border-box", sel: ".a, .b", estilo: ["box-sizing"] },
      { texto: "También el body y el resto de elementos (selector universal)", sel: "body, h1, p", estilo: ["box-sizing"] },
      { texto: "El ancho declarado sigue siendo 200px", sel: ".a, .b", estilo: ["width"] },
    ],
  },
  {
    id: "display-visibilidad",
    titulo: "display y visibility",
    tema: "Modelo de caja",
    enunciado: `<code>.pildora</code>: bloque en línea (<code>display: inline-block</code>) de <code>width: 90px</code>, <code>padding: 4px 0</code>, centrado (<code>text-align: center</code>) y fondo <code>#f4f1ff</code>. <code>.oculto</code>: que no se vea ni ocupe sitio (<code>display: none</code>). <code>.invisible</code>: que no se vea pero sí ocupe sitio (<code>visibility: hidden</code>).`,
    html: plantilla(`  <p><span class="pildora">HTML</span> <span class="pildora">CSS</span> <span class="pildora">DOM</span></p>
  <p class="oculto">No se ve y no ocupa sitio</p>
  <p class="invisible">No se ve, pero ocupa sitio</p>
  <p>Final</p>`, "Display"),
    css: BASE,
    solHtml: plantilla(`  <p><span class="pildora">HTML</span> <span class="pildora">CSS</span> <span class="pildora">DOM</span></p>
  <p class="oculto">No se ve y no ocupa sitio</p>
  <p class="invisible">No se ve, pero ocupa sitio</p>
  <p>Final</p>`, "Display"),
    solCss: `${BASE}.pildora { display: inline-block; width: 90px; padding: 4px 0; text-align: center; background: #f4f1ff; }
.oculto { display: none; }
.invisible { visibility: hidden; }
`,
    comprobar: [
      { texto: ".pildora es un bloque en línea de 90px de ancho", sel: ".pildora", estilo: ["display", "width"] },
      { texto: ".pildora: relleno vertical de 4px, centrada y con fondo #f4f1ff", sel: ".pildora", estilo: ["padding-top", "padding-left", "text-align", "background-color"] },
      { texto: ".oculto desaparece sin ocupar sitio", sel: ".oculto", estilo: ["display"] },
      { texto: ".invisible se oculta pero conserva su sitio", sel: ".invisible", estilo: ["visibility", "display"] },
    ],
  },
  {
    id: "desbordamiento",
    titulo: "Texto que no cabe",
    tema: "Modelo de caja",
    enunciado: `<code>.caja</code> (200 × 60 px) tiene más texto del que cabe: que muestre barra de desplazamiento cuando haga falta (<code>overflow: auto</code>). <code>.recorte</code> (200 px de ancho): una sola línea (<code>white-space: nowrap</code>), recortada (<code>overflow: hidden</code>) y con puntos suspensivos (<code>text-overflow: ellipsis</code>).`,
    html: plantilla(`  <div class="caja">${LOREM}</div>
  <p class="recorte">Este título es demasiado largo para caber en una sola línea</p>`, "Desbordamiento"),
    css: `${BASE}.caja { width: 200px; height: 60px; border: 1px solid #2a1770; }
.recorte { width: 200px; }
`,
    solHtml: plantilla(`  <div class="caja">${LOREM}</div>
  <p class="recorte">Este título es demasiado largo para caber en una sola línea</p>`, "Desbordamiento"),
    solCss: `${BASE}.caja { width: 200px; height: 60px; border: 1px solid #2a1770; overflow: auto; }
.recorte { width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
`,
    comprobar: [
      { texto: ".caja tiene overflow: auto", sel: ".caja", estilo: ["overflow-x", "overflow-y"] },
      { texto: ".recorte no parte la línea", sel: ".recorte", estilo: ["white-space"] },
      { texto: ".recorte oculta lo que sobra", sel: ".recorte", estilo: ["overflow-x", "overflow-y"] },
      { texto: ".recorte muestra puntos suspensivos", sel: ".recorte", estilo: ["text-overflow"] },
    ],
  },

  // ===================================== Selectores CSS =====================================
  {
    id: "sel-combinados",
    titulo: "Selectores combinados",
    tema: "Selectores CSS",
    enunciado: `Escribe estas reglas: <code>nav a</code> en <code>#2a1770</code> y sin subrayado; los enlaces cuyo <code>href</code> empieza por <code>https</code> en rojo <code>#da251c</code> (<code>a[href^="https"]</code>); el párrafo justo después de un <code>h2</code> en negrita (<code>h2 + p</code>); el primer <code>li</code> en <code>#da251c</code> (<code>li:first-child</code>); el último <code>li</code> en cursiva; y los párrafos que no son <code>.nota</code> de <code>18px</code> (<code>p:not(.nota)</code>).`,
    html: plantilla(`  <nav><a href="#inicio">Inicio</a> <a href="https://example.com">Externo</a></nav>
  <h2>Título</h2>
  <p>Primer párrafo, justo tras el título.</p>
  <p>Segundo párrafo.</p>
  <ul>
    <li>Uno</li>
    <li>Dos</li>
    <li>Tres</li>
  </ul>
  <p class="nota">Una nota.</p>`, "Selectores"),
    css: BASE,
    solHtml: plantilla(`  <nav><a href="#inicio">Inicio</a> <a href="https://example.com">Externo</a></nav>
  <h2>Título</h2>
  <p>Primer párrafo, justo tras el título.</p>
  <p>Segundo párrafo.</p>
  <ul>
    <li>Uno</li>
    <li>Dos</li>
    <li>Tres</li>
  </ul>
  <p class="nota">Una nota.</p>`, "Selectores"),
    solCss: `${BASE}nav a { color: #2a1770; text-decoration: none; }
a[href^="https"] { color: #da251c; }
h2 + p { font-weight: bold; }
li:first-child { color: #da251c; }
li:last-child { font-style: italic; }
p:not(.nota) { font-size: 18px; }
`,
    comprobar: [
      { texto: "Los enlaces del nav: color y sin subrayado (el externo, en rojo)", sel: "nav a", estilo: ["color", "text-decoration-line"] },
      { texto: "El párrafo tras el h2 va en negrita", sel: "p", estilo: ["font-weight"] },
      { texto: "El primer li es rojo y el último va en cursiva", sel: "li", estilo: ["color", "font-style"] },
      { texto: "Los párrafos que no son .nota miden 18px", sel: "p", estilo: ["font-size"] },
    ],
  },
  {
    id: "sel-posicion",
    titulo: "Pseudoclases de posición",
    tema: "Selectores CSS",
    enunciado: `En la lista: los <code>li</code> impares con fondo <code>#f4f1ff</code> (<code>:nth-child(odd)</code>); el tercero en negrita (<code>:nth-child(3)</code>); los dos primeros en cursiva (<code>:nth-child(-n+2)</code>); todos menos el primero con una línea superior <code>1px solid #ddd</code> (<code>:not(:first-child)</code>); y el último de color <code>#da251c</code> (<code>:last-child</code>).`,
    html: plantilla(`  <ul>
    <li>Uno</li>
    <li>Dos</li>
    <li>Tres</li>
    <li>Cuatro</li>
    <li>Cinco</li>
    <li>Seis</li>
  </ul>`, "Posición"),
    css: `${BASE}ul { list-style: none; padding: 0; width: 200px; }
li { padding: 6px 10px; }
`,
    solHtml: plantilla(`  <ul>
    <li>Uno</li>
    <li>Dos</li>
    <li>Tres</li>
    <li>Cuatro</li>
    <li>Cinco</li>
    <li>Seis</li>
  </ul>`, "Posición"),
    solCss: `${BASE}ul { list-style: none; padding: 0; width: 200px; }
li { padding: 6px 10px; }
li:nth-child(odd) { background: #f4f1ff; }
li:nth-child(3) { font-weight: bold; }
li:nth-child(-n+2) { font-style: italic; }
li:not(:first-child) { border-top: 1px solid #ddd; }
li:last-child { color: #da251c; }
`,
    comprobar: [
      { texto: "Los impares tienen fondo #f4f1ff", sel: "li", estilo: ["background-color"] },
      { texto: "El tercero va en negrita", sel: "li", estilo: ["font-weight"] },
      { texto: "Los dos primeros van en cursiva", sel: "li", estilo: ["font-style"] },
      { texto: "Todos menos el primero tienen línea superior", sel: "li", estilo: ["border-top-width", "border-top-style", "border-top-color"] },
      { texto: "El último es rojo", sel: "li", estilo: ["color"] },
    ],
  },
  {
    id: "especificidad",
    titulo: "¿Qué regla gana? (especificidad)",
    tema: "Selectores CSS",
    enunciado: `Sin tocar el HTML ni las reglas que ya hay, añade <b>una regla</b> para que el enlace <code>.activo</code> salga en rojo <code>#da251c</code> y en negrita. Cuidado: <code>.activo { color: … }</code> a secas no basta, porque <code>.menu a</code> es más específico. Piensa qué selector pesa más (o llega más tarde con el mismo peso).`,
    html: plantilla(`  <nav class="menu">
    <a href="#" class="activo">Inicio</a>
    <a href="#">Apuntes</a>
    <a href="#">Contacto</a>
  </nav>`, "Especificidad"),
    css: `${BASE}a { color: black; }
nav a { color: #2a1770; }
.menu a { color: #555; margin-right: 12px; }
`,
    solHtml: plantilla(`  <nav class="menu">
    <a href="#" class="activo">Inicio</a>
    <a href="#">Apuntes</a>
    <a href="#">Contacto</a>
  </nav>`, "Especificidad"),
    solCss: `${BASE}a { color: black; }
nav a { color: #2a1770; }
.menu a { color: #555; margin-right: 12px; }
.menu a.activo { color: #da251c; font-weight: bold; }
`,
    comprobar: [
      { texto: "El enlace activo es rojo y va en negrita", sel: "a", estilo: ["color", "font-weight"] },
      { texto: "Los demás enlaces siguen como estaban", sel: "a:not(.activo)", cuenta: true, estilo: ["color", "font-weight"] },
    ],
  },
  {
    id: "pseudoelementos",
    titulo: "::before, ::after y ::first-letter",
    tema: "Selectores CSS",
    enunciado: `Con pseudoelementos, sin tocar el HTML: antes de <code>.nota</code> aparece <code>"💡 "</code> (<code>::before</code> con <code>content</code>); después de los enlaces que empiezan por <code>https</code> aparece <code>" ↗"</code> en rojo <code>#da251c</code>; y la primera letra de <code>.inicial</code> es el doble de grande, en negrita y de color <code>#2a1770</code> (<code>::first-letter</code>).`,
    html: plantilla(`  <p class="nota">Recuerda guardar el archivo.</p>
  <p><a href="https://example.com">Sitio externo</a></p>
  <p class="inicial">La primera letra, grande y destacada.</p>`, "Pseudoelementos"),
    css: BASE,
    solHtml: plantilla(`  <p class="nota">Recuerda guardar el archivo.</p>
  <p><a href="https://example.com">Sitio externo</a></p>
  <p class="inicial">La primera letra, grande y destacada.</p>`, "Pseudoelementos"),
    solCss: `${BASE}.nota::before { content: "💡 "; }
a[href^="https"]::after { content: " ↗"; color: #da251c; }
.inicial::first-letter { font-size: 2em; font-weight: bold; color: #2a1770; }
`,
    comprobar: [
      { texto: ".nota::before añade «💡 »", sel: ".nota", pseudo: "::before", estilo: ["content"] },
      { texto: "El enlace externo termina con « ↗»", sel: "a", pseudo: "::after", estilo: ["content"] },
      { texto: "La flecha es de color #da251c", sel: "a", pseudo: "::after", estilo: ["color"] },
      { texto: "La primera letra es grande, en negrita y morada", sel: ".inicial", pseudo: "::first-letter", estilo: ["font-size", "font-weight", "color"] },
    ],
  },

  // ===================================== Posicionamiento =====================================
  {
    id: "pos-insignia",
    titulo: "Insignia en la esquina (relative y absolute)",
    tema: "Posicionamiento",
    enunciado: `La tarjeta es el punto de referencia (<code>position: relative</code>). La insignia <code>.insignia</code> sale de su esquina superior derecha (<code>position: absolute; top: -10px; right: -10px</code>), es un círculo de 28 × 28 px (<code>border-radius: 50%</code>) con fondo <code>#da251c</code>, texto blanco centrado (<code>text-align: center; line-height: 28px</code>) y letra de 14 px.`,
    html: plantilla(`  <div class="tarjeta">
    <span class="insignia">3</span>
    <h2>Mensajes</h2>
    <p>Tienes mensajes sin leer.</p>
  </div>`, "Insignia"),
    css: `${BASE}.tarjeta { width: 240px; border: 2px solid #2a1770; padding: 16px; border-radius: 12px; margin: 24px; }
`,
    solHtml: plantilla(`  <div class="tarjeta">
    <span class="insignia">3</span>
    <h2>Mensajes</h2>
    <p>Tienes mensajes sin leer.</p>
  </div>`, "Insignia"),
    solCss: `${BASE}.tarjeta { width: 240px; border: 2px solid #2a1770; padding: 16px; border-radius: 12px; margin: 24px; position: relative; }
.insignia { position: absolute; top: -10px; right: -10px; width: 28px; height: 28px; border-radius: 50%; background: #da251c; color: #fff; text-align: center; line-height: 28px; font-size: 14px; }
`,
    comprobar: [
      { texto: "La tarjeta es el punto de referencia (position: relative)", sel: ".tarjeta", estilo: ["position"] },
      { texto: "La insignia está en posición absoluta, arriba y a la derecha (-10px)", sel: ".insignia", estilo: ["position", "top", "right"] },
      { texto: "La insignia es un círculo de 28 × 28 px", sel: ".insignia", estilo: ["width", "height", "border-top-left-radius"] },
      { texto: "Fondo #da251c y texto blanco", sel: ".insignia", estilo: ["background-color", "color"] },
      { texto: "Texto centrado de 14px con line-height de 28px", sel: ".insignia", estilo: ["text-align", "font-size", "line-height"] },
    ],
  },
  {
    id: "pos-fija",
    titulo: "Barra fija y lateral pegajoso (fixed y sticky)",
    tema: "Posicionamiento",
    enunciado: `<code>.barra</code> se queda siempre arriba al desplazarte (<code>position: fixed; top: 0; left: 0; right: 0; z-index: 10</code>) con fondo <code>#2a1770</code>, texto blanco y <code>padding: 10px 16px</code>. <code>.lateral</code> se queda «pegado» al llegar a 64 px del borde superior (<code>position: sticky; top: 64px</code>).`,
    html: plantilla(`  <div class="barra">Barra siempre visible</div>
  <div class="contenido">
    <aside class="lateral">Índice</aside>
    <main>
      <p>${LOREM}</p>
      <p>${LOREM}</p>
      <p>${LOREM}</p>
      <p>${LOREM}</p>
    </main>
  </div>`, "Posición fija"),
    css: `body { font-family: Arial, sans-serif; margin: 0; padding-top: 48px; }
.contenido { display: flex; gap: 16px; padding: 16px; align-items: flex-start; }
.lateral { background: #f4f1ff; padding: 12px; width: 100px; }
`,
    solHtml: plantilla(`  <div class="barra">Barra siempre visible</div>
  <div class="contenido">
    <aside class="lateral">Índice</aside>
    <main>
      <p>${LOREM}</p>
      <p>${LOREM}</p>
      <p>${LOREM}</p>
      <p>${LOREM}</p>
    </main>
  </div>`, "Posición fija"),
    solCss: `body { font-family: Arial, sans-serif; margin: 0; padding-top: 48px; }
.contenido { display: flex; gap: 16px; padding: 16px; align-items: flex-start; }
.lateral { background: #f4f1ff; padding: 12px; width: 100px; position: sticky; top: 64px; }
.barra { position: fixed; top: 0; left: 0; right: 0; z-index: 10; background: #2a1770; color: #fff; padding: 10px 16px; }
`,
    comprobar: [
      { texto: "La barra tiene posición fija", sel: ".barra", estilo: ["position"] },
      { texto: "Pegada arriba, de lado a lado", sel: ".barra", estilo: ["top", "left", "right"] },
      { texto: "La barra tiene z-index 10", sel: ".barra", estilo: ["z-index"] },
      { texto: "Fondo #2a1770, texto blanco y relleno 10px 16px", sel: ".barra", estilo: ["background-color", "color", "padding-top", "padding-left"] },
      { texto: ".lateral es pegajoso a 64px del borde superior", sel: ".lateral", estilo: ["position", "top"] },
    ],
  },
  {
    id: "flotar",
    titulo: "Imagen flotando junto al texto (float y clear)",
    tema: "Posicionamiento",
    enunciado: `La imagen <code>.avatar</code> debe quedar a la izquierda con el texto rodeándola (<code>float: left</code>) y un margen derecho de <code>12px</code> e inferior de <code>8px</code>. El pie <code>.pie</code> no debe subirse junto a la imagen: <code>clear: both</code>, con una línea superior <code>1px solid #ccc</code>.`,
    html: plantilla(`  <img class="avatar" src="${LOGO}" width="100" alt="Logotipo">
  <p>${LOREM}</p>
  <p>${LOREM}</p>
  <div class="pie">Pie de página</div>`, "Float"),
    css: BASE,
    solHtml: plantilla(`  <img class="avatar" src="${LOGO}" width="100" alt="Logotipo">
  <p>${LOREM}</p>
  <p>${LOREM}</p>
  <div class="pie">Pie de página</div>`, "Float"),
    solCss: `${BASE}.avatar { float: left; margin: 0 12px 8px 0; }
.pie { clear: both; border-top: 1px solid #ccc; }
`,
    comprobar: [
      { texto: "La imagen flota a la izquierda", sel: ".avatar", estilo: ["float"] },
      { texto: "Margen derecho de 12px e inferior de 8px", sel: ".avatar", estilo: ["margin-right", "margin-bottom", "margin-top", "margin-left"] },
      { texto: "El pie despeja los elementos flotantes", sel: ".pie", estilo: ["clear"] },
      { texto: "El pie tiene una línea superior de 1px sólida y gris", sel: ".pie", estilo: ["border-top-width", "border-top-style", "border-top-color"] },
    ],
  },

  // ===================================== Flexbox =====================================
  {
    id: "flex-centrar",
    titulo: "Centrar con Flexbox",
    tema: "Flexbox",
    enunciado: `Centra el título y el párrafo de <code>.hero</code> tanto horizontal como verticalmente: <code>display: flex</code>, en columna (<code>flex-direction: column</code>), centrado en los dos ejes (<code>justify-content: center; align-items: center</code>) y con <code>gap: 8px</code>.`,
    html: plantilla(`  <div class="hero">
    <h1>Bienvenido</h1>
    <p>Aprende a maquetar</p>
  </div>`, "Centrar"),
    css: `body { font-family: Arial, sans-serif; margin: 0; }
.hero { height: 240px; background: #f4f1ff; }
.hero h1, .hero p { margin: 0; }
`,
    solHtml: plantilla(`  <div class="hero">
    <h1>Bienvenido</h1>
    <p>Aprende a maquetar</p>
  </div>`, "Centrar"),
    solCss: `body { font-family: Arial, sans-serif; margin: 0; }
.hero { height: 240px; background: #f4f1ff; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 8px; }
.hero h1, .hero p { margin: 0; }
`,
    comprobar: [
      { texto: ".hero es un contenedor flex", sel: ".hero", estilo: ["display"] },
      { texto: "Los elementos van en columna", sel: ".hero", estilo: ["flex-direction"] },
      { texto: "Centrados en los dos ejes", sel: ".hero", estilo: ["justify-content", "align-items"] },
      { texto: "Hueco de 8px entre ellos", sel: ".hero", estilo: ["row-gap"] },
    ],
  },
  {
    id: "flex-tarjetas",
    titulo: "Tarjetas que se reparten el espacio",
    tema: "Flexbox",
    enunciado: `Cinco tarjetas en una fila que pasa a la línea siguiente cuando no caben: <code>.fila</code> con <code>display: flex</code>, <code>flex-wrap: wrap</code> y <code>gap: 16px</code>. Cada <code>.tarjeta</code> crece para repartir el espacio, puede encoger y parte de <code>180px</code>: <code>flex: 1 1 180px</code>.`,
    html: plantilla(`  <div class="fila">
    <div class="tarjeta">Uno</div>
    <div class="tarjeta">Dos</div>
    <div class="tarjeta">Tres</div>
    <div class="tarjeta">Cuatro</div>
    <div class="tarjeta">Cinco</div>
  </div>`, "Tarjetas"),
    css: `${BASE}.tarjeta { background: #4a2fb5; color: #fff; padding: 20px; border-radius: 8px; }
`,
    solHtml: plantilla(`  <div class="fila">
    <div class="tarjeta">Uno</div>
    <div class="tarjeta">Dos</div>
    <div class="tarjeta">Tres</div>
    <div class="tarjeta">Cuatro</div>
    <div class="tarjeta">Cinco</div>
  </div>`, "Tarjetas"),
    solCss: `${BASE}.tarjeta { background: #4a2fb5; color: #fff; padding: 20px; border-radius: 8px; flex: 1 1 180px; }
.fila { display: flex; flex-wrap: wrap; gap: 16px; }
`,
    comprobar: [
      { texto: ".fila es flex y pasa a la línea siguiente", sel: ".fila", estilo: ["display", "flex-wrap"] },
      { texto: "Huecos de 16px", sel: ".fila", estilo: ["row-gap", "column-gap"] },
      { texto: "Las tarjetas tienen flex: 1 1 180px", sel: ".tarjeta", estilo: ["flex-grow", "flex-shrink", "flex-basis"] },
      { texto: "Las tarjetas se reparten el ancho igual que en el objetivo", sel: ".tarjeta", estilo: ["width"] },
    ],
  },
  {
    id: "flex-pagina",
    titulo: "Pie siempre abajo y cabecera repartida",
    tema: "Flexbox",
    enunciado: `Maqueta la página con Flexbox: el <code>body</code> es un contenedor flex en columna (<code>display: flex; flex-direction: column; min-height: 100vh</code>); el <code>main</code> ocupa el espacio sobrante (<code>flex: 1</code>) para que el pie quede abajo; y el <code>header</code> es flex con el título a la izquierda y el menú a la derecha (<code>justify-content: space-between; align-items: center</code>).`,
    html: plantilla(`  <header>
    <strong>Mi sitio</strong>
    <nav><a href="#">Inicio</a> <a href="#">Contacto</a></nav>
  </header>
  <main>Contenido breve</main>
  <footer>Pie de página</footer>`, "Página flex"),
    css: `body { font-family: Arial, sans-serif; margin: 0; }
header, footer { background: #2a1770; color: #fff; padding: 12px 16px; }
header a { color: #fff; }
main { padding: 16px; }
`,
    solHtml: plantilla(`  <header>
    <strong>Mi sitio</strong>
    <nav><a href="#">Inicio</a> <a href="#">Contacto</a></nav>
  </header>
  <main>Contenido breve</main>
  <footer>Pie de página</footer>`, "Página flex"),
    solCss: `body { font-family: Arial, sans-serif; margin: 0; display: flex; flex-direction: column; min-height: 100vh; }
header, footer { background: #2a1770; color: #fff; padding: 12px 16px; }
header a { color: #fff; }
main { padding: 16px; flex: 1; }
header { display: flex; justify-content: space-between; align-items: center; }
`,
    comprobar: [
      { texto: "El body es un contenedor flex en columna", sel: "body", estilo: ["display", "flex-direction"] },
      { texto: "El body ocupa al menos el alto de la pantalla", sel: "body", estilo: ["min-height"] },
      { texto: "El main ocupa el espacio sobrante", sel: "main", estilo: ["flex-grow", "height"] },
      { texto: "El header reparte título y menú", sel: "header", estilo: ["display", "justify-content", "align-items"] },
    ],
  },

  // ===================================== Grid =====================================
  {
    id: "grid-areas",
    titulo: "Página con áreas",
    tema: "Grid",
    enunciado: `Define la rejilla de <code>.pagina</code>: dos columnas (<code>140px 1fr</code>), tres filas (<code>auto 1fr auto</code>), huecos de <code>10px</code> y estas áreas con <code>grid-template-areas</code>: <code>"cab cab" "menu cont" "pie pie"</code>. Después asigna cada elemento a su área (<code>grid-area</code>): <code>header</code> → cab, <code>nav</code> → menu, <code>main</code> → cont, <code>footer</code> → pie.`,
    html: plantilla(`  <div class="pagina">
    <header>Cabecera</header>
    <nav>Menú</nav>
    <main>Contenido</main>
    <footer>Pie</footer>
  </div>`, "Áreas"),
    css: `${BASE}.pagina { min-height: 320px; }
header, nav, main, footer { padding: 10px; background: #f4f1ff; border: 1px solid #b9b0ea; }
header, footer { background: #2a1770; color: #fff; }
`,
    solHtml: plantilla(`  <div class="pagina">
    <header>Cabecera</header>
    <nav>Menú</nav>
    <main>Contenido</main>
    <footer>Pie</footer>
  </div>`, "Áreas"),
    solCss: `${BASE}.pagina { min-height: 320px; display: grid; grid-template-columns: 140px 1fr; grid-template-rows: auto 1fr auto; gap: 10px; grid-template-areas: "cab cab" "menu cont" "pie pie"; }
header, nav, main, footer { padding: 10px; background: #f4f1ff; border: 1px solid #b9b0ea; }
header, footer { background: #2a1770; color: #fff; }
header { grid-area: cab; }
nav { grid-area: menu; }
main { grid-area: cont; }
footer { grid-area: pie; }
`,
    comprobar: [
      { texto: ".pagina es una rejilla con las áreas pedidas", sel: ".pagina", estilo: ["display", "grid-template-areas"] },
      { texto: "Columnas 140px 1fr y filas auto 1fr auto", sel: ".pagina", estilo: ["grid-template-columns", "grid-template-rows"] },
      { texto: "Huecos de 10px", sel: ".pagina", estilo: ["row-gap", "column-gap"] },
      { texto: "La cabecera ocupa las dos columnas", sel: "header", estilo: ["width", "height"] },
      { texto: "El menú y el contenido están en su sitio", sel: "nav, main", estilo: ["width", "height"] },
      { texto: "El pie ocupa las dos columnas", sel: "footer", estilo: ["width", "height"] },
    ],
  },
  {
    id: "grid-galeria",
    titulo: "Galería adaptable",
    tema: "Grid",
    enunciado: `Galería que mete tantas columnas como quepan: <code>.galeria</code> con <code>display: grid</code>, <code>grid-template-columns: repeat(auto-fill, minmax(120px, 1fr))</code> y <code>gap: 10px</code>. Las fotos, cuadradas (<code>aspect-ratio: 1</code>).`,
    html: plantilla(`  <div class="galeria">
    <div class="foto">1</div>
    <div class="foto">2</div>
    <div class="foto">3</div>
    <div class="foto">4</div>
    <div class="foto">5</div>
    <div class="foto">6</div>
    <div class="foto">7</div>
    <div class="foto">8</div>
  </div>`, "Galería"),
    css: `${BASE}.foto { background: #4a2fb5; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 22px; }
`,
    solHtml: plantilla(`  <div class="galeria">
    <div class="foto">1</div>
    <div class="foto">2</div>
    <div class="foto">3</div>
    <div class="foto">4</div>
    <div class="foto">5</div>
    <div class="foto">6</div>
    <div class="foto">7</div>
    <div class="foto">8</div>
  </div>`, "Galería"),
    solCss: `${BASE}.foto { background: #4a2fb5; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 22px; aspect-ratio: 1; }
.galeria { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; }
`,
    comprobar: [
      { texto: ".galeria es una rejilla", sel: ".galeria", estilo: ["display"] },
      { texto: "Columnas adaptables (auto-fill y minmax)", sel: ".galeria", estilo: ["grid-template-columns"] },
      { texto: "Huecos de 10px", sel: ".galeria", estilo: ["row-gap", "column-gap"] },
      { texto: "Las fotos son cuadradas", sel: ".foto", estilo: ["aspect-ratio", "width", "height"] },
    ],
  },
  {
    id: "grid-formulario",
    titulo: "Formulario en dos columnas",
    tema: "Grid",
    enunciado: `Coloca el formulario en una rejilla de dos columnas: etiquetas a la izquierda (columna <code>auto</code>) y campos a la derecha (<code>1fr</code>): <code>grid-template-columns: auto 1fr</code>, <code>gap: 10px 12px</code> (filas, columnas), <code>align-items: center</code> y <code>max-width: 420px</code>. El botón va en la segunda columna (<code>grid-column: 2</code>) y pegado a la izquierda (<code>justify-self: start</code>).`,
    html: plantilla(`  <form class="rejilla-form" action="#">
    <label for="a">Nombre</label>
    <input type="text" id="a" name="nombre">
    <label for="b">Correo</label>
    <input type="email" id="b" name="correo">
    <label for="c">Mensaje</label>
    <textarea id="c" name="mensaje" rows="3"></textarea>
    <button type="submit">Enviar</button>
  </form>`, "Formulario en rejilla"),
    css: BASE,
    solHtml: plantilla(`  <form class="rejilla-form" action="#">
    <label for="a">Nombre</label>
    <input type="text" id="a" name="nombre">
    <label for="b">Correo</label>
    <input type="email" id="b" name="correo">
    <label for="c">Mensaje</label>
    <textarea id="c" name="mensaje" rows="3"></textarea>
    <button type="submit">Enviar</button>
  </form>`, "Formulario en rejilla"),
    solCss: `${BASE}.rejilla-form { display: grid; grid-template-columns: auto 1fr; gap: 10px 12px; align-items: center; max-width: 420px; }
.rejilla-form button { grid-column: 2; justify-self: start; }
`,
    comprobar: [
      { texto: "El formulario es una rejilla de dos columnas", sel: ".rejilla-form", estilo: ["display", "grid-template-columns"] },
      { texto: "Huecos de 10px entre filas y 12px entre columnas", sel: ".rejilla-form", estilo: ["row-gap", "column-gap"] },
      { texto: "Elementos centrados verticalmente y ancho máximo de 420px", sel: ".rejilla-form", estilo: ["align-items", "max-width"] },
      { texto: "El botón va en la segunda columna", sel: "button", estilo: ["grid-column-start", "justify-self"] },
    ],
  },

  // ===================================== Diseño adaptable =====================================
  {
    id: "resp-media",
    titulo: "Media queries: menú y lateral",
    tema: "Diseño adaptable",
    enunciado: `En pantallas estrechas (<code>@media (max-width: 700px)</code>) el menú <code>.menu</code> pasa a columna (<code>flex-direction: column</code>) y el anuncio <code>.lateral</code> desaparece (<code>display: none</code>). La comprobación se hace con una pantalla de <b>640 px</b>; para verlo en la vista previa, estrecha la ventana.`,
    html: plantilla(`  <nav class="menu">
    <a href="#">Inicio</a>
    <a href="#">Apuntes</a>
    <a href="#">Contacto</a>
  </nav>
  <aside class="lateral">Anuncio</aside>
  <main>Contenido principal</main>`, "Responsive"),
    css: `${BASE}.menu { display: flex; gap: 12px; }
.menu a { padding: 8px 12px; background: #f4f1ff; text-decoration: none; }
.lateral { background: #fff4d6; padding: 10px; margin: 12px 0; }
`,
    solHtml: plantilla(`  <nav class="menu">
    <a href="#">Inicio</a>
    <a href="#">Apuntes</a>
    <a href="#">Contacto</a>
  </nav>
  <aside class="lateral">Anuncio</aside>
  <main>Contenido principal</main>`, "Responsive"),
    solCss: `${BASE}.menu { display: flex; gap: 12px; }
.menu a { padding: 8px 12px; background: #f4f1ff; text-decoration: none; }
.lateral { background: #fff4d6; padding: 10px; margin: 12px 0; }
@media (max-width: 700px) {
  .menu { flex-direction: column; }
  .lateral { display: none; }
}
`,
    comprobar: [
      { texto: "En pantalla estrecha el menú va en columna", sel: ".menu", estilo: ["flex-direction"] },
      { texto: "En pantalla estrecha el anuncio desaparece", sel: ".lateral", estilo: ["display"] },
      { texto: "El menú sigue siendo flex y con huecos de 12px", sel: ".menu", estilo: ["display", "row-gap"] },
    ],
  },
  {
    id: "resp-fluida",
    titulo: "Tipografía e imágenes fluidas",
    tema: "Diseño adaptable",
    enunciado: `Con funciones de CSS: el <code>h1</code> con letra fluida <code>font-size: clamp(1.5rem, 5vw, 3rem)</code>; el párrafo <code>.texto</code> con una línea de lectura cómoda (<code>max-width: 60ch</code>); y la imagen con <code>width: min(100%, 400px)</code> (nunca más de 400 px ni más que su contenedor) y <code>height: auto</code>.`,
    html: plantilla(`  <h1>Título fluido</h1>
  <p class="texto">${LOREM}</p>
  <img src="${LOGO}" alt="Logotipo">`, "Fluido"),
    css: BASE,
    solHtml: plantilla(`  <h1>Título fluido</h1>
  <p class="texto">${LOREM}</p>
  <img src="${LOGO}" alt="Logotipo">`, "Fluido"),
    solCss: `${BASE}h1 { font-size: clamp(1.5rem, 5vw, 3rem); }
.texto { max-width: 60ch; }
img { width: min(100%, 400px); height: auto; }
`,
    comprobar: [
      { texto: "El h1 tiene tipografía fluida", sel: "h1", estilo: ["font-size"] },
      { texto: ".texto tiene un ancho máximo de 60ch", sel: ".texto", estilo: ["max-width", "width"] },
      { texto: "La imagen mide como mucho 400px y no se sale de su contenedor", sel: "img", estilo: ["width"] },
    ],
  },

  // ===================================== Variables y efectos =====================================
  {
    id: "variables",
    titulo: "Variables CSS",
    tema: "Variables y efectos",
    enunciado: `Define en <code>:root</code> tres variables: <code>--morado: #2a1770</code>, <code>--rojo: #da251c</code> y <code>--radio: 10px</code>. Úsalas con <code>var()</code>: <code>.titulo</code> con color morado; <code>.boton</code> con fondo morado, texto blanco, sin borde, <code>padding: 10px 18px</code> y esquinas con el radio; <code>.aviso</code> con borde izquierdo de <code>6px solid</code> rojo, <code>padding: 8px 12px</code> y esquinas con el radio.`,
    html: plantilla(`  <h1 class="titulo">Variables CSS</h1>
  <button class="boton">Aceptar</button>
  <p class="aviso">Un aviso con el mismo radio.</p>`, "Variables"),
    css: BASE,
    solHtml: plantilla(`  <h1 class="titulo">Variables CSS</h1>
  <button class="boton">Aceptar</button>
  <p class="aviso">Un aviso con el mismo radio.</p>`, "Variables"),
    solCss: `:root { --morado: #2a1770; --rojo: #da251c; --radio: 10px; }
${BASE}.titulo { color: var(--morado); }
.boton { background: var(--morado); color: #fff; border: 0; padding: 10px 18px; border-radius: var(--radio); }
.aviso { border-left: 6px solid var(--rojo); padding: 8px 12px; border-radius: var(--radio); }
`,
    comprobar: [
      { texto: "Las tres variables están definidas en :root", sel: ":root", estilo: ["--morado", "--rojo", "--radio"] },
      { texto: ".titulo usa el color morado", sel: ".titulo", estilo: ["color"] },
      { texto: ".boton: fondo morado, texto blanco y sin borde", sel: ".boton", estilo: ["background-color", "color", "border-top-width"] },
      { texto: ".boton: relleno y esquinas con --radio", sel: ".boton", estilo: ["padding-top", "padding-left", "border-top-left-radius"] },
      { texto: ".aviso: borde rojo de 6px, relleno y esquinas", sel: ".aviso", estilo: ["border-left-width", "border-left-color", "padding-top", "padding-left", "border-top-left-radius"] },
    ],
  },
  {
    id: "transiciones",
    titulo: "Transiciones suaves",
    tema: "Variables y efectos",
    enunciado: `Que el botón cambie con suavidad: <code>transition</code> de <code>background-color</code> y de <code>transform</code>, de <code>0.3s</code>, con la curva <code>ease-in-out</code>, y <code>cursor: pointer</code>. Después añade <code>.boton:hover</code> con otro fondo (<code>#da251c</code>) y <code>transform: scale(1.05)</code>. Pasa el ratón por la vista previa para verlo; la comprobación revisa la transición y el cursor.`,
    html: plantilla(`  <button class="boton">Pasa el ratón por encima</button>`, "Transiciones"),
    css: `${BASE}.boton { background: #2a1770; color: #fff; border: 0; padding: 12px 20px; border-radius: 8px; font-size: 16px; }
`,
    solHtml: plantilla(`  <button class="boton">Pasa el ratón por encima</button>`, "Transiciones"),
    solCss: `${BASE}.boton { background: #2a1770; color: #fff; border: 0; padding: 12px 20px; border-radius: 8px; font-size: 16px; transition: background-color 0.3s ease-in-out, transform 0.3s ease-in-out; cursor: pointer; }
.boton:hover { background: #da251c; transform: scale(1.05); }
`,
    comprobar: [
      { texto: "Transición de background-color y transform", sel: ".boton", estilo: ["transition-property"] },
      { texto: "Duración de 0.3s", sel: ".boton", estilo: ["transition-duration"] },
      { texto: "Curva ease-in-out", sel: ".boton", estilo: ["transition-timing-function"] },
      { texto: "El cursor es una mano", sel: ".boton", estilo: ["cursor"] },
    ],
  },
  {
    id: "animacion",
    titulo: "Animación con @keyframes",
    tema: "Variables y efectos",
    enunciado: `Haz latir el corazón: define unos fotogramas <code>@keyframes latido</code> (al <code>0%</code> y al <code>100%</code> <code>transform: scale(1)</code>; al <code>50%</code> <code>transform: scale(1.2)</code>) y aplícalos a <code>.corazon</code> con <code>animation: latido 1.2s ease-in-out infinite</code>. La comprobación revisa la animación aplicada; los fotogramas los juzgas tú viendo la vista previa.`,
    html: plantilla(`  <div class="corazon">♥</div>`, "Animación"),
    css: `${BASE}.corazon { font-size: 64px; color: #da251c; width: 80px; text-align: center; }
`,
    solHtml: plantilla(`  <div class="corazon">♥</div>`, "Animación"),
    solCss: `${BASE}.corazon { font-size: 64px; color: #da251c; width: 80px; text-align: center; animation: latido 1.2s ease-in-out infinite; }
@keyframes latido {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
`,
    comprobar: [
      { texto: "La animación se llama «latido»", sel: ".corazon", estilo: ["animation-name"] },
      { texto: "Dura 1.2s con la curva ease-in-out", sel: ".corazon", estilo: ["animation-duration", "animation-timing-function"] },
      { texto: "Se repite sin parar", sel: ".corazon", estilo: ["animation-iteration-count"] },
    ],
  },
];

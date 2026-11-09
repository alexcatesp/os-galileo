// Retos de HTML del Laboratorio, agrupados por tema. Mismo formato que los de `retos.ts`:
// se compara el RESULTADO de la página del alumno con el de la solución.

import { LOGO, plantilla } from "./plantilla";
import type { Reto } from "./retos";

const ESTILO_BASE = `body { font-family: Arial, sans-serif; margin: 16px; }
`;

export const RETOS_HTML: Reto[] = [
  // ===================================== Texto y estructura =====================================
  {
    id: "enfasis",
    titulo: "Énfasis y saltos de línea",
    tema: "Texto y estructura",
    enunciado: `Marca el texto: <b>Lenguajes de marcas</b> en cursiva con <code>em</code>, <b>muy importante</b> en negrita con <code>strong</code>, un salto de línea <code>br</code> antes de «Repasa los temas 1 a 3.» y una línea horizontal <code>hr</code> entre los dos párrafos.`,
    html: plantilla(`  <h1>Recordatorio</h1>
  <p>El examen de Lenguajes de marcas es muy importante.Repasa los temas 1 a 3.</p>
  <p>Aula 2.04 — IES Galileo</p>`, "Recordatorio"),
    css: ESTILO_BASE,
    solHtml: plantilla(`  <h1>Recordatorio</h1>
  <p>El examen de <em>Lenguajes de marcas</em> es <strong>muy importante</strong>.<br>Repasa los temas 1 a 3.</p>
  <hr>
  <p>Aula 2.04 — IES Galileo</p>`, "Recordatorio"),
    solCss: ESTILO_BASE,
    comprobar: [
      { texto: "«Lenguajes de marcas» está en <em>", sel: "em", cuenta: true, contenido: true },
      { texto: "«muy importante» está en <strong>", sel: "strong", cuenta: true, contenido: true },
      { texto: "Hay un salto de línea <br>", sel: "br", cuenta: true },
      { texto: "Hay una línea horizontal <hr>", sel: "hr", cuenta: true },
      { texto: "Siguen siendo dos párrafos", sel: "p", cuenta: true, contenido: true },
    ],
  },
  {
    id: "encabezados",
    titulo: "Jerarquía de encabezados",
    tema: "Texto y estructura",
    enunciado: `Todo está escrito con párrafos. Cambia cada uno por la etiqueta de encabezado que le corresponde según su clase: <code>t1</code> → <code>h1</code>, <code>t2</code> → <code>h2</code>, <code>t3</code> → <code>h3</code>. Los textos no cambian.`,
    html: plantilla(`  <p class="t1">Mi blog</p>
  <p class="t2">Recetas</p>
  <p class="t3">Tortilla</p>
  <p class="t3">Gazpacho</p>
  <p class="t2">Viajes</p>
  <p class="t3">Valencia</p>`, "Blog"),
    css: ESTILO_BASE,
    solHtml: plantilla(`  <h1>Mi blog</h1>
  <h2>Recetas</h2>
  <h3>Tortilla</h3>
  <h3>Gazpacho</h3>
  <h2>Viajes</h2>
  <h3>Valencia</h3>`, "Blog"),
    solCss: ESTILO_BASE,
    comprobar: [
      { texto: "Hay un único <h1> con «Mi blog»", sel: "h1", cuenta: true, contenido: true },
      { texto: "Hay dos <h2>: Recetas y Viajes", sel: "h2", cuenta: true, contenido: true },
      { texto: "Hay tres <h3>: Tortilla, Gazpacho y Valencia", sel: "h3", cuenta: true, contenido: true },
      { texto: "Ya no quedan párrafos sueltos", sel: "p", cuenta: true },
    ],
  },
  {
    id: "citas-codigo",
    titulo: "Citas y código",
    tema: "Texto y estructura",
    enunciado: `Escribe: una cita larga <code>blockquote</code> (con <code>cite="https://example.com/apuntes"</code>) con un párrafo que diga <b>Primero estructura, después estilo.</b>; una frase que diga <b>Pulsa Ctrl + S para guardar.</b> con cada tecla en <code>kbd</code>; y un bloque <code>pre</code> con un <code>code</code> que contenga el texto <code>&lt;h1&gt;Hola&lt;/h1&gt;</code> (recuerda escribir los símbolos &lt; y &gt; como entidades).`,
    html: plantilla(`  <h1>Apuntes</h1>
  <!-- Tu contenido aquí -->`, "Apuntes"),
    css: ESTILO_BASE,
    solHtml: plantilla(`  <h1>Apuntes</h1>
  <blockquote cite="https://example.com/apuntes">
    <p>Primero estructura, después estilo.</p>
  </blockquote>
  <p>Pulsa <kbd>Ctrl</kbd> + <kbd>S</kbd> para guardar.</p>
  <pre><code>&lt;h1&gt;Hola&lt;/h1&gt;</code></pre>`, "Apuntes"),
    solCss: ESTILO_BASE,
    comprobar: [
      { texto: "Hay un <blockquote> con la cita", sel: "blockquote", cuenta: true, contenido: true },
      { texto: "El blockquote lleva el atributo cite", sel: "blockquote", atributos: ["cite"] },
      { texto: "Hay dos teclas <kbd>: Ctrl y S", sel: "kbd", cuenta: true, contenido: true },
      { texto: "Hay un bloque <pre> con <code>", sel: "pre > code", cuenta: true },
      { texto: "El código muestra «<h1>Hola</h1>» como texto", sel: "pre", contenido: true },
    ],
  },
  {
    id: "cabecera-documento",
    titulo: "La cabecera del documento",
    tema: "Texto y estructura",
    enunciado: `Completa el documento: idioma español en la etiqueta <code>html</code> (<code>lang="es"</code>), codificación <code>&lt;meta charset="UTF-8"&gt;</code>, el <code>title</code> <b>IES Galileo — Inicio</b>, la etiqueta <code>viewport</code> (<code>width=device-width, initial-scale=1</code>) y una <code>description</code> que diga <b>Instituto de Formación Profesional</b>.`,
    html: `<!DOCTYPE html>
<html>
<head>
</head>
<body>
  <h1>IES Galileo</h1>
</body>
</html>
`,
    css: ``,
    solHtml: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Instituto de Formación Profesional">
  <title>IES Galileo — Inicio</title>
</head>
<body>
  <h1>IES Galileo</h1>
</body>
</html>
`,
    solCss: ``,
    comprobar: [
      { texto: "El documento declara lang=\"es\"", sel: "html", atributos: ["lang"] },
      { texto: "Hay una etiqueta meta charset", sel: "meta[charset]", cuenta: true, atributos: ["charset"] },
      { texto: "La etiqueta viewport es correcta", sel: "meta[name='viewport']", cuenta: true, atributos: ["content"] },
      { texto: "La descripción es correcta", sel: "meta[name='description']", cuenta: true, atributos: ["content"] },
      { texto: "El título es «IES Galileo — Inicio»", sel: "title", cuenta: true, contenido: true },
    ],
  },

  // ===================================== Listas =====================================
  {
    id: "lista-ordenada",
    titulo: "Pasos numerados",
    tema: "Listas",
    enunciado: `Crea una lista ordenada <code>ol</code> que empiece a contar en <b>3</b> (<code>start="3"</code>) y use letras mayúsculas (<code>type="A"</code>). Tres elementos: <b>Abrir el editor</b>, <b>Escribir el HTML</b> y <b>Guardar el archivo</b>.`,
    html: plantilla(`  <h1>Cómo se hace una web</h1>
  <!-- Tu lista aquí -->`, "Pasos"),
    css: ESTILO_BASE,
    solHtml: plantilla(`  <h1>Cómo se hace una web</h1>
  <ol start="3" type="A">
    <li>Abrir el editor</li>
    <li>Escribir el HTML</li>
    <li>Guardar el archivo</li>
  </ol>`, "Pasos"),
    solCss: ESTILO_BASE,
    comprobar: [
      { texto: "Hay una lista ordenada <ol>", sel: "ol", cuenta: true },
      { texto: "Empieza en 3 y usa letras mayúsculas", sel: "ol", atributos: ["start", "type"], estilo: ["list-style-type"] },
      { texto: "Tiene tres <li> con los textos pedidos", sel: "ol li", cuenta: true, contenido: true },
    ],
  },
  {
    id: "lista-anidada",
    titulo: "Listas anidadas",
    tema: "Listas",
    enunciado: `Crea un índice con una lista <code>ul</code> de dos elementos: <b>Frontend</b> y <b>Backend</b>. Dentro de cada uno, otra lista <code>ul</code> anidada: en Frontend <b>HTML</b> y <b>CSS</b>; en Backend <b>PHP</b> y <b>SQL</b>. La lista interior va <em>dentro</em> del <code>li</code>, no a su lado.`,
    html: plantilla(`  <h1>Tecnologías</h1>
  <!-- Tu lista aquí -->`, "Tecnologías"),
    css: ESTILO_BASE,
    solHtml: plantilla(`  <h1>Tecnologías</h1>
  <ul>
    <li>Frontend
      <ul>
        <li>HTML</li>
        <li>CSS</li>
      </ul>
    </li>
    <li>Backend
      <ul>
        <li>PHP</li>
        <li>SQL</li>
      </ul>
    </li>
  </ul>`, "Tecnologías"),
    solCss: ESTILO_BASE,
    comprobar: [
      { texto: "Hay tres listas <ul> (una exterior y dos anidadas)", sel: "ul", cuenta: true },
      { texto: "Las dos listas interiores están dentro de un <li>", sel: "li > ul", cuenta: true },
      { texto: "Hay seis elementos <li> en total", sel: "li", cuenta: true },
      { texto: "Los cuatro elementos interiores son HTML, CSS, PHP y SQL", sel: "ul ul li", cuenta: true, contenido: true },
    ],
  },
  {
    id: "lista-definicion",
    titulo: "Lista de definiciones",
    tema: "Listas",
    enunciado: `Un glosario se escribe con <code>dl</code> (lista), <code>dt</code> (término) y <code>dd</code> (descripción). Tres términos: <b>HTML</b> → <i>Lenguaje de marcas para estructurar páginas</i>; <b>CSS</b> → <i>Lenguaje para dar estilo a las páginas</i>; <b>DOM</b> → <i>Árbol de objetos que representa la página</i>.`,
    html: plantilla(`  <h1>Glosario</h1>
  <!-- Tu glosario aquí -->`, "Glosario"),
    css: ESTILO_BASE,
    solHtml: plantilla(`  <h1>Glosario</h1>
  <dl>
    <dt>HTML</dt>
    <dd>Lenguaje de marcas para estructurar páginas</dd>
    <dt>CSS</dt>
    <dd>Lenguaje para dar estilo a las páginas</dd>
    <dt>DOM</dt>
    <dd>Árbol de objetos que representa la página</dd>
  </dl>`, "Glosario"),
    solCss: ESTILO_BASE,
    comprobar: [
      { texto: "Hay una lista de definiciones <dl>", sel: "dl", cuenta: true },
      { texto: "Hay tres términos <dt>: HTML, CSS y DOM", sel: "dt", cuenta: true, contenido: true },
      { texto: "Hay tres descripciones <dd> con los textos pedidos", sel: "dd", cuenta: true, contenido: true },
    ],
  },
  {
    id: "lista-estilo",
    titulo: "Listas con estilo",
    tema: "Listas",
    enunciado: `Con CSS: la lista <code>.etiquetas</code> sin viñetas ni relleno, y sus <code>li</code> como «píldoras» en línea (<code>display: inline-block</code>) con <code>padding: 4px 12px</code>, fondo <code>#f4f1ff</code>, esquinas de <code>999px</code> y <code>margin-right: 6px</code>. La lista <code>.pasos</code> numerada con números romanos mayúsculos (<code>upper-roman</code>).`,
    html: plantilla(`  <ul class="etiquetas">
    <li>HTML</li>
    <li>CSS</li>
    <li>JavaScript</li>
  </ul>
  <ol class="pasos">
    <li>Estructura</li>
    <li>Estilo</li>
    <li>Comportamiento</li>
  </ol>`, "Listas con estilo"),
    css: ESTILO_BASE,
    solHtml: plantilla(`  <ul class="etiquetas">
    <li>HTML</li>
    <li>CSS</li>
    <li>JavaScript</li>
  </ul>
  <ol class="pasos">
    <li>Estructura</li>
    <li>Estilo</li>
    <li>Comportamiento</li>
  </ol>`, "Listas con estilo"),
    solCss: `${ESTILO_BASE}.etiquetas { list-style: none; padding: 0; }
.etiquetas li { display: inline-block; padding: 4px 12px; background: #f4f1ff; border-radius: 999px; margin-right: 6px; }
.pasos { list-style-type: upper-roman; }
`,
    comprobar: [
      { texto: ".etiquetas sin viñetas ni relleno", sel: ".etiquetas", estilo: ["list-style-type", "padding-left"] },
      { texto: "Los li son píldoras en línea", sel: ".etiquetas li", estilo: ["display", "padding-top", "padding-left"] },
      { texto: "Fondo #f4f1ff y esquinas de 999px", sel: ".etiquetas li", estilo: ["background-color", "border-top-left-radius"] },
      { texto: "Margen derecho de 6px", sel: ".etiquetas li", estilo: ["margin-right"] },
      { texto: ".pasos usa números romanos mayúsculos", sel: ".pasos", estilo: ["list-style-type"] },
    ],
  },

  // ===================================== Enlaces e imágenes =====================================
  {
    id: "anclas",
    titulo: "Enlaces dentro de la página",
    tema: "Enlaces e imágenes",
    enunciado: `Convierte el índice en un menú que salte a cada sección: los enlaces apuntan a <code>#tema1</code> y <code>#tema2</code>, y los dos <code>h2</code> llevan esos mismos <code>id</code>. Pon <code>id="arriba"</code> al <code>h1</code> y, al final, un enlace <b>Volver arriba</b> que apunte a <code>#arriba</code>.`,
    html: plantilla(`  <h1>Apuntes</h1>
  <ul>
    <li><a>Tema 1</a></li>
    <li><a>Tema 2</a></li>
  </ul>
  <h2>Tema 1</h2>
  <p>Contenido del primer tema.</p>
  <h2>Tema 2</h2>
  <p>Contenido del segundo tema.</p>`, "Apuntes"),
    css: ESTILO_BASE,
    solHtml: plantilla(`  <h1 id="arriba">Apuntes</h1>
  <ul>
    <li><a href="#tema1">Tema 1</a></li>
    <li><a href="#tema2">Tema 2</a></li>
  </ul>
  <h2 id="tema1">Tema 1</h2>
  <p>Contenido del primer tema.</p>
  <h2 id="tema2">Tema 2</h2>
  <p>Contenido del segundo tema.</p>
  <a href="#arriba">Volver arriba</a>`, "Apuntes"),
    solCss: ESTILO_BASE,
    comprobar: [
      { texto: "Hay tres enlaces (dos del índice y «Volver arriba»)", sel: "a", cuenta: true, contenido: true },
      { texto: "Los enlaces apuntan a #tema1, #tema2 y #arriba", sel: "a", atributos: ["href"] },
      { texto: "Los dos h2 tienen los id tema1 y tema2", sel: "h2", atributos: ["id"] },
      { texto: "El h1 tiene id=\"arriba\"", sel: "h1", atributos: ["id"] },
    ],
  },
  {
    id: "correo-telefono",
    titulo: "Correo y teléfono",
    tema: "Enlaces e imágenes",
    enunciado: `Añade dos enlaces: <b>Escribir a secretaría</b> con <code>mailto:secretaria@iesgalileo.example</code> y <b>Llamar al centro</b> con <code>tel:+34960000000</code>. Cada uno con un atributo <code>title</code>: <b>Abre tu programa de correo</b> y <b>Llama desde el móvil</b>.`,
    html: plantilla(`  <h1>Contacto</h1>
  <!-- Tus enlaces aquí -->`, "Contacto"),
    css: ESTILO_BASE,
    solHtml: plantilla(`  <h1>Contacto</h1>
  <p><a href="mailto:secretaria@iesgalileo.example" title="Abre tu programa de correo">Escribir a secretaría</a></p>
  <p><a href="tel:+34960000000" title="Llama desde el móvil">Llamar al centro</a></p>`, "Contacto"),
    solCss: ESTILO_BASE,
    comprobar: [
      { texto: "Hay dos enlaces con los textos pedidos", sel: "a", cuenta: true, contenido: true },
      { texto: "Los enlaces usan mailto: y tel:", sel: "a", atributos: ["href"] },
      { texto: "Los enlaces tienen su atributo title", sel: "a", atributos: ["title"] },
    ],
  },
  {
    id: "figura",
    titulo: "Figura con pie de foto",
    tema: "Enlaces e imágenes",
    enunciado: `Envuelve la imagen en un <code>figure</code> y añade debajo un <code>figcaption</code> que diga <b>Logotipo del instituto</b>. A la imagen ponle <code>alt="Logotipo con un triángulo rojo sobre un círculo morado"</code>.`,
    html: plantilla(`  <h1>Nuestra imagen</h1>
  <img src="${LOGO}" width="120">`, "Figura"),
    css: ESTILO_BASE,
    solHtml: plantilla(`  <h1>Nuestra imagen</h1>
  <figure>
    <img src="${LOGO}" width="120" alt="Logotipo con un triángulo rojo sobre un círculo morado">
    <figcaption>Logotipo del instituto</figcaption>
  </figure>`, "Figura"),
    solCss: ESTILO_BASE,
    comprobar: [
      { texto: "Hay un <figure>", sel: "figure", cuenta: true },
      { texto: "La imagen está dentro del figure y tiene el alt pedido", sel: "figure > img", cuenta: true, atributos: ["alt"] },
      { texto: "El <figcaption> dice «Logotipo del instituto»", sel: "figure > figcaption", cuenta: true, contenido: true },
    ],
  },
  {
    id: "imagen-adaptable",
    titulo: "Imágenes que se adaptan",
    tema: "Enlaces e imágenes",
    enunciado: `La imagen mide 600 px y se sale de su marco de 300 px. Con CSS, que ninguna imagen se pase del ancho de su contenedor (<code>max-width: 100%</code>), que mantenga las proporciones (<code>height: auto</code>) y que sea un bloque (<code>display: block</code>) con las esquinas redondeadas de <code>8px</code>.`,
    html: plantilla(`  <div class="marco">
    <img src="${LOGO}" width="600" alt="Logotipo">
  </div>`, "Imagen adaptable"),
    css: `${ESTILO_BASE}.marco { width: 300px; border: 2px dashed #2a1770; }
`,
    solHtml: plantilla(`  <div class="marco">
    <img src="${LOGO}" width="600" alt="Logotipo">
  </div>`, "Imagen adaptable"),
    solCss: `${ESTILO_BASE}.marco { width: 300px; border: 2px dashed #2a1770; }
img { max-width: 100%; height: auto; display: block; border-radius: 8px; }
`,
    comprobar: [
      { texto: "La imagen no supera el ancho de su marco (max-width: 100%)", sel: "img", estilo: ["max-width", "width"] },
      { texto: "La imagen es un bloque (display: block)", sel: ".marco img", estilo: ["display"] },
      { texto: "Esquinas redondeadas de 8px", sel: "img", estilo: ["border-top-left-radius"] },
    ],
  },

  // ===================================== Tablas =====================================
  {
    id: "tabla-combinada",
    titulo: "Celdas combinadas",
    tema: "Tablas",
    enunciado: `Construye esta tabla de notas: la primera fila tiene <b>Módulo</b> (ocupa 2 filas, <code>rowspan="2"</code>) y <b>Notas</b> (ocupa 2 columnas, <code>colspan="2"</code>). La segunda fila tiene <b>1.ª ev.</b> y <b>2.ª ev.</b>. Después, dos filas de datos: <b>Programación · 7 · 8</b> y <b>Bases de datos · 6 · 9</b>.`,
    html: plantilla(`  <h1>Notas</h1>
  <!-- Tu tabla aquí -->`, "Notas"),
    css: `${ESTILO_BASE}table { border-collapse: collapse; }
td, th { border: 1px solid #2a1770; padding: 6px 12px; }
`,
    solHtml: plantilla(`  <h1>Notas</h1>
  <table>
    <tr><th rowspan="2">Módulo</th><th colspan="2">Notas</th></tr>
    <tr><th>1.ª ev.</th><th>2.ª ev.</th></tr>
    <tr><td>Programación</td><td>7</td><td>8</td></tr>
    <tr><td>Bases de datos</td><td>6</td><td>9</td></tr>
  </table>`, "Notas"),
    solCss: `${ESTILO_BASE}table { border-collapse: collapse; }
td, th { border: 1px solid #2a1770; padding: 6px 12px; }
`,
    comprobar: [
      { texto: "Hay cuatro celdas de cabecera <th> con los textos pedidos", sel: "th", cuenta: true, contenido: true },
      { texto: "«Módulo» ocupa 2 filas y «Notas» ocupa 2 columnas", sel: "th", atributos: ["rowspan", "colspan"] },
      { texto: "Hay seis celdas de datos <td>", sel: "td", cuenta: true, contenido: true },
      { texto: "La tabla tiene cuatro filas", sel: "tr", cuenta: true },
    ],
  },
  {
    id: "tabla-semantica",
    titulo: "Título y pie de tabla",
    tema: "Tablas",
    enunciado: `Tabla accesible del material del aula: un <code>caption</code> que diga <b>Material del aula</b>; en <code>thead</code> las cabeceras <b>Material</b> y <b>Unidades</b> con <code>scope="col"</code>; en <code>tbody</code> dos filas (<b>Teclados · 10</b> y <b>Ratones · 10</b>); y en <code>tfoot</code> la fila <b>Total · 20</b>.`,
    html: plantilla(`  <h1>Inventario</h1>
  <!-- Tu tabla aquí -->`, "Inventario"),
    css: `${ESTILO_BASE}table { border-collapse: collapse; }
td, th, caption { border: 1px solid #2a1770; padding: 6px 12px; }
`,
    solHtml: plantilla(`  <h1>Inventario</h1>
  <table>
    <caption>Material del aula</caption>
    <thead>
      <tr><th scope="col">Material</th><th scope="col">Unidades</th></tr>
    </thead>
    <tbody>
      <tr><td>Teclados</td><td>10</td></tr>
      <tr><td>Ratones</td><td>10</td></tr>
    </tbody>
    <tfoot>
      <tr><td>Total</td><td>20</td></tr>
    </tfoot>
  </table>`, "Inventario"),
    solCss: `${ESTILO_BASE}table { border-collapse: collapse; }
td, th, caption { border: 1px solid #2a1770; padding: 6px 12px; }
`,
    comprobar: [
      { texto: "La tabla tiene <caption> «Material del aula»", sel: "caption", cuenta: true, contenido: true },
      { texto: "Las cabeceras llevan scope=\"col\"", sel: "thead th", cuenta: true, contenido: true, atributos: ["scope"] },
      { texto: "El cuerpo tiene dos filas con sus datos", sel: "tbody td", cuenta: true, contenido: true },
      { texto: "Hay un <tfoot> con el total", sel: "tfoot td", cuenta: true, contenido: true },
    ],
  },
  {
    id: "tabla-cebra",
    titulo: "Tabla con filas alternas",
    tema: "Tablas",
    enunciado: `Con CSS: la tabla con los bordes colapsados (<code>border-collapse: collapse</code>); las filas pares del <code>tbody</code> con fondo <code>#f4f1ff</code> (<code>:nth-child(even)</code>); la última columna alineada a la derecha; y las celdas de cabecera (<code>th</code>) con fondo <code>#2a1770</code> y texto blanco.`,
    html: plantilla(`  <table>
    <thead>
      <tr><th>Módulo</th><th>Horas</th></tr>
    </thead>
    <tbody>
      <tr><td>Programación</td><td>256</td></tr>
      <tr><td>Bases de datos</td><td>192</td></tr>
      <tr><td>Lenguajes de marcas</td><td>96</td></tr>
      <tr><td>Sistemas</td><td>128</td></tr>
    </tbody>
  </table>`, "Tabla con filas alternas"),
    css: `${ESTILO_BASE}td, th { padding: 6px 12px; }
`,
    solHtml: plantilla(`  <table>
    <thead>
      <tr><th>Módulo</th><th>Horas</th></tr>
    </thead>
    <tbody>
      <tr><td>Programación</td><td>256</td></tr>
      <tr><td>Bases de datos</td><td>192</td></tr>
      <tr><td>Lenguajes de marcas</td><td>96</td></tr>
      <tr><td>Sistemas</td><td>128</td></tr>
    </tbody>
  </table>`, "Tabla con filas alternas"),
    solCss: `${ESTILO_BASE}td, th { padding: 6px 12px; }
table { border-collapse: collapse; }
tbody tr:nth-child(even) { background: #f4f1ff; }
td:last-child, th:last-child { text-align: right; }
th { background: #2a1770; color: #fff; }
`,
    comprobar: [
      { texto: "Bordes colapsados", sel: "table", estilo: ["border-collapse"] },
      { texto: "Las filas pares del cuerpo tienen fondo #f4f1ff", sel: "tbody tr:nth-child(even)", estilo: ["background-color"] },
      { texto: "Las filas impares del cuerpo no tienen fondo", sel: "tbody tr:nth-child(odd)", estilo: ["background-color"] },
      { texto: "La última columna va alineada a la derecha", sel: "td:last-child", estilo: ["text-align"] },
      { texto: "Las celdas de cabecera tienen fondo #2a1770 y texto blanco", sel: "th", estilo: ["background-color", "color"] },
    ],
  },

  // ===================================== Formularios =====================================
  {
    id: "form-opciones",
    titulo: "Radios, casillas y listas",
    tema: "Formularios",
    enunciado: `Dentro de un <code>form</code>: dos botones de radio del mismo grupo (<code>name="turno"</code>) con valores <code>manana</code> y <code>tarde</code> y sus etiquetas <b>Mañana</b> y <b>Tarde</b>; una casilla <code>checkbox</code> (<code>id="acepto"</code>, <code>name="acepto"</code>) con la etiqueta <b>Acepto las normas</b>; y una lista desplegable <code>select</code> (<code>id="ciclo"</code>, <code>name="ciclo"</code>) con las opciones <b>DAM</b>, <b>DAW</b> y <b>ASIR</b> (valores <code>dam</code>, <code>daw</code>, <code>asir</code>). Cada <code>label</code> con su <code>for</code>.`,
    html: plantilla(`  <h1>Matrícula</h1>
  <form action="#">
    <!-- Tus controles aquí -->
  </form>`, "Matrícula"),
    css: ESTILO_BASE,
    solHtml: plantilla(`  <h1>Matrícula</h1>
  <form action="#">
    <input type="radio" id="manana" name="turno" value="manana">
    <label for="manana">Mañana</label>
    <input type="radio" id="tarde" name="turno" value="tarde">
    <label for="tarde">Tarde</label>
    <p>
      <input type="checkbox" id="acepto" name="acepto">
      <label for="acepto">Acepto las normas</label>
    </p>
    <p>
      <select id="ciclo" name="ciclo">
        <option value="dam">DAM</option>
        <option value="daw">DAW</option>
        <option value="asir">ASIR</option>
      </select>
    </p>
  </form>`, "Matrícula"),
    solCss: ESTILO_BASE,
    comprobar: [
      { texto: "Hay dos radios con name=\"turno\" y los valores pedidos", sel: "input[type='radio']", cuenta: true, atributos: ["name", "value"] },
      { texto: "Hay una casilla con id y name \"acepto\"", sel: "input[type='checkbox']", cuenta: true, atributos: ["id", "name"] },
      { texto: "Hay un <select> con id y name \"ciclo\"", sel: "select", cuenta: true, atributos: ["id", "name"] },
      { texto: "El select tiene tres opciones con sus textos y valores", sel: "option", cuenta: true, contenido: true, atributos: ["value"] },
      { texto: "Hay tres etiquetas con su atributo for", sel: "label", cuenta: true, contenido: true, atributos: ["for"] },
    ],
  },
  {
    id: "form-fieldset",
    titulo: "Agrupar con fieldset",
    tema: "Formularios",
    enunciado: `Agrupa los campos en dos <code>fieldset</code>, cada uno con su <code>legend</code>: <b>Datos personales</b> (Nombre y Correo) y <b>Preferencias</b> (la casilla del boletín). El botón queda fuera de los grupos. Los campos y etiquetas no cambian.`,
    html: plantilla(`  <form action="#">
    <label for="n">Nombre</label>
    <input type="text" id="n" name="nombre">
    <label for="c">Correo</label>
    <input type="email" id="c" name="correo">
    <input type="checkbox" id="b" name="boletin">
    <label for="b">Quiero recibir el boletín</label>
    <button type="submit">Enviar</button>
  </form>`, "Matrícula"),
    css: ESTILO_BASE,
    solHtml: plantilla(`  <form action="#">
    <fieldset>
      <legend>Datos personales</legend>
      <label for="n">Nombre</label>
      <input type="text" id="n" name="nombre">
      <label for="c">Correo</label>
      <input type="email" id="c" name="correo">
    </fieldset>
    <fieldset>
      <legend>Preferencias</legend>
      <input type="checkbox" id="b" name="boletin">
      <label for="b">Quiero recibir el boletín</label>
    </fieldset>
    <button type="submit">Enviar</button>
  </form>`, "Matrícula"),
    solCss: ESTILO_BASE,
    comprobar: [
      { texto: "Hay dos <fieldset>", sel: "fieldset", cuenta: true },
      { texto: "Sus <legend> son «Datos personales» y «Preferencias»", sel: "fieldset > legend", cuenta: true, contenido: true },
      { texto: "El primer grupo contiene dos campos de texto y el segundo una casilla", sel: "fieldset input", cuenta: true, atributos: ["id"] },
      { texto: "El botón está fuera de los grupos", sel: "form > button", cuenta: true },
    ],
  },
  {
    id: "form-validacion",
    titulo: "Validación sin JavaScript",
    tema: "Formularios",
    enunciado: `Añade validación con atributos HTML: el usuario (<code>#usuario</code>) es obligatorio (<code>required</code>), de <code>minlength="3"</code> a <code>maxlength="12"</code>; la edad (<code>#edad</code>) es un número entre <code>min="16"</code> y <code>max="99"</code>, obligatoria; el DNI (<code>#dni</code>) obligatorio con <code>pattern="[0-9]{8}[A-Za-z]"</code> y un <code>placeholder</code> <b>12345678Z</b>.`,
    html: plantilla(`  <form action="#">
    <p><label for="usuario">Usuario</label> <input type="text" id="usuario" name="usuario"></p>
    <p><label for="edad">Edad</label> <input id="edad" name="edad"></p>
    <p><label for="dni">DNI</label> <input type="text" id="dni" name="dni"></p>
    <button type="submit">Enviar</button>
  </form>`, "Validación"),
    css: ESTILO_BASE,
    solHtml: plantilla(`  <form action="#">
    <p><label for="usuario">Usuario</label> <input type="text" id="usuario" name="usuario" required minlength="3" maxlength="12"></p>
    <p><label for="edad">Edad</label> <input type="number" id="edad" name="edad" min="16" max="99" required></p>
    <p><label for="dni">DNI</label> <input type="text" id="dni" name="dni" required pattern="[0-9]{8}[A-Za-z]" placeholder="12345678Z"></p>
    <button type="submit">Enviar</button>
  </form>`, "Validación"),
    solCss: ESTILO_BASE,
    comprobar: [
      { texto: "El usuario es obligatorio, de 3 a 12 caracteres", sel: "#usuario", atributos: ["required", "minlength", "maxlength"] },
      { texto: "La edad es un campo numérico obligatorio", sel: "#edad", atributos: ["type", "required"] },
      { texto: "La edad va de 16 a 99", sel: "#edad", atributos: ["min", "max"] },
      { texto: "El DNI es obligatorio y sigue el patrón", sel: "#dni", atributos: ["required", "pattern"] },
      { texto: "El DNI tiene el placeholder 12345678Z", sel: "#dni", atributos: ["placeholder"] },
    ],
  },
  {
    id: "form-controles",
    titulo: "Controles especiales",
    tema: "Formularios",
    enunciado: `HTML5 trae controles que no son de texto. Crea: una fecha (<code>type="date"</code>, <code>id="fecha"</code>); un deslizador (<code>type="range"</code>, <code>id="nota"</code>, <code>min="0"</code>, <code>max="10"</code>, <code>step="1"</code>, <code>value="5"</code>); un selector de color (<code>type="color"</code>, <code>id="color"</code>, <code>value="#2a1770"</code>); y un campo de texto <code>id="ciclo"</code> con <code>list="ciclos"</code> asociado a un <code>datalist</code> (<code>id="ciclos"</code>) con las opciones <b>DAM</b>, <b>DAW</b> y <b>ASIR</b>.`,
    html: plantilla(`  <form action="#">
    <!-- Tus controles aquí -->
  </form>`, "Controles"),
    css: ESTILO_BASE,
    solHtml: plantilla(`  <form action="#">
    <p><input type="date" id="fecha" name="fecha"></p>
    <p><input type="range" id="nota" name="nota" min="0" max="10" step="1" value="5"></p>
    <p><input type="color" id="color" name="color" value="#2a1770"></p>
    <p>
      <input type="text" id="ciclo" name="ciclo" list="ciclos">
      <datalist id="ciclos">
        <option value="DAM">
        <option value="DAW">
        <option value="ASIR">
      </datalist>
    </p>
  </form>`, "Controles"),
    solCss: ESTILO_BASE,
    comprobar: [
      { texto: "Hay un campo de fecha con id=\"fecha\"", sel: "#fecha", cuenta: true, atributos: ["type"] },
      { texto: "El deslizador tiene el rango, el paso y el valor pedidos", sel: "#nota", cuenta: true, atributos: ["type", "min", "max", "step", "value"] },
      { texto: "El selector de color vale #2a1770", sel: "#color", cuenta: true, atributos: ["type", "value"] },
      { texto: "El campo de texto se asocia a la lista «ciclos»", sel: "#ciclo", cuenta: true, atributos: ["list"] },
      { texto: "El datalist tiene tres opciones: DAM, DAW y ASIR", sel: "datalist#ciclos option", cuenta: true, atributos: ["value"] },
    ],
  },
  {
    id: "form-estilo",
    titulo: "Formulario con estilo",
    tema: "Formularios",
    enunciado: `Con CSS: los campos (<code>input</code> y <code>textarea</code>) ocupan todo el ancho (<code>width: 100%</code>) sin desbordar (<code>box-sizing: border-box</code>), con <code>padding: 8px</code>, borde <code>1px solid #b9b0ea</code> y esquinas de <code>6px</code>. El botón, fondo <code>#2a1770</code>, texto blanco, sin borde, <code>padding: 10px 18px</code>, esquinas de <code>6px</code> y <code>cursor: pointer</code>.`,
    html: plantilla(`  <form action="#" class="formulario">
    <label for="n">Nombre</label>
    <input type="text" id="n" name="nombre">
    <label for="m">Mensaje</label>
    <textarea id="m" name="mensaje" rows="3"></textarea>
    <button type="submit">Enviar</button>
  </form>`, "Formulario con estilo"),
    css: `${ESTILO_BASE}.formulario { width: 320px; }
label { display: block; margin-top: 10px; }
`,
    solHtml: plantilla(`  <form action="#" class="formulario">
    <label for="n">Nombre</label>
    <input type="text" id="n" name="nombre">
    <label for="m">Mensaje</label>
    <textarea id="m" name="mensaje" rows="3"></textarea>
    <button type="submit">Enviar</button>
  </form>`, "Formulario con estilo"),
    solCss: `${ESTILO_BASE}.formulario { width: 320px; }
label { display: block; margin-top: 10px; }
input, textarea { width: 100%; box-sizing: border-box; padding: 8px; border: 1px solid #b9b0ea; border-radius: 6px; }
button { margin-top: 12px; background: #2a1770; color: #fff; border: 0; padding: 10px 18px; border-radius: 6px; cursor: pointer; }
`,
    comprobar: [
      { texto: "Los campos ocupan todo el ancho sin desbordar", sel: "input, textarea", estilo: ["width", "box-sizing"] },
      { texto: "Relleno de 8px en los campos", sel: "input, textarea", estilo: ["padding-top", "padding-left"] },
      { texto: "Borde de 1px sólido #b9b0ea con esquinas de 6px", sel: "input, textarea", estilo: ["border-top-width", "border-top-style", "border-top-color", "border-top-left-radius"] },
      { texto: "Botón: fondo #2a1770, texto blanco y sin borde", sel: "button", estilo: ["background-color", "color", "border-top-width"] },
      { texto: "Botón: padding, esquinas y cursor", sel: "button", estilo: ["padding-top", "padding-left", "border-top-left-radius", "cursor"] },
    ],
  },

  // ===================================== Semántica HTML5 =====================================
  {
    id: "semantica-articulo",
    titulo: "Artículo con secciones",
    tema: "Semántica HTML5",
    enunciado: `Sustituye los <code>div</code> y <code>span</code> por las etiquetas con significado: <code>article</code> (el conjunto), <code>time</code> con <code>datetime="2026-11-12"</code> (la fecha), <code>section</code> (el programa), <code>aside</code> (el cuadro lateral) y <code>address</code> (los datos de contacto). El texto no cambia.`,
    html: plantilla(`  <div class="articulo">
    <h1>Jornada de puertas abiertas</h1>
    <p>Publicado el <span class="fecha">12 de noviembre de 2026</span></p>
    <div class="seccion">
      <h2>Programa</h2>
      <p>Visitas guiadas a los talleres y charlas de los ciclos.</p>
    </div>
    <div class="lateral">¿Sabías que tenemos tres ciclos de informática?</div>
    <div class="contacto">IES Galileo, Calle Mayor 1</div>
  </div>`, "Jornada"),
    css: ESTILO_BASE,
    solHtml: plantilla(`  <article class="articulo">
    <h1>Jornada de puertas abiertas</h1>
    <p>Publicado el <time datetime="2026-11-12">12 de noviembre de 2026</time></p>
    <section class="seccion">
      <h2>Programa</h2>
      <p>Visitas guiadas a los talleres y charlas de los ciclos.</p>
    </section>
    <aside class="lateral">¿Sabías que tenemos tres ciclos de informática?</aside>
    <address class="contacto">IES Galileo, Calle Mayor 1</address>
  </article>`, "Jornada"),
    solCss: ESTILO_BASE,
    comprobar: [
      { texto: "Hay un <article>", sel: "article", cuenta: true },
      { texto: "La fecha está en un <time> con datetime=\"2026-11-12\"", sel: "time", cuenta: true, contenido: true, atributos: ["datetime"] },
      { texto: "El programa es una <section>", sel: "section", cuenta: true, contenido: true },
      { texto: "El cuadro lateral es un <aside>", sel: "aside", cuenta: true, contenido: true },
      { texto: "El contacto es un <address>", sel: "address", cuenta: true, contenido: true },
    ],
  },
  {
    id: "texto-significado",
    titulo: "Etiquetas de texto con significado",
    tema: "Semántica HTML5",
    enunciado: `Marca así el texto: el <b>2</b> de H2O como subíndice (<code>sub</code>) y el <b>2</b> de m2 como superíndice (<code>sup</code>); la sigla <b>HTML</b> con <code>abbr</code> y <code>title="HyperText Markup Language"</code>; el precio viejo <b>20 €</b> tachado con <code>del</code> y el nuevo <b>15 €</b> con <code>ins</code>; <b>Entrega el viernes</b> resaltado con <code>mark</code> y <b>(sin prórroga)</b> con <code>small</code>.`,
    html: plantilla(`  <p>El agua es H2O y el área se mide en m2.</p>
  <p>Se escribe en HTML.</p>
  <p>Precio: 20 € 15 €</p>
  <p>Entrega el viernes (sin prórroga)</p>`, "Texto con significado"),
    css: ESTILO_BASE,
    solHtml: plantilla(`  <p>El agua es H<sub>2</sub>O y el área se mide en m<sup>2</sup>.</p>
  <p>Se escribe en <abbr title="HyperText Markup Language">HTML</abbr>.</p>
  <p>Precio: <del>20 €</del> <ins>15 €</ins></p>
  <p><mark>Entrega el viernes</mark> <small>(sin prórroga)</small></p>`, "Texto con significado"),
    solCss: ESTILO_BASE,
    comprobar: [
      { texto: "El subíndice de H2O", sel: "sub", cuenta: true, contenido: true },
      { texto: "El superíndice de m2", sel: "sup", cuenta: true, contenido: true },
      { texto: "La sigla HTML con su title", sel: "abbr", cuenta: true, contenido: true, atributos: ["title"] },
      { texto: "El precio viejo tachado y el nuevo insertado", sel: "del, ins", cuenta: true, contenido: true },
      { texto: "«Entrega el viernes» resaltado con <mark>", sel: "mark", cuenta: true, contenido: true },
      { texto: "«(sin prórroga)» en <small>", sel: "small", cuenta: true, contenido: true },
    ],
  },
  {
    id: "semantica-blog",
    titulo: "Página de blog completa",
    tema: "Semántica HTML5",
    enunciado: `Estructura la página con landmarks: <code>header</code> con el título, <code>nav</code> con una lista <code>ul</code> de los enlaces, <code>main</code> con dos <code>article</code> (cada uno con su <code>h2</code> y su párrafo), un <code>aside</code> con «Etiquetas» y un <code>footer</code>. Los enlaces ya están; falta la estructura.`,
    html: plantilla(`  <h1>Diario de clase</h1>
  <a href="#">Inicio</a>
  <a href="#">Archivo</a>
  <h2>Lunes</h2>
  <p>Hemos repasado listas y tablas.</p>
  <h2>Martes</h2>
  <p>Hemos practicado formularios.</p>
  <p>Etiquetas: html, formularios</p>
  <p>IES Galileo</p>`, "Diario"),
    css: ESTILO_BASE,
    solHtml: plantilla(`  <header>
    <h1>Diario de clase</h1>
  </header>
  <nav>
    <ul>
      <li><a href="#">Inicio</a></li>
      <li><a href="#">Archivo</a></li>
    </ul>
  </nav>
  <main>
    <article>
      <h2>Lunes</h2>
      <p>Hemos repasado listas y tablas.</p>
    </article>
    <article>
      <h2>Martes</h2>
      <p>Hemos practicado formularios.</p>
    </article>
  </main>
  <aside>
    <p>Etiquetas: html, formularios</p>
  </aside>
  <footer>
    <p>IES Galileo</p>
  </footer>`, "Diario"),
    solCss: ESTILO_BASE,
    comprobar: [
      { texto: "Hay un <header> con el título", sel: "header > h1", cuenta: true, contenido: true },
      { texto: "El <nav> contiene una lista <ul> con dos enlaces", sel: "nav > ul > li > a", cuenta: true, contenido: true },
      { texto: "El <main> contiene dos <article>", sel: "main > article", cuenta: true, contenido: true },
      { texto: "Cada artículo tiene su <h2>", sel: "article > h2", cuenta: true },
      { texto: "Hay un <aside> con las etiquetas", sel: "aside", cuenta: true, contenido: true },
      { texto: "Hay un <footer>", sel: "footer", cuenta: true, contenido: true },
    ],
  },

  // ===================================== Multimedia =====================================
  {
    id: "audio-video",
    titulo: "Audio y vídeo",
    tema: "Multimedia",
    enunciado: `Incrusta un <code>audio</code> con controles (<code>controls</code>) y <code>preload="none"</code>, con un <code>source</code> (<code>src="audio/clase.mp3"</code>, <code>type="audio/mpeg"</code>) y el texto alternativo <b>Tu navegador no admite audio</b>. Después un <code>video</code> de <code>width="320"</code>, con controles y <code>preload="none"</code>, con un <code>source</code> (<code>src="video/intro.mp4"</code>, <code>type="video/mp4"</code>).`,
    html: plantilla(`  <h1>Multimedia</h1>
  <!-- Tu audio y tu vídeo aquí -->`, "Multimedia"),
    css: ESTILO_BASE,
    solHtml: plantilla(`  <h1>Multimedia</h1>
  <audio controls preload="none">
    <source src="audio/clase.mp3" type="audio/mpeg">
    Tu navegador no admite audio
  </audio>
  <video width="320" controls preload="none">
    <source src="video/intro.mp4" type="video/mp4">
  </video>`, "Multimedia"),
    solCss: ESTILO_BASE,
    comprobar: [
      { texto: "El <audio> tiene controles y preload=\"none\"", sel: "audio", cuenta: true, atributos: ["controls", "preload"] },
      { texto: "El audio tiene su <source> con src y type", sel: "audio > source", cuenta: true, atributos: ["src", "type"] },
      { texto: "El audio incluye el texto alternativo", sel: "audio", contenido: true },
      { texto: "El <video> mide 320, tiene controles y preload=\"none\"", sel: "video", cuenta: true, atributos: ["width", "controls", "preload"] },
      { texto: "El vídeo tiene su <source> con src y type", sel: "video > source", cuenta: true, atributos: ["src", "type"] },
    ],
  },
];

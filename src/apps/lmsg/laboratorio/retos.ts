// Retos del Laboratorio HTML/CSS. Cada reto trae su solución; no se compara el código del alumno
// con el nuestro, sino el RESULTADO: se cargan las dos páginas en iframes aislados del mismo
// tamaño y se contrastan estructura, textos, atributos y estilos calculados por el navegador.
// Así vale cualquier forma correcta de escribirlo (otro selector, otra unidad equivalente…).

import { cargarOculto, componer } from "./documento";

export interface Comprobacion {
  /** lo que se le dice al alumno: «El título h1 dice “Mi instituto”» */
  texto: string;
  /** selector CSS de los elementos a comparar */
  sel: string;
  /** mismo número de elementos que en la solución */
  cuenta?: boolean;
  /** mismo texto (se normalizan los espacios) */
  contenido?: boolean;
  /** atributos HTML que deben coincidir */
  atributos?: string[];
  /** propiedades CSS cuyo valor calculado debe coincidir */
  estilo?: string[];
}

export interface Reto {
  id: string;
  titulo: string;
  nivel: 1 | 2 | 3;
  /** enunciado en HTML */
  enunciado: string;
  html: string;
  css: string;
  solHtml: string;
  solCss: string;
  comprobar: Comprobacion[];
}

const plantilla = (cuerpo: string, titulo = "Mi página") => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${titulo}</title>
  <link rel="stylesheet" href="estilos.css">
</head>
<body>
${cuerpo}
</body>
</html>
`;

const LOGO = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='46' fill='%232a1770'/%3E%3Cpath d='M30 62l20-34 20 34z' fill='%23da251c'/%3E%3C/svg%3E`;

export const PAGINA_LIBRE = {
  html: plantilla(`  <h1>Hola, mundo</h1>
  <p>Edita el HTML a la izquierda y mira el resultado aquí.</p>
  <p>El CSS está en la pestaña <b>estilos.css</b>.</p>`),
  css: `body {
  font-family: Arial, sans-serif;
  margin: 24px;
}

h1 {
  color: #2a1770;
}
`,
};

export const RETOS: Reto[] = [
  {
    id: "estructura",
    titulo: "Tu primera página",
    nivel: 1,
    enunciado: `Escribe en el <code>&lt;body&gt;</code>: un título <code>h1</code> que diga <b>Mi instituto</b>, un párrafo <code>p</code> con <b>Bienvenido al IES Galileo</b> y una lista <code>ul</code> con tres elementos <code>li</code>: <b>DAM</b>, <b>DAW</b> y <b>ASIR</b>.`,
    html: plantilla(`  <!-- Escribe aquí tu contenido -->`, "Mi instituto"),
    css: ``,
    solHtml: plantilla(`  <h1>Mi instituto</h1>
  <p>Bienvenido al IES Galileo</p>
  <ul>
    <li>DAM</li>
    <li>DAW</li>
    <li>ASIR</li>
  </ul>`, "Mi instituto"),
    solCss: ``,
    comprobar: [
      { texto: "Hay un título <h1> que dice «Mi instituto»", sel: "h1", cuenta: true, contenido: true },
      { texto: "Hay un párrafo <p> con el texto de bienvenida", sel: "p", cuenta: true, contenido: true },
      { texto: "Hay una lista <ul>", sel: "ul", cuenta: true },
      { texto: "La lista tiene tres <li> con DAM, DAW y ASIR", sel: "li", cuenta: true, contenido: true },
    ],
  },
  {
    id: "enlaces",
    titulo: "Enlaces e imágenes",
    nivel: 1,
    enunciado: `A la imagen ponle el texto alternativo <b>Logo del instituto</b> (<code>alt</code>) y un ancho de <b>120</b> (<code>width</code>). Después del párrafo añade un enlace <code>a</code> con el texto <b>Ir al módulo</b> que apunte a <code>https://example.com</code> y se abra en una pestaña nueva (<code>target="_blank"</code>).`,
    html: plantilla(`  <h1>Enlaces e imágenes</h1>
  <img src="${LOGO}">
  <p>Todo página web enlaza con otras.</p>`, "Enlaces"),
    css: ``,
    solHtml: plantilla(`  <h1>Enlaces e imágenes</h1>
  <img src="${LOGO}" alt="Logo del instituto" width="120">
  <p>Todo página web enlaza con otras.</p>
  <a href="https://example.com" target="_blank">Ir al módulo</a>`, "Enlaces"),
    solCss: ``,
    comprobar: [
      { texto: "La imagen tiene el atributo alt correcto", sel: "img", cuenta: true, atributos: ["alt"] },
      { texto: "La imagen mide 120 de ancho", sel: "img", atributos: ["width"] },
      { texto: "Hay un enlace con el texto «Ir al módulo»", sel: "a", cuenta: true, contenido: true },
      { texto: "El enlace apunta a https://example.com", sel: "a", atributos: ["href"] },
      { texto: "El enlace se abre en una pestaña nueva", sel: "a", atributos: ["target"] },
    ],
  },
  {
    id: "tabla",
    titulo: "Tabla del horario",
    nivel: 2,
    enunciado: `Construye una tabla con cabecera (<code>thead</code>) y cuerpo (<code>tbody</code>). La cabecera tiene tres <code>th</code>: <b>Hora</b>, <b>Lunes</b>, <b>Martes</b>. El cuerpo tiene dos filas: <b>8:15 · Programación · Bases de datos</b> y <b>9:10 · Lenguajes de marcas · Sistemas</b>. Las celdas de cabecera llevan fondo <code>#2a1770</code> y texto blanco.`,
    html: plantilla(`  <h1>Horario</h1>
  <!-- Tu tabla aquí -->`, "Horario"),
    css: `body { font-family: Arial, sans-serif; }
table { border-collapse: collapse; }
td, th { border: 1px solid #2a1770; padding: 6px 12px; }
`,
    solHtml: plantilla(`  <h1>Horario</h1>
  <table>
    <thead>
      <tr><th>Hora</th><th>Lunes</th><th>Martes</th></tr>
    </thead>
    <tbody>
      <tr><td>8:15</td><td>Programación</td><td>Bases de datos</td></tr>
      <tr><td>9:10</td><td>Lenguajes de marcas</td><td>Sistemas</td></tr>
    </tbody>
  </table>`, "Horario"),
    solCss: `body { font-family: Arial, sans-serif; }
table { border-collapse: collapse; }
td, th { border: 1px solid #2a1770; padding: 6px 12px; }
th { background: #2a1770; color: #fff; }
`,
    comprobar: [
      { texto: "Hay una <table> con <thead> y <tbody>", sel: "table, thead, tbody", cuenta: true },
      { texto: "La cabecera tiene tres <th> con Hora, Lunes y Martes", sel: "th", cuenta: true, contenido: true },
      { texto: "El cuerpo tiene dos filas de tres celdas <td> con los textos pedidos", sel: "tbody td", cuenta: true, contenido: true },
      { texto: "Las celdas <th> tienen fondo #2a1770 y texto blanco", sel: "th", estilo: ["background-color", "color"] },
    ],
  },
  {
    id: "formulario",
    titulo: "Formulario de contacto",
    nivel: 2,
    enunciado: `Crea un <code>form</code> con: un campo de texto <b>Nombre</b> (<code>id="nombre"</code>), un campo de tipo <code>email</code> <b>Correo</b> (<code>id="correo"</code>), una zona <code>textarea</code> <b>Mensaje</b> (<code>id="msg"</code>) y un botón <b>Enviar</b>. Cada campo lleva su <code>label</code> con <code>for</code>. Para que quede como el objetivo, cada <code>label</code> y cada campo en su línea (<code>display: block</code>).`,
    html: plantilla(`  <h1>Contacto</h1>
  <!-- Tu formulario aquí -->`, "Contacto"),
    css: `body { font-family: Arial, sans-serif; }
`,
    solHtml: plantilla(`  <h1>Contacto</h1>
  <form action="#" method="post">
    <label for="nombre">Nombre</label>
    <input type="text" id="nombre" name="nombre">
    <label for="correo">Correo</label>
    <input type="email" id="correo" name="correo">
    <label for="msg">Mensaje</label>
    <textarea id="msg" name="mensaje" rows="4"></textarea>
    <button type="submit">Enviar</button>
  </form>`, "Contacto"),
    solCss: `body { font-family: Arial, sans-serif; }
label, input, textarea { display: block; }
label { margin-top: 10px; }
`,
    comprobar: [
      { texto: "Hay un <form>", sel: "form", cuenta: true },
      { texto: "Hay tres <label> con Nombre, Correo y Mensaje", sel: "label", cuenta: true, contenido: true },
      { texto: "Cada <label> apunta a su campo con for", sel: "label", atributos: ["for"] },
      { texto: "Los campos <input> tienen los tipos y los id pedidos", sel: "input", cuenta: true, atributos: ["type", "id"] },
      { texto: "Hay un <textarea> con id=\"msg\"", sel: "textarea", cuenta: true, atributos: ["id"] },
      { texto: "El botón dice «Enviar»", sel: "button", cuenta: true, contenido: true },
      { texto: "Los <label> están en bloque (cada uno en su línea)", sel: "label", estilo: ["display"] },
      { texto: "Los campos están en bloque (cada uno en su línea)", sel: "input, textarea", estilo: ["display"] },
    ],
  },
  {
    id: "tipografia",
    titulo: "Colores y tipografía",
    nivel: 1,
    enunciado: `Con CSS: todo el <code>body</code> en <code>font-family: Arial, sans-serif</code>; el <code>h1</code> en rojo <code>#da251c</code> y centrado; la clase <code>.destacado</code> en negrita, de <code>20px</code> y color <code>#2a1770</code>.`,
    html: plantilla(`  <h1>Apuntes de Lenguajes de marcas</h1>
  <p class="destacado">HTML da estructura; CSS da el aspecto.</p>
  <p>Los estilos se escriben en el archivo estilos.css.</p>`, "Tipografía"),
    css: `/* Escribe aquí tus reglas */
`,
    solHtml: plantilla(`  <h1>Apuntes de Lenguajes de marcas</h1>
  <p class="destacado">HTML da estructura; CSS da el aspecto.</p>
  <p>Los estilos se escriben en el archivo estilos.css.</p>`, "Tipografía"),
    solCss: `body { font-family: Arial, sans-serif; }
h1 { color: #da251c; text-align: center; }
.destacado { font-weight: bold; font-size: 20px; color: #2a1770; }
`,
    comprobar: [
      { texto: "El body usa la fuente Arial, sans-serif", sel: "body", estilo: ["font-family"] },
      { texto: "El h1 es rojo #da251c y está centrado", sel: "h1", estilo: ["color", "text-align"] },
      { texto: ".destacado: negrita, 20px y color #2a1770", sel: ".destacado", estilo: ["font-weight", "font-size", "color"] },
    ],
  },
  {
    id: "caja",
    titulo: "Modelo de caja: la tarjeta",
    nivel: 2,
    enunciado: `Dale a <code>.tarjeta</code> este aspecto: ancho <b>280px</b>, relleno (<code>padding</code>) <b>16px</b>, margen superior <b>20px</b> y centrada horizontalmente (<code>margin: 20px auto</code>), borde de <b>2px</b> sólido <code>#2a1770</code>, esquinas redondeadas de <b>12px</b> y fondo <code>#f4f1ff</code>.`,
    html: plantilla(`  <div class="tarjeta">
    <h2>DAW</h2>
    <p>Desarrollo de Aplicaciones Web</p>
  </div>`, "Tarjeta"),
    css: `body { font-family: Arial, sans-serif; }
.tarjeta {
  /* tu código aquí */
}
`,
    solHtml: plantilla(`  <div class="tarjeta">
    <h2>DAW</h2>
    <p>Desarrollo de Aplicaciones Web</p>
  </div>`, "Tarjeta"),
    solCss: `body { font-family: Arial, sans-serif; }
.tarjeta {
  width: 280px;
  padding: 16px;
  margin: 20px auto;
  border: 2px solid #2a1770;
  border-radius: 12px;
  background: #f4f1ff;
}
`,
    comprobar: [
      { texto: "Ancho de 280px", sel: ".tarjeta", estilo: ["width"] },
      { texto: "Relleno de 16px", sel: ".tarjeta", estilo: ["padding-top", "padding-right", "padding-bottom", "padding-left"] },
      { texto: "Margen superior de 20px y centrada", sel: ".tarjeta", estilo: ["margin-top", "margin-left", "margin-right"] },
      { texto: "Borde de 2px sólido #2a1770", sel: ".tarjeta", estilo: ["border-top-width", "border-top-style", "border-top-color"] },
      { texto: "Esquinas redondeadas de 12px", sel: ".tarjeta", estilo: ["border-top-left-radius", "border-bottom-right-radius"] },
      { texto: "Fondo #f4f1ff", sel: ".tarjeta", estilo: ["background-color"] },
    ],
  },
  {
    id: "menu",
    titulo: "Menú horizontal",
    nivel: 2,
    enunciado: `Convierte la lista <code>.menu</code> en una barra horizontal: <code>display: flex</code> con huecos (<code>gap</code>) de <b>16px</b>, sin viñetas, sin relleno ni margen, fondo <code>#2a1770</code>. Los enlaces, blancos, sin subrayado, con <code>padding: 10px 14px</code> y <code>display: block</code>.`,
    html: plantilla(`  <ul class="menu">
    <li><a href="#">Inicio</a></li>
    <li><a href="#">Apuntes</a></li>
    <li><a href="#">Ejercicios</a></li>
    <li><a href="#">Contacto</a></li>
  </ul>`, "Menú"),
    css: `body { font-family: Arial, sans-serif; margin: 0; }
`,
    solHtml: plantilla(`  <ul class="menu">
    <li><a href="#">Inicio</a></li>
    <li><a href="#">Apuntes</a></li>
    <li><a href="#">Ejercicios</a></li>
    <li><a href="#">Contacto</a></li>
  </ul>`, "Menú"),
    solCss: `body { font-family: Arial, sans-serif; margin: 0; }
.menu { display: flex; gap: 16px; list-style: none; padding: 0; margin: 0; background: #2a1770; }
.menu a { display: block; padding: 10px 14px; color: #fff; text-decoration: none; }
`,
    comprobar: [
      { texto: "El menú es flex con huecos de 16px", sel: ".menu", estilo: ["display", "column-gap"] },
      { texto: "Sin viñetas, relleno ni margen", sel: ".menu", estilo: ["list-style-type", "padding-left", "padding-top", "margin-top", "margin-left"] },
      { texto: "Fondo #2a1770", sel: ".menu", estilo: ["background-color"] },
      { texto: "Enlaces blancos y sin subrayado", sel: ".menu a", estilo: ["color", "text-decoration-line"] },
      { texto: "Enlaces con padding 10px 14px y en bloque", sel: ".menu a", estilo: ["display", "padding-top", "padding-left"] },
    ],
  },
  {
    id: "semantica",
    titulo: "Página semántica",
    nivel: 2,
    enunciado: `La página está hecha solo con <code>div</code>. Cámbialos por las etiquetas con significado: <code>header</code>, <code>nav</code>, <code>main</code>, <code>article</code> y <code>footer</code>. El texto no cambia.`,
    html: plantilla(`  <div id="cabecera">
    <h1>Blog del módulo</h1>
  </div>
  <div id="menu">
    <a href="#">Inicio</a>
    <a href="#">Apuntes</a>
  </div>
  <div id="principal">
    <div class="entrada">
      <h2>Primera entrada</h2>
      <p>Hoy hemos aprendido etiquetas semánticas.</p>
    </div>
  </div>
  <div id="pie">
    <p>IES Galileo</p>
  </div>`, "Blog"),
    css: `body { font-family: Arial, sans-serif; margin: 0; }
header, footer, #cabecera, #pie { background: #2a1770; color: #fff; padding: 10px 16px; }
nav a, #menu a { margin-right: 12px; }
nav, #menu, main, #principal { padding: 10px 16px; }
`,
    solHtml: plantilla(`  <header>
    <h1>Blog del módulo</h1>
  </header>
  <nav>
    <a href="#">Inicio</a>
    <a href="#">Apuntes</a>
  </nav>
  <main>
    <article>
      <h2>Primera entrada</h2>
      <p>Hoy hemos aprendido etiquetas semánticas.</p>
    </article>
  </main>
  <footer>
    <p>IES Galileo</p>
  </footer>`, "Blog"),
    solCss: `body { font-family: Arial, sans-serif; margin: 0; }
header, footer, #cabecera, #pie { background: #2a1770; color: #fff; padding: 10px 16px; }
nav a, #menu a { margin-right: 12px; }
nav, #menu, main, #principal { padding: 10px 16px; }
`,
    comprobar: [
      { texto: "Hay un <header> con el título", sel: "header", cuenta: true, contenido: true },
      { texto: "Hay un <nav> con los enlaces", sel: "nav", cuenta: true, contenido: true },
      { texto: "Hay un <main>", sel: "main", cuenta: true },
      { texto: "Hay un <article> con la entrada", sel: "article", cuenta: true, contenido: true },
      { texto: "Hay un <footer>", sel: "footer", cuenta: true, contenido: true },
    ],
  },
  {
    id: "rejilla",
    titulo: "Rejilla con Grid",
    nivel: 3,
    enunciado: `Coloca las seis cajas de <code>.rejilla</code> en <b>3 columnas iguales</b> (<code>repeat(3, 1fr)</code>) con huecos de <b>12px</b> usando <code>display: grid</code>. Después haz que la primera caja ocupe <b>2 columnas</b> (<code>grid-column: span 2</code>).`,
    html: plantilla(`  <div class="rejilla">
    <div class="caja">1</div>
    <div class="caja">2</div>
    <div class="caja">3</div>
    <div class="caja">4</div>
    <div class="caja">5</div>
    <div class="caja">6</div>
  </div>`, "Rejilla"),
    css: `body { font-family: Arial, sans-serif; margin: 16px; }
.caja { background: #4a2fb5; color: #fff; padding: 18px; text-align: center; border-radius: 8px; }
.rejilla {
  /* tu código aquí */
}
`,
    solHtml: plantilla(`  <div class="rejilla">
    <div class="caja">1</div>
    <div class="caja">2</div>
    <div class="caja">3</div>
    <div class="caja">4</div>
    <div class="caja">5</div>
    <div class="caja">6</div>
  </div>`, "Rejilla"),
    solCss: `body { font-family: Arial, sans-serif; margin: 16px; }
.caja { background: #4a2fb5; color: #fff; padding: 18px; text-align: center; border-radius: 8px; }
.rejilla { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.caja:first-child { grid-column: span 2; }
`,
    comprobar: [
      { texto: "La rejilla es display: grid", sel: ".rejilla", estilo: ["display"] },
      { texto: "Tres columnas iguales", sel: ".rejilla", estilo: ["grid-template-columns"] },
      { texto: "Huecos de 12px", sel: ".rejilla", estilo: ["column-gap", "row-gap"] },
      { texto: "La primera caja ocupa 2 columnas", sel: ".caja:first-child", estilo: ["grid-column-start", "grid-column-end"] },
    ],
  },
];

// ---------------------------------------------------------------------------------------------

export interface ResultadoComp {
  texto: string;
  ok: boolean;
  /** por qué falla, si falla */
  detalle?: string;
}

const norm = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim();

function elementos(f: HTMLIFrameElement, sel: string): Element[] {
  try {
    return [...(f.contentDocument?.querySelectorAll(sel) ?? [])];
  } catch {
    return [];
  }
}

/** Compara la página del alumno con la solución del reto. */
export async function evaluar(reto: Reto, html: string, css: string): Promise<ResultadoComp[]> {
  const [alumno, solucion] = await Promise.all([
    cargarOculto(componer(html, css)),
    cargarOculto(componer(reto.solHtml, reto.solCss)),
  ]);
  try {
    const ventA = alumno.contentWindow!;
    const ventS = solucion.contentWindow!;
    return reto.comprobar.map((c): ResultadoComp => {
      const a = elementos(alumno, c.sel);
      const s = elementos(solucion, c.sel);
      const falla = (detalle: string): ResultadoComp => ({ texto: c.texto, ok: false, detalle });

      if (c.cuenta && a.length !== s.length) {
        return falla(a.length === 0 ? `No encuentro ningún «${c.sel}».` : `Esperaba ${s.length} «${c.sel}» y hay ${a.length}.`);
      }
      if (!c.cuenta && s.length && !a.length) return falla(`No encuentro ningún «${c.sel}».`);

      for (let i = 0; i < Math.min(a.length, s.length); i++) {
        if (c.contenido && norm(a[i].textContent) !== norm(s[i].textContent)) {
          return falla(`El texto de «${c.sel}»${s.length > 1 ? ` (n.º ${i + 1})` : ""} debería ser «${norm(s[i].textContent)}» y es «${norm(a[i].textContent)}».`);
        }
        for (const at of c.atributos ?? []) {
          const va = a[i].getAttribute(at);
          const vs = s[i].getAttribute(at);
          if (va !== vs) return falla(`${s.length > 1 ? `El n.º ${i + 1} de «${c.sel}»` : `«${c.sel}»`}: el atributo ${at} debería ser ${vs === null ? "inexistente" : `«${vs}»`} y es ${va === null ? "inexistente" : `«${va}»`}.`);
        }
        for (const p of c.estilo ?? []) {
          const va = ventA.getComputedStyle(a[i]).getPropertyValue(p);
          const vs = ventS.getComputedStyle(s[i]).getPropertyValue(p);
          if (va !== vs) return falla(`${p} de «${c.sel}» debería valer ${vs} y vale ${va}.`);
        }
      }
      return { texto: c.texto, ok: true };
    });
  } finally {
    alumno.remove();
    solucion.remove();
  }
}

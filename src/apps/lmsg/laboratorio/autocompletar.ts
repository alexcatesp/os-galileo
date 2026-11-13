// Sugerencias de autocompletado para el editor del Laboratorio HTML/CSS. Funciones puras (sin DOM):
// reciben el texto y la posición del cursor y devuelven lo que se puede insertar.

export interface Sugerencia {
  etiqueta: string;
  firma: string;
  doc: string;
  insertar: string;
  /** posición del cursor dentro de `insertar` */
  cursor: number;
}

export interface Propuesta {
  /** posición donde empieza lo que se sustituye */
  desde: number;
  /** hasta dónde se sustituye (por defecto, el cursor) */
  hasta?: number;
  items: Sugerencia[];
}

/** crea una sugerencia a partir de un texto donde `|` marca la posición del cursor */
function sug(firma: string, doc: string, plantilla: string, etiqueta = firma): Sugerencia {
  const k = plantilla.indexOf("|");
  return k < 0
    ? { etiqueta, firma, doc, insertar: plantilla, cursor: plantilla.length }
    : { etiqueta, firma, doc, insertar: plantilla.slice(0, k) + plantilla.slice(k + 1), cursor: k };
}

const empieza = (s: Sugerencia, minus: string) => s.etiqueta.toLowerCase().startsWith(minus);

// ===================================================================== HTML

/** [nombre, descripción, plantilla de lo que va tras «<» (con | = cursor)] */
const ETIQUETAS: [string, string, string][] = [
  ["div", "bloque genérico", "div>|</div>"],
  ["span", "texto en línea genérico", "span>|</span>"],
  ["p", "párrafo", "p>|</p>"],
  ["h1", "título principal", "h1>|</h1>"],
  ["h2", "título de sección", "h2>|</h2>"],
  ["h3", "subtítulo", "h3>|</h3>"],
  ["h4", "título de nivel 4", "h4>|</h4>"],
  ["h5", "título de nivel 5", "h5>|</h5>"],
  ["h6", "título de nivel 6", "h6>|</h6>"],
  ["a", "enlace", 'a href="|"></a>'],
  ["img", "imagen", 'img src="|" alt="">'],
  ["ul", "lista sin orden", "ul>\n  <li>|</li>\n</ul>"],
  ["ol", "lista ordenada", "ol>\n  <li>|</li>\n</ol>"],
  ["li", "elemento de lista", "li>|</li>"],
  ["table", "tabla", "table>\n  <tr>\n    <td>|</td>\n  </tr>\n</table>"],
  ["thead", "cabecera de la tabla", "thead>|</thead>"],
  ["tbody", "cuerpo de la tabla", "tbody>|</tbody>"],
  ["tr", "fila de tabla", "tr>|</tr>"],
  ["th", "celda de cabecera", "th>|</th>"],
  ["td", "celda de datos", "td>|</td>"],
  ["form", "formulario", 'form action="|" method="post"></form>'],
  ["label", "etiqueta de un campo", 'label for="|"></label>'],
  ["input", "campo de entrada", 'input type="|">'],
  ["textarea", "texto de varias líneas", 'textarea name="|"></textarea>'],
  ["select", "lista desplegable", "select>\n  <option>|</option>\n</select>"],
  ["option", "opción de una lista", "option>|</option>"],
  ["button", "botón", "button>|</button>"],
  ["header", "cabecera de página o sección", "header>|</header>"],
  ["nav", "menú de navegación", "nav>|</nav>"],
  ["main", "contenido principal", "main>|</main>"],
  ["section", "sección temática", "section>|</section>"],
  ["article", "artículo independiente", "article>|</article>"],
  ["aside", "contenido lateral", "aside>|</aside>"],
  ["footer", "pie de página o sección", "footer>|</footer>"],
  ["figure", "figura con pie", "figure>\n  <img src=\"\" alt=\"\">\n  <figcaption>|</figcaption>\n</figure>"],
  ["figcaption", "pie de una figura", "figcaption>|</figcaption>"],
  ["strong", "texto importante (negrita)", "strong>|</strong>"],
  ["em", "énfasis (cursiva)", "em>|</em>"],
  ["b", "negrita sin énfasis", "b>|</b>"],
  ["i", "cursiva sin énfasis", "i>|</i>"],
  ["u", "subrayado", "u>|</u>"],
  ["small", "letra pequeña", "small>|</small>"],
  ["mark", "texto resaltado", "mark>|</mark>"],
  ["code", "fragmento de código", "code>|</code>"],
  ["pre", "texto preformateado", "pre>|</pre>"],
  ["blockquote", "cita larga", "blockquote>|</blockquote>"],
  ["br", "salto de línea", "br>"],
  ["hr", "línea horizontal", "hr>"],
  ["video", "vídeo", 'video src="|" controls></video>'],
  ["audio", "audio", 'audio src="|" controls></audio>'],
  ["iframe", "página incrustada", 'iframe src="|"></iframe>'],
  ["link", "enlaza un recurso (CSS)", 'link rel="stylesheet" href="|">'],
  ["meta", "metadatos", 'meta name="|" content="">'],
  ["title", "título de la pestaña", "title>|</title>"],
  ["style", "CSS dentro del HTML", "style>\n  |\n</style>"],
  ["script", "JavaScript", "script>|</script>"],
  ["head", "cabecera del documento", "head>|</head>"],
  ["body", "cuerpo del documento", "body>\n  |\n</body>"],
  ["html", "esqueleto de una página", 'html lang="es">\n<head>\n  <meta charset="UTF-8">\n  <title>|</title>\n  <link rel="stylesheet" href="estilos.css">\n</head>\n<body>\n\n</body>\n</html>'],
  ["fieldset", "grupo de campos", "fieldset>\n  <legend>|</legend>\n</fieldset>"],
  ["legend", "título de un fieldset", "legend>|</legend>"],
  ["dl", "lista de definiciones", "dl>\n  <dt>|</dt>\n  <dd></dd>\n</dl>"],
  ["details", "bloque desplegable", "details>\n  <summary>|</summary>\n</details>"],
  ["summary", "título de un details", "summary>|</summary>"],
];

export const etiquetasConocidas = new Set(ETIQUETAS.map(([n]) => n));
const VACIAS = new Set(["br", "hr", "img", "input", "link", "meta", "area", "base", "col", "embed", "source", "track", "wbr"]);

const GLOBALES: [string, string][] = [
  ["class", "clase(s) CSS"],
  ["id", "identificador único"],
  ["style", "CSS en línea"],
  ["title", "texto emergente"],
  ["lang", "idioma"],
  ["hidden", "oculta el elemento"],
  ["tabindex", "orden de tabulación"],
  ["role", "rol de accesibilidad"],
  ["aria-label", "etiqueta accesible"],
  ["data-", "dato propio: data-nombre"],
];

const BOOLEANOS = new Set(["hidden", "controls", "autoplay", "loop", "muted", "required", "disabled", "checked", "readonly", "selected", "multiple", "autofocus", "novalidate", "open", "defer", "async"]);

const ATRIBUTOS: Record<string, [string, string][]> = {
  a: [["href", "destino del enlace"], ["target", "dónde se abre"], ["download", "descarga el archivo"], ["rel", "relación con el destino"]],
  img: [["src", "ruta de la imagen"], ["alt", "texto alternativo"], ["width", "ancho"], ["height", "alto"], ["loading", "carga diferida"]],
  link: [["rel", "tipo de relación"], ["href", "ruta del recurso"], ["type", "tipo MIME"]],
  meta: [["charset", "codificación"], ["name", "nombre del metadato"], ["content", "valor del metadato"]],
  script: [["src", "ruta del script"], ["defer", "ejecuta tras cargar el HTML"], ["async", "carga en paralelo"], ["type", "tipo de script"]],
  input: [["type", "tipo de campo"], ["name", "nombre del campo"], ["value", "valor inicial"], ["placeholder", "texto de ayuda"], ["required", "obligatorio"], ["disabled", "desactivado"], ["checked", "marcado"], ["readonly", "solo lectura"], ["min", "mínimo"], ["max", "máximo"], ["maxlength", "longitud máxima"], ["pattern", "expresión regular"], ["autofocus", "con el foco al cargar"]],
  textarea: [["name", "nombre del campo"], ["rows", "filas"], ["cols", "columnas"], ["placeholder", "texto de ayuda"], ["required", "obligatorio"], ["maxlength", "longitud máxima"]],
  select: [["name", "nombre del campo"], ["multiple", "varias opciones"], ["required", "obligatorio"]],
  option: [["value", "valor"], ["selected", "preseleccionada"]],
  button: [["type", "tipo de botón"], ["name", "nombre"], ["value", "valor"], ["disabled", "desactivado"]],
  form: [["action", "a dónde se envía"], ["method", "get o post"], ["novalidate", "sin validación del navegador"]],
  label: [["for", "id del campo asociado"]],
  video: [["src", "ruta del vídeo"], ["controls", "muestra controles"], ["autoplay", "reproduce solo"], ["loop", "repite"], ["muted", "sin sonido"], ["poster", "imagen previa"], ["width", "ancho"], ["height", "alto"]],
  audio: [["src", "ruta del audio"], ["controls", "muestra controles"], ["autoplay", "reproduce solo"], ["loop", "repite"], ["muted", "sin sonido"]],
  iframe: [["src", "página incrustada"], ["width", "ancho"], ["height", "alto"], ["title", "descripción accesible"]],
  table: [["border", "borde (antiguo)"]],
  td: [["colspan", "columnas que ocupa"], ["rowspan", "filas que ocupa"]],
  th: [["colspan", "columnas que ocupa"], ["rowspan", "filas que ocupa"], ["scope", "col o row"]],
  ol: [["start", "primer número"], ["type", "tipo de numeración"], ["reversed", "cuenta atrás"]],
  details: [["open", "abierto al cargar"]],
  html: [["lang", "idioma del documento"]],
};

const VALORES: Record<string, string[]> = {
  "input.type": ["text", "password", "email", "number", "checkbox", "radio", "submit", "button", "date", "time", "file", "range", "color", "search", "tel", "url", "hidden"],
  "button.type": ["submit", "button", "reset"],
  "ol.type": ["1", "a", "A", "i", "I"],
  "script.type": ["module"],
  rel: ["stylesheet", "icon", "noopener", "noreferrer"],
  target: ["_blank", "_self", "_parent", "_top"],
  method: ["get", "post"],
  loading: ["lazy", "eager"],
  lang: ["es", "en", "ca", "fr"],
  charset: ["UTF-8"],
  scope: ["col", "row"],
  "meta.name": ["viewport", "description", "author", "keywords"],
  role: ["button", "navigation", "main", "banner", "contentinfo", "list", "listitem"],
};

/** etiquetas sin cerrar en `antes`, de la más interna a la más externa */
function abiertas(antes: string): string[] {
  const limpio = antes
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "");
  const pila: string[] = [];
  for (const m of limpio.matchAll(/<(\/?)([a-zA-Z][\w-]*)\b[^>]*?(\/?)>/g)) {
    const nombre = m[2].toLowerCase();
    if (m[1]) {
      const k = pila.lastIndexOf(nombre);
      if (k >= 0) pila.length = k;
    } else if (!m[3] && !VACIAS.has(nombre)) pila.push(nombre);
  }
  return pila.reverse();
}

const clasesDelCss = (css: string): string[] => [...new Set([...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/\.([A-Za-z_-][\w-]*)/g)].map((m) => m[1]))];
const clasesDelHtml = (html: string): string[] => [...new Set([...html.matchAll(/\bclass\s*=\s*["']([^"']*)["']/g)].flatMap((m) => m[1].split(/\s+/)).filter(Boolean))];
const idsDelHtml = (html: string): string[] => [...new Set([...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map((m) => m[1]))];

/** `css` es la hoja de estilos (sirve para sugerir las clases ya definidas) */
export function sugerirHtml(texto: string, pos: number, css: string, forzar = false): Propuesta | null {
  const antes = texto.slice(0, pos);
  // dentro de un comentario no se sugiere nada
  if (antes.lastIndexOf("<!--") > antes.lastIndexOf("-->")) return null;

  const lt = antes.lastIndexOf("<");
  const seg = lt >= 0 ? antes.slice(lt) : "";
  const sinComillas = seg.replace(/"[^"]*"|'[^']*'/g, "");

  // 1) «<!» y «</»
  const decl = /^<!([A-Za-z-]*)$/.exec(seg);
  if (decl) {
    const m = decl[1].toLowerCase();
    const items = [sug("<!DOCTYPE html>", "declara que es HTML5", "!DOCTYPE html>\n", "!doctype"), sug("<!-- -->", "comentario", "!-- | -->", "!--")].filter((s) => s.etiqueta.slice(1).startsWith(m) || s.etiqueta.startsWith(`!${m}`));
    return items.length ? { desde: lt + 1, items } : null;
  }
  const cierre = /^<\/([A-Za-z][\w-]*)?$/.exec(seg);
  if (cierre) {
    const minus = (cierre[1] ?? "").toLowerCase();
    const pila = abiertas(antes.slice(0, lt));
    const items = pila.filter((n) => n.startsWith(minus)).filter((n, k, a) => a.indexOf(n) === k).map((n, k) => sug(`</${n}>`, k === 0 ? "cierra la etiqueta abierta" : "cierra una etiqueta anterior", `${n}>`, n));
    return items.length ? { desde: lt + 2, items } : null;
  }

  // 2) nombre de etiqueta tras «<»
  const nombre = /^<([A-Za-z][\w-]*)?$/.exec(seg);
  if (nombre) {
    const minus = (nombre[1] ?? "").toLowerCase();
    const items = ETIQUETAS.map(([n, d, p]) => sug(`<${n}>`, d, p, n)).filter((s) => empieza(s, minus) && s.etiqueta !== minus);
    return items.length ? { desde: lt + 1, items } : null;
  }

  // 3) dentro de una etiqueta de apertura: atributos y valores
  const etiqueta = /^<([A-Za-z][\w-]*)/.exec(seg);
  if (!etiqueta || sinComillas.includes(">")) return null;
  const tag = etiqueta[1].toLowerCase();

  const valor = /([\w:-]+)\s*=\s*(["'])([^"']*)$/.exec(seg);
  if (valor) {
    const atr = valor[1].toLowerCase();
    const comilla = valor[2];
    const todo = valor[3];
    const parcial = atr === "class" ? (/[^\s]*$/.exec(todo)?.[0] ?? "") : todo;
    const minus = parcial.toLowerCase();
    const yaPuestos = new Set(todo.split(/\s+/));
    let lista: string[] = [];
    if (atr === "class") lista = clasesDelCss(css);
    else lista = VALORES[`${tag}.${atr}`] ?? VALORES[atr] ?? [];
    if (atr === "for") lista = idsDelHtml(texto);
    if (!lista.length) return null;
    const salta = atr !== "class" && texto[pos] === comilla;
    const items = lista
      .filter((v) => v.toLowerCase().startsWith(minus) && !(atr === "class" && yaPuestos.has(v) && v !== parcial))
      .map((v) => sug(v, atr === "class" ? "clase definida en tu CSS" : `valor de ${atr}`, salta ? v + comilla : v));
    return items.length && (parcial || forzar) ? { desde: pos - parcial.length, hasta: salta ? pos + 1 : undefined, items } : null;
  }

  const attr = /\s([\w:-]*)$/.exec(sinComillas);
  if (!attr) return null;
  const parcial = attr[1];
  if (!parcial && !forzar) return null;
  const minus = parcial.toLowerCase();
  // atributos que la etiqueta ya tiene (sin contar el que se está escribiendo)
  const previo = sinComillas.slice(0, sinComillas.length - parcial.length);
  const puestos = new Set([...previo.matchAll(/\s([\w:-]+)(?=[=\s/]|$)/g)].map((m) => m[1].toLowerCase()));
  const items = [...(ATRIBUTOS[tag] ?? []), ...GLOBALES]
    .filter(([n], k, a) => n.startsWith(minus) && n !== minus && (n === "data-" || !puestos.has(n)) && a.findIndex(([m]) => m === n) === k)
    .map(([n, d]) => sug(n, d, n === "data-" ? "data-|" : BOOLEANOS.has(n) ? n : `${n}="|"`, n));
  return items.length ? { desde: pos - parcial.length, items } : null;
}

// ===================================================================== CSS

const COLORES = ["red", "blue", "green", "black", "white", "gray", "orange", "purple", "yellow", "pink", "brown", "navy", "teal", "gold", "tomato", "transparent", "currentColor", "rgb()", "rgba()", "hsl()", "var()"];
const LONGITUDES = ["0", "auto", "100%", "50%", "1rem", "1em", "10px", "calc()", "var()"];
const GLOBAL = ["inherit", "initial", "unset"];

/** [propiedad, descripción, valores separados por espacios; «<color>» y «<long>» se expanden; «f()» = función] */
const PROPIEDADES: [string, string, string][] = [
  ["color", "color del texto", "<color>"],
  ["background", "fondo (atajo)", "<color> url() linear-gradient() no-repeat center"],
  ["background-color", "color de fondo", "<color>"],
  ["background-image", "imagen de fondo", "url() linear-gradient() none"],
  ["background-size", "tamaño del fondo", "cover contain auto 100%"],
  ["background-position", "posición del fondo", "center top bottom left right"],
  ["background-repeat", "repetición del fondo", "no-repeat repeat repeat-x repeat-y"],
  ["font-family", "tipo de letra", "Arial Verdana Georgia sans-serif serif monospace system-ui"],
  ["font-size", "tamaño de letra", "1rem 1em 16px 12px 24px 2rem larger smaller"],
  ["font-weight", "grosor de letra", "normal bold bolder lighter 400 700"],
  ["font-style", "estilo de letra", "normal italic oblique"],
  ["line-height", "altura de línea", "1.5 normal 1.2 24px"],
  ["text-align", "alineación del texto", "left right center justify"],
  ["text-decoration", "subrayado y similares", "none underline line-through overline"],
  ["text-transform", "mayúsculas/minúsculas", "none uppercase lowercase capitalize"],
  ["text-indent", "sangría de la primera línea", "<long>"],
  ["text-shadow", "sombra del texto", "none 1px 1px 2px"],
  ["letter-spacing", "espacio entre letras", "normal 1px 0.1em"],
  ["white-space", "gestión de espacios", "normal nowrap pre pre-wrap"],
  ["vertical-align", "alineación vertical en línea", "baseline top middle bottom"],
  ["margin", "margen exterior", "<long>"],
  ["margin-top", "margen superior", "<long>"],
  ["margin-right", "margen derecho", "<long>"],
  ["margin-bottom", "margen inferior", "<long>"],
  ["margin-left", "margen izquierdo", "<long>"],
  ["padding", "relleno interior", "<long>"],
  ["padding-top", "relleno superior", "<long>"],
  ["padding-right", "relleno derecho", "<long>"],
  ["padding-bottom", "relleno inferior", "<long>"],
  ["padding-left", "relleno izquierdo", "<long>"],
  ["border", "borde (atajo)", "1px solid <color> none"],
  ["border-top", "borde superior", "1px solid <color>"],
  ["border-bottom", "borde inferior", "1px solid <color>"],
  ["border-left", "borde izquierdo", "1px solid <color>"],
  ["border-right", "borde derecho", "1px solid <color>"],
  ["border-width", "grosor del borde", "1px 2px thin medium thick"],
  ["border-style", "estilo del borde", "solid dashed dotted double none"],
  ["border-color", "color del borde", "<color>"],
  ["border-radius", "esquinas redondeadas", "4px 8px 50% 0"],
  ["border-collapse", "bordes de tabla", "collapse separate"],
  ["outline", "contorno", "none 1px solid <color>"],
  ["width", "ancho", "<long> fit-content max-content"],
  ["height", "alto", "<long> fit-content 100vh"],
  ["min-width", "ancho mínimo", "<long>"],
  ["max-width", "ancho máximo", "<long> none"],
  ["min-height", "alto mínimo", "<long> 100vh"],
  ["max-height", "alto máximo", "<long> none"],
  ["box-sizing", "cómo se calcula el tamaño", "border-box content-box"],
  ["display", "tipo de caja", "block inline inline-block flex grid none inline-flex table contents"],
  ["position", "posicionamiento", "static relative absolute fixed sticky"],
  ["top", "distancia superior", "<long>"],
  ["right", "distancia derecha", "<long>"],
  ["bottom", "distancia inferior", "<long>"],
  ["left", "distancia izquierda", "<long>"],
  ["z-index", "orden de apilado", "auto 1 10 100 -1"],
  ["float", "flotar a un lado", "left right none"],
  ["clear", "evitar flotantes", "both left right none"],
  ["overflow", "contenido que desborda", "visible hidden scroll auto"],
  ["overflow-x", "desborde horizontal", "visible hidden scroll auto"],
  ["overflow-y", "desborde vertical", "visible hidden scroll auto"],
  ["visibility", "visibilidad", "visible hidden"],
  ["opacity", "transparencia (0 a 1)", "1 0.5 0"],
  ["box-shadow", "sombra de la caja", "none 0 2px 6px"],
  ["cursor", "forma del puntero", "pointer default text move not-allowed grab"],
  ["pointer-events", "reacciona al ratón", "none auto"],
  ["object-fit", "cómo encaja una imagen", "cover contain fill none scale-down"],
  ["aspect-ratio", "proporción", "16/9 1/1 4/3 auto"],
  ["list-style", "viñetas (atajo)", "none disc circle square decimal inside"],
  ["list-style-type", "tipo de viñeta", "none disc circle square decimal lower-alpha upper-roman"],
  ["content", "contenido generado (::before/::after)", '"" none attr()'],
  ["transition", "animación de cambios", "all 0.3s ease 0.2s ease-in-out"],
  ["transform", "transformaciones", "none rotate() scale() translate() skew()"],
  ["animation", "animación con @keyframes", "none 1s ease infinite"],
  ["flex", "flexibilidad (atajo)", "1 0 auto none 1 1 0"],
  ["flex-direction", "dirección del eje principal", "row row-reverse column column-reverse"],
  ["flex-wrap", "saltar de línea", "nowrap wrap wrap-reverse"],
  ["flex-flow", "dirección y salto", "row wrap column nowrap"],
  ["flex-grow", "cuánto crece", "0 1 2"],
  ["flex-shrink", "cuánto se encoge", "0 1"],
  ["flex-basis", "tamaño base", "<long> content"],
  ["justify-content", "reparto en el eje principal", "flex-start flex-end center space-between space-around space-evenly start end"],
  ["align-items", "alineación en el eje cruzado", "stretch flex-start flex-end center baseline start end"],
  ["align-content", "reparto de varias líneas", "flex-start flex-end center space-between space-around stretch"],
  ["align-self", "alineación propia", "auto flex-start flex-end center stretch baseline"],
  ["justify-items", "alineación horizontal en celdas", "stretch start end center"],
  ["justify-self", "alineación horizontal propia", "stretch start end center"],
  ["place-items", "align-items + justify-items", "center start end stretch"],
  ["gap", "hueco entre elementos", "10px 1rem 0 8px"],
  ["row-gap", "hueco entre filas", "10px 1rem"],
  ["column-gap", "hueco entre columnas", "10px 1rem"],
  ["order", "orden visual", "0 1 -1"],
  ["grid-template-columns", "columnas de la cuadrícula", "repeat() 1fr 1fr 1fr auto minmax() 100px"],
  ["grid-template-rows", "filas de la cuadrícula", "repeat() 1fr auto minmax() 100px"],
  ["grid-template-areas", "áreas con nombre", '"cabecera cabecera" "menu contenido"'],
  ["grid-area", "área de un elemento", "auto"],
  ["grid-column", "columnas que ocupa", "1/3 span 2 1/-1"],
  ["grid-row", "filas que ocupa", "1/3 span 2"],
  ["grid-auto-flow", "relleno automático", "row column dense"],
];

const SELECTOR_PSEUDOCLASES: [string, string, string][] = [
  ["hover", "al pasar el ratón", "hover"],
  ["focus", "con el foco", "focus"],
  ["active", "mientras se pulsa", "active"],
  ["visited", "enlace visitado", "visited"],
  ["first-child", "primer hijo", "first-child"],
  ["last-child", "último hijo", "last-child"],
  ["nth-child()", "hijo número n (2n, odd, even)", "nth-child(|)"],
  ["nth-of-type()", "n-ésimo de su etiqueta", "nth-of-type(|)"],
  ["first-of-type", "primero de su etiqueta", "first-of-type"],
  ["last-of-type", "último de su etiqueta", "last-of-type"],
  ["only-child", "hijo único", "only-child"],
  ["not()", "los que NO cumplen", "not(|)"],
  ["is()", "cualquiera de la lista", "is(|)"],
  ["has()", "que contiene…", "has(|)"],
  ["checked", "casilla marcada", "checked"],
  ["disabled", "desactivado", "disabled"],
  ["empty", "sin contenido", "empty"],
  ["root", "el elemento raíz (html)", "root"],
  ["focus-visible", "foco por teclado", "focus-visible"],
];
const SELECTOR_PSEUDOELEMENTOS: [string, string][] = [
  ["before", "antes del contenido"],
  ["after", "después del contenido"],
  ["first-line", "primera línea"],
  ["first-letter", "primera letra"],
  ["selection", "texto seleccionado"],
  ["placeholder", "texto de ayuda de un campo"],
  ["marker", "viñeta de una lista"],
];
const ARROBAS: [string, string, string][] = [
  ["@media", "reglas según la pantalla", "@media (max-width: 600px) {\n  |\n}"],
  ["@import", "importa otro CSS", '@import url("|");'],
  ["@font-face", "tipo de letra propio", "@font-face {\n  font-family: |;\n  src: url();\n}"],
  ["@keyframes", "pasos de una animación", "@keyframes |{\n  from { }\n  to { }\n}"],
  ["@supports", "si el navegador lo admite", "@supports (|) {\n}"],
];
const MEDIA: [string, string, string][] = [
  ["max-width", "hasta este ancho", "max-width: 600px"],
  ["min-width", "desde este ancho", "min-width: 768px"],
  ["orientation", "orientación", "orientation: landscape"],
  ["prefers-color-scheme", "tema claro/oscuro", "prefers-color-scheme: dark"],
  ["hover", "dispositivo con ratón", "hover: hover"],
];

function expandir(valores: string): string[] {
  return valores.split(" ").flatMap((t) => (t === "<color>" ? COLORES : t === "<long>" ? LONGITUDES : [t]));
}

function valorSug(v: string, doc: string): Sugerencia {
  if (v.endsWith("()")) return sug(v, "función", `${v.slice(0, -1)}|)`, v);
  return sug(v, doc, v);
}

export interface Contexto {
  /** tipo de bloque que contiene el cursor, de fuera adentro */
  pila: ("regla" | "at" | "keyframes")[];
  /** texto de la sentencia en curso (desde el último `{`, `}` o `;`) */
  seg: string;
}

/** Recorre el CSS hasta el cursor. Devuelve null si el cursor está en un comentario. */
export function contextoCss(antes: string): Contexto | null {
  const pila: Contexto["pila"] = [];
  let seg = "";
  let parentesis = 0;
  for (let k = 0; k < antes.length; k++) {
    const c = antes[k];
    if (c === "/" && antes[k + 1] === "*") {
      const fin = antes.indexOf("*/", k + 2);
      if (fin < 0) return null;
      k = fin + 1;
    } else if (c === '"' || c === "'") {
      let j = k + 1;
      while (j < antes.length && antes[j] !== c && antes[j] !== "\n") j++;
      seg += antes.slice(k, j + 1);
      k = j;
    } else if (c === "(") {
      parentesis++;
      seg += c;
    } else if (c === ")") {
      parentesis = Math.max(0, parentesis - 1);
      seg += c;
    } else if (parentesis === 0 && c === "{") {
      const pre = seg.trim().toLowerCase();
      pila.push(/^@keyframes|^@-webkit-keyframes/.test(pre) ? "keyframes" : /^@(media|supports|layer|container)/.test(pre) ? "at" : "regla");
      seg = "";
    } else if (parentesis === 0 && c === "}") {
      pila.pop();
      seg = "";
    } else if (parentesis === 0 && c === ";") seg = "";
    else seg += c;
  }
  return { pila, seg };
}

/** `html` es la página (sirve para sugerir sus clases e identificadores) */
export function sugerirCss(texto: string, pos: number, html: string, forzar = false): Propuesta | null {
  const antes = texto.slice(0, pos);
  const ctx = contextoCss(antes);
  if (!ctx) return null;
  const { pila, seg } = ctx;
  const dentro = pila[pila.length - 1];

  // ---- dentro de una regla: propiedades y valores ----
  if (dentro === "regla") {
    const dosPuntos = seg.indexOf(":");
    if (dosPuntos < 0) {
      const parcial = /[-\w]*$/.exec(seg)![0];
      if (!parcial && !forzar) return null;
      const minus = parcial.toLowerCase();
      const yaTiene = texto.slice(pos).split("\n", 1)[0].trimStart().startsWith(":");
      const items = PROPIEDADES.filter(([n]) => n.startsWith(minus) && n !== parcial).map(([n, d]) => sug(n, d, yaTiene ? n : `${n}: |;`, n));
      return items.length ? { desde: pos - parcial.length, items } : null;
    }
    const prop = seg.slice(0, dosPuntos).trim().toLowerCase();
    const valorTxt = seg.slice(dosPuntos + 1);
    const parcial = /[-#\w]*$/.exec(valorTxt)![0];
    if (!parcial && !forzar) return null;
    const minus = parcial.toLowerCase();
    const def = PROPIEDADES.find(([n]) => n === prop);
    let valores = def ? expandir(def[2]) : prop.startsWith("--") ? COLORES : [];
    valores = [...valores, ...GLOBAL];
    const vars = [...new Set([...texto.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]))];
    const items: Sugerencia[] = [];
    if (parcial.startsWith("--")) items.push(...vars.filter((v) => v.startsWith(minus) && v !== parcial).map((v) => sug(v, "variable CSS", v)));
    else items.push(...valores.filter((v) => v.toLowerCase().startsWith(minus) && v !== parcial).map((v) => valorSug(v, def?.[1] ?? "valor")));
    return items.length ? { desde: pos - parcial.length, items } : null;
  }

  // ---- fuera de las reglas (o dentro de @media): selectores y arrobas ----
  const pre = seg.trimStart();
  if (/^@media\b/i.test(pre)) {
    const abierto = pre.lastIndexOf("(") > pre.lastIndexOf(")");
    const parcial = /[-\w]*$/.exec(pre)![0];
    if (!abierto || (!parcial && !forzar)) return null;
    const minus = parcial.toLowerCase();
    const items = MEDIA.filter(([n]) => n.startsWith(minus)).map(([n, d, p]) => sug(p, d, p, n));
    return items.length ? { desde: pos - parcial.length, items } : null;
  }
  if (pre.includes("{") || /^@(import|charset)\b/i.test(pre)) return null;

  if (dentro === "keyframes") {
    const parcial = /[-\w%]*$/.exec(pre)![0];
    const items = [sug("from", "estado inicial", "from { | }"), sug("to", "estado final", "to { | }"), sug("50%", "a mitad", "50% { | }")].filter((s) => s.etiqueta.startsWith(parcial.toLowerCase()) && (parcial || forzar));
    return items.length ? { desde: pos - parcial.length, items } : null;
  }

  const m = /(::?|[.#@])?([-\w]*)$/.exec(pre)!;
  const prefijo = m[1] ?? "";
  const parcial = m[2];
  const minus = parcial.toLowerCase();
  const desde = pos - prefijo.length - parcial.length;
  const nucleo = (items: Sugerencia[]) => (items.length ? { desde, items } : null);

  if (prefijo === "." ) return nucleo(clasesDelHtml(html).filter((c) => c.toLowerCase().startsWith(minus) && c !== parcial).map((c) => sug(`.${c}`, "clase usada en tu HTML", `.${c}`, c)));
  if (prefijo === "#") return nucleo(idsDelHtml(html).filter((c) => c.toLowerCase().startsWith(minus) && c !== parcial).map((c) => sug(`#${c}`, "id usado en tu HTML", `#${c}`, c)));
  if (prefijo === "::") return nucleo(SELECTOR_PSEUDOELEMENTOS.filter(([n]) => n.startsWith(minus)).map(([n, d]) => sug(`::${n}`, d, `::${n}`, n)));
  if (prefijo === ":") return nucleo(SELECTOR_PSEUDOCLASES.filter(([n]) => n.startsWith(minus)).map(([n, d, p]) => sug(`:${n}`, d, `:${p}`, n)));
  if (prefijo === "@") return nucleo(ARROBAS.filter(([n]) => n.slice(1).startsWith(minus)).map(([n, d, p]) => sug(n, d, p, n.slice(1))));

  if (!parcial && !forzar) return null;
  const etiquetas = [...new Set(ETIQUETAS.map(([n]) => n)), "*"].filter((n) => n.startsWith(minus) && n !== parcial && !["script", "title", "meta", "link"].includes(n));
  const clases = parcial ? [] : clasesDelHtml(html).map((c) => sug(`.${c}`, "clase usada en tu HTML", `.${c}`, c));
  return nucleo([...etiquetas.map((n) => sug(n, n === "*" ? "todos los elementos" : "selector de etiqueta", `${n} {\n  |\n}`, n)), ...clases]);
}

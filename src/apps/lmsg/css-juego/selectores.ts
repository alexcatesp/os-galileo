// Niveles de «Selectores». Cada nivel es una escena de HTML real; el alumno escribe un selector
// CSS y se resaltan los elementos que elige. Gana cuando elige EXACTAMENTE los elementos del
// objetivo (los que parpadean). Vale cualquier selector equivalente, no solo el nuestro.

export interface NivelSelector {
  titulo: string;
  /** bloque del temario al que pertenece (para agrupar en la lista) */
  bloque: string;
  /** explicación breve de lo nuevo (HTML) */
  teoria: string;
  /** escena en HTML; las etiquetas se muestran tal cual */
  html: string;
  /** selector de referencia: define el objetivo */
  solucion: string;
}

export const NIVELES_SELECTOR: NivelSelector[] = [
  {
    bloque: "Básicos",
    titulo: "Por etiqueta",
    teoria: `El selector de <b>tipo</b> es el nombre de la etiqueta y elige todos los elementos de ese tipo. Elige los párrafos.`,
    html: `<h1></h1>
<p></p>
<p></p>
<ul></ul>
<span></span>
<p></p>`,
    solucion: "p",
  },
  {
    bloque: "Básicos",
    titulo: "Por id",
    teoria: `El <b>id</b> es único en la página. Se escribe con una almohadilla: <code>#nombre</code>.`,
    html: `<div id="entrada"></div>
<div id="principal"></div>
<div id="salida"></div>`,
    solucion: "#principal",
  },
  {
    bloque: "Básicos",
    titulo: "Por clase",
    teoria: `Una <b>clase</b> puede repetirse en muchos elementos de cualquier tipo. Se escribe con un punto: <code>.nombre</code>.`,
    html: `<p class="aviso"></p>
<p></p>
<div class="aviso"></div>
<span class="nota"></span>`,
    solucion: ".aviso",
  },
  {
    bloque: "Básicos",
    titulo: "Etiqueta y clase",
    teoria: `Se pueden <b>combinar sin espacios</b>: <code>p.aviso</code> elige los <code>p</code> que además tienen la clase <code>aviso</code>.`,
    html: `<p class="aviso"></p>
<p></p>
<div class="aviso"></div>
<p class="aviso nota"></p>
<span class="aviso"></span>`,
    solucion: "p.aviso",
  },
  {
    bloque: "Básicos",
    titulo: "Dos clases a la vez",
    teoria: `Un elemento puede tener varias clases. <code>.a.b</code> (sin espacio) exige las dos.`,
    html: `<p class="aviso"></p>
<p class="aviso urgente"></p>
<p class="urgente"></p>
<div class="urgente aviso"></div>`,
    solucion: ".aviso.urgente",
  },
  {
    bloque: "Relaciones",
    titulo: "Descendientes",
    teoria: `Con un <b>espacio</b> se eligen descendientes a cualquier profundidad: <code>nav a</code> son los <code>a</code> que están dentro de un <code>nav</code>.`,
    html: `<a></a>
<nav>
  <a></a>
  <ul>
    <li><a></a></li>
    <li><a></a></li>
  </ul>
</nav>
<footer><a></a></footer>`,
    solucion: "nav a",
  },
  {
    bloque: "Relaciones",
    titulo: "Hijos directos",
    teoria: `El signo <code>&gt;</code> solo elige <b>hijos directos</b>: <code>ul &gt; li</code> no llega a los <code>li</code> de listas anidadas en otras etiquetas.`,
    html: `<ul>
  <li></li>
  <li>
    <ol>
      <li></li>
    </ol>
  </li>
</ul>
<ol>
  <li></li>
</ol>`,
    solucion: "ul > li",
  },
  {
    bloque: "Relaciones",
    titulo: "Varios a la vez",
    teoria: `La <b>coma</b> agrupa selectores: <code>h1, h2</code> elige los dos tipos.`,
    html: `<h1></h1>
<h2></h2>
<h3></h3>
<p></p>
<h2></h2>`,
    solucion: "h1, h2",
  },
  {
    bloque: "Relaciones",
    titulo: "Hermano inmediato",
    teoria: `<code>+</code> elige el elemento que va <b>justo después</b> de otro y comparte padre: <code>h2 + p</code>.`,
    html: `<h2></h2>
<p></p>
<p></p>
<h2></h2>
<div></div>
<p></p>`,
    solucion: "h2 + p",
  },
  {
    bloque: "Relaciones",
    titulo: "Hermanos posteriores",
    teoria: `<code>~</code> elige <b>todos los hermanos que vienen después</b>, aunque no sean inmediatos: <code>h2 ~ p</code>.`,
    html: `<p></p>
<h2></h2>
<p></p>
<div></div>
<p></p>`,
    solucion: "h2 ~ p",
  },
  {
    bloque: "Atributos",
    titulo: "Tiene el atributo",
    teoria: `<code>[atributo]</code> elige los elementos que <b>tienen</b> ese atributo, sea cual sea su valor.`,
    html: `<input type="text">
<input type="email" required>
<textarea required></textarea>
<input type="text" required>`,
    solucion: "[required]",
  },
  {
    bloque: "Atributos",
    titulo: "Atributo con un valor",
    teoria: `<code>[atributo="valor"]</code> exige un valor exacto: <code>a[target="_blank"]</code>.`,
    html: `<a href="#" target="_blank"></a>
<a href="#"></a>
<a href="#" target="_self"></a>
<a href="#" target="_blank"></a>`,
    solucion: 'a[target="_blank"]',
  },
  {
    bloque: "Atributos",
    titulo: "Empieza por…",
    teoria: `<code>[atributo^="texto"]</code> elige los que <b>empiezan</b> por ese texto. Útil para enlaces seguros: <code>a[href^="https"]</code>.`,
    html: `<a href="https://a.es"></a>
<a href="http://b.es"></a>
<a href="https://c.es/x"></a>
<a href="docs/https.html"></a>`,
    solucion: 'a[href^="https"]',
  },
  {
    bloque: "Atributos",
    titulo: "Termina en…",
    teoria: `<code>[atributo$="texto"]</code> elige los que <b>terminan</b> así: <code>a[href$=".pdf"]</code> para los enlaces a PDF.`,
    html: `<a href="apuntes.pdf"></a>
<a href="apuntes.html"></a>
<a href="tema1.pdf"></a>
<a href="pdf.zip"></a>`,
    solucion: 'a[href$=".pdf"]',
  },
  {
    bloque: "Pseudoclases",
    titulo: "Primer hijo",
    teoria: `<code>:first-child</code> elige el elemento que es el <b>primero</b> dentro de su padre.`,
    html: `<ul>
  <li></li>
  <li></li>
  <li></li>
</ul>
<ol>
  <li></li>
  <li></li>
</ol>`,
    solucion: "li:first-child",
  },
  {
    bloque: "Pseudoclases",
    titulo: "Último hijo",
    teoria: `<code>:last-child</code> elige el <b>último</b> de su padre. Ojo: si después va otra etiqueta, ya no es el último.`,
    html: `<div>
  <p></p>
  <p></p>
</div>
<section>
  <p></p>
  <span></span>
</section>
<p></p>`,
    solucion: "p:last-child",
  },
  {
    bloque: "Pseudoclases",
    titulo: "El n.º 2",
    teoria: `<code>:nth-child(n)</code> elige el hijo que ocupa la posición <b>n</b> (se empieza a contar en 1).`,
    html: `<ul>
  <li></li>
  <li></li>
  <li></li>
</ul>
<ul>
  <li></li>
  <li></li>
</ul>
<ul>
  <li></li>
</ul>`,
    solucion: "li:nth-child(2)",
  },
  {
    bloque: "Pseudoclases",
    titulo: "Impares",
    teoria: `<code>:nth-child(odd)</code> elige las posiciones impares (1, 3, 5…) y <code>even</code> las pares. También vale una fórmula: <code>2n+1</code>.`,
    html: `<ul>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
  <li></li>
</ul>`,
    solucion: "li:nth-child(odd)",
  },
  {
    bloque: "Pseudoclases",
    titulo: "Todos menos…",
    teoria: `<code>:not(…)</code> <b>excluye</b> lo que cumpla lo de dentro: <code>p:not(.nota)</code> son los <code>p</code> sin esa clase.`,
    html: `<p class="nota"></p>
<p></p>
<p class="aviso"></p>
<p class="nota aviso"></p>
<p></p>`,
    solucion: "p:not(.nota)",
  },
  {
    bloque: "Pseudoclases",
    titulo: "Hijo único",
    teoria: `<code>:only-child</code> elige el elemento que es el <b>único hijo</b> de su padre.`,
    html: `<ul>
  <li></li>
</ul>
<ul>
  <li></li>
  <li></li>
</ul>
<ol>
  <li></li>
</ol>`,
    solucion: "li:only-child",
  },
  {
    bloque: "Pseudoclases",
    titulo: "Elementos vacíos",
    teoria: `<code>:empty</code> elige los elementos <b>sin contenido</b> (ni texto ni etiquetas dentro).`,
    html: `<p>Hola</p>
<p></p>
<p>Mundo</p>
<p></p>`,
    solucion: "p:empty",
  },
  {
    bloque: "Pseudoclases",
    titulo: "Primero de su tipo",
    teoria: `<code>:first-of-type</code> elige el primero <b>de su misma etiqueta</b> entre sus hermanos, aunque otros tipos vayan antes. No es lo mismo que <code>:first-child</code>.`,
    html: `<div>
  <h2></h2>
  <p></p>
  <p></p>
</div>
<div>
  <p></p>
  <span></span>
  <p></p>
</div>`,
    solucion: "p:first-of-type",
  },
  {
    bloque: "Reto final",
    titulo: "Combinando todo",
    teoria: `Elige los <b>enlaces internos</b> (los que empiezan por <code>#</code>) del menú <code>.menu</code>, <b>menos los del último elemento de la lista</b>. Combina clase, descendiente, <code>:not</code>, <code>:last-child</code> y atributo.`,
    html: `<ul class="menu">
  <li><a href="#inicio"></a></li>
  <li><a href="https://x.es"></a></li>
  <li><a href="#contacto"></a></li>
</ul>
<ul>
  <li><a href="#otro"></a></li>
  <li></li>
</ul>`,
    solucion: '.menu li:not(:last-child) a[href^="#"]',
  },
];

// ---------------------------------------------------------------------------------------------

/** Etiqueta de apertura tal cual está escrita, para que el alumno vea clases y atributos. */
function etiquetaDe(el: Element): string {
  const attrs = [...el.attributes].filter((a) => a.name !== "data-etq").map((a) => (a.value === "" && /^(required|disabled|checked|hidden)$/.test(a.name) ? a.name : `${a.name}="${a.value}"`));
  return `<${el.localName}${attrs.length ? " " + attrs.join(" ") : ""}>`;
}

const ESTILO_ESCENA = `
  :host { display: block; }
  escena-css, escena-css * { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 6px; box-sizing: border-box; }
  escena-css { flex-direction: column; flex-wrap: nowrap; padding: 8px; background: #fff; border: 2px solid #c9c2ee; border-radius: 10px; }
  escena-css * { margin: 0; line-height: 1.3; padding: 6px 8px; background: #faf9ff; border: 2px dashed #b9b0ea; border-radius: 8px; font: 13px Consolas, "Cascadia Mono", monospace; color: #1a1440; }
  escena-css *::before { content: attr(data-etq); flex: 0 0 auto; color: #4a2fb5; font-weight: 700; white-space: pre; }
  escena-css ul, escena-css ol, escena-css nav, escena-css section, escena-css div { flex-direction: column; }
  escena-css ul > *, escena-css ol > * { flex-direction: row; }
  escena-css > * { align-self: flex-start; }
  escena-css .cs-objetivo { border-color: #f59e0b; border-style: solid; background: #fff4d6; animation: cs-parpadeo 1.1s ease-in-out infinite; }
  escena-css .cs-elegido { border-color: #1f9d4d; border-style: solid; background: #dff5e6; animation: none; }
  escena-css .cs-elegido.cs-fallo { border-color: #da251c; background: #ffe3e0; }
  @keyframes cs-parpadeo { 50% { box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.45); } }
  @media (prefers-reduced-motion: reduce) { escena-css .cs-objetivo { animation: none; } }
`;

export interface Escena {
  /** elementos que elige un selector (lanza si no es válido) */
  elegir(selector: string): Element[];
  /** elementos objetivo del nivel */
  objetivo: Element[];
  /** marca los elementos elegidos por el alumno */
  marcar(elegidos: Element[]): void;
}

/** Construye la escena de un nivel dentro de un shadow root (aísla los selectores del resto del SO). */
export function montarEscena(anfitrion: HTMLElement, nivel: NivelSelector, resaltarObjetivo = true): Escena {
  const sombra = anfitrion.shadowRoot ?? anfitrion.attachShadow({ mode: "open" });
  sombra.innerHTML = `<style>${ESTILO_ESCENA}</style><escena-css>${nivel.html}</escena-css>`;
  const raiz = sombra.querySelector("escena-css")!;
  const dentro = (sel: string) => [...raiz.querySelectorAll(sel)].filter((e) => e !== raiz);
  for (const el of dentro("*")) el.setAttribute("data-etq", etiquetaDe(el));
  // el selector se evalúa sobre el árbol de la sombra: lo de fuera (div, body…) no cuenta
  const elegir = (sel: string) => [...sombra.querySelectorAll(sel)].filter((e) => e !== raiz && raiz.contains(e));
  const objetivo = elegir(nivel.solucion);
  if (resaltarObjetivo) objetivo.forEach((e) => e.classList.add("cs-objetivo"));
  return {
    elegir,
    objetivo,
    marcar(elegidos) {
      for (const e of dentro("*")) e.classList.remove("cs-elegido", "cs-fallo");
      for (const e of elegidos) e.classList.add("cs-elegido", ...(objetivo.includes(e) ? [] : ["cs-fallo"]));
    },
  };
}

export function mismosElementos(a: Element[], b: Element[]): boolean {
  return a.length === b.length && a.every((e) => b.includes(e));
}

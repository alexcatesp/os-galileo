// Emmet mínimo para el editor del Laboratorio: funciones puras (sin DOM).
// HTML: `ul>li*3`, `div.caja#uno>p{Hola}`, `a[href=x]`, `h1+p`, `div>p^footer`, `li.item$*3`, `!`.
// CSS: `m10`, `p20`, `w100%`, `df`, `jcc`, `aic`, `bgc`…

import { contextoCss, etiquetasConocidas } from "./autocompletar";

export interface Expansion {
  desde: number;
  hasta: number;
  insertar: string;
  /** posición del cursor dentro de `insertar` */
  cursor: number;
}

// ===================================================================== HTML

interface Nodo {
  tag: string;
  id: string;
  clases: string[];
  attrs: [string, string | null][];
  texto: string;
  veces: number;
  hijos: Nodo[];
  padre: Nodo | null;
  /** el nombre de etiqueta se escribió a mano */
  explicito: boolean;
}

const VACIAS = new Set(["br", "hr", "img", "input", "link", "meta"]);
const EN_LINEA = new Set(["a", "span", "em", "strong", "b", "i", "u", "small", "mark", "code", "br", "img", "label"]);
const HIJO_POR_DEFECTO: Record<string, string> = { ul: "li", ol: "li", table: "tr", thead: "tr", tbody: "tr", tr: "td", select: "option", p: "span", span: "span", em: "span" };
const MARCA = "\u0001";

function nuevoNodo(padre: Nodo | null): Nodo {
  return { tag: "", id: "", clases: [], attrs: [], texto: "", veces: 1, hijos: [], padre, explicito: false };
}

/** lee un elemento a partir de `i`; devuelve el nodo y la posición siguiente, o null si no es válido */
function leerElemento(s: string, i: number, padre: Nodo | null): [Nodo, number] | null {
  const n = nuevoNodo(padre);
  const nombre = /^[A-Za-z][\w:-]*/.exec(s.slice(i));
  if (nombre) {
    n.tag = nombre[0].toLowerCase();
    n.explicito = true;
    i += nombre[0].length;
  }
  let algo = !!nombre;
  while (i < s.length) {
    const c = s[i];
    if (c === "#" || c === ".") {
      const m = /^[\w$-]+/.exec(s.slice(i + 1));
      if (!m) return null;
      if (c === "#") n.id = m[0];
      else n.clases.push(m[0]);
      i += 1 + m[0].length;
      algo = true;
    } else if (c === "[") {
      const fin = s.indexOf("]", i);
      if (fin < 0) return null;
      for (const m of s.slice(i + 1, fin).matchAll(/([\w:-]+)(?:=("[^"]*"|'[^']*'|[^\s]*))?/g)) {
        n.attrs.push([m[1], m[2] === undefined ? null : m[2].replace(/^["']|["']$/g, "")]);
      }
      i = fin + 1;
      algo = true;
    } else if (c === "{") {
      const fin = s.indexOf("}", i);
      if (fin < 0) return null;
      n.texto = s.slice(i + 1, fin);
      i = fin + 1;
      algo = true;
    } else if (c === "*") {
      const m = /^\d+/.exec(s.slice(i + 1));
      if (!m) return null;
      n.veces = Math.min(50, Math.max(1, Number(m[0])));
      i += 1 + m[0].length;
      break;
    } else break;
  }
  return algo ? [n, i] : null;
}

function analizar(s: string): Nodo | null {
  const raiz = nuevoNodo(null);
  let cur = raiz;
  let i = 0;
  let ultimo: Nodo | null = null;
  for (;;) {
    const r = leerElemento(s, i, cur);
    if (!r) return null;
    const [n, sig] = r;
    if (!n.tag) n.tag = HIJO_POR_DEFECTO[cur.tag] ?? "div";
    cur.hijos.push(n);
    ultimo = n;
    i = sig;
    if (i >= s.length) break;
    const op = s[i];
    if (op === ">") {
      cur = ultimo;
      i++;
    } else if (op === "+") i++;
    else if (op === "^") {
      while (s[i] === "^") {
        cur = cur.padre ?? cur;
        i++;
      }
    } else return null;
  }
  return raiz;
}

const num = (t: string, k: number) => t.replace(/\$+/g, (d) => String(k).padStart(d.length, "0"));

function pintar(n: Nodo, marca: { puesta: boolean }): string[] {
  const lineas: string[] = [];
  for (let k = 1; k <= n.veces; k++) {
    const attrs: [string, string | null][] = [...n.attrs];
    const tiene = (a: string) => attrs.some(([x]) => x === a);
    let implicito = "";
    if (n.tag === "img") {
      if (!tiene("src")) implicito += ` src="${marca.puesta ? "" : MARCA}"`;
      if (!tiene("src") && !marca.puesta) marca.puesta = true;
      if (!tiene("alt")) implicito += ` alt=""`;
    } else if (n.tag === "a" && !tiene("href")) implicito = ` href=""`;
    else if (n.tag === "input" && !tiene("type")) implicito = ` type="text"`;
    else if (n.tag === "link" && !tiene("rel")) implicito = ` rel="stylesheet" href=""`;
    const cl = n.clases.map((c) => num(c, k)).join(" ");
    const abre =
      `<${n.tag}` +
      (n.id ? ` id="${num(n.id, k)}"` : "") +
      (cl ? ` class="${cl}"` : "") +
      attrs.map(([a, v]) => (v === null ? ` ${a}` : ` ${a}="${num(v, k)}"`)).join("") +
      implicito +
      ">";
    if (VACIAS.has(n.tag)) {
      lineas.push(abre);
      continue;
    }
    const cierra = `</${n.tag}>`;
    const texto = num(n.texto, k);
    if (!n.hijos.length) {
      let medio = texto;
      if (!texto && !marca.puesta) {
        medio = MARCA;
        marca.puesta = true;
      }
      lineas.push(abre + medio + cierra);
      continue;
    }
    const sub = n.hijos.map((h) => pintar(h, marca));
    if (!texto && n.hijos.every((h) => EN_LINEA.has(h.tag)) && sub.every((l) => l.length === 1)) {
      lineas.push(abre + sub.map((l) => l[0]).join("") + cierra);
      continue;
    }
    lineas.push(abre);
    if (texto) lineas.push(`  ${texto}`);
    for (const l of sub.flat()) lineas.push(`  ${l}`);
    lineas.push(cierra);
  }
  return lineas;
}

const ESQUELETO = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${MARCA}</title>
  <link rel="stylesheet" href="estilos.css">
</head>
<body>

</body>
</html>`;

function terminar(plantilla: string, sangria: string, desde: number, hasta: number): Expansion {
  const texto = plantilla.split("\n").join(`\n${sangria}`);
  const k = texto.indexOf(MARCA);
  const insertar = texto.replace(MARCA, "");
  return { desde, hasta, insertar, cursor: k < 0 ? insertar.length : k };
}

export function expandirHtml(texto: string, pos: number): Expansion | null {
  const antes = texto.slice(0, pos);
  if (antes.lastIndexOf("<") > antes.lastIndexOf(">")) return null; // dentro de una etiqueta
  if (antes.lastIndexOf("<!--") > antes.lastIndexOf("-->")) return null;
  const ini = antes.lastIndexOf("\n") + 1;
  const linea = antes.slice(ini);
  const sangria = /^[ \t]*/.exec(linea)![0];
  // lo que hay tras la última etiqueta real de la línea
  const resto = linea.replace(/^.*<\/?[A-Za-z][^<>]*>/, "");
  const m = /(?:^|\s)((?:[\w.#>+*^!:$-]|\[[^\]]*\]|\{[^}]*\})+)$/.exec(resto);
  if (!m) return null;
  const abrev = m[1];
  const desde = pos - abrev.length;
  if (abrev === "!") return terminar(ESQUELETO, sangria, desde, pos);
  const raiz = analizar(abrev);
  if (!raiz) return null;
  const primero = raiz.hijos[0];
  if (primero.explicito && !etiquetasConocidas.has(primero.tag)) return null;
  const marca = { puesta: false };
  const lineas = raiz.hijos.flatMap((h) => pintar(h, marca));
  return terminar(lineas.join("\n"), sangria, desde, pos);
}

// ===================================================================== CSS

const NUMERICAS: Record<string, [string, string]> = {
  m: ["margin", "px"], mt: ["margin-top", "px"], mr: ["margin-right", "px"], mb: ["margin-bottom", "px"], ml: ["margin-left", "px"],
  p: ["padding", "px"], pt: ["padding-top", "px"], pr: ["padding-right", "px"], pb: ["padding-bottom", "px"], pl: ["padding-left", "px"],
  w: ["width", "px"], h: ["height", "px"], mxw: ["max-width", "px"], mnw: ["min-width", "px"], mxh: ["max-height", "px"], mnh: ["min-height", "px"],
  fz: ["font-size", "px"], br: ["border-radius", "px"], g: ["gap", "px"],
  t: ["top", "px"], r: ["right", "px"], b: ["bottom", "px"], l: ["left", "px"],
  lh: ["line-height", ""], z: ["z-index", ""], fw: ["font-weight", ""], op: ["opacity", ""],
};
const SIN_NUMERO_OK = new Set(["m", "p", "w", "h", "fz", "br", "g", "lh"]);

const PALABRAS: Record<string, string> = {
  df: "display: flex;", dg: "display: grid;", db: "display: block;", dib: "display: inline-block;", di: "display: inline;", dn: "display: none;",
  jcc: "justify-content: center;", jcsb: "justify-content: space-between;", jcsa: "justify-content: space-around;", jcfe: "justify-content: flex-end;",
  aic: "align-items: center;", aife: "align-items: flex-end;", aifs: "align-items: flex-start;",
  fdc: "flex-direction: column;", fdr: "flex-direction: row;", fww: "flex-wrap: wrap;",
  tac: "text-align: center;", tal: "text-align: left;", tar: "text-align: right;",
  posa: "position: absolute;", posr: "position: relative;", posf: "position: fixed;", poss: "position: sticky;",
  bgc: "background-color: |;", c: "color: |;", bd: "border: 1px solid |;", bxz: "box-sizing: border-box;", tdn: "text-decoration: none;",
  fwb: "font-weight: bold;", fsi: "font-style: italic;", cp: "cursor: pointer;", ovh: "overflow: hidden;", ova: "overflow: auto;",
};

export function expandirCss(texto: string, pos: number): Expansion | null {
  const antes = texto.slice(0, pos);
  const ctx = contextoCss(antes);
  if (!ctx || ctx.pila[ctx.pila.length - 1] !== "regla" || ctx.seg.includes(":")) return null;
  const linea = antes.slice(antes.lastIndexOf("\n") + 1);
  const m = /(?:^|[\s;{])([a-z]+)(-?\d+(?:\.\d+)?)?(px|rem|em|vh|vw|%)?$/.exec(linea);
  if (!m) return null;
  const [, nombre, cifra, unidad] = m;
  const desde = pos - m[0].length + (m[0].length - (nombre.length + (cifra?.length ?? 0) + (unidad?.length ?? 0)));
  const plantilla = (t: string): Expansion => {
    const k = t.indexOf("|");
    return { desde, hasta: pos, insertar: k < 0 ? t : t.replace("|", ""), cursor: k < 0 ? t.length : k };
  };
  if (cifra === undefined && unidad === undefined && PALABRAS[nombre]) return plantilla(PALABRAS[nombre]);
  const def = NUMERICAS[nombre];
  if (!def) return null;
  if (cifra === undefined) return SIN_NUMERO_OK.has(nombre) ? plantilla(`${def[0]}: |;`) : null;
  const valor = cifra === "0" && !unidad ? "0" : cifra + (unidad ?? def[1]);
  return plantilla(`${def[0]}: ${valor};`);
}

// Revisor de HTML para el alumnado: etiquetas mal cerradas y buenas prácticas básicas.
// No sustituye al validador del W3C; solo señala lo que más se repite en clase.

export interface Aviso {
  nivel: "error" | "aviso";
  texto: string;
  linea?: number;
}

const VACIAS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
/** Etiquetas cuyo cierre HTML permite omitir: se avisa, pero no es un error */
const CIERRE_OPCIONAL = new Set(["li", "p", "td", "th", "tr", "thead", "tbody", "tfoot", "option", "dt", "dd"]);
const CRUDAS = new Set(["script", "style", "textarea", "title"]);

function lineaDe(texto: string, indice: number): number {
  let n = 1;
  for (let i = 0; i < indice; i++) if (texto.charCodeAt(i) === 10) n++;
  return n;
}

export function revisarHtml(html: string): Aviso[] {
  const avisos: Aviso[] = [];
  if (!html.trim()) return [{ nivel: "aviso", texto: "El documento está vacío." }];

  // ---- 1. Etiquetas abiertas y cerradas ----
  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
  const pila: { nombre: string; indice: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    if (m[0].startsWith("<!--")) continue;
    const cierre = m[1] === "/";
    const nombre = m[2].toLowerCase();
    if (!cierre) {
      if (VACIAS.has(nombre) || m[3].trimEnd().endsWith("/")) continue;
      pila.push({ nombre, indice: m.index });
      if (CRUDAS.has(nombre)) {
        // el contenido de <style>, <script>… no se interpreta como etiquetas
        const fin = html.toLowerCase().indexOf(`</${nombre}`, re.lastIndex);
        if (fin > -1) re.lastIndex = fin;
      }
    } else {
      const pos = pila.map((p) => p.nombre).lastIndexOf(nombre);
      if (pos === -1) {
        avisos.push({ nivel: "error", texto: `La etiqueta de cierre </${nombre}> no tiene su apertura.`, linea: lineaDe(html, m.index) });
        continue;
      }
      for (let i = pila.length - 1; i > pos; i--) {
        const sin = pila[i];
        avisos.push({
          nivel: CIERRE_OPCIONAL.has(sin.nombre) ? "aviso" : "error",
          texto: `<${sin.nombre}> no está cerrada antes de </${nombre}>.`,
          linea: lineaDe(html, sin.indice),
        });
      }
      pila.length = pos;
    }
  }
  for (const p of pila) {
    avisos.push({
      nivel: CIERRE_OPCIONAL.has(p.nombre) ? "aviso" : "error",
      texto: `<${p.nombre}> no tiene su etiqueta de cierre </${p.nombre}>.`,
      linea: lineaDe(html, p.indice),
    });
  }

  // ---- 2. Estructura y buenas prácticas (sobre el DOM que construye el navegador) ----
  if (!/^\s*<!doctype\s+html/i.test(html)) avisos.push({ nivel: "aviso", texto: "Falta <!DOCTYPE html> al principio: el navegador usaría el modo de compatibilidad (quirks)." });
  const doc = new DOMParser().parseFromString(html, "text/html");
  if (!doc.documentElement.getAttribute("lang")) avisos.push({ nivel: "aviso", texto: "La etiqueta <html> debería llevar el idioma: <html lang=\"es\">." });
  if (!doc.querySelector("meta[charset]")) avisos.push({ nivel: "aviso", texto: "Falta <meta charset=\"UTF-8\"> en el <head>: las tildes pueden verse mal." });
  if (!doc.title.trim()) avisos.push({ nivel: "aviso", texto: "Falta el <title> (o está vacío): es el texto de la pestaña." });

  doc.querySelectorAll("img:not([alt])").forEach(() => avisos.push({ nivel: "aviso", texto: "Una <img> no tiene atributo alt (texto alternativo para lectores de pantalla)." }));
  doc.querySelectorAll("a:not([href])").forEach((a) => avisos.push({ nivel: "aviso", texto: `Un <a> sin href (“${(a.textContent ?? "").trim().slice(0, 24)}”) no es un enlace.` }));

  const h1 = doc.querySelectorAll("h1").length;
  if (h1 > 1) avisos.push({ nivel: "aviso", texto: `Hay ${h1} títulos <h1>; lo habitual es uno solo por página.` });
  let previo = 0;
  doc.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach((h) => {
    const n = Number(h.tagName[1]);
    if (previo && n > previo + 1) avisos.push({ nivel: "aviso", texto: `Salto de <h${previo}> a <h${n}>: no te saltes niveles de título.` });
    previo = n;
  });

  const vistos = new Set<string>();
  doc.querySelectorAll("[id]").forEach((el) => {
    const id = el.id;
    if (vistos.has(id)) avisos.push({ nivel: "error", texto: `El id “${id}” está repetido: debe ser único en el documento.` });
    vistos.add(id);
  });

  doc.querySelectorAll("label[for]").forEach((l) => {
    const para = l.getAttribute("for")!;
    if (!doc.getElementById(para)) avisos.push({ nivel: "aviso", texto: `El <label for="${para}"> no apunta a ningún elemento con ese id.` });
  });
  doc.querySelectorAll("input:not([type=hidden]):not([type=submit]):not([type=button]), textarea, select").forEach((c) => {
    const id = c.id;
    const conEtiqueta = (id && doc.querySelector(`label[for="${CSS.escape(id)}"]`)) || c.closest("label");
    if (!conEtiqueta && !c.getAttribute("aria-label")) avisos.push({ nivel: "aviso", texto: `Un <${c.tagName.toLowerCase()}> no tiene <label> asociada.` });
  });

  // quitar duplicados exactos conservando el orden
  const visto = new Set<string>();
  return avisos.filter((a) => {
    const clave = `${a.nivel}|${a.texto}|${a.linea ?? ""}`;
    if (visto.has(clave)) return false;
    visto.add(clave);
    return true;
  });
}

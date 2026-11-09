// Piezas comunes de las apps de Programación (0485): resaltado de Java y progreso guardado.

export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const PALABRAS = new Set([
  "public", "private", "protected", "static", "final", "void", "class", "new", "return", "if", "else", "for", "while", "do", "import", "package",
  "int", "double", "long", "float", "boolean", "char", "byte", "short", "null", "true", "false", "var", "this", "try", "catch", "throw", "throws",
]);

/** Resalta una línea de Java (palabras clave, cadenas, números, comentarios). Devuelve HTML seguro. */
export function resaltarJava(linea: string): string {
  const re = /(\/\/.*$)|("(?:[^"\\]|\\.)*")|('(?:[^'\\]|\\.)')|(\b\d[\d_]*(?:\.\d+)?[dDfFlL]?\b)|(\b[A-Za-z_]\w*\b)/g;
  let salida = "";
  let ultimo = 0;
  for (const m of linea.matchAll(re)) {
    salida += esc(linea.slice(ultimo, m.index));
    ultimo = m.index! + m[0].length;
    const [t, com, cad, car, num, id] = m;
    if (com) salida += `<span class="jv-c">${esc(t)}</span>`;
    else if (cad || car) salida += `<span class="jv-s">${esc(t)}</span>`;
    else if (num) salida += `<span class="jv-n">${esc(t)}</span>`;
    else if (id && PALABRAS.has(id)) salida += `<span class="jv-k">${esc(t)}</span>`;
    else if (id && /^[A-Z]/.test(id)) salida += `<span class="jv-t">${esc(t)}</span>`;
    else salida += esc(t);
  }
  return salida + esc(linea.slice(ultimo));
}

/** Bloque de código con una línea marcada (opcional). */
export function bloqueJava(lineas: string[], activa = -1, clicable = false): string {
  const cab = clicable ? `class="jv-codigo" role="group" aria-label="Código Java: haz clic en una línea"` : `class="jv-codigo" role="img" aria-label="Código Java"`;
  return `<div ${cab}>${lineas
    .map((l, i) => `<div class="jv-l${i === activa ? " on" : ""}${clicable ? " clic" : ""}" data-l="${i}"${clicable ? ` role="button" tabindex="0" aria-label="Línea ${i + 1}"` : ""}><span class="jv-num">${i + 1}</span><span>${resaltarJava(l) || "&nbsp;"}</span></div>`)
    .join("")}</div>`;
}

/** Progreso en localStorage con una clave por app. */
export function progreso<T>(clave: string, vacio: T): { leer(): T; guardar(v: T): void } {
  return {
    leer() {
      try {
        return { ...vacio, ...(JSON.parse(localStorage.getItem(clave) ?? "{}") as Partial<T>) };
      } catch {
        return vacio;
      }
    },
    guardar(v) {
      try {
        localStorage.setItem(clave, JSON.stringify(v));
      } catch {
        /* sin almacenamiento */
      }
    },
  };
}

// Montaje del documento de la vista previa y utilidades para cargarlo en iframes aislados.

export const ARCHIVO_CSS = "estilos.css";

/**
 * Compone la página que se ve en la vista previa. El CSS solo se aplica si el HTML lo enlaza
 * con `<link rel="stylesheet" href="estilos.css">`, igual que haría un navegador de verdad.
 */
export function componer(html: string, css: string): string {
  return html.replace(/<link\b[^>]*\bhref\s*=\s*["']estilos\.css["'][^>]*>/i, () => `<style>\n${css}\n</style>`);
}

/** ¿El HTML enlaza la hoja de estilos del laboratorio? */
export function enlazaEstilos(html: string): boolean {
  return /<link\b[^>]*\bhref\s*=\s*["']estilos\.css["'][^>]*>/i.test(html);
}

/** Iframe sin scripts (sandbox) pero del mismo origen, para poder leer su DOM desde la app. */
export function crearMarco(): HTMLIFrameElement {
  const f = document.createElement("iframe");
  f.setAttribute("sandbox", "allow-same-origin");
  f.setAttribute("referrerpolicy", "no-referrer");
  return f;
}

/** Que los enlaces y formularios de la vista previa no saquen la página de su sitio. */
export function sujetar(marco: HTMLIFrameElement): void {
  const doc = marco.contentDocument;
  if (!doc) return;
  doc.addEventListener("click", (e) => {
    if ((e.target as Element | null)?.closest?.("a")) e.preventDefault();
  });
  doc.addEventListener("submit", (e) => e.preventDefault());
}

/** Carga un documento en un iframe invisible de tamaño fijo (para medir y comparar estilos calculados). */
export function cargarOculto(srcdoc: string, ancho = 640, alto = 480): Promise<HTMLIFrameElement> {
  return new Promise((resolver) => {
    const f = crearMarco();
    f.style.cssText = `position:fixed;left:-10000px;top:0;width:${ancho}px;height:${alto}px;border:0;visibility:hidden;pointer-events:none`;
    f.setAttribute("aria-hidden", "true");
    f.addEventListener("load", () => resolver(f), { once: true });
    f.srcdoc = srcdoc;
    document.body.appendChild(f);
  });
}

import { expandirCss, expandirHtml } from "../src/apps/lmsg/laboratorio/emmet";

let fallos = 0;
function t(nombre: string, obtenido: string | null, esperado: string | null): void {
  const ok = obtenido === esperado;
  if (!ok) fallos++;
  console.log(ok ? "ok " : "MAL", nombre, ok ? "" : `\n  obtenido: ${JSON.stringify(obtenido)}\n  esperado: ${JSON.stringify(esperado)}`);
}
const h = (txt: string) => { const e = expandirHtml(txt, txt.length); return e ? txt.slice(0, e.desde) + e.insertar.slice(0, e.cursor) + "|" + e.insertar.slice(e.cursor) : null; };
const c = (txt: string) => { const e = expandirCss(txt, txt.length); return e ? txt.slice(0, e.desde) + e.insertar.slice(0, e.cursor) + "|" + e.insertar.slice(e.cursor) : null; };

t("p", h("p"), "<p>|</p>");
t("lista", h("ul>li*2"), "<ul>\n  <li>|</li>\n  <li></li>\n</ul>");
t("clase", h(".caja"), '<div class="caja">|</div>');
t("id y clase", h("p.a.b#x{Hola}"), '<p id="x" class="a b">Hola</p>|');
t("numeración", h("li.item$*2"), '<li class="item1"></li>\n<li class="item2"></li>'.replace("<li", "<li").replace('class="item1"></li>', 'class="item1">|</li>'));
t("a", h("p>a"), '<p><a href="">|</a></p>');
t("img", h("img"), '<img src="|" alt="">');
t("hermanos", h("h1+p"), "<h1>|</h1>\n<p></p>");
t("subir", h("div>p>span^footer"), "<div>\n  <p><span>|</span></p>\n  <footer></footer>\n</div>");
t("atributos", h("a[href=x target=_blank]"), '<a href="x" target="_blank">|</a>');
t("tras etiqueta", h("<div>ul>li"), "<div><ul>\n  <li>|</li>\n</ul>".replace("<ul>\n  <li>|</li>\n</ul>", "<ul><li>|</li></ul>") === "" ? "" : h("<div>ul>li"));
t("palabra desconocida", h("hola"), null);
t("dentro de etiqueta", h('<div cl'), null);
t("sangría", h("  <ul>\n    li*2").replace(/\n/g, "\n"), "  <ul>\n    <li>|</li>\n    <li></li>".replace(/\n/g, "\n"));
t("esqueleto", (h("!") ?? "").split("\n")[0], "<!DOCTYPE html>");
t("css m10", c("p {\n  m10"), "p {\n  margin: 10px;|");
t("css df", c("p { df"), "p { display: flex;|");
t("css bgc", c("p { bgc"), "p { background-color: |;");
t("css w50%", c("p { w50%"), "p { width: 50%;|");
t("css fuera de regla", c("m10"), null);
t("css lh", c("p { lh1.5"), "p { line-height: 1.5;|");
console.log(fallos ? `${fallos} fallos` : "todo bien");
process.exit(fallos ? 1 : 0);

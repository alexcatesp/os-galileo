import { sugerirCss, sugerirHtml } from "../src/apps/lmsg/laboratorio/autocompletar";

let fallos = 0;
function t(nombre: string, r: ReturnType<typeof sugerirHtml>, espera: string | null): void {
  const primero = r?.items.map((i) => i.etiqueta).slice(0, 4).join(",") ?? null;
  const ok = espera === null ? r === null : !!r && r.items.some((i) => i.etiqueta === espera || i.insertar.startsWith(espera));
  if (!ok) fallos++;
  console.log(ok ? "ok " : "MAL", nombre, "->", primero);
}
const h = (txt: string, css = "") => sugerirHtml(txt, txt.length, css);
const c = (txt: string, html = "") => sugerirCss(txt, txt.length, html);

t("etiqueta <di", h("<di"), "div");
t("etiqueta <", h("<"), "div");
t("cierre </", h("<div><p>hola</"), "p");
t("cierre tras void", h("<div><br><img src=''></"), "div");
t("atributo", h('<a hr'), "href");
t("atributo ya puesto", h('<a href="x" hr'), null);
t("valor type", h('<input type="ch'), "checkbox");
t("clase del css", h('<p class="ca', ".caja{} .carta{}"), "caja");
t("comentario", h("<!-- <di"), null);
t("doctype", h("<!DOC"), "!doctype");
t("texto normal", h("hola"), null);
t("propiedad", c("p { col"), "color");
t("valor", c("p { display: fl"), "flex");
t("valor color", c("p { color: re"), "red");
t("fuera de regla", c("bo"), "body");
t("clase de html", c(".ca", '<div class="caja">'), ".caja");
t("pseudo", c("a:ho"), ":hover");
t("pseudoel", c("p::bef"), "::before");
t("arroba", c("@me"), "@media");
t("media", c("@media (max"), "max-width: 600px");
t("comentario css", c("/* col"), null);
t("tras }", c("p { color: red; }\nsp"), "span");
t("media interior", c("@media (x) { p { col"), "color");
t("keyframes", c("@keyframes a { fr"), "from");
console.log(fallos ? `${fallos} fallos` : "todo bien");
process.exit(fallos ? 1 : 0);

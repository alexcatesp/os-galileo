// Del modelo al pseudocódigo (y al XML), asignando de paso el número de línea a cada nodo.

import type { Lista, Nodo, Programa } from "./modelo";

export function aTexto(p: Programa): string {
  const out: string[] = ["INICIO"];
  const sangria = (n: number) => "  ".repeat(n);
  const emitir = (texto: string, nivel: number, nodo?: Nodo) => {
    out.push(sangria(nivel) + texto);
    if (nodo) nodo.linea = out.length;
  };
  const lista = (l: Lista, nivel: number) => l.forEach((n) => nodo(n, nivel));
  const nodo = (n: Nodo, nivel: number) => {
    switch (n.t) {
      case "leer": return emitir(`LEER ${n.vars}`, nivel, n);
      case "escribir": return emitir(`ESCRIBIR ${n.expr}`, nivel, n);
      case "asignar": return emitir(`${n.variable} <- ${n.expr}`, nivel, n);
      case "si":
        emitir(`SI ${n.cond} ENTONCES`, nivel, n);
        lista(n.entonces, nivel + 1);
        if (n.sino.length) {
          emitir("SI NO", nivel);
          lista(n.sino, nivel + 1);
        }
        return emitir("FIN SI", nivel);
      case "mientras":
        emitir(`MIENTRAS ${n.cond} HACER`, nivel, n);
        lista(n.cuerpo, nivel + 1);
        return emitir("FIN MIENTRAS", nivel);
      case "repetir": {
        emitir("REPETIR", nivel, n);
        lista(n.cuerpo, nivel + 1);
        return emitir(`HASTA ${n.hasta}`, nivel);
      }
      case "para":
        emitir(`PARA ${n.variable} DESDE ${n.desde} HASTA ${n.hasta}${n.paso ? ` CON PASO ${n.paso}` : ""} HACER`, nivel, n);
        lista(n.cuerpo, nivel + 1);
        return emitir("FIN PARA", nivel);
      case "segun":
        emitir(`SEGÚN ${n.expr} HACER`, nivel, n);
        for (const c of n.casos) {
          emitir(`CASO ${c.valor}:`, nivel + 1);
          lista(c.cuerpo, nivel + 2);
        }
        if (n.otro.length) {
          emitir("OTRO:", nivel + 1);
          lista(n.otro, nivel + 2);
        }
        return emitir("FIN SEGÚN", nivel);
    }
  };
  lista(p.cuerpo, 1);
  out.push("FIN");
  return out.join("\n") + "\n";
}

// ---------- XML ----------
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function aXml(p: Programa): string {
  const out: string[] = ['<?xml version="1.0" encoding="UTF-8"?>', '<diagrama version="1">'];
  const lista = (l: Lista, nivel: number) => l.forEach((n) => nodo(n, nivel));
  const nodo = (n: Nodo, nivel: number) => {
    const s = "  ".repeat(nivel);
    switch (n.t) {
      case "leer": return out.push(`${s}<leer variables="${esc(n.vars)}"/>`);
      case "escribir": return out.push(`${s}<escribir expresion="${esc(n.expr)}"/>`);
      case "asignar": return out.push(`${s}<asignar variable="${esc(n.variable)}" expresion="${esc(n.expr)}"/>`);
      case "si":
        out.push(`${s}<si condicion="${esc(n.cond)}">`, `${s}  <entonces>`);
        lista(n.entonces, nivel + 2);
        out.push(`${s}  </entonces>`, `${s}  <sino>`);
        lista(n.sino, nivel + 2);
        return out.push(`${s}  </sino>`, `${s}</si>`);
      case "mientras":
        out.push(`${s}<mientras condicion="${esc(n.cond)}">`);
        lista(n.cuerpo, nivel + 1);
        return out.push(`${s}</mientras>`);
      case "repetir":
        out.push(`${s}<repetir hasta="${esc(n.hasta)}">`);
        lista(n.cuerpo, nivel + 1);
        return out.push(`${s}</repetir>`);
      case "para":
        out.push(`${s}<para variable="${esc(n.variable)}" desde="${esc(n.desde)}" hasta="${esc(n.hasta)}" paso="${esc(n.paso)}">`);
        lista(n.cuerpo, nivel + 1);
        return out.push(`${s}</para>`);
      case "segun":
        out.push(`${s}<segun expresion="${esc(n.expr)}">`);
        for (const c of n.casos) {
          out.push(`${s}  <caso valor="${esc(c.valor)}">`);
          lista(c.cuerpo, nivel + 2);
          out.push(`${s}  </caso>`);
        }
        out.push(`${s}  <otro>`);
        lista(n.otro, nivel + 2);
        out.push(`${s}  </otro>`, `${s}</segun>`);
    }
  };
  lista(p.cuerpo, 1);
  out.push("</diagrama>");
  return out.join("\n") + "\n";
}

export function deXml(xml: string): Programa {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.querySelector("parsererror")) throw new Error("El archivo XML no es válido");
  const raiz = doc.documentElement;
  if (raiz.tagName !== "diagrama") throw new Error("No es un diagrama de OS Galileo (falta <diagrama>)");
  const at = (e: Element, n: string) => e.getAttribute(n) ?? "";
  const hijosDe = (e: Element): Lista =>
    [...e.children].map((c): Nodo => {
      switch (c.tagName) {
        case "leer": return { t: "leer", vars: at(c, "variables") };
        case "escribir": return { t: "escribir", expr: at(c, "expresion") };
        case "asignar": return { t: "asignar", variable: at(c, "variable"), expr: at(c, "expresion") };
        case "si": return {
          t: "si", cond: at(c, "condicion"),
          entonces: hijosDe(c.querySelector(":scope > entonces") ?? c.ownerDocument.createElement("x")),
          sino: hijosDe(c.querySelector(":scope > sino") ?? c.ownerDocument.createElement("x")),
        };
        case "mientras": return { t: "mientras", cond: at(c, "condicion"), cuerpo: hijosDe(c) };
        case "repetir": return { t: "repetir", hasta: at(c, "hasta"), cuerpo: hijosDe(c) };
        case "para": return { t: "para", variable: at(c, "variable"), desde: at(c, "desde"), hasta: at(c, "hasta"), paso: at(c, "paso"), cuerpo: hijosDe(c) };
        case "segun": return {
          t: "segun", expr: at(c, "expresion"),
          casos: [...c.querySelectorAll(":scope > caso")].map((k) => ({ valor: at(k, "valor"), cuerpo: hijosDe(k) })),
          otro: hijosDe(c.querySelector(":scope > otro") ?? c.ownerDocument.createElement("x")),
        };
        default: throw new Error(`Elemento desconocido en el XML: <${c.tagName}>`);
      }
    });
  return { cuerpo: hijosDe(raiz) };
}

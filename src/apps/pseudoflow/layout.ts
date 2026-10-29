// Del modelo al diagrama de flujo en SVG. Toda decisión tiene dos salidas que se reúnen,
// así que el diagrama no puede dejar ramas colgando. Los estilos van como atributos para
// que el SVG exportado a PNG se vea igual.

import type { Lista, Nodo, Si } from "./modelo";

const GAP = 34;
const FUENTE = 13;
const ANCHO_CAR = 7.4;
const INTERLINEA = 17;
const AZUL = "#2a1770";
const TEXTO = "#1a1440";

export type FormaTipo = "inicio" | "fin" | "proceso" | "es" | "decision";

interface Medida {
  lineas: string[];
  w: number;
  h: number;
}

/** Ajusta el texto a un ancho máximo y calcula el tamaño de la forma. */
function medir(texto: string, tipo: FormaTipo): Medida {
  const maxCar = tipo === "decision" ? 18 : 28;
  const palabras = texto.split(/\s+/).filter(Boolean);
  const lineas: string[] = [];
  let actual = "";
  for (const p of palabras) {
    if ((actual + " " + p).trim().length > maxCar && actual) {
      lineas.push(actual);
      actual = p;
    } else actual = (actual + " " + p).trim();
  }
  if (actual || !lineas.length) lineas.push(actual);
  const tw = Math.max(...lineas.map((l) => l.length)) * ANCHO_CAR;
  const th = lineas.length * INTERLINEA;
  if (tipo === "decision") return { lineas, w: Math.max(130, tw + 64), h: Math.max(70, th + 46) };
  if (tipo === "inicio" || tipo === "fin") return { lineas, w: Math.max(100, tw + 40), h: 42 };
  return { lineas, w: Math.max(120, tw + (tipo === "es" ? 56 : 32)), h: Math.max(42, th + 18) };
}

export interface Item {
  nodo: Nodo | null;
  fase?: string;
  /** lista que contiene el nodo y posición, para borrar */
  lista?: Lista;
  idx?: number;
}
export interface PuntoMas {
  lista: Lista;
  idx: number;
}

class Dibujo {
  partes: string[] = [];
  items: Item[] = [];
  mas: PuntoMas[] = [];

  forma(tipo: FormaTipo, x: number, y: number, m: Medida, item: Item): void {
    const { w, h, lineas } = m;
    const id = this.items.push(item) - 1;
    let figura: string;
    const cx = x, cy = y + h / 2;
    switch (tipo) {
      case "inicio":
      case "fin":
        figura = `<rect x="${x - w / 2}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${AZUL}" stroke="${AZUL}" stroke-width="2"/>`;
        break;
      case "proceso":
        figura = `<rect x="${x - w / 2}" y="${y}" width="${w}" height="${h}" rx="3" fill="#ebe7ff" stroke="${AZUL}" stroke-width="2"/>`;
        break;
      case "es": {
        const s = 14;
        figura = `<polygon points="${x - w / 2 + s},${y} ${x + w / 2 + s},${y} ${x + w / 2 - s},${y + h} ${x - w / 2 - s},${y + h}" fill="#dff5e6" stroke="#1f7a3d" stroke-width="2"/>`;
        break;
      }
      case "decision":
        figura = `<polygon points="${x},${y} ${x + w / 2},${cy} ${x},${y + h} ${x - w / 2},${cy}" fill="#fff1c4" stroke="#b8860b" stroke-width="2"/>`;
        break;
    }
    const color = tipo === "inicio" || tipo === "fin" ? "#fff" : TEXTO;
    const t0 = cy - ((lineas.length - 1) * INTERLINEA) / 2 + 4;
    const texto = lineas
      .map((l, i) => `<text x="${cx}" y="${t0 + i * INTERLINEA}" text-anchor="middle" font-size="${FUENTE}" fill="${color}" font-family="Segoe UI, system-ui, sans-serif">${esc(l)}</text>`)
      .join("");
    this.partes.push(`<g class="forma" data-id="${id}">${figura}${texto}</g>`);
  }

  linea(pts: [number, number][], cabeza: boolean, etiqueta?: { t: string; x: number; y: number }): void {
    const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
    this.partes.push(`<path d="${d}" fill="none" stroke="#4a4470" stroke-width="1.8" ${cabeza ? 'marker-end="url(#punta)"' : ""}/>`);
    if (etiqueta) {
      this.partes.push(
        `<text x="${etiqueta.x}" y="${etiqueta.y}" font-size="12" font-weight="600" fill="#6b3d00" font-family="Segoe UI, system-ui, sans-serif">${esc(etiqueta.t)}</text>`,
      );
    }
  }

  punto(x: number, y: number): void {
    this.partes.push(`<circle cx="${x}" cy="${y}" r="3.5" fill="#4a4470"/>`);
  }

  masBoton(x: number, y: number, p: PuntoMas): void {
    const id = this.mas.push(p) - 1;
    this.partes.push(
      `<g class="mas" data-mas="${id}"><circle cx="${x + 18}" cy="${y}" r="8" fill="#fff" stroke="#9a94c7" stroke-width="1.4"/><path d="M${x + 14},${y} h8 M${x + 18},${y - 4} v8" stroke="#6a62a8" stroke-width="1.6"/></g>`,
    );
  }
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

interface Bloque {
  izq: number;
  der: number;
  h: number;
  dib(d: Dibujo, x: number, y: number): void;
}

function formaSimple(tipo: FormaTipo, texto: string, item: Item): Bloque {
  const m = medir(texto, tipo);
  const dx = tipo === "es" ? 14 : 0;
  return { izq: m.w / 2 + dx, der: m.w / 2 + dx, h: m.h, dib: (d, x, y) => d.forma(tipo, x, y, m, item) };
}

/** Secuencia vertical con flechas y botones «+» entre los elementos. */
function secuencia(lista: Lista, cabezaFinal: boolean, extras: Bloque[] = []): Bloque {
  const bloques = lista.map((n, i) => bloqueNodo(n, lista, i));
  const todos = [...bloques, ...extras];
  const n = todos.length;
  const h = GAP * (n + 1) + todos.reduce((a, b) => a + b.h, 0);
  return {
    izq: Math.max(0, ...todos.map((b) => b.izq)),
    der: Math.max(0, ...todos.map((b) => b.der)),
    h,
    dib(d, x, y) {
      let cur = y;
      for (let i = 0; i <= n; i++) {
        const ultima = i === n;
        d.linea([[x, cur], [x, cur + GAP]], !ultima || cabezaFinal);
        // el «+» inserta en la lista; el hueco tras un bloque extra (p. ej. el incremento del PARA) no
        if (i <= bloques.length) d.masBoton(x, cur + GAP / 2, { lista, idx: i });
        cur += GAP;
        if (!ultima) {
          todos[i].dib(d, x, cur);
          cur += todos[i].h;
        }
      }
    },
  };
}

function bloqueNodo(n: Nodo, lista: Lista, idx: number): Bloque {
  const item = (fase?: string): Item => ({ nodo: n.origen ?? n, fase, lista, idx });
  switch (n.t) {
    case "leer": return formaSimple("es", `Leer ${n.vars}`, item());
    case "escribir": return formaSimple("es", `Escribir ${n.expr}`, item());
    case "asignar": return formaSimple("proceso", `${n.variable} ← ${n.expr}`, item());
    case "si": return decision(n.cond, n.entonces, n.sino, item());
    case "mientras": return bucleMientras(n.cond, secuencia(n.cuerpo, false), item());
    case "repetir": return bucleRepetir(n.hasta, n.cuerpo, item());
    case "para": {
      const negativo = /^\s*-/.test(n.paso);
      const incr = formaSimple("proceso", `${n.variable} ← ${n.variable} + ${n.paso || "1"}`, item("incr"));
      const ini = formaSimple("proceso", `${n.variable} ← ${n.desde}`, item("ini"));
      const bucle = bucleMientras(`${n.variable} ${negativo ? "≥" : "≤"} ${n.hasta}`, secuencia(n.cuerpo, false, [incr]), item("cond"));
      return apilar([ini, bucle]);
    }
    case "segun": {
      // se dibuja como una cadena de decisiones; clicar cualquiera selecciona el SEGÚN real
      if (!n.casos.length) return formaSimple("proceso", `SEGÚN ${n.expr}`, item());
      const sint = (i: number): Si => ({
        t: "si",
        cond: `${n.expr} = ${n.casos[i].valor}`,
        entonces: n.casos[i].cuerpo,
        sino: i + 1 < n.casos.length ? [sint(i + 1)] : n.otro,
        origen: n,
      });
      const s0 = sint(0);
      return decision(s0.cond, s0.entonces, s0.sino, item());
    }
  }
}

function apilar(bs: Bloque[]): Bloque {
  return {
    izq: Math.max(...bs.map((b) => b.izq)),
    der: Math.max(...bs.map((b) => b.der)),
    h: bs.reduce((a, b) => a + b.h, 0) + GAP * (bs.length - 1),
    dib(d, x, y) {
      let cur = y;
      bs.forEach((b, i) => {
        b.dib(d, x, cur);
        cur += b.h;
        if (i < bs.length - 1) {
          d.linea([[x, cur], [x, cur + GAP]], true);
          cur += GAP;
        }
      });
    },
  };
}

function decision(cond: string, entonces: Lista, sino: Lista, item: Item): Bloque {
  const m = medir(cond, "decision");
  const A = secuencia(entonces, false);
  const B = secuencia(sino, false);
  const DL = Math.max(A.der + 26, m.w / 2 + 26);
  const DR = Math.max(B.izq + 26, m.w / 2 + 26);
  const hb = Math.max(A.h, B.h);
  return {
    izq: DL + A.izq,
    der: DR + B.der,
    h: m.h / 2 + hb,
    dib(d, x, y) {
      d.forma("decision", x, y, m, item);
      const cy = y + m.h / 2;
      const merge = cy + hb;
      d.linea([[x - m.w / 2, cy], [x - DL, cy]], false, { t: "Sí", x: x - m.w / 2 - 22, y: cy - 6 });
      d.linea([[x + m.w / 2, cy], [x + DR, cy]], false, { t: "No", x: x + m.w / 2 + 8, y: cy - 6 });
      A.dib(d, x - DL, cy);
      B.dib(d, x + DR, cy);
      d.linea(A.h < hb ? [[x - DL, cy + A.h], [x - DL, merge], [x, merge]] : [[x - DL, merge], [x, merge]], false);
      d.linea(B.h < hb ? [[x + DR, cy + B.h], [x + DR, merge], [x, merge]] : [[x + DR, merge], [x, merge]], false);
      d.punto(x, merge);
    },
  };
}

function bucleMientras(cond: string, cuerpo: Bloque, item: Item): Bloque {
  const m = medir(cond, "decision");
  const LI = Math.max(cuerpo.izq, m.w / 2) + 28;
  const LD = Math.max(cuerpo.der, m.w / 2) + 28;
  return {
    izq: LI,
    der: LD,
    h: m.h + cuerpo.h + 22,
    dib(d, x, y) {
      d.forma("decision", x, y, m, item);
      const cy = y + m.h / 2;
      const by = y + m.h + cuerpo.h;
      cuerpo.dib(d, x, y + m.h);
      d.partes.push(
        `<text x="${x - 24}" y="${y + m.h + 16}" font-size="12" font-weight="600" fill="#6b3d00" font-family="Segoe UI, system-ui, sans-serif">Sí</text>`,
      );
      // vuelta al principio del bucle
      d.linea([[x, by], [x - LI, by], [x - LI, cy], [x - m.w / 2, cy]], true);
      // salida por la derecha
      const fin = by + 22;
      d.linea([[x + m.w / 2, cy], [x + LD, cy], [x + LD, fin], [x, fin]], false, { t: "No", x: x + m.w / 2 + 8, y: cy - 6 });
      d.punto(x, fin);
    },
  };
}

function bucleRepetir(hasta: string, cuerpoLista: Lista, item: Item): Bloque {
  const m = medir(hasta, "decision");
  const cuerpo = secuencia(cuerpoLista, true);
  const LD = Math.max(cuerpo.der, m.w / 2) + 28;
  return {
    izq: Math.max(cuerpo.izq, m.w / 2),
    der: LD,
    h: cuerpo.h + m.h,
    dib(d, x, y) {
      d.punto(x, y);
      cuerpo.dib(d, x, y);
      const ty = y + cuerpo.h;
      d.forma("decision", x, ty, m, item);
      const cy = ty + m.h / 2;
      d.partes.push(
        `<text x="${x - 24}" y="${ty + m.h + 16}" font-size="12" font-weight="600" fill="#6b3d00" font-family="Segoe UI, system-ui, sans-serif">Sí</text>`,
      );
      d.linea([[x + m.w / 2, cy], [x + LD, cy], [x + LD, y], [x + 4, y]], true, { t: "No", x: x + m.w / 2 + 8, y: cy - 6 });
    },
  };
}

export interface Resultado {
  svg: string;
  ancho: number;
  alto: number;
  items: Item[];
  mas: PuntoMas[];
}

export function dibujar(raiz: Lista): Resultado {
  const inicio = formaSimple("inicio", "Inicio", { nodo: null });
  const fin = formaSimple("fin", "Fin", { nodo: null });
  const cuerpo = secuencia(raiz, true);
  const margen = 30;
  const izq = Math.max(inicio.izq, cuerpo.izq, fin.izq) + margen;
  const der = Math.max(inicio.der, cuerpo.der, fin.der) + margen;
  const alto = inicio.h + cuerpo.h + fin.h + margen * 2;
  const ancho = izq + der;
  const d = new Dibujo();
  const x = izq;
  inicio.dib(d, x, margen);
  cuerpo.dib(d, x, margen + inicio.h);
  fin.dib(d, x, margen + inicio.h + cuerpo.h);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ancho} ${alto}" width="${ancho}" height="${alto}">` +
    `<defs><marker id="punta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#4a4470"/></marker></defs>` +
    d.partes.join("") +
    `</svg>`;
  return { svg, ancho, alto, items: d.items, mas: d.mas };
}

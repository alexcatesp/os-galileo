// Corrector de ejercicios: ejecuta el algoritmo del alumno con cada dato de prueba y comprueba lo que
// escribe (números, textos) y la forma del algoritmo. No contiene soluciones, solo criterios.

import { ErrorEjecucion, Maquina, type Valor } from "./ejecutor";
import { hijos, recorrer, type Nodo, type Programa } from "./modelo";
import { normalizar } from "./parser";

export interface Prueba {
  /** valores que irán respondiendo a cada LEER, en orden */
  entrada: (number | string)[];
  /** números que deben aparecer en lo escrito, en este orden (pueden aparecer otros entre medias) */
  numeros?: number[];
  /** los números escritos son exactamente estos */
  exactos?: number[];
  /** el último número escrito es este */
  ultimo?: number;
  /** números que no deben aparecer */
  sinNumeros?: number[];
  /** textos que deben aparecer, en orden; «a|b» admite alternativas. Sin distinguir mayúsculas ni tildes */
  textos?: string[];
  /** textos que no deben aparecer */
  sinTextos?: string[];
  /** debe escribir algún mensaje con letras */
  hayTexto?: boolean;
  /** un texto debe aparecer exactamente n veces */
  repite?: [string, number];
  /** número mínimo de líneas escritas */
  lineasMin?: number;
  /** vale que sobren datos de entrada sin leer */
  sobran?: boolean;
}

export type TipoNodo = Nodo["t"];

export interface Estructura {
  usa?: TipoNodo[];
  noUsa?: TipoNodo[];
  /** todos los SI son simples (sin SI NO) y hay al menos uno */
  sinSino?: boolean;
  /** hay algún SI con SI NO */
  siConSino?: boolean;
  /** hay una decisión dentro de otra */
  anidado?: boolean;
  maxDecisiones?: number;
  /** número mínimo de instrucciones en total */
  minPasos?: number;
  maxEscribir?: number;
  /** el último paso del algoritmo principal es de este tipo */
  ultimoEs?: TipoNodo;
  /** mínimo de subprocesos y de llamadas */
  subprocesos?: number;
  llamadas?: number;
  /** máximo de instrucciones en el algoritmo principal */
  maxPrincipal?: number;
  /** cada subproceso tiene al menos n instrucciones */
  minPasosSub?: number;
  /** hay un SEGÚN y ninguno tiene más de n casos */
  maxCasos?: number;
  /** grupos de palabras de las acciones que deben ir en este orden; dentro de un grupo, cualquier orden */
  orden?: string[][];
}

export interface ResultadoPrueba {
  prueba: Prueba;
  ok: boolean;
  /** lo que escribió el algoritmo */
  salida: string;
  problemas: string[];
}

const TOLERANCIA = 0.005;
const MAX_DATOS = 500;
/** pasos que se permiten en una prueba (los ejercicios más pesados, como los números perfectos, necesitan cientos de miles) */
const LIMITE_PRUEBA = 3_000_000;

function plano(s: string): string {
  return normalizar(s).toLowerCase();
}

export function extraerNumeros(s: string): number[] {
  return (s.match(/(?<![\w.])-?\d+(?:[.,]\d+)?/g) ?? []).map((x) => parseFloat(x.replace(",", ".")));
}

const igual = (a: number, b: number) => Math.abs(a - b) <= TOLERANCIA;

function escapar(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** posición del primer texto (con alternativas «a|b») a partir de `desde`, como palabra completa */
function buscarTexto(salida: string, patron: string, desde: number): { ini: number; fin: number } | null {
  let mejor: { ini: number; fin: number } | null = null;
  for (const alt of patron.split("|")) {
    const t = plano(alt).trim();
    if (!t) continue;
    const re = new RegExp(`(?<![a-z0-9])${escapar(t)}(?![a-z0-9])`, "g");
    re.lastIndex = desde;
    const m = re.exec(salida);
    if (m && (!mejor || m.index < mejor.ini)) mejor = { ini: m.index, fin: m.index + m[0].length };
  }
  return mejor;
}

function contarTexto(salida: string, patron: string): number {
  let n = 0;
  let pos = 0;
  for (;;) {
    const m = buscarTexto(salida, patron, pos);
    if (!m) return n;
    n++;
    pos = m.fin;
  }
}

const lista = (xs: (string | number)[]) => xs.join(" · ");
const primero = (patron: string) => patron.split("|")[0].trim();

export function correr(programa: Programa, entrada: (number | string)[]): { salida: string; error?: string; sobran: number } {
  const m = new Maquina(programa, false, LIMITE_PRUEBA);
  let i = 0;
  try {
    let ev = m.siguiente();
    for (let pasos = 0; ev.tipo !== "fin" && pasos < MAX_DATOS * 1000; pasos++) {
      if (ev.tipo === "leer") {
        if (i >= entrada.length) {
          return { salida: m.salida.join("\n"), error: "El algoritmo pide más datos de los previstos en esta prueba", sobran: 0 };
        }
        ev = m.siguiente(entrada[i++] as Valor);
      } else ev = m.siguiente();
    }
  } catch (e) {
    return { salida: m.salida.join("\n"), error: e instanceof ErrorEjecucion ? e.message : String(e), sobran: entrada.length - i };
  }
  return { salida: m.salida.join("\n"), sobran: entrada.length - i };
}

export function juzgar(programa: Programa, p: Prueba): ResultadoPrueba {
  const r = correr(programa, p.entrada);
  const problemas: string[] = [];
  const texto = plano(r.salida);
  const nums = extraerNumeros(r.salida);
  if (r.error) problemas.push(r.error);
  else if (r.sobran > 0 && !p.sobran) problemas.push(`Sobran ${r.sobran} dato${r.sobran === 1 ? "" : "s"} de entrada: el algoritmo termina antes de leerlos`);

  if (!r.error) {
    if (p.exactos && (p.exactos.length !== nums.length || p.exactos.some((x, i) => !igual(x, nums[i])))) {
      problemas.push(`Debería escribir exactamente los números ${p.exactos.length ? lista(p.exactos) : "(ninguno)"}`);
    }
    if (p.numeros) {
      let pos = 0;
      for (const x of p.numeros) {
        const k = nums.findIndex((y, i) => i >= pos && igual(x, y));
        if (k < 0) {
          problemas.push(`Debería escribir ${lista(p.numeros)} (en ese orden); falta ${x}`);
          break;
        }
        pos = k + 1;
      }
    }
    if (p.ultimo !== undefined && (!nums.length || !igual(p.ultimo, nums[nums.length - 1]))) {
      problemas.push(`El último número que escribe debería ser ${p.ultimo}`);
    }
    for (const x of p.sinNumeros ?? []) {
      if (nums.some((y) => igual(x, y))) problemas.push(`No debería escribir el número ${x}`);
    }
    if (p.textos) {
      let pos = 0;
      for (const t of p.textos) {
        const m = buscarTexto(texto, t, pos);
        if (!m) {
          problemas.push(`Debería mostrar «${primero(t)}»${p.textos.length > 1 ? " (en este orden)" : ""}`);
          break;
        }
        pos = m.fin;
      }
    }
    for (const t of p.sinTextos ?? []) {
      if (buscarTexto(texto, t, 0)) problemas.push(`No debería mostrar «${primero(t)}» en este caso`);
    }
    if (p.hayTexto && !/[a-z]/.test(texto)) problemas.push("Debería mostrar un mensaje");
    if (p.repite) {
      const n = contarTexto(texto, p.repite[0]);
      if (n !== p.repite[1]) problemas.push(`«${primero(p.repite[0])}» debería aparecer ${p.repite[1]} ${p.repite[1] === 1 ? "vez" : "veces"} y aparece ${n}`);
    }
    if (p.lineasMin !== undefined && r.salida.split("\n").filter((l) => l.trim()).length < p.lineasMin) {
      problemas.push(`Debería escribir al menos ${p.lineasMin} líneas`);
    }
  }
  return { prueba: p, ok: problemas.length === 0, salida: r.salida, problemas };
}

// ---------- forma del algoritmo ----------
function todos(p: Programa): Nodo[] {
  const out: Nodo[] = [];
  recorrer(p, (n) => out.push(n));
  return out;
}

function contiene(n: Nodo, tipo: TipoNodo): boolean {
  return hijos(n).some((l) => l.some((h) => h.t === tipo || contiene(h, tipo)));
}

export function revisarEstructura(p: Programa, e: Estructura): string[] {
  const fallos: string[] = [];
  const nodos = todos(p);
  const tipos = new Set(nodos.map((n) => n.t));
  const nombre: Record<TipoNodo, string> = {
    leer: "LEER", escribir: "ESCRIBIR", asignar: "una asignación", si: "SI", mientras: "MIENTRAS", repetir: "REPETIR",
    para: "PARA", segun: "SEGÚN", accion: "una acción", llamar: "una llamada a un subproceso",
  };
  for (const t of e.usa ?? []) if (!tipos.has(t)) fallos.push(`Tu algoritmo debe usar ${nombre[t]}`);
  for (const t of e.noUsa ?? []) if (tipos.has(t)) fallos.push(`En este ejercicio no debes usar ${nombre[t]}`);
  const sis = nodos.filter((n) => n.t === "si");
  if (e.sinSino) {
    if (!sis.length) fallos.push("Usa una decisión SI (sin SI NO)");
    else if (sis.some((n) => n.t === "si" && n.sino.length)) fallos.push("Aquí la decisión debe ser simple: sin SI NO");
  }
  if (e.siConSino && !sis.some((n) => n.t === "si" && n.sino.length)) fallos.push("Usa una decisión doble: con SI NO");
  if (e.anidado && !sis.some((n) => contiene(n, "si"))) fallos.push("Necesitas decisiones anidadas (un SI dentro de otro)");
  if (e.maxDecisiones !== undefined && sis.length > e.maxDecisiones) fallos.push(`Resuélvelo con ${e.maxDecisiones === 1 ? "una sola decisión" : `como mucho ${e.maxDecisiones} decisiones`}`);
  if (e.minPasos !== undefined && nodos.length < e.minPasos) fallos.push(`Faltan pasos: como mínimo ${e.minPasos}`);
  if (e.maxEscribir !== undefined && nodos.filter((n) => n.t === "escribir").length > e.maxEscribir) {
    fallos.push(`Solo puede haber ${e.maxEscribir === 1 ? "una instrucción ESCRIBIR" : `${e.maxEscribir} instrucciones ESCRIBIR`}`);
  }
  if (e.ultimoEs && p.cuerpo[p.cuerpo.length - 1]?.t !== e.ultimoEs) fallos.push(`El último paso del algoritmo debe ser ${nombre[e.ultimoEs]}`);
  if (e.subprocesos !== undefined && p.subprocesos.length < e.subprocesos) fallos.push(`Crea ${e.subprocesos === 1 ? "un subproceso" : `${e.subprocesos} subprocesos`}`);
  if (e.llamadas !== undefined && nodos.filter((n) => n.t === "llamar").length < e.llamadas) fallos.push(`Llama a tus subprocesos (mínimo ${e.llamadas} llamadas)`);
  if (e.maxPrincipal !== undefined && p.cuerpo.length > e.maxPrincipal) fallos.push(`El algoritmo principal debe tener como mucho ${e.maxPrincipal} pasos`);
  if (e.minPasosSub !== undefined && p.subprocesos.some((s) => s.cuerpo.length < e.minPasosSub!)) fallos.push(`Cada subproceso necesita al menos ${e.minPasosSub} pasos`);
  if (e.maxCasos !== undefined) {
    const sg = nodos.filter((n) => n.t === "segun");
    if (!sg.length) fallos.push("Usa SEGÚN");
    else if (sg.some((n) => n.t === "segun" && n.casos.length > e.maxCasos!)) fallos.push(`Agrupa los valores: como mucho ${e.maxCasos} casos`);
  }
  if (e.orden) {
    const acciones: string[] = [];
    recorrer(p, (n) => {
      if (n.t === "accion") acciones.push(plano(n.texto));
    });
    const pos = (palabra: string) => acciones.findIndex((a) => palabra.split("|").some((w) => a.includes(plano(w).trim())));
    let limite = -1;
    for (const grupo of e.orden) {
      const idx = grupo.map(pos);
      if (idx.some((i) => i < 0)) {
        fallos.push(`Falta el paso «${grupo[idx.findIndex((i) => i < 0)].split("|")[0]}»`);
        break;
      }
      if (Math.min(...idx) <= limite) {
        fallos.push(`Revisa el orden: «${grupo[idx.indexOf(Math.min(...idx))].split("|")[0]}» no puede ir tan pronto`);
        break;
      }
      limite = Math.max(...idx);
    }
  }
  return fallos;
}

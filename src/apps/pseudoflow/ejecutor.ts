// Evaluador de expresiones (sin eval) y ejecución paso a paso del modelo.

import type { Lista, Nodo, Programa } from "./modelo";
import { normalizar } from "./parser";

export type Valor = number | string | boolean;

export class ErrorEjecucion extends Error {}

// ---------- expresiones ----------
type Tok = { k: "num" | "str" | "id" | "op" | "par"; v: string };

function tokenizar(src: string): Tok[] {
  const t: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/\d/.test(c) || (c === "." && /\d/.test(src[i + 1] ?? ""))) {
      let j = i;
      while (j < src.length && /[\d.]/.test(src[j])) j++;
      t.push({ k: "num", v: src.slice(i, j) });
      i = j;
    } else if (c === '"') {
      const j = src.indexOf('"', i + 1);
      if (j < 0) throw new ErrorEjecucion("Falta cerrar unas comillas");
      t.push({ k: "str", v: src.slice(i + 1, j) });
      i = j + 1;
    } else if (/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ_]/.test(c)) {
      let j = i;
      while (j < src.length && /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ_0-9]/.test(src[j])) j++;
      t.push({ k: "id", v: src.slice(i, j) });
      i = j;
    } else if ("()".includes(c)) {
      t.push({ k: "par", v: c });
      i++;
    } else {
      const dos = src.slice(i, i + 2);
      if (["<=", ">=", "<>", "!=", "&&", "||", "=="].includes(dos)) { t.push({ k: "op", v: dos }); i += 2; }
      else if ("+-*/%<>=!^,".includes(c)) { t.push({ k: "op", v: c }); i++; }
      else throw new ErrorEjecucion(`Carácter no válido en la expresión: «${c}»`);
    }
  }
  return t;
}

const FUNCIONES: Record<string, (a: Valor[]) => Valor> = {
  ABS: (a) => Math.abs(num(a[0])),
  RAIZ: (a) => {
    if (num(a[0]) < 0) throw new ErrorEjecucion("RAIZ de un número negativo");
    return Math.sqrt(num(a[0]));
  },
  ENTERO: (a) => Math.trunc(num(a[0])),
  REDONDEAR: (a) => Math.round(num(a[0])),
  AZAR: (a) => Math.floor(Math.random() * Math.max(1, num(a[0]))),
  LONGITUD: (a) => String(a[0]).length,
};

function num(v: Valor | undefined): number {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v))) return Number(v);
  throw new ErrorEjecucion(`«${v}» no es un número`);
}

export type Entorno = Map<string, Valor>;

export function evaluar(src: string, vars: Entorno): Valor {
  const t = tokenizar(src);
  let p = 0;
  const ver = () => t[p];
  const esOp = (...ops: string[]) => ver()?.k === "op" && ops.includes(ver().v);
  const esPal = (...ps: string[]) => ver()?.k === "id" && ps.includes(normalizar(ver().v));

  const o = (): Valor => {
    let a = y();
    while (esPal("O") || esOp("||")) { p++; const b = y(); a = Boolean(a) || Boolean(b); }
    return a;
  };
  const y = (): Valor => {
    let a = no();
    while (esPal("Y") || esOp("&&")) { p++; const b = no(); a = Boolean(a) && Boolean(b); }
    return a;
  };
  const no = (): Valor => {
    if (esPal("NO") || esOp("!")) { p++; return !no(); }
    return cmp();
  };
  const cmp = (): Valor => {
    const a = suma();
    if (esOp("=", "==", "<>", "!=", "<", ">", "<=", ">=")) {
      const op = t[p++].v;
      const b = suma();
      const ambosNum = (typeof a === "number" || (typeof a === "string" && a.trim() !== "" && !isNaN(Number(a)))) &&
        (typeof b === "number" || (typeof b === "string" && b.trim() !== "" && !isNaN(Number(b))));
      const x = ambosNum ? Number(a) : a, z = ambosNum ? Number(b) : b;
      if (["<", ">", "<=", ">="].includes(op) && (typeof x !== typeof z || typeof x === "boolean")) {
        throw new ErrorEjecucion(`No se puede comparar ${typeof x === "string" ? "un texto" : "un número"} con ${typeof z === "string" ? "un texto" : "un número"} usando «${op}»`);
      }
      switch (op) {
        case "=": case "==": return x === z;
        case "<>": case "!=": return x !== z;
        case "<": return x < z;
        case ">": return x > z;
        case "<=": return x <= z;
        default: return x >= z;
      }
    }
    return a;
  };
  const suma = (): Valor => {
    let a = prod();
    while (esOp("+", "-")) {
      const op = t[p++].v;
      const b = prod();
      if (op === "+" && (typeof a === "string" || typeof b === "string")) a = String(a) + String(b);
      else a = op === "+" ? num(a) + num(b) : num(a) - num(b);
    }
    return a;
  };
  const prod = (): Valor => {
    let a = unario();
    while (esOp("*", "/", "%") || esPal("MOD", "DIV")) {
      const op = normalizar(t[p++].v);
      const b = unario();
      const d = num(b);
      if ((op === "/" || op === "%" || op === "MOD" || op === "DIV") && d === 0) throw new ErrorEjecucion("División entre cero");
      if (op === "*") a = num(a) * d;
      else if (op === "/") a = num(a) / d;
      else if (op === "DIV") a = Math.trunc(num(a) / d);
      else a = num(a) % d;
    }
    return a;
  };
  const unario = (): Valor => {
    if (esOp("-")) { p++; return -num(unario()); }
    if (esOp("+")) { p++; return num(unario()); }
    return potencia();
  };
  const potencia = (): Valor => {
    const a = atomo();
    if (esOp("^")) { p++; return Math.pow(num(a), num(unario())); }
    return a;
  };
  const atomo = (): Valor => {
    const x = t[p++];
    if (!x) throw new ErrorEjecucion("La expresión está incompleta");
    if (x.k === "num") return Number(x.v);
    if (x.k === "str") return x.v;
    if (x.k === "par" && x.v === "(") {
      const v = o();
      if (t[p]?.v !== ")") throw new ErrorEjecucion("Falta cerrar un paréntesis");
      p++;
      return v;
    }
    if (x.k === "id") {
      const n = normalizar(x.v);
      if (n === "VERDADERO") return true;
      if (n === "FALSO") return false;
      if (t[p]?.v === "(" && FUNCIONES[n]) {
        p++;
        const args: Valor[] = [];
        if (t[p]?.v !== ")") {
          args.push(o());
          while (esOp(",")) { p++; args.push(o()); }
        }
        if (t[p]?.v !== ")") throw new ErrorEjecucion("Falta cerrar un paréntesis");
        p++;
        return FUNCIONES[n](args);
      }
      if (!vars.has(x.v)) throw new ErrorEjecucion(`La variable «${x.v}» no tiene valor todavía`);
      return vars.get(x.v)!;
    }
    throw new ErrorEjecucion(`No esperaba «${x.v}» en la expresión`);
  };

  if (!t.length) throw new ErrorEjecucion("Falta una expresión");
  const r = o();
  if (p < t.length) throw new ErrorEjecucion(`No esperaba «${t[p].v}» en la expresión`);
  return r;
}

/** Separa por comas que no estén dentro de comillas ni de paréntesis */
export function separarComas(s: string): string[] {
  const partes: string[] = [];
  let nivel = 0, comillas = false, ini = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '"') comillas = !comillas;
    else if (!comillas) {
      if (c === "(") nivel++;
      else if (c === ")") nivel--;
      else if (c === "," && nivel === 0) { partes.push(s.slice(ini, i).trim()); ini = i + 1; }
    }
  }
  partes.push(s.slice(ini).trim());
  return partes.filter((p) => p !== "");
}

export function formatear(v: Valor): string {
  if (typeof v === "boolean") return v ? "VERDADERO" : "FALSO";
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : String(Number(v.toPrecision(12)));
  return v;
}

// ---------- ejecución ----------
export type Evento =
  | { tipo: "paso"; nodo: Nodo; fase?: "ini" | "cond" | "incr" }
  | { tipo: "leer"; nombre: string; nodo: Nodo }
  | { tipo: "fin" };

const LIMITE = 20000;

export class Maquina {
  vars: Entorno = new Map();
  salida: string[] = [];
  /** variable que acaba de cambiar (para resaltarla) */
  cambiada: string | null = null;
  pasos = 0;
  private gen: Generator<Evento, void, Valor | undefined>;
  esperando: string | null = null;

  constructor(programa: Programa) {
    this.gen = this.correr(programa.cuerpo);
  }

  /** Avanza hasta el siguiente evento. Si el anterior fue una lectura, hay que pasar el valor. */
  siguiente(entrada?: Valor): Evento {
    const r = this.gen.next(entrada);
    this.esperando = null;
    if (r.done) return { tipo: "fin" };
    if (r.value.tipo === "leer") this.esperando = r.value.nombre;
    return r.value;
  }

  private asignar(nombre: string, v: Valor): void {
    this.vars.set(nombre, v);
    this.cambiada = nombre;
  }

  private *correr(l: Lista): Generator<Evento, void, Valor | undefined> {
    for (const n of l) yield* this.nodo(n);
  }

  private tic(): void {
    if (++this.pasos > LIMITE) throw new ErrorEjecucion(`Se superaron ${LIMITE} pasos: ¿hay un bucle infinito?`);
  }

  private *nodo(n: Nodo): Generator<Evento, void, Valor | undefined> {
    this.tic();
    this.cambiada = null;
    switch (n.t) {
      case "leer": {
        for (const nombre of separarComas(n.vars)) {
          const bruto = yield { tipo: "leer", nombre, nodo: n };
          const s = String(bruto ?? "").trim();
          this.asignar(nombre, s !== "" && !isNaN(Number(s)) ? Number(s) : s);
        }
        return;
      }
      case "escribir": {
        yield { tipo: "paso", nodo: n };
        this.salida.push(separarComas(n.expr).map((e) => formatear(evaluar(e, this.vars))).join(""));
        return;
      }
      case "asignar": {
        yield { tipo: "paso", nodo: n };
        this.asignar(n.variable, evaluar(n.expr, this.vars));
        return;
      }
      case "si": {
        yield { tipo: "paso", nodo: n };
        yield* this.correr(evaluar(n.cond, this.vars) ? n.entonces : n.sino);
        return;
      }
      case "mientras": {
        for (;;) {
          this.tic();
          yield { tipo: "paso", nodo: n };
          if (!evaluar(n.cond, this.vars)) return;
          yield* this.correr(n.cuerpo);
        }
      }
      case "repetir": {
        do {
          this.tic();
          yield* this.correr(n.cuerpo);
          yield { tipo: "paso", nodo: n };
        } while (!evaluar(n.hasta, this.vars));
        return;
      }
      case "para": {
        yield { tipo: "paso", nodo: n, fase: "ini" };
        this.asignar(n.variable, evaluar(n.desde, this.vars));
        for (;;) {
          this.tic();
          yield { tipo: "paso", nodo: n, fase: "cond" };
          const paso = n.paso ? num(evaluar(n.paso, this.vars)) : 1;
          if (paso === 0) throw new ErrorEjecucion("El paso del PARA no puede ser 0");
          const v = num(this.vars.get(n.variable));
          const limite = num(evaluar(n.hasta, this.vars));
          if (paso > 0 ? v > limite : v < limite) return;
          yield* this.correr(n.cuerpo);
          yield { tipo: "paso", nodo: n, fase: "incr" };
          this.asignar(n.variable, num(this.vars.get(n.variable)) + paso);
        }
      }
      case "segun": {
        yield { tipo: "paso", nodo: n };
        const v = evaluar(n.expr, this.vars);
        const caso = n.casos.find((c) => {
          const w = evaluar(c.valor, this.vars);
          return w === v || (typeof w !== "boolean" && typeof v !== "boolean" && String(w) === String(v));
        });
        yield* this.correr(caso ? caso.cuerpo : n.otro);
      }
    }
  }
}

/** ¿Es una condición bien formada? (para avisar al editar antes de ejecutar) */
export function condicionValida(src: string): boolean {
  try {
    tokenizar(src);
    return src.trim() !== "";
  } catch {
    return false;
  }
}

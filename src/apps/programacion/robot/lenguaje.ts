// Lenguaje del «Robot Galileo»: un subconjunto de Java (órdenes, for, while, do..while, if/else, int).
// Un único modelo (`Sent[]`) con dos vistas: los bloques lo editan y `aTexto` lo muestra como Java;
// el texto de Java se convierte de vuelta con `compilar`. Los mensajes de error imitan los de Eclipse.

import { ACCIONES, SENSORES } from "./mundo";

export type Tipo = "int" | "boolean";
export type Expr =
  | { k: "num"; v: number }
  | { k: "var"; n: string }
  | { k: "sensor"; n: string }
  | { k: "bin"; op: string; a: Expr; b: Expr }
  | { k: "no"; e: Expr };

export type Sent =
  | { t: "accion"; n: string; l: number }
  | { t: "decl"; n: string; e: Expr; l: number }
  | { t: "asig"; n: string; op: "=" | "+=" | "-="; e: Expr; l: number }
  | { t: "for"; ini: Sent | null; cond: Expr | null; upd: Sent | null; cuerpo: Sent[]; l: number }
  | { t: "while"; cond: Expr; cuerpo: Sent[]; l: number }
  | { t: "dowhile"; cond: Expr; cuerpo: Sent[]; l: number; lCond: number }
  | { t: "if"; cond: Expr; cuerpo: Sent[]; sino: Sent[] | null; l: number; lSino: number }
  | { t: "vacio"; l: number };

export interface ErrorJava {
  momento: "compilación" | "ejecución";
  linea?: number;
  mensaje: string;
}

// ---------------------------------------------------------------- texto de una expresión
const PREC: Record<string, number> = { "||": 1, "&&": 2, "==": 3, "!=": 3, "<": 4, ">": 4, "<=": 4, ">=": 4, "+": 5, "-": 5, "*": 6, "/": 6, "%": 6 };

export function exprATexto(e: Expr, prec = 0): string {
  switch (e.k) {
    case "num":
      return String(e.v);
    case "var":
      return e.n;
    case "sensor":
      return `${e.n}()`;
    case "no":
      return `!${exprATexto(e.e, 9)}`;
    case "bin": {
      const p = PREC[e.op];
      const t = `${exprATexto(e.a, p)} ${e.op} ${exprATexto(e.b, p + 1)}`;
      return p < prec ? `(${t})` : t;
    }
  }
}

export function aTexto(prog: Sent[]): string {
  const sal: string[] = [];
  const corto = (s: Sent): string => {
    if (s.t === "decl") return `int ${s.n} = ${exprATexto(s.e)}`;
    if (s.t === "asig") {
      if (s.op !== "=" && s.e.k === "num" && s.e.v === 1) return `${s.n}${s.op === "+=" ? "++" : "--"}`;
      return `${s.n} ${s.op} ${exprATexto(s.e)}`;
    }
    return "";
  };
  const blq = (cuerpo: Sent[], sang: string) => {
    for (const s of cuerpo) emitir(s, sang + "  ");
  };
  function emitir(s: Sent, sang: string): void {
    switch (s.t) {
      case "accion":
        sal.push(`${sang}${s.n}();`);
        break;
      case "decl":
      case "asig":
        sal.push(`${sang}${corto(s)};`);
        break;
      case "vacio":
        sal.push(`${sang};`);
        break;
      case "for":
        sal.push(`${sang}for (${s.ini ? corto(s.ini) : ""}; ${s.cond ? exprATexto(s.cond) : ""}; ${s.upd ? corto(s.upd) : ""}) {`);
        blq(s.cuerpo, sang);
        sal.push(`${sang}}`);
        break;
      case "while":
        sal.push(`${sang}while (${exprATexto(s.cond)}) {`);
        blq(s.cuerpo, sang);
        sal.push(`${sang}}`);
        break;
      case "dowhile":
        sal.push(`${sang}do {`);
        blq(s.cuerpo, sang);
        sal.push(`${sang}} while (${exprATexto(s.cond)});`);
        break;
      case "if":
        sal.push(`${sang}if (${exprATexto(s.cond)}) {`);
        blq(s.cuerpo, sang);
        if (s.sino) {
          sal.push(`${sang}} else {`);
          blq(s.sino, sang);
        }
        sal.push(`${sang}}`);
        break;
    }
  }
  for (const s of prog) emitir(s, "");
  return sal.join("\n");
}

// ---------------------------------------------------------------- analizador léxico
interface Tok {
  t: "id" | "num" | "sim" | "fin";
  v: string;
  l: number;
}

class ErrorSintaxis extends Error {
  constructor(
    public linea: number,
    mensaje: string,
  ) {
    super(mensaje);
  }
}

function tokens(src: string): Tok[] {
  const sal: Tok[] = [];
  let i = 0;
  let l = 1;
  while (i < src.length) {
    const c = src[i];
    if (c === "\n") {
      l++;
      i++;
    } else if (/\s/.test(c)) i++;
    else if (c === "/" && src[i + 1] === "/") while (i < src.length && src[i] !== "\n") i++;
    else if (c === "/" && src[i + 1] === "*") {
      const fin = src.indexOf("*/", i + 2);
      if (fin < 0) throw new ErrorSintaxis(l, "Syntax error, unterminated comment");
      l += (src.slice(i, fin).match(/\n/g) ?? []).length;
      i = fin + 2;
    } else if (/[A-Za-zÁÉÍÓÚáéíóúñÑ_]/.test(c)) {
      const m = /^[A-Za-zÁÉÍÓÚáéíóúñÑ_0-9]+/.exec(src.slice(i))!;
      sal.push({ t: "id", v: m[0], l });
      i += m[0].length;
    } else if (/[0-9]/.test(c)) {
      const m = /^[0-9]+/.exec(src.slice(i))!;
      sal.push({ t: "num", v: m[0], l });
      i += m[0].length;
    } else {
      const dos = src.slice(i, i + 2);
      if (["++", "--", "+=", "-=", "==", "!=", "<=", ">=", "&&", "||"].includes(dos)) {
        sal.push({ t: "sim", v: dos, l });
        i += 2;
      } else if ("(){};,<>=!+-*/%".includes(c)) {
        sal.push({ t: "sim", v: c, l });
        i++;
      } else throw new ErrorSintaxis(l, `Syntax error on token "${c}", delete this token`);
    }
  }
  sal.push({ t: "fin", v: "", l });
  return sal;
}

// ---------------------------------------------------------------- analizador sintáctico
const RESERVADAS = new Set(["for", "while", "do", "if", "else", "int", "true", "false", "return", "break", "continue"]);
const ASIGNACIONES = ["=", "+=", "-=", "++", "--"];

function analizar(src: string): Sent[] {
  const tk = tokens(src);
  let p = 0;
  const ambitos: Set<string>[] = [new Set()];
  const lineaFin = tk[tk.length - 1].l;
  const act = () => tk[p];
  const es = (v: string) => act().t === "sim" && act().v === v;
  const lineaPrev = () => (p > 0 ? tk[p - 1].l : 1);

  function esperar(v: string): Tok {
    if (es(v)) return tk[p++];
    const a = act();
    if (a.t === "fin") {
      if (v === "}") throw new ErrorSintaxis(lineaFin, 'Syntax error, insert "}" to complete Block');
      throw new ErrorSintaxis(lineaPrev(), v === ";" ? 'Syntax error, insert ";" to complete Statement' : `Syntax error, insert "${v}" to complete Statement`);
    }
    if (v === ";") throw new ErrorSintaxis(lineaPrev(), 'Syntax error, insert ";" to complete Statement');
    if (v === ")") throw new ErrorSintaxis(a.l, 'Syntax error, insert ")" to complete Expression');
    throw new ErrorSintaxis(a.l, `Syntax error on token "${a.v}", ${v} expected`);
  }

  const declarada = (n: string) => ambitos.some((a) => a.has(n));

  function tipoDe(e: Expr, l: number): Tipo {
    switch (e.k) {
      case "num":
      case "var":
        return "int";
      case "sensor":
        return "boolean";
      case "no":
        if (tipoDe(e.e, l) !== "boolean") throw new ErrorSintaxis(l, "The operator ! is undefined for the argument type(s) int");
        return "boolean";
      case "bin": {
        const a = tipoDe(e.a, l);
        const b = tipoDe(e.b, l);
        const mal = () => new ErrorSintaxis(l, `The operator ${e.op} is undefined for the argument type(s) ${a}, ${b}`);
        if (["+", "-", "*", "/", "%"].includes(e.op)) {
          if (a !== "int" || b !== "int") throw mal();
          return "int";
        }
        if (["<", ">", "<=", ">="].includes(e.op)) {
          if (a !== "int" || b !== "int") throw mal();
          return "boolean";
        }
        if (e.op === "==" || e.op === "!=") {
          if (a !== b) throw new ErrorSintaxis(l, `Incompatible operand types ${a} and ${b}`);
          return "boolean";
        }
        if (a !== "boolean" || b !== "boolean") throw mal();
        return "boolean";
      }
    }
  }
  const exigir = (e: Expr, tipo: Tipo, l: number) => {
    const t = tipoDe(e, l);
    if (t !== tipo) throw new ErrorSintaxis(l, `Type mismatch: cannot convert from ${t} to ${tipo}`);
  };

  // expresiones, de menor a mayor precedencia
  function expr(min = 1): Expr {
    let izq = unaria();
    for (;;) {
      const op = act().t === "sim" ? act().v : "";
      const pr = PREC[op];
      if (!pr || pr < min) return izq;
      p++;
      const der = expr(pr + 1);
      izq = { k: "bin", op, a: izq, b: der };
    }
  }
  function unaria(): Expr {
    const a = act();
    if (es("!")) {
      p++;
      return { k: "no", e: unaria() };
    }
    if (es("-")) {
      p++;
      const e = unaria();
      if (e.k === "num") return { k: "num", v: -e.v };
      return { k: "bin", op: "-", a: { k: "num", v: 0 }, b: e };
    }
    if (es("(")) {
      p++;
      const e = expr();
      esperar(")");
      return e;
    }
    if (a.t === "num") {
      p++;
      return { k: "num", v: Number(a.v) };
    }
    if (a.t === "id") {
      if (a.v === "true" || a.v === "false") throw new ErrorSintaxis(a.l, "En este mundo no hay true/false: usa un sensor, como hayPared()");
      p++;
      if (es("(")) {
        p++;
        if (!SENSORES[a.v]) throw new ErrorSintaxis(a.l, `The method ${a.v}() is undefined for the type Robot`);
        esperar(")");
        return { k: "sensor", n: a.v };
      }
      if (RESERVADAS.has(a.v)) throw new ErrorSintaxis(a.l, `Syntax error on token "${a.v}", invalid Expression`);
      if (!declarada(a.v)) throw new ErrorSintaxis(a.l, `${a.v} cannot be resolved to a variable`);
      return { k: "var", n: a.v };
    }
    if (a.t === "fin") throw new ErrorSintaxis(lineaPrev(), "Syntax error, insert an expression to complete it");
    throw new ErrorSintaxis(a.l, `Syntax error on token "${a.v}", invalid Expression`);
  }

  /** declaración o asignación sin el `;` final (sirve también para el `for`) */
  function simple(): Sent {
    const a = act();
    const l = a.l;
    if (a.t === "id" && a.v === "int") {
      p++;
      const nom = act();
      if (nom.t !== "id" || RESERVADAS.has(nom.v)) throw new ErrorSintaxis(nom.l, `Syntax error on token "${nom.v}", invalid VariableDeclaratorId`);
      p++;
      if (declarada(nom.v)) throw new ErrorSintaxis(l, `Duplicate local variable ${nom.v}`);
      esperar("=");
      const e = expr();
      exigir(e, "int", l);
      ambitos[ambitos.length - 1].add(nom.v);
      return { t: "decl", n: nom.v, e, l };
    }
    if (a.t === "id") {
      const sig = tk[p + 1];
      if (sig.t === "sim" && ASIGNACIONES.includes(sig.v)) {
        if (!declarada(a.v)) throw new ErrorSintaxis(l, `${a.v} cannot be resolved to a variable`);
        p += 2;
        if (sig.v === "++" || sig.v === "--") return { t: "asig", n: a.v, op: sig.v === "++" ? "+=" : "-=", e: { k: "num", v: 1 }, l };
        const e = expr();
        exigir(e, "int", l);
        return { t: "asig", n: a.v, op: sig.v as "=" | "+=" | "-=", e, l };
      }
    }
    throw new ErrorSintaxis(a.t === "fin" ? lineaPrev() : l, a.t === "fin" ? "Syntax error, insert a statement to complete it" : `Syntax error on token "${a.v}", invalid Statement`);
  }

  function bloqueOSent(): Sent[] {
    if (es("{")) {
      p++;
      ambitos.push(new Set());
      const cuerpo: Sent[] = [];
      while (!es("}")) {
        if (act().t === "fin") throw new ErrorSintaxis(lineaFin, 'Syntax error, insert "}" to complete Block');
        cuerpo.push(sentencia());
      }
      p++;
      ambitos.pop();
      return cuerpo;
    }
    ambitos.push(new Set());
    const s = sentencia();
    ambitos.pop();
    return [s];
  }

  function condicion(): Expr {
    const l = act().l;
    esperar("(");
    const c = expr();
    esperar(")");
    exigir(c, "boolean", l);
    return c;
  }

  function sentencia(): Sent {
    const a = act();
    const l = a.l;
    if (es(";")) {
      p++;
      return { t: "vacio", l };
    }
    if (a.t === "id" && a.v === "for") {
      p++;
      esperar("(");
      ambitos.push(new Set());
      const ini = es(";") ? null : simple();
      esperar(";");
      let cond: Expr | null = null;
      if (!es(";")) {
        cond = expr();
        exigir(cond, "boolean", l);
      }
      esperar(";");
      const upd = es(")") ? null : simple();
      esperar(")");
      const cuerpo = bloqueOSent();
      ambitos.pop();
      return { t: "for", ini, cond, upd, cuerpo, l };
    }
    if (a.t === "id" && a.v === "while") {
      p++;
      const cond = condicion();
      return { t: "while", cond, cuerpo: bloqueOSent(), l };
    }
    if (a.t === "id" && a.v === "do") {
      p++;
      const cuerpo = bloqueOSent();
      const w = act();
      if (!(w.t === "id" && w.v === "while")) throw new ErrorSintaxis(w.t === "fin" ? lineaPrev() : w.l, 'Syntax error, insert "while ( Expression ) ;" to complete DoStatement');
      p++;
      const cond = condicion();
      esperar(";");
      return { t: "dowhile", cond, cuerpo, l, lCond: w.l };
    }
    if (a.t === "id" && a.v === "if") {
      p++;
      const cond = condicion();
      const cuerpo = bloqueOSent();
      let sino: Sent[] | null = null;
      let lSino = l;
      if (act().t === "id" && act().v === "else") {
        lSino = act().l;
        p++;
        sino = bloqueOSent();
      }
      return { t: "if", cond, cuerpo, sino, l, lSino };
    }
    if (a.t === "id" && a.v === "else") throw new ErrorSintaxis(l, 'Syntax error on token "else", delete this token');
    if (a.t === "id" && tk[p + 1].t === "sim" && tk[p + 1].v === "(") {
      if (!ACCIONES[a.v]) throw new ErrorSintaxis(l, `The method ${a.v}() is undefined for the type Robot`);
      p += 2;
      if (!es(")")) {
        const arg = act();
        throw new ErrorSintaxis(l, `The method ${a.v}() in the type Robot is not applicable for the arguments (${arg.t === "num" ? "int" : "…"})`);
      }
      p++;
      esperar(";");
      return { t: "accion", n: a.v, l };
    }
    if (a.t === "id" && (a.v === "int" || (tk[p + 1].t === "sim" && ASIGNACIONES.includes(tk[p + 1].v)))) {
      const s = simple();
      esperar(";");
      return s;
    }
    if (a.t === "id" && !RESERVADAS.has(a.v)) {
      if (SENSORES[a.v] || ACCIONES[a.v]) throw new ErrorSintaxis(l, `Syntax error, insert "()" to complete ${a.v}`);
      throw new ErrorSintaxis(l, `${a.v} cannot be resolved to a variable`);
    }
    if (a.t === "sim" && a.v === "}") throw new ErrorSintaxis(l, 'Syntax error on token "}", delete this token');
    throw new ErrorSintaxis(l, `Syntax error on token "${a.v}", invalid Statement`);
  }

  const prog: Sent[] = [];
  while (act().t !== "fin") prog.push(sentencia());
  return prog;
}

export function compilar(src: string): { prog: Sent[] } | { error: ErrorJava } {
  try {
    return { prog: analizar(src) };
  } catch (e) {
    if (e instanceof ErrorSintaxis) return { error: { momento: "compilación", linea: e.linea, mensaje: e.message } };
    throw e;
  }
}

// ---------------------------------------------------------------- utilidades sobre el modelo
/** Número de instrucciones (las llaves y el `else` no cuentan). */
export function contar(prog: Sent[]): number {
  let n = 0;
  for (const s of prog) {
    if (s.t === "vacio") continue;
    n++;
    if (s.t === "for" || s.t === "while" || s.t === "dowhile") n += contar(s.cuerpo);
    else if (s.t === "if") n += contar(s.cuerpo) + (s.sino ? contar(s.sino) : 0);
  }
  return n;
}

/** Si el `for` es el típico `for (int i = 0; i < N; i++)`, devuelve N. */
export function comoRepetir(s: Sent): number | null {
  if (s.t !== "for" || !s.ini || s.ini.t !== "decl" || !s.cond || !s.upd || s.upd.t !== "asig") return null;
  const v = s.ini.n;
  if (s.ini.e.k !== "num" || s.ini.e.v !== 0) return null;
  if (s.cond.k !== "bin" || s.cond.op !== "<" || s.cond.a.k !== "var" || s.cond.a.n !== v || s.cond.b.k !== "num") return null;
  if (s.upd.n !== v || s.upd.op !== "+=" || s.upd.e.k !== "num" || s.upd.e.v !== 1) return null;
  return s.cond.b.v;
}

/** Condición que los bloques saben mostrar: un sensor, con `!` o sin él. */
export function condSimple(e: Expr): { sensor: string; negado: boolean } | null {
  if (e.k === "sensor") return { sensor: e.n, negado: false };
  if (e.k === "no" && e.e.k === "sensor") return { sensor: e.e.n, negado: true };
  return null;
}

/** ¿Pueden los bloques representar este programa tal cual? */
export function sePuedeEnBloques(prog: Sent[]): boolean {
  return prog.every((s) => {
    if (s.t === "accion") return true;
    if (s.t === "for") return comoRepetir(s) !== null && sePuedeEnBloques(s.cuerpo);
    if (s.t === "while" || s.t === "dowhile") return condSimple(s.cond) !== null && sePuedeEnBloques(s.cuerpo);
    if (s.t === "if") return condSimple(s.cond) !== null && !s.sino && sePuedeEnBloques(s.cuerpo);
    return false;
  });
}

const VARS_BUCLE = ["i", "j", "k", "m", "n"];
/** Un `for` de bloques con N repeticiones, con el nombre de variable que toca por profundidad. */
export function repetir(n: number, cuerpo: Sent[], prof = 0): Sent {
  const v = VARS_BUCLE[Math.min(prof, VARS_BUCLE.length - 1)];
  return {
    t: "for",
    ini: { t: "decl", n: v, e: { k: "num", v: 0 }, l: 0 },
    cond: { k: "bin", op: "<", a: { k: "var", n: v }, b: { k: "num", v: n } },
    upd: { t: "asig", n: v, op: "+=", e: { k: "num", v: 1 }, l: 0 },
    cuerpo,
    l: 0,
  };
}

/** Renombra las variables de los `for` de bloques según su profundidad (i, j, k…). */
export function normalizarBloques(prog: Sent[], prof = 0): Sent[] {
  return prog.map((s) => {
    if (s.t === "for") {
      const n = comoRepetir(s);
      if (n !== null) return repetir(n, normalizarBloques(s.cuerpo, prof + 1), prof);
    }
    if (s.t === "while" || s.t === "dowhile") return { ...s, cuerpo: normalizarBloques(s.cuerpo, prof) };
    if (s.t === "if") return { ...s, cuerpo: normalizarBloques(s.cuerpo, prof) };
    return s;
  });
}

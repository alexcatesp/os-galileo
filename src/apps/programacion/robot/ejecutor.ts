// Intérprete del «Robot Galileo». Ejecuta el programa entero de golpe y devuelve la traza (un paso por
// orden, comprobación de condición o asignación) para que la pantalla pueda reproducirla despacio.

import { exprATexto, type Expr, type ErrorJava, type Sent } from "./lenguaje";
import { ACCIONES, SENSORES, Fallo, copiar, type Estado, type Mundo } from "./mundo";

export interface Paso {
  /** línea del código Java (1…) que se está ejecutando */
  linea: number;
  /** qué ha pasado, en una frase */
  nota: string;
  estado: Estado;
  vars: { n: string; v: number }[];
  /** "accion" mueve al robot; "cond" evalúa una condición; "var" cambia una variable */
  tipo: "accion" | "cond" | "var" | "fallo";
  /** solo en "cond": resultado de la condición */
  si?: boolean;
  /** solo en "cond": veces que se ha repetido ya el bucle */
  vuelta?: number;
}

export interface Ejecucion {
  pasos: Paso[];
  error?: ErrorJava;
  final: Estado;
  /** el programa se cortó por parecer un bucle infinito */
  infinito: boolean;
}

export const MAX_PASOS = 4000;

class Corte extends Error {}

export function ejecutar(prog: Sent[], mundo: Mundo, maxPasos = MAX_PASOS): Ejecucion {
  const e = copiar(mundo.inicial);
  const pasos: Paso[] = [];
  const marcos: Map<string, number>[] = [new Map()];
  let infinito = false;
  let error: ErrorJava | undefined;

  const buscar = (n: string): Map<string, number> => marcos.slice().reverse().find((m) => m.has(n))!;
  const vars = () => {
    const sal: { n: string; v: number }[] = [];
    for (const m of marcos) for (const [n, v] of m) sal.push({ n, v });
    return sal;
  };
  const poner = (linea: number, tipo: Paso["tipo"], nota: string, extra: Partial<Paso> = {}) => {
    if (pasos.length >= maxPasos) throw new Corte();
    pasos.push({ linea, tipo, nota, estado: copiar(e), vars: vars(), ...extra });
  };

  function valor(x: Expr): number | boolean {
    switch (x.k) {
      case "num":
        return x.v;
      case "var":
        return buscar(x.n).get(x.n)!;
      case "sensor":
        return SENSORES[x.n].leer(mundo, e);
      case "no":
        return !valor(x.e);
      case "bin": {
        if (x.op === "&&") return !!valor(x.a) && !!valor(x.b);
        if (x.op === "||") return !!valor(x.a) || !!valor(x.b);
        const a = valor(x.a) as number;
        const b = valor(x.b) as number;
        switch (x.op) {
          case "+": return a + b;
          case "-": return a - b;
          case "*": return a * b;
          case "/":
            if (b === 0) throw new Fallo("Exception in thread \"main\" java.lang.ArithmeticException: / by zero");
            return Math.trunc(a / b);
          case "%":
            if (b === 0) throw new Fallo("Exception in thread \"main\" java.lang.ArithmeticException: / by zero");
            return a % b;
          case "<": return a < b;
          case ">": return a > b;
          case "<=": return a <= b;
          case ">=": return a >= b;
          case "==": return a === b;
          default: return a !== b;
        }
      }
    }
  }

  const usadas = (x: Expr, sal = new Set<string>()): Set<string> => {
    if (x.k === "var") sal.add(x.n);
    else if (x.k === "bin") {
      usadas(x.a, sal);
      usadas(x.b, sal);
    } else if (x.k === "no") usadas(x.e, sal);
    return sal;
  };

  /** evalúa una condición dejando constancia en la traza */
  function condicion(c: Expr, linea: number, vuelta: number): boolean {
    const r = valor(c) as boolean;
    const conVars = [...usadas(c)].map((n) => ` (${n} = ${buscar(n).get(n)})`).join("");
    poner(linea, "cond", `¿${exprATexto(c)}?${conVars} → ${r ? "sí" : "no"}`, { si: r, vuelta });
    return r;
  }

  function simple(s: Sent): void {
    if (s.t === "decl") {
      const v = valor(s.e) as number;
      marcos[marcos.length - 1].set(s.n, v);
      poner(s.l, "var", `int ${s.n} = ${v}`);
    } else if (s.t === "asig") {
      const marco = buscar(s.n);
      const v = valor(s.e) as number;
      const nuevo = s.op === "=" ? v : s.op === "+=" ? marco.get(s.n)! + v : marco.get(s.n)! - v;
      marco.set(s.n, nuevo);
      poner(s.l, "var", `${s.n} ahora vale ${nuevo}`);
    }
  }

  function cuerpo(lista: Sent[]): void {
    marcos.push(new Map());
    for (const s of lista) sentencia(s);
    marcos.pop();
  }

  function sentencia(s: Sent): void {
    switch (s.t) {
      case "vacio":
        break;
      case "accion":
        try {
          ACCIONES[s.n].hacer(mundo, e);
        } catch (x) {
          if (x instanceof Fallo) {
            poner(s.l, "fallo", x.message);
            throw x;
          }
          throw x;
        }
        poner(s.l, "accion", `${s.n}()`);
        break;
      case "decl":
      case "asig":
        simple(s);
        break;
      case "for": {
        marcos.push(new Map());
        if (s.ini) simple(s.ini);
        let vuelta = 0;
        while (s.cond ? condicion(s.cond, s.l, vuelta) : true) {
          cuerpo(s.cuerpo);
          vuelta++;
          if (s.upd) simple(s.upd);
          if (!s.cond && pasos.length >= maxPasos) throw new Corte();
        }
        marcos.pop();
        break;
      }
      case "while": {
        let vuelta = 0;
        while (condicion(s.cond, s.l, vuelta)) {
          cuerpo(s.cuerpo);
          vuelta++;
        }
        break;
      }
      case "dowhile": {
        let vuelta = 0;
        do {
          cuerpo(s.cuerpo);
          vuelta++;
        } while (condicion(s.cond, s.lCond, vuelta));
        break;
      }
      case "if":
        if (condicion(s.cond, s.l, 0)) cuerpo(s.cuerpo);
        else if (s.sino) cuerpo(s.sino);
        break;
    }
  }

  try {
    for (const s of prog) sentencia(s);
  } catch (x) {
    if (x instanceof Corte) {
      infinito = true;
      error = { momento: "ejecución", mensaje: `Se cortó tras ${maxPasos} pasos: ¿el bucle no termina nunca? Revisa su condición.` };
    } else if (x instanceof Fallo) error = { momento: "ejecución", mensaje: x.message };
    else throw x;
  }
  return { pasos, error, final: e, infinito };
}

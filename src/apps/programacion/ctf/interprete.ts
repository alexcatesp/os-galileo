// Intérprete de un subconjunto de Java para «CTF de Strings»: variables, literales, `+`, llamadas
// encadenadas a métodos de String/StringBuilder, arrays de String y algunos métodos estáticos.
// No usa `eval`: tokeniza, analiza y evalúa su propio árbol, así que no puede tocar nada del navegador.
// Los mensajes de error imitan a Eclipse (compilación) y a la JVM (ejecución).

export type Valor =
  | { k: "str"; v: string }
  | { k: "int"; v: number }
  | { k: "chr"; v: string }
  | { k: "bool"; v: boolean }
  | { k: "sb"; v: { t: string } }
  | { k: "arr"; v: Valor[] }
  | { k: "nulo" }
  | { k: "vacio" };

export class ErrorJava extends Error {
  constructor(
    mensaje: string,
    readonly linea: number,
    readonly momento: "compilación" | "ejecución" = "compilación",
  ) {
    super(mensaje);
  }
}

const tipoDe = (v: Valor): string => ({ str: "String", int: "int", chr: "char", bool: "boolean", sb: "StringBuilder", arr: "String[]", nulo: "null", vacio: "void" })[v.k];
const str = (v: string): Valor => ({ k: "str", v });
const ent = (v: number): Valor => ({ k: "int", v });
const bool = (v: boolean): Valor => ({ k: "bool", v });
const arrStr = (v: string[]): Valor => ({ k: "arr", v: v.map(str) });

/** Cómo se imprime un valor al concatenarlo (`"" + x`). */
function aTexto(v: Valor): string {
  switch (v.k) {
    case "str":
    case "chr":
      return v.v;
    case "int":
      return String(v.v);
    case "bool":
      return v.v ? "true" : "false";
    case "sb":
      return v.v.t;
    case "nulo":
      return "null";
    case "arr":
      return "[Ljava.lang.String;@1b6d3586";
    default:
      return "";
  }
}

/** Valor mostrado en la traza: las cadenas, entre comillas. */
export function mostrar(v: Valor | undefined): string {
  if (!v) return "";
  switch (v.k) {
    case "str":
      return `"${v.v}"`;
    case "chr":
      return `'${v.v}'`;
    case "sb":
      return `StringBuilder("${v.v.t}")`;
    case "arr":
      return `{${v.v.map((x) => mostrar(x)).join(", ")}}`;
    default:
      return aTexto(v);
  }
}

// ---------------------------------------------------------------------------------- catálogo

/** Tipos de parámetro: int (admite char), chr, str, cs (String o StringBuilder), any, arr. */
type TP = "int" | "chr" | "str" | "cs" | "any" | "arr";
const NOMBRE_TP: Record<TP, string> = { int: "int", chr: "char", str: "String", cs: "CharSequence", any: "Object", arr: "String[]" };

export interface Def {
  nombre: string;
  params: TP[];
  ret: string;
  doc: string;
  /** el último parámetro admite varios argumentos */
  varargs?: boolean;
  fn(recv: Valor, a: Valor[], linea: number): Valor;
}

const fueraDeRango = (i: number, n: number, l: number): ErrorJava => new ErrorJava(`java.lang.StringIndexOutOfBoundsException: Index ${i} out of bounds for length ${n}`, l, "ejecución");
const texto = (v: Valor) => (v.k === "str" || v.k === "chr" ? v.v : v.k === "sb" ? v.v.t : "");
const num = (v: Valor) => (v.k === "int" ? v.v : v.k === "chr" ? v.v.codePointAt(0)! : 0);
const chr = (c: string): Valor => ({ k: "chr", v: c });

function recorte(s: string, ini: number, fin: number, l: number): Valor {
  if (ini < 0 || fin > s.length || ini > fin) throw new ErrorJava(`java.lang.StringIndexOutOfBoundsException: begin ${ini}, end ${fin}, length ${s.length}`, l, "ejecución");
  return str(s.slice(ini, fin));
}
const trimJava = (s: string) => s.replace(/^[\u0000- ]+|[\u0000- ]+$/g, "");
function partir(s: string, regex: string): string[] {
  let partes: string[];
  try {
    partes = s.split(new RegExp(regex));
  } catch {
    throw new ErrorJava(`java.util.regex.PatternSyntaxException: ${regex}`, 0, "ejecución");
  }
  while (partes.length > 1 && partes[partes.length - 1] === "") partes.pop();
  return partes;
}

export const STRING: Def[] = [
  { nombre: "length", params: [], ret: "int", doc: "Número de caracteres.", fn: (r) => ent(texto(r).length) },
  {
    nombre: "charAt",
    params: ["int"],
    ret: "char",
    doc: "Carácter en esa posición (la primera es la 0).",
    fn(r, a, l) {
      const s = texto(r);
      const i = num(a[0]);
      if (i < 0 || i >= s.length) throw fueraDeRango(i, s.length, l);
      return chr(s[i]);
    },
  },
  { nombre: "substring", params: ["int"], ret: "String", doc: "Desde esa posición hasta el final.", fn: (r, a, l) => recorte(texto(r), num(a[0]), texto(r).length, l) },
  { nombre: "substring", params: ["int", "int"], ret: "String", doc: "Desde la primera posición (incluida) hasta la segunda (excluida).", fn: (r, a, l) => recorte(texto(r), num(a[0]), num(a[1]), l) },
  { nombre: "indexOf", params: ["str"], ret: "int", doc: "Posición de la primera aparición, o -1 si no está.", fn: (r, a) => ent(texto(r).indexOf(texto(a[0]))) },
  { nombre: "indexOf", params: ["chr"], ret: "int", doc: "Posición de la primera aparición del carácter, o -1.", fn: (r, a) => ent(texto(r).indexOf(texto(a[0]))) },
  { nombre: "indexOf", params: ["str", "int"], ret: "int", doc: "Como indexOf, buscando a partir de una posición.", fn: (r, a) => ent(texto(r).indexOf(texto(a[0]), Math.max(0, num(a[1])))) },
  { nombre: "lastIndexOf", params: ["str"], ret: "int", doc: "Posición de la última aparición, o -1.", fn: (r, a) => ent(texto(r).lastIndexOf(texto(a[0]))) },
  { nombre: "replace", params: ["chr", "chr"], ret: "String", doc: "Cambia todos los caracteres iguales al primero por el segundo.", fn: (r, a) => str(texto(r).split(texto(a[0])).join(texto(a[1]))) },
  { nombre: "replace", params: ["cs", "cs"], ret: "String", doc: "Cambia todas las apariciones del primer texto por el segundo.", fn: (r, a) => str(texto(a[0]) === "" ? [...texto(r)].join(texto(a[1])) : texto(r).split(texto(a[0])).join(texto(a[1]))) },
  {
    nombre: "replaceAll",
    params: ["str", "str"],
    ret: "String",
    doc: "Como replace, pero el primer argumento es una expresión regular.",
    fn(r, a, l) {
      try {
        return str(texto(r).replace(new RegExp(texto(a[0]), "g"), texto(a[1]).replace(/\\\$/g, "$$$$")));
      } catch {
        throw new ErrorJava(`java.util.regex.PatternSyntaxException: ${texto(a[0])}`, l, "ejecución");
      }
    },
  },
  { nombre: "toUpperCase", params: [], ret: "String", doc: "El texto en mayúsculas.", fn: (r) => str(texto(r).toUpperCase()) },
  { nombre: "toLowerCase", params: [], ret: "String", doc: "El texto en minúsculas.", fn: (r) => str(texto(r).toLowerCase()) },
  { nombre: "trim", params: [], ret: "String", doc: "Quita los espacios del principio y del final.", fn: (r) => str(trimJava(texto(r))) },
  { nombre: "strip", params: [], ret: "String", doc: "Como trim, entendiendo también los espacios Unicode.", fn: (r) => str(texto(r).trim()) },
  { nombre: "concat", params: ["str"], ret: "String", doc: "Añade el argumento al final.", fn: (r, a) => str(texto(r) + texto(a[0])) },
  { nombre: "contains", params: ["cs"], ret: "boolean", doc: "true si contiene ese texto.", fn: (r, a) => bool(texto(r).includes(texto(a[0]))) },
  { nombre: "startsWith", params: ["str"], ret: "boolean", doc: "true si empieza por ese texto.", fn: (r, a) => bool(texto(r).startsWith(texto(a[0]))) },
  { nombre: "endsWith", params: ["str"], ret: "boolean", doc: "true si termina en ese texto.", fn: (r, a) => bool(texto(r).endsWith(texto(a[0]))) },
  { nombre: "equals", params: ["any"], ret: "boolean", doc: "true si el contenido es igual (se compara con equals, nunca con ==).", fn: (r, a) => bool(a[0].k === "str" && a[0].v === texto(r)) },
  { nombre: "equalsIgnoreCase", params: ["str"], ret: "boolean", doc: "true si es igual sin distinguir mayúsculas.", fn: (r, a) => bool(texto(r).toLowerCase() === texto(a[0]).toLowerCase()) },
  { nombre: "isEmpty", params: [], ret: "boolean", doc: "true si no tiene ningún carácter.", fn: (r) => bool(texto(r) === "") },
  { nombre: "isBlank", params: [], ret: "boolean", doc: "true si está vacío o solo tiene espacios.", fn: (r) => bool(texto(r).trim() === "") },
  {
    nombre: "repeat",
    params: ["int"],
    ret: "String",
    doc: "Repite el texto n veces.",
    fn(r, a, l) {
      if (num(a[0]) < 0) throw new ErrorJava(`java.lang.IllegalArgumentException: count is negative: ${num(a[0])}`, l, "ejecución");
      return str(texto(r).repeat(num(a[0])));
    },
  },
  {
    nombre: "split",
    params: ["str"],
    ret: "String[]",
    doc: "Parte el texto por un separador (expresión regular) y devuelve un array.",
    fn(r, a, l) {
      try {
        return arrStr(partir(texto(r), texto(a[0])));
      } catch (e) {
        throw e instanceof ErrorJava ? new ErrorJava(e.message, l, "ejecución") : e;
      }
    },
  },
  { nombre: "toString", params: [], ret: "String", doc: "El propio texto.", fn: (r) => str(texto(r)) },
];

const BUILDER: Def[] = [
  { nombre: "append", params: ["any"], ret: "StringBuilder", doc: "Añade al final y devuelve el propio objeto.", fn: (r, a) => ((r as { v: { t: string } }).v.t += aTexto(a[0]), r) },
  { nombre: "reverse", params: [], ret: "StringBuilder", doc: "Invierte el contenido (del propio objeto) y lo devuelve.", fn: (r) => (((r as { v: { t: string } }).v.t = [...(r as { v: { t: string } }).v.t].reverse().join("")), r) },
  {
    nombre: "insert",
    params: ["int", "any"],
    ret: "StringBuilder",
    doc: "Inserta en una posición y devuelve el propio objeto.",
    fn(r, a, l) {
      const b = (r as { v: { t: string } }).v;
      const i = num(a[0]);
      if (i < 0 || i > b.t.length) throw new ErrorJava(`java.lang.StringIndexOutOfBoundsException: offset ${i}, length ${b.t.length}`, l, "ejecución");
      b.t = b.t.slice(0, i) + aTexto(a[1]) + b.t.slice(i);
      return r;
    },
  },
  {
    nombre: "deleteCharAt",
    params: ["int"],
    ret: "StringBuilder",
    doc: "Borra el carácter de esa posición y devuelve el propio objeto.",
    fn(r, a, l) {
      const b = (r as { v: { t: string } }).v;
      const i = num(a[0]);
      if (i < 0 || i >= b.t.length) throw new ErrorJava(`java.lang.StringIndexOutOfBoundsException: index ${i},length ${b.t.length}`, l, "ejecución");
      b.t = b.t.slice(0, i) + b.t.slice(i + 1);
      return r;
    },
  },
  { nombre: "length", params: [], ret: "int", doc: "Número de caracteres.", fn: (r) => ent((r as { v: { t: string } }).v.t.length) },
  {
    nombre: "charAt",
    params: ["int"],
    ret: "char",
    doc: "Carácter en esa posición.",
    fn(r, a, l) {
      const t = (r as { v: { t: string } }).v.t;
      const i = num(a[0]);
      if (i < 0 || i >= t.length) throw new ErrorJava(`java.lang.StringIndexOutOfBoundsException: index ${i},length ${t.length}`, l, "ejecución");
      return chr(t[i]);
    },
  },
  { nombre: "toString", params: [], ret: "String", doc: "Devuelve un String con el contenido.", fn: (r) => str((r as { v: { t: string } }).v.t) },
];

const ESTATICOS: Record<string, Def[]> = {
  String: [
    { nombre: "join", params: ["cs", "arr"], ret: "String", doc: "Une los elementos de un array poniendo el separador entre ellos.", fn: (_r, a) => str((a[1] as { v: Valor[] }).v.map(aTexto).join(texto(a[0]))) },
    { nombre: "join", params: ["cs", "cs"], varargs: true, ret: "String", doc: "Une los textos que le pases poniendo el separador entre ellos.", fn: (_r, a) => str(a.slice(1).map(aTexto).join(texto(a[0]))) },
    { nombre: "valueOf", params: ["any"], ret: "String", doc: "Representación en texto de un valor.", fn: (_r, a) => str(aTexto(a[0])) },
  ],
  Integer: [
    {
      nombre: "parseInt",
      params: ["str"],
      ret: "int",
      doc: "Convierte un texto en un número entero.",
      fn(_r, a, l) {
        const t = texto(a[0]);
        if (!/^[+-]?\d+$/.test(t)) throw new ErrorJava(`java.lang.NumberFormatException: For input string: "${t}"`, l, "ejecución");
        return ent(parseInt(t, 10));
      },
    },
  ],
};

export const CLASES_ESTATICAS = Object.keys(ESTATICOS);
const TIPOS_DECL = ["String", "StringBuilder", "int", "char", "boolean", "var", "String[]"];

function catalogoDe(v: Valor): Def[] | null {
  if (v.k === "str") return STRING;
  if (v.k === "sb") return BUILDER;
  return null;
}

/** Métodos que ofrece el autocompletado para un valor. */
export function metodosDe(v: Valor): Def[] {
  return catalogoDe(v) ?? [];
}
export function estaticosDe(clase: string): Def[] {
  return ESTATICOS[clase] ?? [];
}
export const firmaDe = (d: Def): string => `${d.nombre}(${d.params.map((p) => NOMBRE_TP[p]).join(", ")})`;

function encaja(p: TP, v: Valor): boolean {
  switch (p) {
    case "int":
      return v.k === "int" || v.k === "chr";
    case "chr":
      return v.k === "chr";
    case "str":
      return v.k === "str";
    case "cs":
      return v.k === "str" || v.k === "sb";
    case "arr":
      return v.k === "arr";
    default:
      return v.k !== "vacio";
  }
}

function resolver(defs: Def[], nombre: string, args: Valor[], tipoRecv: string, linea: number): Def {
  const candidatos = defs.filter((d) => d.nombre === nombre);
  if (!candidatos.length) throw new ErrorJava(`The method ${nombre}(${args.map(tipoDe).join(", ")}) is undefined for the type ${tipoRecv}`, linea);
  for (const d of candidatos) {
    if (d.varargs) {
      const fijos = d.params.length - 1;
      if (args.length > fijos && args.slice(0, fijos).every((a, i) => encaja(d.params[i], a)) && args.slice(fijos).every((a) => encaja(d.params[fijos], a))) return d;
    } else if (d.params.length === args.length && d.params.every((p, i) => encaja(p, args[i]))) return d;
  }
  const primero = candidatos[0];
  throw new ErrorJava(`The method ${firmaDe(primero)} in the type ${tipoRecv} is not applicable for the arguments (${args.map(tipoDe).join(", ")})`, linea);
}

// ---------------------------------------------------------------------------------- análisis léxico

interface Tok {
  t: "id" | "num" | "str" | "chr" | "p" | "fin";
  v: string;
  linea: number;
  /** posición en el código fuente: [ini, fin) */
  ini: number;
  fin: number;
}

function tokenizar(src: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  let linea = 1;
  const esc = (c: string) => ({ n: "\n", t: "\t", '"': '"', "'": "'", "\\": "\\", "0": "\0" })[c] ?? c;
  while (i < src.length) {
    const c = src[i];
    if (c === "\n") {
      linea++;
      i++;
    } else if (/\s/.test(c)) i++;
    else if (c === "/" && src[i + 1] === "/") while (i < src.length && src[i] !== "\n") i++;
    else if (c === "/" && src[i + 1] === "*") {
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) {
        if (src[i] === "\n") linea++;
        i++;
      }
      i += 2;
    } else if (/[A-Za-z_$]/.test(c)) {
      let j = i;
      while (j < src.length && /[\w$]/.test(src[j])) j++;
      toks.push({ t: "id", v: src.slice(i, j), linea, ini: i, fin: j });
      i = j;
    } else if (/\d/.test(c)) {
      let j = i;
      while (j < src.length && /[\d_]/.test(src[j])) j++;
      toks.push({ t: "num", v: src.slice(i, j).replace(/_/g, ""), linea, ini: i, fin: j });
      i = j;
    } else if (c === '"') {
      let j = i + 1;
      let v = "";
      while (j < src.length && src[j] !== '"') {
        if (src[j] === "\n") throw new ErrorJava("String literal is not properly closed by a double-quote", linea);
        if (src[j] === "\\") {
          v += esc(src[j + 1] ?? "");
          j += 2;
        } else v += src[j++];
      }
      if (j >= src.length) throw new ErrorJava("String literal is not properly closed by a double-quote", linea);
      toks.push({ t: "str", v, linea, ini: i, fin: j + 1 });
      i = j + 1;
    } else if (c === "'") {
      let j = i + 1;
      let v = "";
      while (j < src.length && src[j] !== "'" && src[j] !== "\n") {
        if (src[j] === "\\") {
          v += esc(src[j + 1] ?? "");
          j += 2;
        } else v += src[j++];
      }
      if (src[j] !== "'") throw new ErrorJava("Invalid character constant", linea);
      if ([...v].length !== 1) throw new ErrorJava("Invalid character constant", linea);
      toks.push({ t: "chr", v, linea, ini: i, fin: j + 1 });
      i = j + 1;
    } else if ((c === "=" || c === "!") && src[i + 1] === "=") {
      toks.push({ t: "p", v: c + "=", linea, ini: i, fin: i + 2 });
      i += 2;
    } else if ("()[].,;=+-".includes(c)) {
      toks.push({ t: "p", v: c, linea, ini: i, fin: i + 1 });
      i++;
    } else throw new ErrorJava(`Syntax error on token "${c}", delete this token`, linea);
  }
  toks.push({ t: "fin", v: "", linea, ini: src.length, fin: src.length });
  return toks;
}

// ---------------------------------------------------------------------------------- análisis sintáctico

type Expr =
  | { n: "lit"; v: Valor }
  | { n: "var"; nombre: string; linea: number }
  | { n: "llamada"; recv: Expr; nombre: string; args: Expr[]; linea: number }
  | { n: "indice"; recv: Expr; idx: Expr; linea: number }
  | { n: "campo"; recv: Expr; nombre: string; linea: number }
  | { n: "nuevo"; clase: string; args: Expr[]; linea: number }
  | { n: "bin"; op: "+" | "-"; izq: Expr; der: Expr; linea: number }
  | { n: "neg"; e: Expr; linea: number };

type Sentencia =
  | { n: "decl"; tipo: string; nombre: string; valor: Expr | null; linea: number; src: string }
  | { n: "asig"; nombre: string; valor: Expr; linea: number; src: string }
  | { n: "expr"; e: Expr; linea: number; src: string };

class Analizador {
  private i = 0;
  constructor(
    private readonly toks: Tok[],
    private readonly src: string,
  ) {}
  private get t(): Tok {
    return this.toks[this.i];
  }
  private sig(): Tok {
    return this.toks[this.i++];
  }
  private es(v: string): boolean {
    return this.t.t === "p" && this.t.v === v;
  }
  private esperar(v: string, contexto: string): void {
    if (!this.es(v)) {
      const previa = this.toks[Math.max(0, this.i - 1)].linea;
      if (v === ";") throw new ErrorJava(`Syntax error, insert ";" to complete ${contexto}`, this.t.t === "fin" ? previa : previa);
      throw new ErrorJava(`Syntax error, insert "${v}" to complete ${contexto}`, this.t.linea);
    }
    this.i++;
  }

  programa(): Sentencia[] {
    const lista: Sentencia[] = [];
    while (this.t.t !== "fin") lista.push(this.sentencia());
    return lista;
  }

  private sentencia(): Sentencia {
    const t0 = this.t;
    const inicio = this.i;
    const linea = t0.linea;
    const fuente = () => this.src.slice(this.toks[inicio].ini, this.toks[this.i - 1].fin);
    // declaración: Tipo nombre [= expr];
    const esTipo = t0.t === "id" && TIPOS_DECL.includes(t0.v);
    const nombreTipo = t0.t === "id" && t0.v !== "new" && this.toks[this.i + 1]?.t === "id" && !TIPOS_DECL.includes(t0.v);
    if (nombreTipo) throw new ErrorJava(`${t0.v} cannot be resolved to a type`, linea);
    if (esTipo && (this.toks[this.i + 1]?.t === "id" || (this.toks[this.i + 1]?.v === "[" && this.toks[this.i + 2]?.v === "]"))) {
      this.sig();
      let tipo = t0.v;
      if (this.es("[")) {
        this.sig();
        this.esperar("]", "ArrayType");
        tipo += "[]";
      }
      if (this.t.t !== "id") throw new ErrorJava('Syntax error on token, delete this token', this.t.linea);
      const nombre = this.sig().v;
      let valor: Expr | null = null;
      if (this.es("=")) {
        this.sig();
        valor = this.expr();
      }
      this.esperar(";", "LocalVariableDeclarationStatement");
      return { n: "decl", tipo, nombre, valor, linea, src: fuente() };
    }
    // asignación: nombre = expr;
    if (t0.t === "id" && this.toks[this.i + 1]?.t === "p" && this.toks[this.i + 1].v === "=") {
      this.sig();
      this.sig();
      const valor = this.expr();
      this.esperar(";", "Expression");
      return { n: "asig", nombre: t0.v, valor, linea, src: fuente() };
    }
    const e = this.expr();
    if (this.es("=")) throw new ErrorJava("Syntax error on token \"=\", the left-hand side of an assignment must be a variable", this.t.linea);
    this.esperar(";", "Expression");
    return { n: "expr", e, linea, src: fuente() };
  }

  private expr(): Expr {
    let izq = this.unaria();
    while (this.es("+") || this.es("-") || this.es("==") || this.es("!=")) {
      const op = this.sig();
      if (op.v === "==" || op.v === "!=") throw new ErrorJava(`En este juego no se usa ${op.v}: con objetos compara las referencias. Usa equals().`, op.linea);
      const der = this.unaria();
      izq = { n: "bin", op: op.v as "+" | "-", izq, der, linea: op.linea };
    }
    return izq;
  }

  private unaria(): Expr {
    if (this.es("-")) {
      const t = this.sig();
      return { n: "neg", e: this.unaria(), linea: t.linea };
    }
    return this.postfija();
  }

  private args(): Expr[] {
    const lista: Expr[] = [];
    if (!this.es(")")) {
      lista.push(this.expr());
      while (this.es(",")) {
        this.sig();
        lista.push(this.expr());
      }
    }
    this.esperar(")", "MethodInvocation");
    return lista;
  }

  private postfija(): Expr {
    let e = this.primaria();
    for (;;) {
      if (this.es(".")) {
        this.sig();
        if (this.t.t !== "id") throw new ErrorJava('Syntax error on token ".", Identifier expected after this token', this.t.linea);
        const nombre = this.sig();
        if (this.es("(")) {
          this.sig();
          e = { n: "llamada", recv: e, nombre: nombre.v, args: this.args(), linea: nombre.linea };
        } else e = { n: "campo", recv: e, nombre: nombre.v, linea: nombre.linea };
      } else if (this.es("[")) {
        const t = this.sig();
        const idx = this.expr();
        this.esperar("]", "ArrayAccess");
        e = { n: "indice", recv: e, idx, linea: t.linea };
      } else return e;
    }
  }

  private primaria(): Expr {
    const t = this.sig();
    switch (t.t) {
      case "num": {
        const n = Number(t.v);
        if (n > 2147483647) throw new ErrorJava(`The literal ${t.v} of type int is out of range`, t.linea);
        return { n: "lit", v: ent(n) };
      }
      case "str":
        return { n: "lit", v: str(t.v) };
      case "chr":
        return { n: "lit", v: chr(t.v) };
      case "id":
        if (t.v === "true" || t.v === "false") return { n: "lit", v: bool(t.v === "true") };
        if (t.v === "null") return { n: "lit", v: { k: "nulo" } };
        if (t.v === "new") {
          if (this.t.t !== "id") throw new ErrorJava('Syntax error on token "new", Identifier expected', t.linea);
          const clase = this.sig();
          if (clase.v !== "StringBuilder" && clase.v !== "String") throw new ErrorJava(`${clase.v} cannot be resolved to a type`, clase.linea);
          this.esperar("(", "ClassInstanceCreationExpression");
          return { n: "nuevo", clase: clase.v, args: this.args(), linea: clase.linea };
        }
        return { n: "var", nombre: t.v, linea: t.linea };
      case "p":
        if (t.v === "(") {
          const e = this.expr();
          this.esperar(")", "ParenthesizedExpression");
          return e;
        }
        throw new ErrorJava(`Syntax error on token "${t.v}", delete this token`, t.linea);
      default:
        throw new ErrorJava("Syntax error, insert \";\" to complete Expression", this.toks[Math.max(0, this.i - 2)]?.linea ?? 1);
    }
  }
}

// ---------------------------------------------------------------------------------- evaluación

interface Variable {
  tipo: string;
  valor: Valor | null;
}
export type Entorno = Map<string, Variable>;

function compatible(tipo: string, v: Valor): boolean {
  switch (tipo) {
    case "String":
      return v.k === "str" || v.k === "nulo";
    case "StringBuilder":
      return v.k === "sb" || v.k === "nulo";
    case "int":
      return v.k === "int" || v.k === "chr";
    case "char":
      return v.k === "chr";
    case "boolean":
      return v.k === "bool";
    case "String[]":
      return v.k === "arr" || v.k === "nulo";
    default:
      return true;
  }
}

function evaluar(e: Expr, env: Entorno): Valor {
  switch (e.n) {
    case "lit":
      return e.v;
    case "var": {
      const v = env.get(e.nombre);
      if (!v) throw new ErrorJava(`${e.nombre} cannot be resolved to a variable`, e.linea);
      if (!v.valor) throw new ErrorJava(`The local variable ${e.nombre} may not have been initialized`, e.linea);
      return v.valor;
    }
    case "neg": {
      const v = evaluar(e.e, env);
      if (v.k !== "int" && v.k !== "chr") throw new ErrorJava(`The operator - is undefined for the argument type ${tipoDe(v)}`, e.linea);
      return ent(-num(v));
    }
    case "bin": {
      const a = evaluar(e.izq, env);
      const b = evaluar(e.der, env);
      if (e.op === "+") {
        if (a.k === "str" || b.k === "str") return str(aTexto(a) + aTexto(b));
        if ((a.k === "int" || a.k === "chr") && (b.k === "int" || b.k === "chr")) return ent(num(a) + num(b));
        if (a.k === "sb" || b.k === "sb") return str(aTexto(a) + aTexto(b));
        throw new ErrorJava(`The operator + is undefined for the argument type(s) ${tipoDe(a)}, ${tipoDe(b)}`, e.linea);
      }
      if ((a.k === "int" || a.k === "chr") && (b.k === "int" || b.k === "chr")) return ent(num(a) - num(b));
      throw new ErrorJava(`The operator - is undefined for the argument type(s) ${tipoDe(a)}, ${tipoDe(b)}`, e.linea);
    }
    case "nuevo": {
      const args = e.args.map((x) => evaluar(x, env));
      if (e.clase === "StringBuilder") {
        if (args.length === 0) return { k: "sb", v: { t: "" } };
        if (args.length === 1 && (args[0].k === "str" || args[0].k === "sb")) return { k: "sb", v: { t: texto(args[0]) } };
        if (args.length === 1 && args[0].k === "int") return { k: "sb", v: { t: "" } };
        throw new ErrorJava(`The constructor StringBuilder(${args.map(tipoDe).join(", ")}) is undefined`, e.linea);
      }
      if (args.length === 1 && args[0].k === "str") return str(args[0].v);
      if (args.length === 0) return str("");
      throw new ErrorJava(`The constructor String(${args.map(tipoDe).join(", ")}) is undefined`, e.linea);
    }
    case "campo": {
      const r = evaluar(e.recv, env);
      if (r.k === "arr" && e.nombre === "length") return ent(r.v.length);
      throw new ErrorJava(`${e.nombre} cannot be resolved or is not a field`, e.linea);
    }
    case "indice": {
      const r = evaluar(e.recv, env);
      const i = evaluar(e.idx, env);
      if (r.k !== "arr") throw new ErrorJava(`The type of the expression must be an array type but it resolved to ${tipoDe(r)}`, e.linea);
      if (i.k !== "int" && i.k !== "chr") throw new ErrorJava(`Type mismatch: cannot convert from ${tipoDe(i)} to int`, e.linea);
      if (num(i) < 0 || num(i) >= r.v.length) throw new ErrorJava(`java.lang.ArrayIndexOutOfBoundsException: Index ${num(i)} out of bounds for length ${r.v.length}`, e.linea, "ejecución");
      return r.v[num(i)];
    }
    case "llamada": {
      // llamada estática: String.join(...), Integer.parseInt(...)
      if (e.recv.n === "var" && !env.has(e.recv.nombre) && CLASES_ESTATICAS.includes(e.recv.nombre)) {
        const args = e.args.map((x) => evaluar(x, env));
        return resolver(ESTATICOS[e.recv.nombre], e.nombre, args, e.recv.nombre, e.linea).fn(str(""), args, e.linea);
      }
      const r = evaluar(e.recv, env);
      const args = e.args.map((x) => evaluar(x, env));
      if (r.k === "nulo") throw new ErrorJava(`java.lang.NullPointerException: Cannot invoke "String.${e.nombre}()" because ${e.recv.n === "var" ? `"${e.recv.nombre}"` : "the value"} is null`, e.linea, "ejecución");
      const cat = catalogoDe(r);
      if (!cat) throw new ErrorJava(`Cannot invoke ${e.nombre}(${args.map(tipoDe).join(", ")}) on the ${r.k === "int" || r.k === "chr" || r.k === "bool" ? "primitive type " : "type "}${tipoDe(r)}`, e.linea);
      return resolver(cat, e.nombre, args, tipoDe(r), e.linea).fn(r, args, e.linea);
    }
  }
}

// ---------------------------------------------------------------------------------- ejecución

export interface Paso {
  linea: number;
  codigo: string;
  /** valor de `s` tras la sentencia */
  s: string | null;
  /** otras variables, para la traza */
  vars: { nombre: string; valor: string }[];
  aviso?: string;
}

export interface Resultado {
  pasos: Paso[];
  /** valor final de `s` (null si el programa falló antes de poder leerlo) */
  s: string | null;
  error?: { mensaje: string; linea: number; momento: "compilación" | "ejecución" };
  entorno: Entorno;
}

function crearEntorno(entrada: string): Entorno {
  return new Map<string, Variable>([["s", { tipo: "String", valor: str(entrada) }]]);
}

function valorS(env: Entorno): string | null {
  const v = env.get("s")?.valor;
  return v && v.k === "str" ? v.v : null;
}

function ejecutarSentencia(st: Sentencia, env: Entorno): string | undefined {
  switch (st.n) {
    case "decl": {
      if (env.has(st.nombre)) throw new ErrorJava(`Duplicate local variable ${st.nombre}`, st.linea);
      const v = st.valor ? evaluar(st.valor, env) : null;
      if (v && v.k === "vacio") throw new ErrorJava(`Type mismatch: cannot convert from void to ${st.tipo}`, st.linea);
      if (v && !compatible(st.tipo, v)) throw new ErrorJava(`Type mismatch: cannot convert from ${tipoDe(v)} to ${st.tipo}`, st.linea);
      env.set(st.nombre, { tipo: st.tipo === "var" ? (v ? tipoDe(v) : "var") : st.tipo, valor: v });
      return undefined;
    }
    case "asig": {
      const variable = env.get(st.nombre);
      if (!variable) throw new ErrorJava(`${st.nombre} cannot be resolved to a variable`, st.linea);
      const v = evaluar(st.valor, env);
      if (!compatible(variable.tipo, v)) throw new ErrorJava(`Type mismatch: cannot convert from ${tipoDe(v)} to ${variable.tipo}`, st.linea);
      variable.valor = v;
      return undefined;
    }
    case "expr": {
      const e = st.e;
      if (e.n !== "llamada" && e.n !== "nuevo") throw new ErrorJava("Not a statement", st.linea);
      const v = evaluar(e, env);
      // el resultado de un método de String que no se guarda se pierde: String es inmutable
      if (e.n === "llamada" && v.k !== "sb" && v.k !== "vacio") {
        const sobre = e.recv.n === "var" ? e.recv.nombre : "";
        const esString = sobre !== "" && env.get(sobre)?.tipo === "String";
        return `El resultado ${mostrar(v)} se descarta: ${esString ? `${sobre} no cambia (los String son inmutables)` : "no lo guardas en ninguna variable"}. Asígnalo: ${esString ? `${sobre} = ` : "s = "}…`;
      }
      return undefined;
    }
  }
}

export function ejecutar(script: string, entrada: string): Resultado {
  const env = crearEntorno(entrada);
  const pasos: Paso[] = [];
  let sentencias: Sentencia[];
  try {
    sentencias = new Analizador(tokenizar(script), script).programa();
  } catch (e) {
    if (e instanceof ErrorJava) return { pasos, s: valorS(env), error: { mensaje: e.message, linea: e.linea, momento: e.momento }, entorno: env };
    throw e;
  }
  for (const st of sentencias) {
    try {
      const aviso = ejecutarSentencia(st, env);
      pasos.push({
        linea: st.linea,
        codigo: st.src,
        s: valorS(env),
        vars: [...env.entries()].filter(([n]) => n !== "s").map(([nombre, v]) => ({ nombre, valor: v.valor ? mostrar(v.valor) : "(sin valor)" })),
        ...(aviso ? { aviso } : {}),
      });
    } catch (e) {
      if (e instanceof ErrorJava) return { pasos, s: valorS(env), error: { mensaje: e.message, linea: e.linea || st.linea, momento: e.momento }, entorno: env };
      throw e;
    }
  }
  return { pasos, s: valorS(env), entorno: env };
}

/** Evalúa una expresión suelta con las variables de un entorno (para el autocompletado). */
export function evaluarSuelta(src: string, env: Entorno): Valor | null {
  try {
    const toks = tokenizar(src + ";");
    const a = new Analizador(toks, src);
    const st = a.programa()[0];
    if (!st || st.n !== "expr") return null;
    const copia: Entorno = new Map([...env].map(([n, v]) => [n, { ...v }]));
    return evaluar(st.e, copia);
  } catch {
    return null;
  }
}

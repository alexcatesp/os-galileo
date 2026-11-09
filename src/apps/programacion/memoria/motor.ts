// Motor de «Memoria de Java»: no interpreta Java, sino una lista de operaciones sobre la pila y el
// montón que cada programa de ejemplo define a mano. El estado de cada paso se CALCULA (qué objetos
// quedan sin referencia, qué da `==`…), así que el dibujo no puede contradecir al código.

export interface Variable {
  nombre: string;
  tipo: string;
  /** método al que pertenece (main, anadir…) */
  marco: string;
  /** valor si es primitivo */
  prim?: string;
  /** objeto al que apunta (null = no apunta a nada); undefined si es primitivo */
  ref?: number | null;
}

export interface Obj {
  id: number;
  clase: string;
  texto: string;
  /** vive en el string pool (los literales) */
  pool?: boolean;
  /** inalcanzable: ninguna variable lo referencia */
  basura?: boolean;
}

export interface Estado {
  marcos: string[];
  vars: Variable[];
  monton: Obj[];
  salida: string[];
  error?: string;
  sigId: number;
}

export type Op =
  | { k: "prim"; nombre: string; tipo: string; v: string }
  | { k: "copiaPrim"; nombre: string; tipo: string; desde: string }
  | { k: "nuevo"; nombre: string; tipo: string; clase: string; texto: string }
  | { k: "literal"; nombre: string; texto: string }
  | { k: "copiaRef"; nombre: string; tipo: string; desde: string }
  | { k: "nulo"; nombre: string; tipo: string }
  | { k: "mutar"; nombre: string; texto: string }
  | { k: "suelto"; clase: string; texto: string }
  | { k: "derivar"; nombre: string; clase: string; texto: string }
  | { k: "comparar"; izq: string; der: string; modo: "==" | "equals" }
  | { k: "imprimirVar"; nombre: string }
  | { k: "llamar"; marco: string; params: { nombre: string; tipo: string; desde: string }[] }
  | { k: "retornar" }
  | { k: "error"; texto: string }
  | { k: "gc" };

export function estadoInicial(): Estado {
  return { marcos: ["main"], vars: [], monton: [], salida: [], sigId: 1 };
}

/** ¿Hay algún objeto al que ya no llegue ninguna variable? Los del pool no se recogen nunca. */
function marcarBasura(s: Estado): void {
  const vivos = new Set(s.vars.map((v) => v.ref).filter((r): r is number => typeof r === "number"));
  for (const o of s.monton) o.basura = !o.pool && !vivos.has(o.id);
}

export function aplicar(e: Estado, ops: Op[]): Estado {
  const s: Estado = structuredClone(e);
  const marco = () => s.marcos[s.marcos.length - 1];
  const buscar = (nombre: string): Variable => {
    const v = s.vars.find((x) => x.nombre === nombre && x.marco === marco());
    if (!v) throw new Error(`Variable «${nombre}» no encontrada en ${marco()}`);
    return v;
  };
  /** declara la variable si no existe en el marco actual; si existe, la reutiliza (asignación) */
  const poner = (nombre: string, tipo: string): Variable => {
    let v = s.vars.find((x) => x.nombre === nombre && x.marco === marco());
    if (!v) {
      v = { nombre, tipo, marco: marco() };
      s.vars.push(v);
    }
    return v;
  };
  const crear = (clase: string, texto: string, pool = false): Obj => {
    const o: Obj = { id: s.sigId++, clase, texto, ...(pool ? { pool: true } : {}) };
    s.monton.push(o);
    return o;
  };
  const objeto = (id: number | null | undefined): Obj | undefined => s.monton.find((o) => o.id === id);
  const textoDe = (v: Variable): string => (v.ref === undefined ? (v.prim ?? "") : v.ref === null ? "null" : (objeto(v.ref)?.texto ?? ""));

  for (const op of ops) {
    switch (op.k) {
      case "prim": {
        const v = poner(op.nombre, op.tipo);
        v.prim = op.v;
        delete v.ref;
        break;
      }
      case "copiaPrim": {
        const origen = buscar(op.desde);
        const v = poner(op.nombre, op.tipo);
        v.prim = origen.prim;
        delete v.ref;
        break;
      }
      case "nuevo": {
        const o = crear(op.clase, op.texto);
        const v = poner(op.nombre, op.tipo);
        v.ref = o.id;
        delete v.prim;
        break;
      }
      case "literal": {
        const o = s.monton.find((x) => x.pool && x.texto === op.texto) ?? crear("String", op.texto, true);
        const v = poner(op.nombre, "String");
        v.ref = o.id;
        delete v.prim;
        break;
      }
      case "copiaRef": {
        const origen = buscar(op.desde);
        const v = poner(op.nombre, op.tipo);
        v.ref = origen.ref ?? null;
        delete v.prim;
        break;
      }
      case "nulo": {
        const v = poner(op.nombre, op.tipo);
        v.ref = null;
        delete v.prim;
        break;
      }
      case "mutar": {
        const o = objeto(buscar(op.nombre).ref);
        if (!o) throw new Error(`«${op.nombre}» no apunta a ningún objeto`);
        o.texto = op.texto;
        break;
      }
      case "suelto":
        crear(op.clase, op.texto);
        break;
      case "derivar": {
        const o = crear(op.clase, op.texto);
        buscar(op.nombre).ref = o.id;
        break;
      }
      case "comparar": {
        const a = buscar(op.izq);
        const b = buscar(op.der);
        const igual = op.modo === "==" ? (a.ref === undefined ? a.prim === b.prim : a.ref === b.ref) : textoDe(a) === textoDe(b);
        s.salida.push(String(igual));
        break;
      }
      case "imprimirVar":
        s.salida.push(textoDe(buscar(op.nombre)));
        break;
      case "llamar": {
        const copias = op.params.map((p) => ({ p, origen: buscar(p.desde) }));
        s.marcos.push(op.marco);
        for (const { p, origen } of copias) {
          const v = poner(p.nombre, p.tipo);
          if (origen.ref !== undefined) v.ref = origen.ref;
          else v.prim = origen.prim;
        }
        break;
      }
      case "retornar": {
        const m = s.marcos.pop();
        s.vars = s.vars.filter((v) => v.marco !== m);
        break;
      }
      case "error":
        s.error = op.texto;
        break;
      case "gc":
        s.monton = s.monton.filter((o) => !o.basura);
        break;
    }
    marcarBasura(s);
  }
  return s;
}

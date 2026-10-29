// Analizador del pseudocódigo del departamento (el de las diapositivas de la UT03 §1):
//   LEER · ESCRIBIR · x <- expr · SI/ENTONCES/SI NO/FIN SI · MIENTRAS/HACER/FIN MIENTRAS
//   REPETIR/HASTA · PARA/DESDE/HASTA/CON PASO/HACER/FIN PARA · SEGÚN/CASO/OTRO/FIN SEGÚN
//   SUBPROCESO nombre … FIN SUBPROCESO · llamada: nombre
// Con la opción `libre`, una línea que no es una instrucción es una acción en lenguaje natural.

import type { Caso, Lista, Nodo, Programa, Subproceso } from "./modelo";

export interface ErrorSintaxis {
  linea: number;
  mensaje: string;
}

export interface OpcionesAnalisis {
  /** admite acciones en lenguaje natural («Coger el cepillo») y llamadas a subprocesos que no existen */
  libre?: boolean;
}

interface Linea {
  n: number;
  texto: string; // sin comentario ni espacios
  norm: string; // mayúsculas y sin tildes
}

export function normalizar(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toUpperCase();
}

/** Quita el comentario `// …` que no esté dentro de una cadena */
function sinComentario(l: string): string {
  let comillas = false;
  for (let i = 0; i < l.length; i++) {
    if (l[i] === '"') comillas = !comillas;
    else if (!comillas && l[i] === "/" && l[i + 1] === "/") return l.slice(0, i);
  }
  return l;
}

const ID = "[A-Za-zÁÉÍÓÚÜÑáéíóúüñ_][A-Za-zÁÉÍÓÚÜÑáéíóúüñ_0-9]*";
const RESERVADAS = new Set([
  "INICIO", "FIN", "LEER", "ESCRIBIR", "SI", "SINO", "ENTONCES", "MIENTRAS", "HACER", "REPETIR", "HASTA", "PARA",
  "DESDE", "CON", "PASO", "SEGUN", "CASO", "OTRO", "SUBPROCESO",
]);

class Fallo extends Error {
  constructor(public linea: number, mensaje: string) {
    super(mensaje);
  }
}

class Lector {
  private i = 0;
  constructor(private lineas: Linea[]) {}

  get actual(): Linea | undefined {
    return this.lineas[this.i];
  }
  avanzar(): Linea {
    return this.lineas[this.i++];
  }
  get fin(): boolean {
    return this.i >= this.lineas.length;
  }
}

const fin = (n: string, palabra: string) => new RegExp(`^FIN\\s*${palabra}$`).test(n);

function bloque(r: Lector, cierra: (norm: string) => boolean, abre: Linea | null, falta: string, op: OpcionesAnalisis): Lista {
  const lista: Lista = [];
  for (;;) {
    const l = r.actual;
    if (!l) {
      if (abre) throw new Fallo(abre.n, `Falta ${falta} para cerrar esta línea`);
      return lista;
    }
    if (cierra(l.norm)) return lista;
    r.avanzar();
    lista.push(sentencia(r, l, op));
  }
}

function sentencia(r: Lector, l: Linea, op: OpcionesAnalisis): Nodo {
  const { norm, texto, n } = l;
  const orig = (m: RegExpMatchArray, g: number) => {
    // las expresiones se recuperan del texto original (misma longitud que el normalizado)
    const ini = m.indices![g][0], fin2 = m.indices![g][1];
    return texto.length === norm.length ? texto.slice(ini, fin2).trim() : norm.slice(ini, fin2).trim();
  };
  const co = (re: RegExp) => norm.match(new RegExp(re.source, "d"));
  let m: RegExpMatchArray | null;

  if ((m = co(/^LEER\s+(.+)$/))) return { t: "leer", vars: orig(m, 1), linea: n };
  if ((m = co(/^(?:ESCRIBIR|MOSTRAR|IMPRIMIR)\s+(.+)$/))) return { t: "escribir", expr: orig(m, 1), linea: n };

  if ((m = co(/^SI\s+(.+?)\s+ENTONCES$/))) {
    const cond = orig(m, 1);
    const entonces = bloque(r, (x) => x === "SI NO" || x === "SINO" || fin(x, "SI"), l, "FIN SI", op);
    let sino: Lista = [];
    if (r.actual && (r.actual.norm === "SI NO" || r.actual.norm === "SINO")) {
      r.avanzar();
      sino = bloque(r, (x) => fin(x, "SI"), l, "FIN SI", op);
    }
    r.avanzar(); // FIN SI
    return { t: "si", cond, entonces, sino, linea: n };
  }

  if ((m = co(/^MIENTRAS\s+(.+?)\s+HACER$/))) {
    const cuerpo = bloque(r, (x) => fin(x, "MIENTRAS"), l, "FIN MIENTRAS", op);
    r.avanzar();
    return { t: "mientras", cond: orig(m, 1), cuerpo, linea: n };
  }

  if (/^REPETIR$/.test(norm)) {
    const cuerpo = bloque(r, (x) => /^HASTA\s/.test(x), l, "HASTA condición", op);
    const h = r.avanzar();
    const mh = h.norm.match(/^HASTA\s+(.+)$/d)!;
    const hasta = h.texto.length === h.norm.length ? h.texto.slice(mh.indices![1][0], mh.indices![1][1]).trim() : mh[1];
    return { t: "repetir", hasta, cuerpo, linea: n };
  }

  if ((m = co(new RegExp(`^PARA\\s+(${ID.toUpperCase()})\\s+DESDE\\s+(.+?)\\s+HASTA\\s+(.+?)(?:\\s+CON\\s+PASO\\s+(.+?))?\\s+HACER$`)))) {
    const cuerpo = bloque(r, (x) => fin(x, "PARA"), l, "FIN PARA", op);
    r.avanzar();
    return { t: "para", variable: orig(m, 1), desde: orig(m, 2), hasta: orig(m, 3), paso: m[4] ? orig(m, 4) : "", cuerpo, linea: n };
  }

  if ((m = co(/^SEGUN\s+(.+?)\s+HACER$/))) {
    const casos: Caso[] = [];
    let otro: Lista = [];
    const finCaso = (x: string) => /^CASO\s/.test(x) || /^(?:DE\s+)?OTRO(?:\s+MODO|\s+CASO)?:?$/.test(x) || fin(x, "SEGUN");
    for (;;) {
      const a = r.actual;
      if (!a) throw new Fallo(n, "Falta FIN SEGÚN para cerrar esta línea");
      if (fin(a.norm, "SEGUN")) {
        r.avanzar();
        break;
      }
      r.avanzar();
      const mc = a.norm.match(/^CASO\s+(.+?):?$/d);
      if (mc) {
        const valor = a.texto.length === a.norm.length ? a.texto.slice(mc.indices![1][0], mc.indices![1][1]).trim() : mc[1];
        casos.push({ valor, cuerpo: bloque(r, finCaso, l, "FIN SEGÚN", op) });
      } else if (/^(?:DE\s+)?OTRO(?:\s+MODO|\s+CASO)?:?$/.test(a.norm)) {
        otro = bloque(r, finCaso, l, "FIN SEGÚN", op);
      } else {
        throw new Fallo(a.n, "Dentro de SEGÚN solo puede haber CASO valor: u OTRO:");
      }
    }
    return { t: "segun", expr: orig(m, 1), casos, otro, linea: n };
  }

  // asignación: variable <- expr  (también «=», «:=» y «←»)
  const a = texto.match(new RegExp(`^(${ID})\\s*(?:<-|←|:=|=)\\s*(.+)$`));
  if (a && !RESERVADAS.has(normalizar(a[1]))) return { t: "asignar", variable: a[1], expr: a[2].trim(), linea: n };

  // llamada a un subproceso: una palabra sola (se comprueba al final que exista)
  const ll = texto.match(new RegExp(`^(${ID})\\s*(?:\\(\\s*\\))?$`));
  if (ll && !RESERVADAS.has(normalizar(ll[1]))) return { t: "llamar", nombre: ll[1], linea: n };

  if (/^(FIN|HASTA|CASO|OTRO)\b|^SI NO$|^SINO$/.test(norm)) throw new Fallo(n, `«${texto}» no tiene su apertura (¿falta SI, MIENTRAS, REPETIR…?)`);
  if (op.libre) return { t: "accion", texto, linea: n };
  throw new Fallo(n, `No entiendo esta línea: «${texto}»`);
}

export function analizar(codigo: string, op: OpcionesAnalisis = {}): { programa: Programa | null; error: ErrorSintaxis | null } {
  const lineas: Linea[] = [];
  codigo.split(/\r?\n/).forEach((crudo, i) => {
    const texto = sinComentario(crudo).trim();
    if (texto) lineas.push({ n: i + 1, texto, norm: normalizar(texto) });
  });
  try {
    for (const l of lineas) {
      if (/[‹›]/.test(l.texto)) throw new Fallo(l.n, "Rellena los huecos ‹…› antes de continuar");
    }
    const r = new Lector(lineas);
    const subprocesos: Subproceso[] = [];
    let principal: Lista | null = null;
    const sueltas: Lista = [];

    while (!r.fin) {
      const l = r.actual!;
      if (/^SUBPROCESO\b/.test(l.norm)) {
        const ms = l.texto.match(new RegExp(`^\\S+\\s+(${ID})\\s*(?:\\(\\s*\\))?$`));
        if (!ms) throw new Fallo(l.n, "Después de SUBPROCESO va el nombre, sin espacios (por ejemplo: SUBPROCESO PrepararCafe)");
        r.avanzar();
        if (subprocesos.some((s) => normalizar(s.nombre) === normalizar(ms[1]))) throw new Fallo(l.n, `Ya existe un subproceso llamado «${ms[1]}»`);
        const cuerpo = bloque(r, (x) => fin(x, "SUBPROCESO"), l, "FIN SUBPROCESO", op);
        r.avanzar();
        subprocesos.push({ nombre: ms[1], cuerpo });
        continue;
      }
      if (l.norm === "INICIO") {
        if (principal) throw new Fallo(l.n, "Solo puede haber un INICIO … FIN");
        r.avanzar();
        principal = bloque(r, (x) => x === "FIN", l, "FIN", op);
        r.avanzar();
        continue;
      }
      // FIN suelto al final del texto (algoritmo sin INICIO)
      if (l.norm === "FIN" && !principal && sueltas.length) {
        r.avanzar();
        if (!r.fin) throw new Fallo(r.actual!.n, "Hay líneas después de FIN");
        continue;
      }
      r.avanzar();
      sueltas.push(sentencia(r, l, op));
    }

    if (principal && sueltas.length) throw new Fallo(sueltas[0].linea ?? 1, "Hay instrucciones fuera de INICIO … FIN");
    const programa: Programa = { cuerpo: principal ?? sueltas, subprocesos };

    // las llamadas deben apuntar a un subproceso (en modo libre, si no existe es una acción más)
    const existe = new Map(subprocesos.map((s) => [normalizar(s.nombre), s.nombre]));
    const listas = [programa.cuerpo, ...subprocesos.map((s) => s.cuerpo)];
    let fallo: Fallo | null = null;
    const reparar = (lista: Lista) => {
      lista.forEach((nodo, i) => {
        if (nodo.t === "llamar") {
          const nombre = existe.get(normalizar(nodo.nombre));
          if (nombre) nodo.nombre = nombre;
          else if (op.libre) lista[i] = { t: "accion", texto: nodo.nombre, linea: nodo.linea };
          else fallo ??= new Fallo(nodo.linea ?? 1, `No existe el subproceso «${nodo.nombre}» (¿está escrito igual que en SUBPROCESO?)`);
        }
        const sub: Lista[] =
          nodo.t === "si" ? [nodo.entonces, nodo.sino] :
          nodo.t === "mientras" || nodo.t === "repetir" || nodo.t === "para" ? [nodo.cuerpo] :
          nodo.t === "segun" ? [...nodo.casos.map((c) => c.cuerpo), nodo.otro] : [];
        sub.forEach(reparar);
      });
    };
    listas.forEach(reparar);
    if (fallo) throw fallo;
    return { programa, error: null };
  } catch (e) {
    if (e instanceof Fallo) return { programa: null, error: { linea: e.linea, mensaje: e.message } };
    throw e;
  }
}

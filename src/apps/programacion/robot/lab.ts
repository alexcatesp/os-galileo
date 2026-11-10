// Laboratorio del «Robot Galileo»: lógica pura del editor de mapas (sin DOM, para poder probarla en Node).
// El alumno edita solo el interior; los bordes de pared se añaden con `conBordes`.

export type Herramienta = "pared" | "suelo" | "moneda" | "meta" | "robot";

export const MIN_ANCHO = 3;
export const MAX_ANCHO = 14;
export const MIN_ALTO = 2;
export const MAX_ALTO = 10;

/** mapa con el que se abre el laboratorio por primera vez (interior, sin bordes) */
export const MAPA_INICIAL: string[] = [">..#....", ".#.#.##.", ".#...#o.", ".####.#.", "o.....oG"];

const ROBOTS = "^>v<";
const esRobot = (c: string) => ROBOTS.includes(c);

/** añade el marco de pared alrededor del interior */
export function conBordes(filas: string[]): string[] {
  const w = filas[0]?.length ?? 1;
  return ["#".repeat(w + 2), ...filas.map((f) => `#${f}#`), "#".repeat(w + 2)];
}

/** comprueba que el mapa es válido; devuelve el motivo si no lo es */
export function validar(filas: string[]): string | null {
  if (!filas.length || filas.length < MIN_ALTO || filas.length > MAX_ALTO) return `El mapa debe tener entre ${MIN_ALTO} y ${MAX_ALTO} filas.`;
  const w = filas[0].length;
  if (w < MIN_ANCHO || w > MAX_ANCHO) return `El mapa debe tener entre ${MIN_ANCHO} y ${MAX_ANCHO} columnas.`;
  let robots = 0;
  let metas = 0;
  for (const f of filas) {
    if (f.length !== w) return "Todas las filas deben medir lo mismo.";
    for (const c of f) {
      if (!"#.oG^>v<".includes(c)) return `Carácter no válido: «${c}». Usa # . o G ^ > v <`;
      if (esRobot(c)) robots++;
      if (c === "G") metas++;
    }
  }
  if (robots !== 1) return robots === 0 ? "Falta el robot (^ > v <)." : "Solo puede haber un robot.";
  if (metas > 1) return "Solo puede haber una meta (G).";
  return null;
}

const poner = (filas: string[], x: number, y: number, c: string): string[] => filas.map((f, j) => (j === y ? f.slice(0, x) + c + f.slice(x + 1) : f));
const quitar = (filas: string[], c: string): string[] => filas.map((f) => f.split(c).join("."));

/**
 * Aplica una herramienta a una casilla del interior y devuelve el mapa nuevo (o null si no cambia nada).
 * `arrastre` = se está pintando mientras se arrastra: pared, suelo y monedas se «ponen» sin alternar;
 * la meta y el robot solo se colocan con un clic.
 */
export function pintar(filas: string[], x: number, y: number, h: Herramienta, arrastre = false): string[] | null {
  const c = filas[y]?.[x];
  if (c === undefined) return null;
  switch (h) {
    case "pared":
      return esRobot(c) || c === "#" ? null : poner(filas, x, y, "#");
    case "suelo":
      return esRobot(c) || c === "." ? null : poner(filas, x, y, ".");
    case "moneda":
      if (esRobot(c)) return null;
      if (c === "o") return arrastre ? null : poner(filas, x, y, ".");
      return poner(filas, x, y, "o");
    case "meta":
      if (arrastre || esRobot(c)) return null;
      if (c === "G") return poner(filas, x, y, ".");
      return poner(quitar(filas, "G"), x, y, "G");
    case "robot": {
      if (arrastre) return null;
      if (esRobot(c)) return poner(filas, x, y, ROBOTS[(ROBOTS.indexOf(c) + 1) % 4]);
      const actual = filas.join("").match(/[\^>v<]/)?.[0] ?? ">";
      return poner(filas.map((f) => f.replace(/[\^>v<]/g, ".")), x, y, actual);
    }
  }
}

/** cambia el tamaño del interior (null si recortaría el robot o la meta, o se sale de los límites) */
export function redimensionar(filas: string[], ancho: number, alto: number): string[] | null {
  if (ancho < MIN_ANCHO || ancho > MAX_ANCHO || alto < MIN_ALTO || alto > MAX_ALTO) return null;
  const nuevas: string[] = [];
  for (let y = 0; y < alto; y++) {
    const f = filas[y] ?? "";
    nuevas.push(f.slice(0, ancho).padEnd(ancho, "."));
  }
  const antes = filas.join("").replace(/[^\^>v<G]/g, "").length;
  const despues = nuevas.join("").replace(/[^\^>v<G]/g, "").length;
  return antes === despues ? nuevas : null;
}

/** deja solo el robot en la esquina superior izquierda */
export function vaciar(filas: string[]): string[] {
  const w = filas[0].length;
  return filas.map((_, y) => (y === 0 ? ">" + ".".repeat(w - 1) : ".".repeat(w)));
}

/** convierte un texto pegado en un mapa (rellena con suelo las filas cortas) o devuelve el error */
export function desdeTexto(texto: string): { filas: string[] } | { error: string } {
  const lineas = texto.split(/\r?\n/).map((l) => l.replace(/\s+$/, ""));
  while (lineas.length && !lineas[0]) lineas.shift();
  while (lineas.length && !lineas[lineas.length - 1]) lineas.pop();
  if (!lineas.length) return { error: "El texto está vacío." };
  const w = Math.max(...lineas.map((l) => l.length));
  const filas = lineas.map((l) => l.padEnd(w, "."));
  const e = validar(filas);
  return e ? { error: e } : { filas };
}

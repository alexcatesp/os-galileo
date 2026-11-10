// Niveles del «Robot Galileo». Cada nivel es un dato: mapas, límite de instrucciones, bloques disponibles,
// pistas y solución. Un programa supera el nivel si resuelve TODOS sus mapas sin pasarse del límite.

import { ejecutar, type Ejecucion } from "./ejecutor";
import { compilar, contar, type Sent } from "./lenguaje";
import { crearMundo } from "./mundo";

export type BloqueId = "avanzar" | "girarIzquierda" | "girarDerecha" | "recoger" | "repetir" | "mientras" | "hacerMientras" | "si";

export interface Nivel {
  id: string;
  mundo: number;
  titulo: string;
  /** HTML breve: la situación */
  historia: string;
  objetivo: string;
  mapas: string[][];
  /** máximo de instrucciones (cada orden, bucle o condición cuenta 1; las llaves no) */
  limite: number;
  bloques: BloqueId[];
  sensores: string[];
  /** con qué vista empieza el alumno */
  modo: "bloques" | "java";
  pistas: [string, string];
  solucion: string;
  aprende: string;
  /** "predecir": no se programa; se lee `codigo` y se adivina qué hará (por defecto, "programar") */
  tipo?: "programar" | "predecir";
  codigo?: string;
  /** qué se le pregunta además de la casilla final */
  preguntas?: { monedas: boolean; error: boolean };
  /** resultado calculado a mano, para que `probar:robot` compruebe que el motor coincide */
  esperado?: { x: number; y: number; monedas: number; error: boolean };
  /** crea un mapa nuevo al azar de la familia del nivel (la solución de referencia lo resuelve siempre) */
  generar?: Generador;
}

export type Azar = () => number;
export type Generador = (azar: Azar) => string[];

/** sorteador con semilla (mulberry32): mismos números para la misma semilla */
export function azarConSemilla(semilla: number): Azar {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const entre = (z: Azar, a: number, b: number) => a + Math.floor(z() * (b - a + 1));

export interface MundoDef {
  n: number;
  nombre: string;
  emoji: string;
  lema: string;
}

export const MUNDOS: MundoDef[] = [
  { n: 1, nombre: "El pasillo", emoji: "🔁", lema: "for: sé cuántas veces" },
  { n: 2, nombre: "El laberinto", emoji: "🧭", lema: "while: miro y decido" },
  { n: 3, nombre: "La máquina", emoji: "⚙️", lema: "do..while: primero hago, luego miro" },
  { n: 4, nombre: "El almacén", emoji: "📦", lema: "todos juntos" },
];


// ---------------------------------------------------------------- generadores de mapas (tamaños que cambian)
const rejilla = (ancho: number, alto: number) => Array.from({ length: alto }, () => Array<string>(ancho).fill("#"));
const texto = (g: string[][]) => g.map((f) => f.join(""));

/** pasillo recto de `n` pasos desde el robot hasta la meta */
const pasillo = (n: number): string[] => ["#".repeat(n + 3), `#>${".".repeat(n - 1)}G#`, "#".repeat(n + 3)];

/** pasillo con una moneda en cada casilla (sin meta) */
const pasilloMonedas = (n: number): string[] => ["#".repeat(n + 3), `#>${"o".repeat(n)}#`, "#".repeat(n + 3)];

/** camino en L: `a` pasos al este, giro a la derecha y `b` pasos al sur hasta la meta */
function esquina(a: number, b: number): string[] {
  const g = rejilla(a + 3, b + 3);
  for (let x = 1; x <= 1 + a; x++) g[1][x] = ".";
  for (let y = 1; y <= 1 + b; y++) g[y][1 + a] = ".";
  g[1][1] = ">";
  g[1 + b][1 + a] = "G";
  return texto(g);
}

/** escalera de `n` escalones (avanzar, izquierda, avanzar, derecha) hasta la meta */
function escalera(n: number): string[] {
  const g = rejilla(n + 3, n + 3);
  for (let k = 0; k < n; k++) {
    g[n + 1 - k][1 + k] = ".";
    g[n + 1 - k][2 + k] = ".";
  }
  g[n + 1][1] = ">";
  g[1][n + 1] = "G";
  return texto(g);
}

/** caracol cuadrado: un único camino que gira siempre a la derecha y acaba en el centro */
function caracol(N: number): string[] {
  const g = rejilla(N, N);
  const dx = [1, 0, -1, 0];
  const dy = [0, 1, 0, -1];
  const dentro = (a: number, b: number) => a >= 1 && b >= 1 && a <= N - 2 && b <= N - 2;
  const abierta = (a: number, b: number) => dentro(a, b) && g[b][a] !== "#";
  let x = 1;
  let y = 1;
  let d = 0;
  g[1][1] = ">";
  const puede = () => {
    const qx = x + dx[d];
    const qy = y + dy[d];
    return dentro(qx, qy) && !abierta(qx, qy) && !abierta(qx + dx[d], qy + dy[d]);
  };
  let fallos = 0;
  for (;;) {
    if (puede()) {
      x += dx[d];
      y += dy[d];
      g[y][x] = ".";
      fallos = 0;
    } else {
      d = (d + 1) % 4;
      if (++fallos >= 2) break;
    }
  }
  g[y][x] = "G";
  return texto(g);
}

/** fila de `n` monedas empezando por la casilla del robot (n = 0: fila vacía) y una casilla libre al final */
const filaMonedas = (n: number): string[] => (n === 0 ? ["###", "#>#", "###"] : ["#".repeat(n + 3), `#>${"o".repeat(n - 1)}.#`, "#".repeat(n + 3), "!moneda"]);

/** pasillo con puertas a la derecha: el robot empieza en una puerta y la meta está en la siguiente, a `d` casillas */
function puertas(d: number): string[] {
  const g = rejilla(d + 6, 4);
  for (let x = 1; x <= d + 4; x++) g[1][x] = ".";
  g[1][1] = ">";
  g[2][1] = ".";
  g[2][1 + d] = "G";
  g[2][d + 3] = ".";
  return texto(g);
}

/** anillo de pasillo: el robot empieza (y la meta está) en la esquina superior izquierda */
function anillo(a: number, b: number, monedas: [number, number][] = []): string[] {
  const g = rejilla(a + 3, b + 3);
  for (let x = 1; x <= 1 + a; x++) g[1][x] = g[1 + b][x] = ".";
  for (let y = 1; y <= 1 + b; y++) g[y][1] = g[y][1 + a] = ".";
  g[1][1] = ">";
  for (const [x, y] of monedas) g[y][x] = "o";
  return [...texto(g), "!meta"];
}

/** sala vacía rodeada de pared, con el robot mirando al este en (x, y) */
function sala(ancho: number, alto: number, x: number, y: number): string[] {
  const g = rejilla(ancho, alto);
  for (let j = 1; j < alto - 1; j++) for (let i = 1; i < ancho - 1; i++) g[j][i] = ".";
  g[y][x] = ">";
  return texto(g);
}

/**
 * almacén: un pasillo central (columna 1) por el que sube el robot, con una estantería a la derecha cada dos
 * filas. `largos[i]` es la longitud de la estantería i (de abajo arriba). Tras la última quedan dos casillas
 * de pasillo. `hay(i, j)` decide si la casilla j de la estantería i tiene moneda (por defecto, todas).
 */
function almacen(largos: number[], hay: (i: number, j: number) => boolean = () => true): string[] {
  const k = largos.length;
  const H = 2 * k + 3;
  const g = rejilla(Math.max(...largos) + 3, H);
  for (let y = 1; y <= 2 * k + 1; y++) g[y][1] = ".";
  g[2 * k + 1][1] = "^";
  largos.forEach((largo, i) => {
    const y = 2 * k + 1 - 2 * i;
    for (let j = 0; j < largo; j++) g[y][2 + j] = hay(i, j) ? "o" : ".";
  });
  return texto(g);
}

export const NIVELES: Nivel[] = [
  {
    id: "p1",
    mundo: 1,
    titulo: "Siete casillas",
    historia: "Galileo acaba de despertar en el pasillo del instituto. La meta está al fondo y <b>no le dejan escribir siete veces la misma orden</b>.",
    objetivo: "Llega a la meta <b>🏁</b> usando como mucho 3 instrucciones.",
    mapas: [["##########", "#>......G#", "##########"]],
    limite: 3,
    bloques: ["avanzar", "repetir"],
    sensores: [],
    modo: "bloques",
    pistas: ["Para llegar hacen falta 7 pasos. Una instrucción <b>repetir</b> puede contener a <b>avanzar</b> y repetirla las veces que quieras.", "Pon un bloque «repetir» y mete dentro un «avanzar». Ajusta el número de veces a 7."],
    solucion: "for (int i = 0; i < 7; i++) {\n  avanzar();\n}",
    aprende: "<code>for (int i = 0; i &lt; 7; i++)</code> se lee: «empieza con <code>i = 0</code>; mientras <code>i &lt; 7</code>, haz el cuerpo y suma 1 a <code>i</code>». Vale 0, 1, 2… 6: siete vueltas.",
  },
  {
    id: "p2",
    mundo: 1,
    titulo: "El pasillo largo",
    historia: "Otro pasillo, mucho más largo. Si antes escribías 7 órdenes, ahora serían 14. Con el bucle solo cambia <b>un número</b>.",
    objetivo: "Llega a la meta con como mucho 3 instrucciones.",
    mapas: [["#################", "#>.............G#", "#################"]],
    limite: 3,
    bloques: ["avanzar", "repetir"],
    sensores: [],
    modo: "bloques",
    pistas: ["Cuenta las casillas entre el robot y la meta: ese es el número de vueltas.", "Son 14 casillas: repetir 14 veces avanzar."],
    solucion: "for (int i = 0; i < 14; i++) {\n  avanzar();\n}",
    aprende: "El cuerpo del bucle no cambia; solo cambia el <b>número de vueltas</b>. Si te pasas, el robot choca; si te quedas corto, no llega.",
  },
  {
    id: "p3",
    mundo: 1,
    titulo: "Monedas en fila",
    historia: "Hay una moneda en cada casilla del pasillo. El robot debe <b>recogerlas todas</b> y no tiene sitio para tantas órdenes.",
    objetivo: "Recoge las 6 monedas <b>💰</b> con como mucho 4 instrucciones.",
    mapas: [["#########", "#>oooooo#", "#########"]],
    limite: 4,
    bloques: ["avanzar", "recoger", "repetir"],
    sensores: [],
    modo: "bloques",
    pistas: ["Fíjate en el patrón: avanzar, recoger, avanzar, recoger… Ese <b>par</b> es lo que se repite.", "Mete dos bloques dentro del repetir: avanzar y recoger. Son 6 monedas, 6 vueltas."],
    solucion: "for (int i = 0; i < 6; i++) {\n  avanzar();\n  recoger();\n}",
    aprende: "El cuerpo de un bucle puede tener <b>varias órdenes</b>: se repiten todas, en orden, en cada vuelta.",
  },
  {
    id: "p4",
    mundo: 1,
    titulo: "La escalera",
    historia: "Para subir la escalera hay que <b>avanzar, girar, avanzar y volver a girar</b>, una y otra vez. Busca el patrón.",
    objetivo: "Sube hasta la meta con como mucho 6 instrucciones.",
    mapas: [["#######", "#####G#", "####..#", "###..##", "##..###", "#>.####", "#######"]],
    limite: 6,
    bloques: ["avanzar", "girarIzquierda", "girarDerecha", "repetir"],
    sensores: [],
    modo: "bloques",
    pistas: ["Un escalón es: avanzar al este, girar a la izquierda, avanzar al norte, girar a la derecha. ¿Cuántos escalones hay?", "Repite 4 veces: avanzar, girarIzquierda, avanzar, girarDerecha."],
    solucion: "for (int i = 0; i < 4; i++) {\n  avanzar();\n  girarIzquierda();\n  avanzar();\n  girarDerecha();\n}",
    aprende: "Descubrir el <b>patrón que se repite</b> es el primer paso para diseñar un bucle: ¿qué grupo de órdenes se repite y cuántas veces?",
  },
  {
    id: "p5",
    mundo: 1,
    titulo: "El huerto",
    historia: "Una moneda cada dos casillas. Ahora el patrón tiene <b>tres</b> órdenes. Este nivel lo escribes tú en Java (también puedes volver a los bloques).",
    objetivo: "Recoge las 5 monedas con como mucho 5 instrucciones.",
    mapas: [["#############", "#>.o.o.o.o.o#", "#############"]],
    limite: 5,
    bloques: ["avanzar", "recoger", "repetir"],
    sensores: [],
    modo: "java",
    pistas: ["El patrón es: avanzar, avanzar, recoger. Son 5 monedas.", "for (int i = 0; i < 5; i++) { avanzar(); avanzar(); recoger(); }"],
    solucion: "for (int i = 0; i < 5; i++) {\n  avanzar();\n  avanzar();\n  recoger();\n}",
    aprende: "Cuidado con el <b>off-by-one</b>: <code>i &lt; 5</code> da 5 vueltas, <code>i &lt;= 5</code> daría 6 y el robot chocaría. Mira siempre cuántas vueltas dará.",
  },
  {
    id: "p6",
    mundo: 1,
    titulo: "Tres lados",
    historia: "El camino da dos giros: tres lados de un cuadrado. Cada lado es <b>avanzar tres veces y girar</b>. ¡Hasta un bucle puede ir dentro de otro!",
    objetivo: "Llega a la meta con como mucho 6 instrucciones.",
    mapas: [["######", "#>...#", "####.#", "####.#", "#G...#", "######"]],
    limite: 6,
    bloques: ["avanzar", "girarDerecha", "girarIzquierda", "repetir"],
    sensores: [],
    modo: "java",
    pistas: ["Cada lado: avanzar 3 veces y girar a la derecha. Son 3 lados.", "for (int i = 0; i < 3; i++) { avanzar(); avanzar(); avanzar(); girarDerecha(); }  (o un for dentro de otro)"],
    solucion: "for (int i = 0; i < 3; i++) {\n  for (int j = 0; j < 3; j++) {\n    avanzar();\n  }\n  girarDerecha();\n}",
    aprende: "Un bucle dentro de otro: el de fuera cuenta los <b>lados</b>, el de dentro cuenta los <b>pasos de cada lado</b>. Se usa <code>j</code> para no repetir el nombre <code>i</code>.",
  },
  {
    id: "r1",
    mundo: 1,
    tipo: "predecir",
    titulo: "¿Cuántas vueltas?",
    historia: "Aquí no programas: <b>lees</b>. Este código usa <code>i += 2</code> en lugar del habitual <code>i++</code>. Antes de ejecutarlo, predice dónde acabará el robot y cuántas monedas recogerá.",
    objetivo: "Haz clic en la casilla donde acabará el robot y escribe cuántas monedas recogerá.",
    mapas: [["##############", "#>.o.o.o.o.o.#", "##############"]],
    codigo: "for (int i = 0; i < 7; i += 2) {\n  avanzar();\n  avanzar();\n  recoger();\n}",
    preguntas: { monedas: true, error: false },
    esperado: { x: 9, y: 1, monedas: 4, error: false },
    limite: 0,
    bloques: [],
    sensores: [],
    modo: "java",
    pistas: ["Escribe en un papel los valores de <code>i</code> en cada vuelta: empieza en 0, suma 2 y el bucle sigue mientras <code>i &lt; 7</code>.", "i vale 0, 2, 4 y 6 (el siguiente, 8, ya no cumple i &lt; 7). Son 4 vueltas, y cada vuelta avanza 2 casillas."],
    solucion: "i = 0, 2, 4, 6 → 4 vueltas × 2 casillas = 8 casillas; recoge 4 monedas.",
    aprende: "Para saber cuántas vueltas da un <code>for</code>, escribe los valores de <code>i</code>: aquí 0, 2, 4, 6 (el 8 ya no cumple <code>i &lt; 7</code>): <b>4 vueltas</b>, no 7 ni 3. El paso del <code>for</code> manda.",
  },

  // ---------------------------------------------------------------- mundo 2: el laberinto (while)
  {
    id: "l1",
    mundo: 2,
    titulo: "Hasta la pared",
    historia: "Tres pasillos de <b>longitudes distintas</b> y un solo programa para los tres. Un <code>for</code> con un número fijo servirá en uno y fallará en los otros: ahora el robot tiene que <b>mirar</b>.",
    objetivo: "Llega a la meta en los 3 pasillos con como mucho 3 instrucciones.",
    mapas: [pasillo(4), pasillo(9), pasillo(6)],
    limite: 3,
    bloques: ["avanzar", "mientras", "repetir"],
    sensores: ["hayPared", "enMeta"],
    modo: "bloques",
    pistas: ["No puedes contar los pasos de antemano: miden distinto. El robot tiene un sensor, <code>hayPared()</code>, que dice si hay una pared justo delante.", "Pon un «mientras» con la condición <code>!hayPared()</code> (no hay pared) y dentro un «avanzar»."],
    solucion: "while (!hayPared()) {\n  avanzar();\n}",
    aprende: "<code>while</code> repite <b>mientras</b> se cumpla la condición y la comprueba <b>antes</b> de cada vuelta. No hace falta saber cuántas veces: lo decide el sensor. Si la condición es falsa desde el principio, el cuerpo no se ejecuta ni una vez.",
  },
  {
    id: "l2",
    mundo: 2,
    titulo: "Monedas hasta el final",
    historia: "Cada casilla del pasillo tiene una moneda, pero cada pasillo tiene una longitud. Recoge todas sin saber cuántas hay.",
    objetivo: "Recoge todas las monedas en los 3 pasillos con como mucho 4 instrucciones.",
    mapas: [pasilloMonedas(5), pasilloMonedas(8), pasilloMonedas(3)],
    limite: 4,
    bloques: ["avanzar", "recoger", "mientras", "repetir"],
    sensores: ["hayPared"],
    modo: "bloques",
    pistas: ["El patrón es el de siempre (avanzar y recoger), pero ahora se repite hasta que se acaba el pasillo.", "mientras !hayPared(): avanzar y recoger. Al llegar a la última moneda ya habrá pared delante y el bucle acabará."],
    solucion: "while (!hayPared()) {\n  avanzar();\n  recoger();\n}",
    aprende: "El cuerpo del <code>while</code> puede tener varias órdenes. La condición se vuelve a mirar <b>al terminar cada vuelta completa</b>, no entre una orden y otra.",
  },
  {
    id: "l3",
    mundo: 2,
    titulo: "Monedas sueltas",
    historia: "Ahora hay monedas solo en algunas casillas, y recoger donde no hay nada es un error. El robot debe <b>mirar antes de recoger</b>. Ojo con la última casilla.",
    objetivo: "Recoge todas las monedas en los 3 pasillos con como mucho 6 instrucciones.",
    mapas: [["#########", "#>.o.o.o#", "#########"], ["###########", "#>o..o.oo.#", "###########"], ["#######", "#>..o.#", "#######"], ["########", "#>o.o.o#", "########"]],
    limite: 6,
    bloques: ["avanzar", "recoger", "mientras", "si", "repetir"],
    sensores: ["hayPared", "hayMoneda"],
    modo: "bloques",
    pistas: ["El bucle recorre el pasillo y un «si hayMoneda()» decide si recoger. Piensa en el <b>orden</b>: ¿qué pasa con la moneda de la última casilla?", "mientras !hayPared(): avanzar y, después, si hayMoneda(): recoger. Así miras la casilla justo después de llegar a ella."],
    solucion: "while (!hayPared()) {\n  avanzar();\n  if (hayMoneda()) {\n    recoger();\n  }\n}",
    aprende: "Un bucle y un <code>if</code> juntos: el bucle recorre y el <code>if</code> decide. El <b>orden</b> importa: si miras la moneda <i>antes</i> de avanzar, te dejas la de la última casilla (el bucle acaba al llegar a la pared).",
  },
  {
    id: "l4",
    mundo: 2,
    titulo: "La esquina",
    historia: "El camino sigue recto hasta una pared, gira a la derecha y sigue hasta la meta, pero <b>cada pasillo tiene tramos de longitud distinta</b>. Hacen falta dos bucles uno detrás de otro.",
    objetivo: "Llega a la meta en los 3 mapas con como mucho 5 instrucciones.",
    mapas: [esquina(4, 3), esquina(7, 2), esquina(2, 6)],
    limite: 5,
    bloques: ["avanzar", "girarDerecha", "girarIzquierda", "mientras", "repetir"],
    sensores: ["hayPared", "enMeta"],
    modo: "bloques",
    pistas: ["El tramo de antes del giro es «avanzar hasta la pared», y el de después también. ¿Qué va entre los dos?", "mientras !hayPared(): avanzar · girarDerecha · mientras !hayPared(): avanzar."],
    solucion: "while (!hayPared()) {\n  avanzar();\n}\ngirarDerecha();\nwhile (!hayPared()) {\n  avanzar();\n}",
    aprende: "Los bucles se pueden <b>encadenar</b>: cada uno hace su tramo. La condición es siempre la misma, pero el robot está en un sitio distinto cuando la comprueba.",
  },
  {
    id: "l5",
    mundo: 2,
    titulo: "La escalera interminable",
    historia: "Una escalera con un número de escalones desconocido. Ya no hay una pared que avise: lo único que sabes es <b>si has llegado a la meta</b>. Este nivel lo escribes en Java.",
    objetivo: "Sube hasta la meta en las 3 escaleras con como mucho 6 instrucciones.",
    mapas: [escalera(3), escalera(5), escalera(4)],
    limite: 6,
    bloques: ["avanzar", "girarIzquierda", "girarDerecha", "mientras", "repetir"],
    sensores: ["enMeta", "hayPared"],
    modo: "java",
    pistas: ["Un escalón es lo de siempre: avanzar, girar a la izquierda, avanzar, girar a la derecha. ¿Hasta cuándo? Hasta que <code>enMeta()</code> sea verdadero.", "while (!enMeta()) { avanzar(); girarIzquierda(); avanzar(); girarDerecha(); }"],
    solucion: "while (!enMeta()) {\n  avanzar();\n  girarIzquierda();\n  avanzar();\n  girarDerecha();\n}",
    aprende: "El bucle no cuenta escalones: <b>pregunta si ha llegado</b>. La condición puede ser cualquier sensor, no solo la pared. Elegir bien la condición de parada es la mitad del diseño de un <code>while</code>.",
  },
  {
    id: "l6",
    mundo: 2,
    titulo: "El caracol",
    historia: "Un camino en espiral que gira siempre a la derecha y termina en el centro. No sabes cuántas vueltas da. En cada paso el robot debe <b>decidir qué hacer según lo que ve</b>.",
    objetivo: "Llega al centro en los 3 caracoles con como mucho 6 instrucciones.",
    mapas: [caracol(7), caracol(9), caracol(8)],
    limite: 6,
    bloques: ["avanzar", "girarDerecha", "girarIzquierda", "mientras", "si"],
    sensores: ["hayPared", "enMeta", "hayParedDerecha", "hayParedIzquierda"],
    modo: "java",
    pistas: ["Repite hasta llegar a la meta. En cada vuelta solo hay dos casos: si hay pared delante, toca girar; si no, toca avanzar.", "while (!enMeta()) { if (hayPared()) { girarDerecha(); } else { avanzar(); } }"],
    solucion: "while (!enMeta()) {\n  if (hayPared()) {\n    girarDerecha();\n  } else {\n    avanzar();\n  }\n}",
    aprende: "Un <code>if … else</code> dentro de un <code>while</code>: el bucle repite y el <code>if</code> decide qué hacer en cada vuelta. Es la receta de muchos robots reales para seguir una pared.",
  },
  {
    id: "r2",
    mundo: 2,
    tipo: "predecir",
    titulo: "La moneda de la última casilla",
    historia: "Este programa recorre el pasillo mirando <b>antes</b> de avanzar. Parece correcto… ¿lo es? Predice qué hará antes de ejecutarlo.",
    objetivo: "Haz clic en la casilla donde acabará el robot y escribe cuántas monedas recogerá.",
    mapas: [["#########", "#>o.oo.o#", "#########"]],
    codigo: "while (!hayPared()) {\n  if (hayMoneda()) {\n    recoger();\n  }\n  avanzar();\n}",
    preguntas: { monedas: true, error: false },
    esperado: { x: 7, y: 1, monedas: 3, error: false },
    limite: 0,
    bloques: [],
    sensores: [],
    modo: "java",
    pistas: ["Sigue al robot casilla a casilla. En cada vuelta primero mira si hay moneda y <b>luego</b> avanza. ¿En qué momento deja de cumplirse <code>!hayPared()</code>?", "Cuando el robot llega a la última casilla ya tiene la pared delante, así que el bucle termina <b>sin mirar</b> esa casilla."],
    solucion: "Acaba en la última casilla y recoge 3 monedas: la de la última casilla se queda.",
    aprende: "El bucle comprueba <code>hayPared()</code> al empezar cada vuelta: al llegar a la última casilla ya hay pared, el bucle acaba y <b>la moneda de esa casilla se queda sin recoger</b>. Es el fallo de «mirar antes de avanzar»; se arregla avanzando primero o con un <code>if</code> después del bucle.",
  },

  // ---------------------------------------------------------------- mundo 3: la máquina (do..while)
  {
    id: "m1",
    mundo: 3,
    titulo: "¿Y si no hay ninguna?",
    historia: "Galileo está sobre la primera moneda de una fila. Pero ojo: <b>a veces la fila está vacía</b> y entonces no debe hacer nada. Aquí vas a ver cuándo un <code>do…while</code> es mala idea.",
    objetivo: "Recoge todas las monedas en los 3 mapas (¡uno está vacío!) con como mucho 4 instrucciones.",
    mapas: [filaMonedas(4), filaMonedas(0), filaMonedas(7)],
    limite: 4,
    bloques: ["avanzar", "recoger", "mientras", "hacerMientras"],
    sensores: ["hayMoneda", "hayPared"],
    modo: "bloques",
    pistas: ["En el mapa vacío el robot no debe hacer nada: tiene que <b>preguntar primero</b> «¿hay moneda?» y solo si la hay, actuar. Cuidado: el bloque «mientras» empieza con «no», quítalo.", "mientras hayMoneda(): recoger y avanzar. Después de la última moneda hay una casilla libre."],
    solucion: "while (hayMoneda()) {\n  recoger();\n  avanzar();\n}",
    aprende: "El <code>while</code> mira <b>antes</b>, así que puede no ejecutar el cuerpo ni una vez. Un <code>do…while</code> aquí fallaría en el mapa vacío: actúa primero (<code>recoger()</code> sin moneda) y mira después.",
  },
  {
    id: "m2",
    mundo: 3,
    titulo: "La próxima puerta",
    historia: "En el pasillo hay puertas a la derecha. Galileo está justo <b>en una de ellas</b> y debe entrar por la <b>siguiente</b>, que es la de la meta. Hay otra puerta más allá que no sirve.",
    objetivo: "Llega a la meta en los 3 pasillos con como mucho 4 instrucciones.",
    mapas: [puertas(3), puertas(6), puertas(2)],
    limite: 4,
    bloques: ["avanzar", "girarDerecha", "girarIzquierda", "mientras", "hacerMientras"],
    sensores: ["hayParedDerecha", "hayPared"],
    modo: "bloques",
    pistas: ["Ahora mismo no hay pared a tu derecha (estás en una puerta). Si miras antes de avanzar, el bucle no arranca. Avanza primero y luego mira.", "hacer { avanzar } mientras hayParedDerecha(); después girarDerecha y avanzar."],
    solucion: "do {\n  avanzar();\n} while (hayParedDerecha());\ngirarDerecha();\navanzar();",
    aprende: "Misma idea con otro sensor: el <code>do…while</code> sirve para «salir de donde estoy y buscar la siguiente». Si la condición ya se cumple al empezar, el <code>while</code> normal no daría ni un paso.",
  },
  {
    id: "m3",
    mundo: 3,
    titulo: "La ronda",
    historia: "El vigilante empieza su ronda sobre la meta y debe <b>recorrer todo el pasillo en anillo hasta volver a ella</b>. Como ya está en la meta, un <code>while (!enMeta())</code> no se movería. Este nivel lo escribes en Java.",
    objetivo: "Recorre todo el anillo y vuelve al punto de partida, en los 3 mapas, con como mucho 6 instrucciones.",
    mapas: [anillo(4, 3), anillo(6, 2), anillo(3, 5)],
    limite: 6,
    bloques: ["avanzar", "girarDerecha", "girarIzquierda", "mientras", "hacerMientras", "si"],
    sensores: ["enMeta", "hayPared"],
    modo: "java",
    pistas: ["Al empezar ya estás en la meta, así que hay que moverse primero y comprobar después. En cada vuelta solo hay dos casos: si hay pared delante, gira; si no, avanza.", "do { if (hayPared()) { girarDerecha(); } else { avanzar(); } } while (!enMeta());"],
    solucion: "do {\n  if (hayPared()) {\n    girarDerecha();\n  } else {\n    avanzar();\n  }\n} while (!enMeta());",
    aprende: "«Repetir hasta volver al punto de partida» es el caso clásico del <code>do…while</code>: el punto de partida cumple la condición de parada <i>desde el principio</i>, pero todavía no has dado la vuelta.",
  },
  {
    id: "m4",
    mundo: 3,
    titulo: "La ronda con monedas",
    historia: "El anillo tiene ahora monedas repartidas por el camino. Durante la ronda, el vigilante debe <b>recogerlas todas</b>.",
    objetivo: "Da la vuelta completa y recoge todas las monedas en los 3 mapas con como mucho 7 instrucciones.",
    mapas: [
      anillo(4, 3, [[3, 1], [5, 2], [2, 4]]),
      anillo(6, 2, [[2, 1], [7, 1], [7, 3], [4, 3]]),
      anillo(3, 5, [[4, 1], [4, 3], [1, 3]]),
    ],
    limite: 7,
    bloques: ["avanzar", "girarDerecha", "girarIzquierda", "recoger", "mientras", "hacerMientras", "si"],
    sensores: ["enMeta", "hayPared", "hayMoneda"],
    modo: "java",
    pistas: ["Es la ronda de antes, pero en cada vuelta además hay que preguntar si hay moneda en la casilla donde estás.", "do { if (hayMoneda()) { recoger(); } if (hayPared()) { girarDerecha(); } else { avanzar(); } } while (!enMeta());"],
    solucion: "do {\n  if (hayMoneda()) {\n    recoger();\n  }\n  if (hayPared()) {\n    girarDerecha();\n  } else {\n    avanzar();\n  }\n} while (!enMeta());",
    aprende: "Un solo bucle puede ocuparse de varias cosas en cada vuelta: recoger, girar o avanzar. Cada <code>if</code> es una pregunta distinta sobre lo que ve el robot.",
  },
  {
    id: "r3",
    mundo: 3,
    tipo: "predecir",
    titulo: "Actúa primero, mira después",
    historia: "Un <code>do…while</code> parecía la solución para recoger la fila de monedas. Pero el robot empieza en una casilla <b>vacía</b>. Predice qué le pasa.",
    objetivo: "Haz clic en la casilla donde acabará el robot, di cuántas monedas recogerá y si el programa terminará con un error.",
    mapas: [["#######", "#>.oo.#", "#######"]],
    codigo: "do {\n  recoger();\n  avanzar();\n} while (hayMoneda());",
    preguntas: { monedas: true, error: true },
    esperado: { x: 1, y: 1, monedas: 0, error: true },
    limite: 0,
    bloques: [],
    sensores: [],
    modo: "java",
    pistas: ["En un <code>do…while</code> el cuerpo se ejecuta <b>siempre una vez</b> antes de mirar la condición. ¿Qué es lo primero que hace el cuerpo?", "Lo primero es <code>recoger()</code>, y en la casilla de salida no hay ninguna moneda: el programa falla ahí."],
    solucion: "Error en la primera vuelta: el robot no se mueve de su casilla y recoge 0 monedas.",
    aprende: "El <code>do…while</code> ejecuta el cuerpo <b>antes</b> de mirar la condición. Aquí intenta <code>recoger()</code> en una casilla vacía y el programa falla antes de llegar a comprobar nada. Con un <code>while</code> normal no habría pasado nada malo.",
  },

  // ---------------------------------------------------------------- mundo 4: el almacén (bucles anidados)
  {
    id: "a1",
    mundo: 4,
    titulo: "Tres estanterías",
    historia: "El almacén tiene un pasillo central y <b>tres estanterías</b> a la derecha, cada una de 3 casillas con monedas. Por cada estantería: entrar recogiendo, dar la vuelta, salir y subir a la siguiente. <b>Un bucle dentro de otro.</b>",
    objetivo: "Recoge las 9 monedas con como mucho 13 instrucciones. El robot empieza mirando al norte, en la primera estantería.",
    mapas: [almacen([3, 3, 3])],
    limite: 13,
    bloques: ["avanzar", "girarDerecha", "girarIzquierda", "recoger", "repetir"],
    sensores: [],
    modo: "bloques",
    pistas: ["Por cada estantería haces lo mismo, así que hay un bucle exterior de 3 vueltas. Y dentro de cada estantería, «avanzar y recoger» se repite 3 veces: otro bucle, <b>dentro</b> del primero.", "repetir 3 { girarDerecha · repetir 3 {avanzar, recoger} · girarDerecha · girarDerecha · repetir 3 {avanzar} · girarDerecha · avanzar · avanzar }"],
    solucion: "for (int i = 0; i < 3; i++) {\n  girarDerecha();\n  for (int j = 0; j < 3; j++) {\n    avanzar();\n    recoger();\n  }\n  girarDerecha();\n  girarDerecha();\n  for (int j = 0; j < 3; j++) {\n    avanzar();\n  }\n  girarDerecha();\n  avanzar();\n  avanzar();\n}",
    aprende: "El bucle de fuera cuenta <b>estanterías</b>; los de dentro cuentan <b>casillas</b>. Por cada vuelta del exterior, el interior da todas las suyas: 3 × 3 = 9 veces «avanzar y recoger». Sin bucles harían falta 45 instrucciones.",
  },
  {
    id: "a2",
    mundo: 4,
    titulo: "Estanterías desiguales",
    historia: "Siguen siendo tres estanterías, pero <b>cada una mide distinto</b> y cada almacén es diferente. El bucle de dentro ya no puede contar: tiene que preguntar.",
    objetivo: "Recoge todas las monedas en los 3 almacenes con como mucho 13 instrucciones.",
    mapas: [almacen([3, 1, 4]), almacen([2, 4, 2]), almacen([5, 2, 3])],
    limite: 13,
    bloques: ["avanzar", "girarDerecha", "girarIzquierda", "recoger", "repetir", "mientras"],
    sensores: ["hayPared"],
    modo: "bloques",
    pistas: ["Mantén el bucle de fuera (3 estanterías), pero cambia los de dentro: «avanzar y recoger» y «volver» ya no se repiten un número fijo de veces, sino <b>hasta topar con la pared</b>.", "repetir 3 { girarDerecha · mientras !hayPared() {avanzar, recoger} · girarDerecha · girarDerecha · mientras !hayPared() {avanzar} · girarDerecha · avanzar · avanzar }"],
    solucion: "for (int i = 0; i < 3; i++) {\n  girarDerecha();\n  while (!hayPared()) {\n    avanzar();\n    recoger();\n  }\n  girarDerecha();\n  girarDerecha();\n  while (!hayPared()) {\n    avanzar();\n  }\n  girarDerecha();\n  avanzar();\n  avanzar();\n}",
    aprende: "Un <code>for</code> puede contener <code>while</code>: el exterior sabe cuántas veces (3 estanterías) y el interior se adapta a lo que ve (el largo de cada una). Se mezclan según lo que sepas de antemano.",
  },
  {
    id: "a3",
    mundo: 4,
    titulo: "El almacén sin planos",
    historia: "Ahora tampoco sabes <b>cuántas estanterías hay</b>. Cuando el robot llega al final del pasillo central, no queda ninguna más. Dos <code>while</code> anidados. Este nivel lo escribes en Java.",
    objetivo: "Recoge todas las monedas en los 3 almacenes con como mucho 13 instrucciones.",
    mapas: [almacen([3, 1]), almacen([2, 4, 3, 1]), almacen([4, 2, 5])],
    limite: 13,
    bloques: ["avanzar", "girarDerecha", "girarIzquierda", "recoger", "repetir", "mientras"],
    sensores: ["hayPared"],
    modo: "java",
    pistas: ["El bucle de fuera también pregunta: «mientras no haya pared delante» (en el pasillo central, mirando al norte). Tras la última estantería, el robot sube dos casillas y llega al final del pasillo.", "while (!hayPared()) { girarDerecha(); while (!hayPared()) { avanzar(); recoger(); } girarDerecha(); girarDerecha(); while (!hayPared()) { avanzar(); } girarDerecha(); avanzar(); avanzar(); }"],
    solucion: "while (!hayPared()) {\n  girarDerecha();\n  while (!hayPared()) {\n    avanzar();\n    recoger();\n  }\n  girarDerecha();\n  girarDerecha();\n  while (!hayPared()) {\n    avanzar();\n  }\n  girarDerecha();\n  avanzar();\n  avanzar();\n}",
    aprende: "La misma pregunta, <code>!hayPared()</code>, sirve para dos cosas distintas según <b>hacia dónde mira</b> el robot: en el pasillo central decide si queda otra estantería; dentro de una, si queda otra casilla.",
  },
  {
    id: "a4",
    mundo: 4,
    titulo: "Paquetes sueltos",
    historia: "Las estanterías no están llenas: hay <b>huecos</b>, y recoger donde no hay nada es un error. Tres estructuras a la vez: un bucle para las estanterías, otro para las casillas y un <code>if</code> para decidir si recoger.",
    objetivo: "Recoge todas las monedas en los 3 almacenes con como mucho 14 instrucciones.",
    mapas: [almacen([4, 3, 5], (i, j) => (i + j) % 2 === 0), almacen([3, 5], (i, j) => j % 2 === 1 || (i === 0 && j === 0)), almacen([2, 4, 3, 5], (i, j) => (i * 2 + j) % 3 === 0)],
    limite: 14,
    bloques: ["avanzar", "girarDerecha", "girarIzquierda", "recoger", "repetir", "mientras", "si"],
    sensores: ["hayPared", "hayMoneda"],
    modo: "java",
    pistas: ["Parte del nivel anterior: el recorrido es el mismo. Lo único que cambia es que, al llegar a cada casilla de la estantería, hay que mirar si hay moneda antes de recoger.", "Dentro del bucle de la ida: avanzar(); if (hayMoneda()) { recoger(); }"],
    solucion: "while (!hayPared()) {\n  girarDerecha();\n  while (!hayPared()) {\n    avanzar();\n    if (hayMoneda()) {\n      recoger();\n    }\n  }\n  girarDerecha();\n  girarDerecha();\n  while (!hayPared()) {\n    avanzar();\n  }\n  girarDerecha();\n  avanzar();\n  avanzar();\n}",
    aprende: "Así se construyen los programas grandes: <b>de dentro hacia fuera</b>. Primero la decisión de una casilla (<code>if</code>), luego recorrer una estantería (<code>while</code>) y por último recorrer el almacén (otro <code>while</code>). Cada nivel de sangría es una pregunta distinta.",
  },
  {
    id: "r4",
    mundo: 4,
    tipo: "predecir",
    titulo: "El caracol de i",
    historia: "El bucle de dentro cuenta hasta <code>i</code>, así que <b>cada vuelta del de fuera avanza más</b>. Traza el recorrido en un papel y predice dónde acabará el robot (empieza mirando al este).",
    objetivo: "Haz clic en la casilla donde acabará el robot.",
    mapas: [sala(8, 8, 3, 2)],
    codigo: "for (int i = 0; i < 3; i++) {\n  for (int j = 0; j <= i; j++) {\n    avanzar();\n  }\n  girarDerecha();\n}",
    preguntas: { monedas: false, error: false },
    esperado: { x: 1, y: 4, monedas: 0, error: false },
    limite: 0,
    bloques: [],
    sensores: [],
    modo: "java",
    pistas: ["Haz una tabla con i, el número de pasos del bucle de dentro (j va de 0 hasta i, inclusive) y hacia dónde mira el robot después de cada giro.", "i = 0: 1 paso al este · i = 1: 2 pasos al sur · i = 2: 3 pasos al oeste. Cada tramo sale de donde acabó el anterior."],
    solucion: "1 paso al este, 2 al sur y 3 al oeste: acaba 2 casillas a la izquierda de donde empezó y 2 más abajo.",
    aprende: "Con bucles anidados, el de dentro se repite completo en cada vuelta del de fuera y aquí su número de vueltas depende de <code>i</code> (<code>j &lt;= i</code>: 1, 2 y 3 pasos). La forma segura de trazarlo es una tabla con <code>i</code>, <code>j</code> y la posición.",
  },
];

// ---------------------------------------------------------------- mapas al azar («🎲 Mapas nuevos»)
/** pasillo de `n` casillas libres tras el robot, con moneda al azar en cada una (siempre alguna) */
function pasilloSuelto(z: Azar, n: number, p: number): string[] {
  const celdas = Array.from({ length: n }, () => (z() < p ? "o" : "."));
  if (!celdas.includes("o")) celdas[entre(z, 0, n - 1)] = "o";
  return ["#".repeat(n + 3), `#>${celdas.join("")}#`, "#".repeat(n + 3)];
}

/** anillo con monedas al azar en sus casillas (menos la de salida) */
function anilloSuelto(z: Azar, a: number, b: number): string[] {
  const celdas: [number, number][] = [];
  for (let x = 1; x <= 1 + a; x++) for (const y of [1, 1 + b]) if (!(x === 1 && y === 1)) celdas.push([x, y]);
  for (let y = 2; y < 1 + b; y++) for (const x of [1, 1 + a]) celdas.push([x, y]);
  const monedas = celdas.filter(() => z() < 0.4);
  if (!monedas.length) monedas.push(celdas[entre(z, 0, celdas.length - 1)]);
  return anillo(a, b, monedas);
}

/** almacén al azar: `k` estanterías de 1 a 5 casillas, con monedas en todas o repartidas */
function almacenSuelto(z: Azar, k: number, p: number): string[] {
  const largos = Array.from({ length: k }, () => entre(z, 1, 5));
  const llenas = largos.map((l) => Array.from({ length: l }, () => z() < p));
  if (!llenas.some((f) => f.some(Boolean))) llenas[0][0] = true;
  return almacen(largos, (i, j) => llenas[i][j]);
}

const GENERADORES: Record<string, Generador> = {
  l1: (z) => pasillo(entre(z, 2, 12)),
  l2: (z) => pasilloMonedas(entre(z, 1, 10)),
  l3: (z) => pasilloSuelto(z, entre(z, 3, 10), 0.5),
  l4: (z) => esquina(entre(z, 1, 8), entre(z, 1, 8)),
  l5: (z) => escalera(entre(z, 2, 7)),
  l6: (z) => caracol(entre(z, 5, 11)),
  m1: (z) => filaMonedas(entre(z, 0, 8)),
  m2: (z) => puertas(entre(z, 1, 7)),
  m3: (z) => anillo(entre(z, 2, 7), entre(z, 2, 5)),
  m4: (z) => anilloSuelto(z, entre(z, 2, 7), entre(z, 2, 5)),
  a2: (z) => almacenSuelto(z, 3, 1.1),
  a3: (z) => almacenSuelto(z, entre(z, 1, 4), 1.1),
  a4: (z) => almacenSuelto(z, entre(z, 1, 4), 0.5),
};
for (const n of NIVELES) n.generar = GENERADORES[n.id];

// ---------------------------------------------------------------- evaluación
export interface ResultadoMapa {
  ok: boolean;
  motivo: string;
  ejecucion: Ejecucion;
}

export interface Veredicto {
  mapas: ResultadoMapa[];
  instrucciones: number;
  dentroDelLimite: boolean;
  superado: boolean;
}

export function evaluar(nivel: Nivel, prog: Sent[]): Veredicto {
  const mapas = nivel.mapas.map((filas) => {
    const mundo = crearMundo(filas);
    const ejecucion = ejecutar(prog, mundo);
    const f = ejecucion.final;
    let motivo = "";
    if (ejecucion.error) motivo = ejecucion.error.mensaje;
    else if (f.monedas.length) motivo = `Quedan ${f.monedas.length} moneda${f.monedas.length > 1 ? "s" : ""} sin recoger.`;
    else if (mundo.meta && (f.x !== mundo.meta.x || f.y !== mundo.meta.y)) motivo = "El robot terminó, pero no está sobre la meta.";
    else if (mundo.meta && mundo.meta.x === mundo.inicial.x && mundo.meta.y === mundo.inicial.y) {
      // la meta es el punto de partida: hay que recorrer todo el camino y volver
      const visitadas = new Set(ejecucion.pasos.map((p) => `${p.estado.x},${p.estado.y}`));
      visitadas.add(`${mundo.inicial.x},${mundo.inicial.y}`);
      let libres = 0;
      for (let y = 0; y < mundo.alto; y++) for (let x = 0; x < mundo.ancho; x++) if (!mundo.paredes[y][x]) libres++;
      if (visitadas.size < libres) motivo = "Terminó donde empezó, pero sin recorrer todo el camino: la ronda debe dar la vuelta completa.";
    }
    return { ok: !motivo, motivo, ejecucion };
  });
  const instrucciones = contar(prog);
  const dentroDelLimite = instrucciones <= nivel.limite;
  return { mapas, instrucciones, dentroDelLimite, superado: mapas.every((m) => m.ok) && dentroDelLimite };
}

// ---------------------------------------------------------------- niveles de predicción
export interface Prediccion {
  x: number;
  y: number;
  monedas: number | null;
  error: boolean | null;
}

export interface Real {
  x: number;
  y: number;
  monedas: number;
  error: boolean;
  mensajeError?: string;
}

/** ejecuta de verdad el código del nivel de predicción */
export function ejecucionDePrediccion(nivel: Nivel, prog: Sent[]): Veredicto {
  const ejecucion = ejecutar(prog, crearMundo(nivel.mapas[0]));
  return { mapas: [{ ok: true, motivo: "", ejecucion }], instrucciones: contar(prog), dentroDelLimite: true, superado: false };
}

export function resultadoReal(nivel: Nivel): Real {
  const r = compilar(nivel.codigo ?? "");
  if ("error" in r) throw new Error(`El código del nivel ${nivel.id} no compila: ${r.error.mensaje}`);
  const mundo = crearMundo(nivel.mapas[0]);
  const ej = ejecutar(r.prog, mundo);
  const f = ej.final;
  return { x: f.x, y: f.y, monedas: mundo.inicial.monedas.length - f.monedas.length, error: !!ej.error, mensajeError: ej.error?.mensaje };
}

/** compara la predicción con lo que ocurre de verdad (solo lo que el nivel pregunta cuenta) */
export function juzgarPrediccion(nivel: Nivel, p: Prediccion): { ok: boolean; casilla: boolean; monedas: boolean | null; error: boolean | null; real: Real } {
  const real = resultadoReal(nivel);
  const casilla = p.x === real.x && p.y === real.y;
  const monedas = nivel.preguntas?.monedas ? p.monedas === real.monedas : null;
  const error = nivel.preguntas?.error ? p.error === real.error : null;
  return { ok: casilla && monedas !== false && error !== false, casilla, monedas, error, real };
}

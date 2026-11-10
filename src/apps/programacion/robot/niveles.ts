// Niveles del «Robot Galileo». Cada nivel es un dato: mapas, límite de instrucciones, bloques disponibles,
// pistas y solución. Un programa supera el nivel si resuelve TODOS sus mapas sin pasarse del límite.

import { ejecutar, type Ejecucion } from "./ejecutor";
import { contar, type Sent } from "./lenguaje";
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
}

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
    objetivo: "Recoge las 6 monedas <b>🪙</b> con como mucho 4 instrucciones.",
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
];

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
    return { ok: !motivo, motivo, ejecucion };
  });
  const instrucciones = contar(prog);
  const dentroDelLimite = instrucciones <= nivel.limite;
  return { mapas, instrucciones, dentroDelLimite, superado: mapas.every((m) => m.ok) && dentroDelLimite };
}

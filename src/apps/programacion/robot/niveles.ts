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

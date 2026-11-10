// Valida los niveles del Robot Galileo: la solución los supera, el programa vacío no, y las trampas típicas fallan.
import { compilar } from "../src/apps/programacion/robot/lenguaje";
import { NIVELES, evaluar } from "../src/apps/programacion/robot/niveles";

let incidencias = 0;
const mal = (m: string) => {
  incidencias++;
  console.log("  ✗", m);
};
const prog = (t: string) => {
  const r = compilar(t);
  if ("error" in r) throw new Error(`${r.error.linea}: ${r.error.mensaje}\n${t}`);
  return r.prog;
};

for (const n of NIVELES) {
  const v = evaluar(n, prog(n.solucion));
  console.log(`${n.id} «${n.titulo}»: solución ${v.superado ? "OK" : "FALLA"} (${v.instrucciones}/${n.limite})`);
  if (!v.superado) mal(`la solución no supera ${n.id}: ${v.mapas.map((m) => m.motivo).join(" | ")}`);
  if (evaluar(n, []).superado) mal(`el programa vacío supera ${n.id}`);
}

// trampas concretas
const casos: [string, string, boolean][] = [
  ["p1", "for (int i = 0; i <= 7; i++) { avanzar(); }", false], // una vuelta de más: choca
  ["p1", "for (int i = 0; i < 6; i++) { avanzar(); }", false], // se queda corto
  ["p1", "avanzar();avanzar();avanzar();avanzar();avanzar();avanzar();avanzar();", false], // no cabe en el límite
  ["p1", "for (int i = 0; i < 7; i++) avanzar();", true], // sin llaves
  ["p3", "for (int i = 0; i < 6; i++) { avanzar(); recoger(); }", true],
  ["p3", "for (int i = 0; i < 6; i++) { recoger(); avanzar(); }", false], // recoger donde no hay nada
  ["p5", "for (int i = 0; i <= 5; i++) { avanzar(); avanzar(); recoger(); }", false],
  ["p1", "while (true) { avanzar(); }", false],
  // mundo 2: while
  ["l1", "for (int i = 0; i < 4; i++) { avanzar(); }", false], // solo vale para un pasillo
  ["l1", "for (int i = 0; i < 9; i++) { avanzar(); }", false], // choca en los cortos
  ["l1", "while (!enMeta()) { avanzar(); }", true], // otra condición válida
  ["l2", "while (!hayPared()) { recoger(); avanzar(); }", false], // recoge antes de pisar la moneda
  ["l3", "while (!hayPared()) { if (hayMoneda()) { recoger(); } avanzar(); }", false], // se deja la moneda de la última casilla
  ["l3", "while (!hayPared()) { if (hayMoneda()) { recoger(); } avanzar(); } if (hayMoneda()) { recoger(); }", true], // la «arreglada» también vale (6 instrucciones)
  ["l4", "while (!hayPared()) { avanzar(); } girarDerecha(); while (!hayPared()) { avanzar(); }", true],
  ["l4", "while (!hayPared()) { avanzar(); } girarDerecha();", false],
  ["l5", "for (int i = 0; i < 4; i++) { avanzar(); girarIzquierda(); avanzar(); girarDerecha(); }", false],
  ["l5", "while (!enMeta()) { avanzar(); girarIzquierda(); avanzar(); girarDerecha(); }", true],
  ["l6", "while (!hayPared()) { avanzar(); }", false],
  ["l6", "while (!enMeta()) { if (!hayPared()) { avanzar(); } if (hayPared()) { girarDerecha(); } }", true], // sin else también vale
  ["l6", "while (!enMeta()) { if (hayPared()) { girarDerecha(); } else { avanzar(); } }", true],
  // mundo 3: do..while
  ["m1", "while (hayMoneda()) { recoger(); avanzar(); }", true],
  ["m1", "do { recoger(); avanzar(); } while (hayMoneda());", false], // en el mapa vacío recoge donde no hay nada
  ["m1", "while (!hayMoneda()) { avanzar(); }", false],
  ["m2", "do { avanzar(); } while (hayParedDerecha()); girarDerecha(); avanzar();", true],
  ["m2", "while (hayParedDerecha()) { avanzar(); } girarDerecha(); avanzar();", false], // se queda en la primera puerta
  ["m3", "do { if (hayPared()) { girarDerecha(); } else { avanzar(); } } while (!enMeta());", true],
  ["m3", "while (!enMeta()) { if (hayPared()) { girarDerecha(); } else { avanzar(); } }", false], // ya está en la meta: no se mueve
  ["m3", "do { avanzar(); } while (!enMeta());", false],
  ["m4", "do { if (hayMoneda()) { recoger(); } if (hayPared()) { girarDerecha(); } else { avanzar(); } } while (!enMeta());", true],
  ["m4", "do { if (hayPared()) { girarDerecha(); } else { avanzar(); } } while (!enMeta());", false], // da la vuelta pero no recoge
];
for (const [id, cod, esperado] of casos) {
  const n = NIVELES.find((x) => x.id === id)!;
  const r = compilar(cod);
  if ("error" in r) {
    if (esperado || !/true\/false/.test(r.error.mensaje)) mal(`no compila: ${cod} → ${r.error.mensaje}`);
    continue;
  }
  const v = evaluar(n, r.prog);
  if (v.superado !== esperado) mal(`${id}: «${cod}» debería ${esperado ? "superar" : "fallar"} y no`);
}

// bucles infinitos: no deben colgar
const infinito = compilar("int x = 0; while (x < 5) { avanzar(); }");
if ("prog" in infinito) {
  const v = evaluar(NIVELES[0], infinito.prog);
  if (!v.mapas[0].ejecucion.error) mal("el bucle infinito no se cortó");
}

// errores de compilación estilo Eclipse
const errores: [string, RegExp][] = [
  ["avanzar()", /insert ";"/],
  ["avanza();", /method avanza\(\) is undefined/],
  ["for (int i = 0; i < 3; i++ { avanzar(); }", /insert "\)"/],
  ["for (int i = 0; i < 3; i++) { avanzar();", /insert "\}"/],
  ["while (3) { avanzar(); }", /Type mismatch: cannot convert from int to boolean/],
  ["while (hayPared()) { avanzar(); } }", /Syntax error on token "\}"/],
  ["avanzar(2);", /not applicable/],
  ["x = 3;", /x cannot be resolved/],
];
for (const [cod, re] of errores) {
  const r = compilar(cod);
  if (!("error" in r) || !re.test(r.error.mensaje)) mal(`error esperado ${re} para «${cod}»: ${"error" in r ? r.error.mensaje : "compiló"}`);
}

console.log(incidencias ? `\n${incidencias} incidencia(s)` : "\nSin incidencias");
process.exit(incidencias ? 1 : 0);

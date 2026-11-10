// Valida los niveles del Robot Galileo: la solución los supera, el programa vacío no, y las trampas típicas fallan.
import { compilar } from "../src/apps/programacion/robot/lenguaje";
import { MAPA_INICIAL, conBordes, desdeTexto, pintar, redimensionar, validar, vaciar } from "../src/apps/programacion/robot/lab";
import { crearMundo } from "../src/apps/programacion/robot/mundo";
import { NIVELES, azarConSemilla, evaluar, juzgarPrediccion, resultadoReal } from "../src/apps/programacion/robot/niveles";

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
  if (n.tipo === "laboratorio") continue; // no tiene solución: el mapa lo crea el alumno
  if (n.tipo === "predecir") {
    // el resultado calculado a mano debe coincidir con el del motor, y una predicción equivocada debe fallar
    const real = resultadoReal(n);
    const e = n.esperado!;
    const igual = real.x === e.x && real.y === e.y && real.monedas === e.monedas && real.error === e.error;
    console.log(`${n.id} «${n.titulo}»: predicción ${igual ? "OK" : "FALLA"} (real: x=${real.x}, y=${real.y}, monedas=${real.monedas}, error=${real.error})`);
    if (!igual) mal(`${n.id}: el motor da ${JSON.stringify(real)} y se esperaba ${JSON.stringify(e)}`);
    const acierto = juzgarPrediccion(n, { x: e.x, y: e.y, monedas: e.monedas, error: e.error });
    if (!acierto.ok) mal(`${n.id}: la predicción correcta no se da por buena`);
    const falla = juzgarPrediccion(n, { x: e.x + 1, y: e.y, monedas: e.monedas, error: e.error });
    if (falla.ok) mal(`${n.id}: una casilla equivocada se da por buena`);
    if (n.preguntas?.monedas && juzgarPrediccion(n, { x: e.x, y: e.y, monedas: e.monedas + 1, error: e.error }).ok) mal(`${n.id}: unas monedas equivocadas se dan por buenas`);
    if (n.preguntas?.error && juzgarPrediccion(n, { x: e.x, y: e.y, monedas: e.monedas, error: !e.error }).ok) mal(`${n.id}: un error equivocado se da por bueno`);
    continue;
  }
  const v = evaluar(n, prog(n.solucion));
  console.log(`${n.id} «${n.titulo}»: solución ${v.superado ? "OK" : "FALLA"} (${v.instrucciones}/${n.limite})`);
  if (!v.superado) mal(`la solución no supera ${n.id}: ${v.mapas.map((m) => m.motivo).join(" | ")}`);
  if (evaluar(n, []).superado) mal(`el programa vacío supera ${n.id}`);
}

// mapas al azar: la solución de referencia debe resolver todos los que sortea cada generador
for (const n of NIVELES) {
  if (!n.generar) continue;
  const solu = prog(n.solucion);
  const azar = azarConSemilla(2026);
  const vistos = new Set<string>();
  let fallos = 0;
  for (let k = 0; k < 150; k++) {
    const mapa = n.generar(azar);
    vistos.add(mapa.join("|"));
    const v = evaluar({ ...n, mapas: [mapa] }, solu);
    if (!v.mapas[0].ok) {
      fallos++;
      if (fallos <= 2) mal(`${n.id}: la solución falla en un mapa sorteado (${v.mapas[0].motivo}):\n${mapa.join("\n")}`);
    }
  }
  console.log(`${n.id}: 150 mapas al azar, ${vistos.size} distintos, ${fallos} fallos`);
  if (vistos.size < 3) mal(`${n.id}: el generador apenas varía (${vistos.size} mapas distintos)`);
}

// trampas concretas
const sol = (id: string) => NIVELES.find((x) => x.id === id)!.solucion;
const casos: [string, string, boolean][] = [
  // mundo 4: bucles anidados; la solución de cada nivel no sirve en el siguiente
  ["a2", sol("a1"), false], // contar casillas no vale con estanterías desiguales
  ["a2", sol("a2"), true],
  ["a3", sol("a2"), false], // el exterior cuenta 3 estanterías y hay mapas con otro número
  ["a3", sol("a3"), true],
  ["a3", sol("a2").replace("for (int i = 0; i < 3; i++)", "while (!hayPared())"), true], // equivalente a la solución
  ["a4", sol("a3"), false], // recoger donde no hay moneda
  ["a4", sol("a4"), true],
  ["a1", sol("a1").replace("i < 3", "i < 2"), false], // una estantería sin recorrer
  ["a1", sol("a1").replace("j < 3; j++) {\n    avanzar();\n    recoger", "j < 4; j++) {\n    avanzar();\n    recoger"), false], // una vuelta de más: choca
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

// laboratorio: lógica del editor de mapas
{
  const cuenta = (f: string[], c: string) => f.join("").split(c).length - 1;
  const ok = (cond: boolean, msg: string) => cond || mal(`laboratorio: ${msg}`);
  ok(validar(MAPA_INICIAL) === null, "el mapa inicial no es válido");
  const mundoLab = crearMundo(conBordes(MAPA_INICIAL));
  ok(mundoLab.ancho === 10 && mundoLab.alto === 7 && mundoLab.meta !== null && mundoLab.inicial.x === 1 && mundoLab.inicial.y === 1, "el mapa inicial no se crea bien con bordes");
  ok(pintar(MAPA_INICIAL, 0, 0, "pared") === null, "se puede poner una pared sobre el robot");
  ok(pintar(MAPA_INICIAL, 1, 0, "pared")![0][1] === "#", "no pone la pared");
  const moneda = pintar(MAPA_INICIAL, 2, 0, "moneda")!;
  ok(moneda[0][2] === "o" && pintar(moneda, 2, 0, "moneda")![0][2] === ".", "la moneda no alterna con clics");
  ok(pintar(moneda, 2, 0, "moneda", true) === null, "arrastrando no debe quitar monedas");
  const meta = pintar(MAPA_INICIAL, 1, 0, "meta")!;
  ok(cuenta(meta, "G") === 1 && meta[0][1] === "G", "debe haber una única meta al moverla");
  const rotado = pintar(MAPA_INICIAL, 0, 0, "robot")!;
  ok(rotado[0][0] === "v", "el robot no gira al pulsarlo (> pasa a v)");
  const movido = pintar(MAPA_INICIAL, 2, 0, "robot")!;
  ok(cuenta(movido, ">") === 1 && movido[0][2] === ">" && movido[0][0] === ".", "el robot debe moverse conservando su orientación");
  ok(pintar(MAPA_INICIAL, 1, 0, "robot", true) === null && pintar(MAPA_INICIAL, 1, 0, "meta", true) === null, "robot y meta no se pintan arrastrando");
  ok(redimensionar(MAPA_INICIAL, 7, 5) === null, "recortar la columna de la meta debería rechazarse");
  const grande = redimensionar(MAPA_INICIAL, 10, 6)!;
  ok(!!grande && grande.length === 6 && grande.every((f) => f.length === 10) && validar(grande) === null, "ampliar el mapa falla");
  ok(redimensionar(MAPA_INICIAL, 20, 5) === null && redimensionar(MAPA_INICIAL, 8, 1) === null, "no respeta los límites de tamaño");
  ok(validar(vaciar(MAPA_INICIAL)) === null && cuenta(vaciar(MAPA_INICIAL), "#") === 0, "vaciar deja un mapa raro");
  const desde = desdeTexto(">..\n.o\n");
  ok("filas" in desde && desde.filas.join("|") === ">..|.o.", "desdeTexto no rellena las filas cortas");
  ok("error" in desdeTexto(">>.\n..."), "dos robots deberían ser un error");
  ok("error" in desdeTexto("...\n..."), "sin robot debería ser un error");
  ok("error" in desdeTexto(">.x\n..."), "un carácter raro debería ser un error");
  ok("error" in desdeTexto(">.G\n..G"), "dos metas deberían ser un error");
  console.log("laboratorio: pruebas del editor de mapas hechas");
}

console.log(incidencias ? `\n${incidencias} incidencia(s)` : "\nSin incidencias");
process.exit(incidencias ? 1 : 0);

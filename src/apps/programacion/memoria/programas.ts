// Programas de «Memoria de Java» (UT02 §4, §10, §12 y Profundización A/B). Cada paso lleva su línea,
// las operaciones sobre la pila/montón y, a veces, una pregunta para predecir antes de verlo.

import { aplicar, estadoInicial, type Estado, type Op } from "./motor";

export interface Pregunta {
  texto: string;
  opciones: string[];
  correcta: number;
  porque: string;
  /** la respuesta correcta es lo que imprime este paso (se comprueba al validar) */
  deSalida?: boolean;
}

export interface Paso {
  /** línea del código que se ejecuta (0 = primera); -1 si es algo posterior al código */
  linea: number;
  ops: Op[];
  /** explicación (HTML sencillo) */
  nota: string;
  pregunta?: Pregunta;
}

export interface Programa {
  id: string;
  titulo: string;
  bloque: string;
  resumen: string;
  codigo: string[];
  pasos: Paso[];
}

const VERDAD = ["true", "false"];

export const PROGRAMAS: Programa[] = [
  {
    id: "primitivos",
    titulo: "Primitivos: se copia el valor",
    bloque: "Pila y referencias",
    resumen: "Un <code>int</code> guarda su valor dentro de la propia variable.",
    codigo: ["int a = 5;", "int b = a;", "b = 7;", "System.out.println(a);"],
    pasos: [
      { linea: 0, ops: [{ k: "prim", nombre: "a", tipo: "int", v: "5" }], nota: "Un <code>int</code> cabe directamente en la pila: la variable <b>contiene</b> el 5." },
      { linea: 1, ops: [{ k: "copiaPrim", nombre: "b", tipo: "int", desde: "a" }], nota: "<code>b</code> recibe una <b>copia</b> del valor. A partir de aquí <code>a</code> y <code>b</code> son independientes." },
      { linea: 2, ops: [{ k: "prim", nombre: "b", tipo: "int", v: "7" }], nota: "Cambiar <code>b</code> no toca <code>a</code>: cada variable tiene su propia casilla." },
      {
        linea: 3,
        ops: [{ k: "imprimirVar", nombre: "a" }],
        nota: "Imprime lo que vale <code>a</code>.",
        pregunta: { texto: "¿Qué imprime <code>println(a)</code>?", opciones: ["5", "7", "12"], correcta: 0, porque: "Con primitivos se copia el valor; después, <code>b = 7</code> solo cambia <code>b</code>.", deSalida: true },
      },
    ],
  },
  {
    id: "dos-variables",
    titulo: "Dos variables, un objeto",
    bloque: "Pila y referencias",
    resumen: "Con objetos, copiar la variable copia la <b>referencia</b>, no el objeto.",
    codigo: ['StringBuilder a = new StringBuilder("Hola");', "StringBuilder b = a;", 'b.append(" mundo");', "System.out.println(a);"],
    pasos: [
      { linea: 0, ops: [{ k: "nuevo", nombre: "a", tipo: "StringBuilder", clase: "StringBuilder", texto: "Hola" }], nota: "<code>new</code> reserva un objeto en el <b>montón</b>. La variable <code>a</code> guarda solo su <b>dirección</b> (la flecha)." },
      { linea: 1, ops: [{ k: "copiaRef", nombre: "b", tipo: "StringBuilder", desde: "a" }], nota: "Se copia la <b>referencia</b>: ahora <code>a</code> y <code>b</code> apuntan al <b>mismo</b> objeto. No hay un segundo objeto." },
      { linea: 2, ops: [{ k: "mutar", nombre: "b", texto: "Hola mundo" }], nota: "<code>append</code> modifica el objeto (un <code>StringBuilder</code> es mutable). Lo ven las dos variables, porque es el mismo." },
      {
        linea: 3,
        ops: [{ k: "imprimirVar", nombre: "a" }],
        nota: "Imprime el objeto al que apunta <code>a</code>.",
        pregunta: { texto: "¿Qué imprime <code>println(a)</code>?", opciones: ["Hola", "Hola mundo", "No compila"], correcta: 1, porque: "<code>a</code> y <code>b</code> son dos nombres para el mismo objeto: lo que se añade por <code>b</code> se ve por <code>a</code>.", deSalida: true },
      },
    ],
  },
  {
    id: "dos-new",
    titulo: "Dos new, dos objetos: == y equals",
    bloque: "Comparar objetos",
    resumen: "<code>==</code> pregunta «¿es el mismo objeto?»; <code>equals</code>, «¿valen lo mismo?».",
    codigo: ['String x = new String("hola");', 'String y = new String("hola");', "System.out.println(x == y);", "System.out.println(x.equals(y));"],
    pasos: [
      { linea: 0, ops: [{ k: "nuevo", nombre: "x", tipo: "String", clase: "String", texto: "hola" }], nota: "<code>new String(...)</code> fabrica un objeto, fuera del string pool." },
      { linea: 1, ops: [{ k: "nuevo", nombre: "y", tipo: "String", clase: "String", texto: "hola" }], nota: "Otro <code>new</code>: otro objeto distinto, aunque con el mismo texto." },
      {
        linea: 2,
        ops: [{ k: "comparar", izq: "x", der: "y", modo: "==" }],
        nota: "<code>==</code> compara las <b>referencias</b>: ¿las dos flechas llegan al mismo objeto?",
        pregunta: { texto: "¿Qué imprime <code>x == y</code>?", opciones: VERDAD, correcta: 1, porque: "Son dos objetos distintos: las flechas no llegan al mismo sitio.", deSalida: true },
      },
      {
        linea: 3,
        ops: [{ k: "comparar", izq: "x", der: "y", modo: "equals" }],
        nota: "<code>equals</code> compara el <b>contenido</b> de los objetos.",
        pregunta: { texto: "¿Y <code>x.equals(y)</code>?", opciones: VERDAD, correcta: 0, porque: "Los dos objetos contienen el mismo texto, «hola».", deSalida: true },
      },
    ],
  },
  {
    id: "pool",
    titulo: "El string pool",
    bloque: "Comparar objetos",
    resumen: "Los literales iguales comparten objeto; <code>new</code> crea uno aparte.",
    codigo: ['String a = "hola";', 'String b = "hola";', 'String c = new String("hola");', "System.out.println(a == b);", "System.out.println(a == c);", "System.out.println(a.equals(c));"],
    pasos: [
      { linea: 0, ops: [{ k: "literal", nombre: "a", texto: "hola" }], nota: "Un <b>literal</b> se guarda en el <b>string pool</b>, una zona del montón con un solo ejemplar de cada cadena." },
      { linea: 1, ops: [{ k: "literal", nombre: "b", texto: "hola" }], nota: "El mismo literal: Java <b>reutiliza</b> el objeto del pool. No se crea otro; <code>b</code> apunta al mismo que <code>a</code>." },
      { linea: 2, ops: [{ k: "nuevo", nombre: "c", tipo: "String", clase: "String", texto: "hola" }], nota: "<code>new String(...)</code> obliga a crear un objeto <b>nuevo fuera del pool</b>. Por eso es un antipatrón." },
      {
        linea: 3,
        ops: [{ k: "comparar", izq: "a", der: "b", modo: "==" }],
        nota: "¿Mismo objeto?",
        pregunta: { texto: "¿Qué imprime <code>a == b</code>?", opciones: VERDAD, correcta: 0, porque: "Las dos variables apuntan al mismo objeto del pool.", deSalida: true },
      },
      {
        linea: 4,
        ops: [{ k: "comparar", izq: "a", der: "c", modo: "==" }],
        nota: "<code>c</code> apunta a un objeto distinto del que apunta <code>a</code>.",
        pregunta: { texto: "¿Qué imprime <code>a == c</code>?", opciones: VERDAD, correcta: 1, porque: "<code>c</code> es un objeto aparte, aunque diga lo mismo.", deSalida: true },
      },
      { linea: 5, ops: [{ k: "comparar", izq: "a", der: "c", modo: "equals" }], nota: "Con <code>equals</code> se compara el contenido: «hola» y «hola». <b>Con objetos, compara siempre con <code>equals</code>.</b>" },
    ],
  },
  {
    id: "inmutable",
    titulo: "String es inmutable",
    bloque: "String",
    resumen: "Ningún método de <code>String</code> cambia el objeto: todos devuelven uno nuevo.",
    codigo: ['String s = "hola";', "s.toUpperCase();", "System.out.println(s);", "s = s.toUpperCase();", "System.out.println(s);"],
    pasos: [
      { linea: 0, ops: [{ k: "literal", nombre: "s", texto: "hola" }], nota: "<code>s</code> apunta al literal «hola» del pool." },
      { linea: 1, ops: [{ k: "suelto", clase: "String", texto: "HOLA" }], nota: "<code>toUpperCase()</code> <b>crea un objeto nuevo</b> con «HOLA»… pero nadie guarda su referencia. Queda como basura. El de «hola» no se ha tocado." },
      {
        linea: 2,
        ops: [{ k: "imprimirVar", nombre: "s" }],
        nota: "<code>s</code> sigue apuntando al objeto de siempre.",
        pregunta: { texto: "¿Qué imprime?", opciones: ["hola", "HOLA"], correcta: 0, porque: "<code>s.toUpperCase();</code> sin asignar el resultado no cambia nada: el <code>String</code> original es inmutable.", deSalida: true },
      },
      { linea: 3, ops: [{ k: "derivar", nombre: "s", clase: "String", texto: "HOLA" }], nota: "Ahora sí: el resultado se <b>asigna</b> a <code>s</code>, que pasa a apuntar al objeto nuevo. El literal «hola» sigue en el pool." },
      { linea: 4, ops: [{ k: "imprimirVar", nombre: "s" }], nota: "Ahora <code>s</code> apunta a «HOLA»." },
      { linea: -1, ops: [{ k: "gc" }], nota: "Cuando le convenga, el <b>recolector de basura</b> se lleva el «HOLA» suelto de la línea 2: nadie podía llegar a él." },
    ],
  },
  {
    id: "concatenar",
    titulo: "Concatenar crea objetos nuevos",
    bloque: "String",
    resumen: "Cada <code>+</code> sobre un <code>String</code> fabrica uno nuevo y abandona el anterior.",
    codigo: ['String t = "a";', 't = t + "b";', 't = t + "c";'],
    pasos: [
      { linea: 0, ops: [{ k: "literal", nombre: "t", texto: "a" }], nota: "<code>t</code> apunta al literal «a». (Los literales «b» y «c» también viven en el pool; no los dibujo para no llenar la pantalla.)" },
      { linea: 1, ops: [{ k: "derivar", nombre: "t", clase: "String", texto: "ab" }], nota: "<code>t + \"b\"</code> <b>no añade</b> al objeto: crea un <code>String</code> nuevo, «ab», y <code>t</code> apunta a él." },
      { linea: 2, ops: [{ k: "derivar", nombre: "t", clase: "String", texto: "abc" }], nota: "Otro objeto nuevo, «abc». El «ab» queda sin referencias: es <b>basura</b>. En un bucle de 50 000 vueltas, serían 50 000 objetos descartados.", pregunta: { texto: "Tras la línea 3, ¿qué le pasa al objeto «ab»?", opciones: ["Sigue siendo el valor de t", "Queda inalcanzable (basura)", "Se modifica para ser «abc»"], correcta: 1, porque: "<code>t</code> ya apunta a «abc»; nadie referencia «ab», y los <code>String</code> no se modifican." },
      },
      { linea: -1, ops: [{ k: "gc" }], nota: "El recolector libera «ab». Por eso, en bucles, se usa <code>StringBuilder</code>." },
    ],
  },
  {
    id: "builder",
    titulo: "StringBuilder: un solo objeto",
    bloque: "String",
    resumen: "<code>StringBuilder</code> es mutable: <code>append</code> modifica el mismo objeto.",
    codigo: ['StringBuilder sb = new StringBuilder("a");', 'sb.append("b");', 'sb.append("c");', "System.out.println(sb);"],
    pasos: [
      { linea: 0, ops: [{ k: "nuevo", nombre: "sb", tipo: "StringBuilder", clase: "StringBuilder", texto: "a" }], nota: "Un único objeto en el montón." },
      { linea: 1, ops: [{ k: "mutar", nombre: "sb", texto: "ab" }], nota: "<code>append</code> <b>modifica</b> el objeto. No se crea ninguno nuevo." },
      { linea: 2, ops: [{ k: "mutar", nombre: "sb", texto: "abc" }], nota: "Otra vez el mismo objeto. Sin basura, sin copias." },
      {
        linea: 3,
        ops: [{ k: "imprimirVar", nombre: "sb" }],
        nota: "Imprime «abc».",
        pregunta: { texto: "¿Cuántos objetos <code>StringBuilder</code> hay en el montón?", opciones: ["1", "2", "3"], correcta: 0, porque: "Solo hubo un <code>new StringBuilder</code>; los <code>append</code> trabajan sobre ese mismo objeto." },
      },
    ],
  },
  {
    id: "null",
    titulo: "null y NullPointerException",
    bloque: "Memoria",
    resumen: "<code>null</code> es una referencia que no apunta a ningún objeto.",
    codigo: ['String nombre = "Ana";', "nombre = null;", "System.out.println(nombre.length());"],
    pasos: [
      { linea: 0, ops: [{ k: "literal", nombre: "nombre", texto: "Ana" }], nota: "<code>nombre</code> apunta a «Ana»." },
      { linea: 1, ops: [{ k: "nulo", nombre: "nombre", tipo: "String" }], nota: "<code>null</code>: la variable existe, pero <b>no apunta a ningún objeto</b> (la flecha desaparece). El objeto «Ana» sigue en el pool." },
      {
        linea: 2,
        ops: [{ k: "error", texto: 'Exception in thread "main" java.lang.NullPointerException: Cannot invoke "String.length()" because "nombre" is null' }],
        nota: "Pedir un método a una referencia sin objeto es el error en ejecución más frecuente de Java. El mensaje te dice qué método y sobre qué variable.",
        pregunta: { texto: "¿Qué ocurre al ejecutar la línea 3?", opciones: ["Imprime 0", "Imprime 3", "Lanza NullPointerException", "No compila"], correcta: 2, porque: "Compila perfectamente: el fallo ocurre al ejecutar, porque <code>nombre</code> no apunta a ningún objeto al que pedirle <code>length()</code>." },
      },
    ],
  },
  {
    id: "recolector",
    titulo: "El recolector de basura",
    bloque: "Memoria",
    resumen: "Un objeto sin ninguna referencia viva es candidato a ser liberado.",
    codigo: ["Scanner s = new Scanner(System.in);", 's = new Scanner("10 20");', "s = null;", "System.gc();"],
    pasos: [
      { linea: 0, ops: [{ k: "nuevo", nombre: "s", tipo: "Scanner", clase: "Scanner", texto: "lee de System.in" }], nota: "Objeto A creado; <code>s</code> apunta a A." },
      {
        linea: 1,
        ops: [{ k: "nuevo", nombre: "s", tipo: "Scanner", clase: "Scanner", texto: 'lee de "10 20"' }],
        nota: "Objeto B creado y <code>s</code> pasa a apuntar a B. A queda <b>inalcanzable</b>.",
        pregunta: { texto: "Tras la línea 2, ¿cuántos objetos están inalcanzables?", opciones: ["0", "1", "2"], correcta: 1, porque: "Solo A: <code>s</code> ya no lo referencia. B sigue vivo porque <code>s</code> apunta a él." },
      },
      {
        linea: 2,
        ops: [{ k: "nulo", nombre: "s", tipo: "Scanner" }],
        nota: "<code>s = null</code>: ahora B también está inalcanzable.",
        pregunta: { texto: "Tras la línea 3, ¿cuántos objetos están inalcanzables?", opciones: ["0", "1", "2"], correcta: 2, porque: "A y B: ninguna variable apunta ya a ninguno de los dos." },
      },
      { linea: 3, ops: [{ k: "gc" }], nota: "<code>System.gc()</code> es una <b>sugerencia</b>, no una orden: la JVM decide cuándo recoge. Aquí lo hace y la memoria queda libre. En Java no llamas a <code>free</code> ni a <code>delete</code>." },
    ],
  },
  {
    id: "parametros",
    titulo: "Parámetros: se copia la referencia",
    bloque: "Memoria",
    resumen: "Java pasa todo <b>por valor</b>; con objetos, el valor es la referencia.",
    codigo: [
      'static void anadir(StringBuilder x) { x.append("!"); }',
      'static void cambiar(StringBuilder x) { x = new StringBuilder("otro"); }',
      "",
      "// en main:",
      'StringBuilder sb = new StringBuilder("hola");',
      "anadir(sb);",
      "cambiar(sb);",
      "System.out.println(sb);",
    ],
    pasos: [
      { linea: 4, ops: [{ k: "nuevo", nombre: "sb", tipo: "StringBuilder", clase: "StringBuilder", texto: "hola" }], nota: "En <code>main</code>, <code>sb</code> apunta a un objeto «hola»." },
      { linea: 5, ops: [{ k: "llamar", marco: "anadir", params: [{ nombre: "x", tipo: "StringBuilder", desde: "sb" }] }], nota: "Al llamar al método se <b>copia la referencia</b> en el parámetro <code>x</code>: <code>x</code> y <code>sb</code> apuntan al <b>mismo</b> objeto." },
      { linea: 0, ops: [{ k: "mutar", nombre: "x", texto: "hola!" }], nota: "<code>x.append</code> modifica ese objeto, que también es el de <code>sb</code>. Un método <b>sí puede</b> cambiar un objeto mutable que recibe." },
      { linea: 5, ops: [{ k: "retornar" }], nota: "El método termina y su variable <code>x</code> desaparece de la pila." },
      { linea: 6, ops: [{ k: "llamar", marco: "cambiar", params: [{ nombre: "x", tipo: "StringBuilder", desde: "sb" }] }], nota: "Otra vez <code>x</code> es una copia de la referencia de <code>sb</code>." },
      { linea: 1, ops: [{ k: "nuevo", nombre: "x", tipo: "StringBuilder", clase: "StringBuilder", texto: "otro" }], nota: "<code>x = new …</code> hace que <b>la copia</b> apunte a otro objeto. <code>sb</code>, en <code>main</code>, sigue apuntando al de antes: un método <b>no puede</b> cambiar a qué objeto apunta tu variable." },
      { linea: 6, ops: [{ k: "retornar" }], nota: "<code>x</code> desaparece y el objeto «otro» queda sin referencias: basura." },
      {
        linea: 7,
        ops: [{ k: "imprimirVar", nombre: "sb" }],
        nota: "Imprime el objeto de <code>sb</code>.",
        pregunta: { texto: "¿Qué imprime?", opciones: ["hola", "hola!", "otro", "otro!"], correcta: 1, porque: "<code>anadir</code> modificó el objeto de <code>sb</code> («hola!»); <code>cambiar</code> solo reasignó su copia local.", deSalida: true },
      },
    ],
  },
];

/** Estados tras cada paso: el 0 es el inicial y el k+1 el resultado del paso k. */
export function estadosDe(p: Programa): Estado[] {
  const lista: Estado[] = [estadoInicial()];
  for (const paso of p.pasos) lista.push(aplicar(lista[lista.length - 1], paso.ops));
  return lista;
}

// Pruebas de «CTF de Strings». La entrada de cada prueba se GENERA a partir de la bandera con la
// transformación inversa, así que todas tienen solución y se pueden validar ejecutándola.

export interface Prueba {
  id: string;
  titulo: string;
  /** ambientación (HTML sencillo) */
  historia: string;
  /** lo que hay que conseguir (HTML sencillo) */
  objetivo: string;
  /** valor inicial de `s`: el mensaje interceptado */
  entrada: string;
  /** valor que debe tener `s` al terminar */
  bandera: string;
  /** script con el que arranca el editor */
  inicial: string;
  pistas: [string, string];
  /** una solución de referencia */
  solucion: string;
  /** lo que se aprende, al capturar la bandera */
  aprende: string;
  /** métodos de String que conviene mirar */
  herramientas: string[];
}

const leet = (t: string) => t.replace(/a/g, "4").replace(/e/g, "3").replace(/o/g, "0").replace(/i/g, "1");
const alReves = (t: string) => [...t].reverse().join("");
const intercambiar = (t: string) => t.replace(/[ae]/g, (c) => (c === "a" ? "e" : "a"));
const separar = (t: string) => [...t].join("-");

/** Esconde las letras de `clave` en esas posiciones, rellenando el resto con ruido. */
function esconder(clave: string, posiciones: number[], largo: number): string {
  const ruido = "xqzkwvjhmbtdnpylfg";
  const letras: string[] = [];
  for (let i = 0; i < largo; i++) letras.push(ruido[(i * 7 + 3) % ruido.length]);
  posiciones.forEach((p, i) => (letras[p] = clave[i]));
  return letras.join("");
}

const PLANTILLA = "// Escribe tu script aquí. La variable s ya contiene el mensaje interceptado.\n// Al terminar, s debe valer la bandera.\n\n";

const B1 = "mensaje_secreto";
const B2 = "ENTRADA_LIBRE";
const B3 = "puerta_trasera";
const B4 = "servidor_central";
const B5 = "contrasena_segura";
const B6 = "BASE DE DATOS";
const B7 = "acceso";
const POS7 = [1, 4, 6, 9, 12, 15];
const B8 = "central_base";
const B9 = "galileo_ctf_superado";

export const PRUEBAS: Prueba[] = [
  {
    id: "leetspeak",
    titulo: "Leetspeak",
    historia: "La banda <b>Los 4-3-0-1</b> cifra sus mensajes cambiando vocales por números. Hemos interceptado el primero.",
    objetivo: "Decodifica el mensaje: <code>4</code> → <code>a</code>, <code>3</code> → <code>e</code>, <code>0</code> → <code>o</code> y <code>1</code> → <code>i</code>.",
    entrada: leet(B1),
    bandera: B1,
    inicial: PLANTILLA,
    pistas: ["<code>replace(a, b)</code> cambia <b>todas</b> las apariciones de <code>a</code> por <code>b</code>. Necesitas un cambio por cada cifra.", "Un cambio por línea: <code>s = s.replace(\"4\", \"a\");</code> y así con las demás. Recuerda el <code>s =</code>."],
    solucion: 's = s.replace("4", "a");\ns = s.replace("3", "e");\ns = s.replace("0", "o");\ns = s.replace("1", "i");',
    aprende: "<code>replace</code> no modifica <code>s</code>: <b>devuelve</b> un <code>String</code> nuevo, y por eso hay que asignarlo (<code>s = s.replace(…)</code>). Las llamadas se pueden encadenar porque cada una devuelve otro <code>String</code>.",
    herramientas: ["replace"],
  },
  {
    id: "ruido",
    titulo: "Ruido en la línea",
    historia: "El mensaje llega con espacios y marcas de interferencia (<code>#</code>) alrededor.",
    objetivo: "Quita los espacios de los extremos y las almohadillas, y deja el texto <b>en mayúsculas</b>.",
    entrada: `   ##${B2.toLowerCase()}##   `,
    bandera: B2,
    inicial: PLANTILLA,
    pistas: ["<code>trim()</code> quita los espacios del principio y del final, pero no las almohadillas. Para quitar un carácter, cámbialo por la cadena vacía <code>\"\"</code>.", 's = s.trim();\ns = s.replace("#", "");\ns = s.toUpperCase();'],
    solucion: 's = s.trim();\ns = s.replace("#", "");\ns = s.toUpperCase();',
    aprende: "Quitar texto es «reemplazarlo por nada»: <code>replace(\"#\", \"\")</code>. El orden aquí es libre, pero cada paso trabaja sobre el resultado del anterior.",
    herramientas: ["trim", "replace", "toUpperCase"],
  },
  {
    id: "separadores",
    titulo: "Separadores",
    historia: "Otro mensaje, escrito letra a letra con guiones para despistar.",
    objetivo: "Deja el texto sin guiones. Hay (al menos) dos formas de hacerlo.",
    entrada: separar(B3),
    bandera: B3,
    inicial: PLANTILLA,
    pistas: ["Puedes <b>quitar</b> los guiones con <code>replace</code>… o <b>partir</b> el texto por los guiones con <code>split(\"-\")</code> y volver a <b>unir</b> las piezas con <code>String.join(\"\", piezas)</code>.", 's = s.replace("-", "");'],
    solucion: 's = s.replace("-", "");',
    aprende: "<code>split</code> devuelve un <b>array</b> de <code>String</code> y <code>String.join</code> (método estático) los vuelve a unir. Con <code>replace</code> se llega al mismo resultado en una línea; hay varios caminos correctos.",
    herramientas: ["replace", "split"],
  },
  {
    id: "corchetes",
    titulo: "Dentro de corchetes",
    historia: "La información útil va entre corchetes; todo lo demás es relleno.",
    objetivo: "Quédate solo con el texto que hay <b>entre</b> <code>[</code> y <code>]</code> (sin los corchetes).",
    entrada: `xx##[${B4}]##yy`,
    bandera: B4,
    inicial: PLANTILLA,
    pistas: ["<code>indexOf(\"[\")</code> te dice en qué posición está el corchete; <code>substring(inicio, fin)</code> corta (el <code>fin</code> <b>no</b> se incluye).", 's = s.substring(s.indexOf("[") + 1, s.indexOf("]"));'],
    solucion: 's = s.substring(s.indexOf("[") + 1, s.indexOf("]"));',
    aprende: "Los métodos se pueden usar <b>dentro de los argumentos</b> de otros: <code>indexOf</code> devuelve un <code>int</code> que <code>substring</code> usa como posición. El intervalo es semiabierto: el inicio se incluye y el fin no, y por eso se suma 1 al corchete de apertura.",
    herramientas: ["indexOf", "substring"],
  },
  {
    id: "reves",
    titulo: "Al revés",
    historia: "Este mensaje se transmitió desde el final hacia el principio.",
    objetivo: "Dale la vuelta al texto.",
    entrada: alReves(B5),
    bandera: B5,
    inicial: PLANTILLA,
    pistas: ["<code>String</code> no tiene <code>reverse()</code>, pero <code>StringBuilder</code> sí. <code>new StringBuilder(s)</code> crea uno con el texto de <code>s</code>, y <code>toString()</code> lo devuelve a <code>String</code>.", "s = new StringBuilder(s).reverse().toString();"],
    solucion: "s = new StringBuilder(s).reverse().toString();",
    aprende: "<code>StringBuilder</code> es <b>mutable</b>: <code>reverse()</code> cambia su propio contenido y se devuelve a sí mismo, de ahí que se pueda encadenar <code>toString()</code>. Para volver a tener un <code>String</code> hay que convertirlo.",
    herramientas: ["StringBuilder", "reverse", "toString"],
  },
  {
    id: "trampa",
    titulo: "La trampa",
    historia: "Un compañero escribió este script y asegura que «no funciona». Los métodos se ejecutan… pero <code>s</code> no cambia.",
    objetivo: "Arréglalo para que <code>s</code> quede como <code>BASE DE DATOS</code> (sin espacios en los extremos, con espacios en lugar de guiones bajos y en mayúsculas). Mira la traza: los avisos ⚠ te dicen dónde está el fallo.",
    entrada: "  base_de_datos  ",
    bandera: B6,
    inicial: "s.trim();\ns.replace(\"_\", \" \");\ns.toUpperCase();\n",
    pistas: ["Los <code>String</code> son <b>inmutables</b>: cada método devuelve un String nuevo y el original no cambia. Si no guardas el resultado, se pierde.", "Escribe <code>s =</code> delante de cada llamada: <code>s = s.trim();</code>."],
    solucion: 's = s.trim();\ns = s.replace("_", " ");\ns = s.toUpperCase();',
    aprende: "Este es <b>el error más común</b> con <code>String</code>: llamar a un método y no guardar el resultado. El compilador no avisa porque es código válido; solo lo ves comprobando el valor.",
    herramientas: ["trim", "replace", "toUpperCase"],
  },
  {
    id: "posiciones",
    titulo: "Posiciones",
    historia: "La clave está escondida entre letras sin sentido, en posiciones concretas.",
    objetivo: `La clave son las letras de las posiciones <b>${POS7.join(", ")}</b> (la primera posición es la 0), <b>en ese orden</b>.`,
    entrada: esconder(B7, POS7, 16),
    bandera: B7,
    inicial: PLANTILLA,
    pistas: ["<code>charAt(i)</code> devuelve el <code>char</code> de la posición <code>i</code>. Cuidado: sumar dos <code>char</code> da un <b>número</b>; empieza la expresión con una cadena vacía: <code>\"\" + s.charAt(1) + …</code>.", 's = "" + s.charAt(1) + s.charAt(4) + s.charAt(6) + s.charAt(9) + s.charAt(12) + s.charAt(15);'],
    solucion: 's = "" + s.charAt(1) + s.charAt(4) + s.charAt(6) + s.charAt(9) + s.charAt(12) + s.charAt(15);',
    aprende: "<code>char + char</code> es una <b>suma de códigos</b>, no una concatenación; con una cadena a la izquierda, <code>+</code> concatena. También puedes ir añadiendo las letras a un <code>StringBuilder</code> con <code>append</code>.",
    herramientas: ["charAt", "length"],
  },
  {
    id: "orden",
    titulo: "El orden importa",
    historia: "Este cifrado <b>intercambia</b> las letras <code>a</code> y <code>e</code>: donde había una <code>a</code> ahora hay una <code>e</code>, y al revés.",
    objetivo: "Deshaz el intercambio. Ojo: si cambias todas las <code>a</code> por <code>e</code> y luego todas las <code>e</code> por <code>a</code>, acabarás con puras <code>a</code>.",
    entrada: intercambiar(B8),
    bandera: B8,
    inicial: PLANTILLA,
    pistas: ["Necesitas un carácter <b>intermedio</b> que no aparezca en el texto, para no pisar los cambios. Por ejemplo, <code>#</code>.", 's = s.replace("a", "#");\ns = s.replace("e", "a");\ns = s.replace("#", "e");'],
    solucion: 's = s.replace("a", "#");\ns = s.replace("e", "a");\ns = s.replace("#", "e");',
    aprende: "Las llamadas se ejecutan <b>en orden</b> y cada una trabaja sobre el resultado de la anterior. Para intercambiar dos valores hace falta un tercero temporal, como cuando intercambias dos variables.",
    herramientas: ["replace"],
  },
  {
    id: "jefe",
    titulo: "Jefe final",
    historia: "El mensaje definitivo de la banda: tres capas de cifrado, una dentro de otra.",
    objetivo: "El mensaje útil está <b>entre corchetes</b>, <b>escrito al revés</b> y en <b>leetspeak</b> (<code>4</code>→a, <code>3</code>→e, <code>0</code>→o, <code>1</code>→i). Quita las tres capas.",
    entrada: `  ##[${leet(alReves(B9))}]##  `,
    bandera: B9,
    inicial: PLANTILLA,
    pistas: ["Quita las capas una a una y mira la traza después de cada línea: primero los corchetes (<code>indexOf</code> + <code>substring</code>), luego dale la vuelta (<code>StringBuilder</code>) y por último los cuatro <code>replace</code>.", 's = s.substring(s.indexOf("[") + 1, s.indexOf("]"));\ns = new StringBuilder(s).reverse().toString();\ns = s.replace("4", "a").replace("3", "e").replace("0", "o").replace("1", "i");'],
    solucion: 's = s.substring(s.indexOf("[") + 1, s.indexOf("]"));\ns = new StringBuilder(s).reverse().toString();\ns = s.replace("4", "a").replace("3", "e").replace("0", "o").replace("1", "i");',
    aprende: "Has combinado <code>indexOf</code>, <code>substring</code>, <code>StringBuilder</code> y <code>replace</code> encadenado. Para <b>comprobar</b> el resultado en un programa de verdad usarías <code>s.equals(\"…\")</code>, nunca <code>==</code>.",
    herramientas: ["substring", "indexOf", "StringBuilder", "replace"],
  },
];

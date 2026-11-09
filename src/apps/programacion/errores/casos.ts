// Casos de «Cazador de errores» (UT02 §3, §7, §12). Los mensajes de compilación son los de Eclipse
// (en inglés, como los verá el alumnado); los de ejecución, los de la JVM. `linea` es 0-based.

export interface Arreglo {
  texto: string;
  ok: boolean;
  porque: string;
}

export interface Caso {
  id: string;
  titulo: string;
  momento: "compilación" | "ejecución";
  codigo: string[];
  /** línea que Eclipse subraya (compilación) o donde salta la excepción (ejecución) */
  linea: number;
  mensaje: string;
  /** qué significa el mensaje, en cristiano (se enseña al acertar la línea) */
  traduccion: string;
  pregunta: string;
  arreglos: Arreglo[];
  pista: string;
}

const MAIN = (cuerpo: string[]): string[] => ["public class Main {", "    public static void main(String[] args) {", ...cuerpo.map((l) => (l ? "        " + l : "")), "    }", "}"];
/** número de líneas de cabecera de MAIN, para indicar `linea` respecto al cuerpo */
const OFFSET = 2;

const ok = (texto: string, porque: string): Arreglo => ({ texto, ok: true, porque });
const ko = (texto: string, porque: string): Arreglo => ({ texto, ok: false, porque });

export const CASOS: Caso[] = [
  {
    id: "import-scanner",
    titulo: "La clase que no encuentra",
    momento: "compilación",
    codigo: MAIN(['Scanner teclado = new Scanner(System.in);', 'System.out.println("¿Cómo te llamas?");', "String nombre = teclado.nextLine();"]),
    linea: OFFSET,
    mensaje: "Scanner cannot be resolved to a type",
    traduccion: "Java no sabe qué es <code>Scanner</code>: no es de <code>java.lang</code> y no la has importado.",
    pregunta: "¿Cómo se arregla?",
    arreglos: [
      ok("Añadir <code>import java.util.Scanner;</code> antes de la clase", "<code>Scanner</code> vive en <code>java.util</code>. En Eclipse: <code>Ctrl+Shift+O</code>."),
      ko("Cambiar <code>Scanner</code> por <code>scanner</code>", "Java distingue mayúsculas y el tipo se llama <code>Scanner</code>."),
      ko("Añadir <code>import java.lang.Scanner;</code>", "<code>Scanner</code> no está en <code>java.lang</code>: ese import tampoco se resuelve."),
      ko("Cambiar <code>new Scanner(System.in)</code> por <code>new Scanner()</code>", "Eso no arregla el tipo desconocido y además crearía otro error (no existe ese constructor)."),
    ],
    pista: "Una clase que no es de <code>java.lang</code> necesita algo antes de la clase.",
  },
  {
    id: "mismatch-double",
    titulo: "Un valor demasiado ancho",
    momento: "compilación",
    codigo: MAIN(["int mitad = 7 / 2.0;", "System.out.println(mitad);"]),
    linea: OFFSET,
    mensaje: "Type mismatch: cannot convert from double to int",
    traduccion: "<code>7 / 2.0</code> es un <code>double</code> (3.5) y no cabe en un <code>int</code> sin decirlo explícitamente.",
    pregunta: "Queremos guardar el 3.5. ¿Cuál es el arreglo?",
    arreglos: [
      ok("<code>double mitad = 7 / 2.0;</code>", "Si el resultado tiene decimales, la variable debe ser <code>double</code>."),
      ko("<code>int mitad = 7 / 2.0f;</code>", "Un <code>float</code> tampoco cabe en un <code>int</code>: sigue el mismo error."),
      ko("<code>int mitad = (int) 7 / 2.0;</code>", "El <i>cast</i> se aplica solo al 7 y luego se divide entre 2.0: el resultado sigue siendo <code>double</code>."),
      ko("<code>Int mitad = 7 / 2.0;</code>", "El tipo se escribe <code>int</code> en minúscula; <code>Int</code> no existe."),
    ],
    pista: "Piensa en qué tipo tiene el resultado de la división.",
  },
  {
    id: "metodo-indefinido",
    titulo: "El método de otro objeto",
    momento: "compilación",
    codigo: MAIN(["Scanner teclado = new Scanner(System.in);", "String texto = teclado.nextLine();", "int n = texto.nextInt();"]),
    linea: OFFSET + 2,
    mensaje: "The method nextInt() is undefined for the type String",
    traduccion: "Le pides <code>nextInt()</code> a un <code>String</code>, que no tiene ese método. Te has equivocado de objeto.",
    pregunta: "¿Cuál es el arreglo?",
    arreglos: [
      ok("<code>int n = teclado.nextInt();</code>", "<code>nextInt()</code> es un método de <code>Scanner</code>: se le pide al lector."),
      ko("<code>int n = Integer.nextInt(texto);</code>", "<code>Integer</code> no tiene <code>nextInt</code>; lo que tiene es <code>parseInt</code>."),
      ko("<code>int n = (int) texto;</code>", "No se puede convertir un <code>String</code> en <code>int</code> con un <i>cast</i>."),
      ko("<code>int n = texto.nextInt;</code>", "Sin paréntesis Java busca un atributo, y tampoco existe."),
    ],
    pista: "Mira de qué tipo es la variable a la que le pides el método.",
  },
  {
    id: "constructor-indefinido",
    titulo: "El constructor que no existe",
    momento: "compilación",
    codigo: MAIN(["Scanner lector = new Scanner();", "int n = lector.nextInt();"]),
    linea: OFFSET,
    mensaje: "The constructor Scanner() is undefined",
    traduccion: "No hay ningún constructor de <code>Scanner</code> que no pida parámetros: necesita saber de dónde lee.",
    pregunta: "¿Cuál es el arreglo?",
    arreglos: [
      ok("<code>new Scanner(System.in)</code>", "<code>Scanner(InputStream)</code> con el teclado como fuente."),
      ko("<code>new Scanner(\"System.in\")</code>", "Compila, pero lee el <i>texto</i> «System.in», no el teclado."),
      ko("<code>Scanner lector = Scanner();</code>", "Sin <code>new</code> Java busca un método llamado <code>Scanner</code>."),
      ko("<code>new Scanner(0)</code>", "No hay un constructor que reciba un entero."),
    ],
    pista: "Mira qué constructores ofrece el Javadoc de <code>Scanner</code>.",
  },
  {
    id: "no-inicializada",
    titulo: "Variable sin valor",
    momento: "compilación",
    codigo: MAIN(["int suma;", "suma = suma + 5;", "System.out.println(suma);"]),
    linea: OFFSET + 1,
    mensaje: "The local variable suma may not have been initialized",
    traduccion: "Lees <code>suma</code> (en <code>suma + 5</code>) antes de haberle dado ningún valor.",
    pregunta: "¿Cuál es el arreglo?",
    arreglos: [
      ok("Inicializarla al declararla: <code>int suma = 0;</code>", "Así tiene un valor desde el principio."),
      ko("Escribir <code>int suma = null;</code>", "Un <code>int</code> no puede ser <code>null</code> (es primitivo): daría «cannot convert from null to int»."),
      ko("Declararla como <code>Integer suma;</code>", "Sigue sin tener valor: el mismo error."),
      ko("Quitar la línea <code>System.out.println(suma);</code>", "El error es por la línea de la suma, no por imprimir."),
    ],
    pista: "Una variable local no tiene valor por defecto.",
  },
  {
    id: "punto-y-coma",
    titulo: "Falta algo al final",
    momento: "compilación",
    codigo: MAIN(["int edad = 17", 'System.out.println("Edad: " + edad);']),
    linea: OFFSET,
    mensaje: 'Syntax error, insert ";" to complete LocalVariableDeclarationStatement',
    traduccion: "Una sentencia termina en <code>;</code> y a la declaración de <code>edad</code> le falta.",
    pregunta: "¿Cuál es el arreglo?",
    arreglos: [
      ok("<code>int edad = 17;</code>", "Cada sentencia termina con punto y coma."),
      ko("<code>int edad = 17.</code>", "Un punto no cierra la sentencia."),
      ko("<code>int edad == 17</code>", "<code>==</code> compara; para asignar se usa <code>=</code>."),
      ko("<code>int edad = (17)</code>", "Los paréntesis no sustituyen al punto y coma."),
    ],
    pista: "Los errores de sintaxis suelen señalar la línea donde algo se queda sin cerrar.",
  },
  {
    id: "args-numero",
    titulo: "Argumentos de menos",
    momento: "compilación",
    codigo: MAIN(['String curso = "Programación";', "String trozo = curso.substring();", "System.out.println(trozo);"]),
    linea: OFFSET + 1,
    mensaje: "The method substring(int) in the type String is not applicable for the arguments ()",
    traduccion: "<code>substring</code> necesita al menos un argumento y no le has pasado ninguno.",
    pregunta: "Queremos «Prog». ¿Cuál es el arreglo?",
    arreglos: [
      ok("<code>curso.substring(0, 4)</code>", "Posiciones 0 a 3: el final no se incluye."),
      ko("<code>curso.substring(0, 3)</code>", "Compila, pero da «Pro»: el final es excluyente."),
      ko("<code>curso.substring(\"Prog\")</code>", "El parámetro es un <code>int</code>, no un <code>String</code>."),
      ko("<code>curso.substring(4, 0)</code>", "Compila, pero falla al ejecutar: el inicio no puede ser mayor que el final."),
    ],
    pista: "El mensaje te dice qué firma esperaba y qué le diste.",
  },
  {
    id: "arg-tipo",
    titulo: "Un argumento del tipo equivocado",
    momento: "compilación",
    codigo: MAIN(['int mayor = Math.max("3", 7);', "System.out.println(mayor);"]),
    linea: OFFSET,
    mensaje: "The method max(int, int) in the type Math is not applicable for the arguments (String, int)",
    traduccion: "<code>max</code> espera dos números y le pasas un texto («3») y un número.",
    pregunta: "¿Cuál es el arreglo?",
    arreglos: [
      ok("<code>Math.max(3, 7)</code>", "Dos <code>int</code>, como pide la firma."),
      ko("<code>Math.max('3', 7)</code>", "Compila, pero <code>'3'</code> es un <code>char</code> y se convierte en su código (51): daría 51."),
      ko("<code>Math.max(\"3\", \"7\")</code>", "Dos textos: sigue sin ser aplicable."),
      ko("<code>Math.max(3)</code>", "Falta un argumento."),
    ],
    pista: "Lee los tipos entre paréntesis: lo esperado y lo recibido.",
  },
  {
    id: "if-asignacion",
    titulo: "Comparar o asignar",
    momento: "compilación",
    codigo: MAIN(['String nombre = "Ana";', 'if (nombre = "Ana") {', '    System.out.println("Hola, Ana");', "}"]),
    linea: OFFSET + 1,
    mensaje: "Type mismatch: cannot convert from String to boolean",
    traduccion: "Un solo <code>=</code> <b>asigna</b>; el <code>if</code> necesita una condición <code>boolean</code>.",
    pregunta: "¿Cuál es el arreglo correcto para comparar <b>cadenas</b>?",
    arreglos: [
      ok("<code>if (nombre.equals(\"Ana\")) {</code>", "Para comparar el contenido de objetos se usa <code>equals</code>."),
      ko("<code>if (nombre == \"Ana\") {</code>", "Compila y hasta puede funcionar con literales, pero <code>==</code> compara <b>referencias</b>: es el error clásico de la 🚀 Profundización A."),
      ko("<code>if (nombre.equals = \"Ana\") {</code>", "Sigue siendo una asignación, además a un método."),
      ko("<code>if (nombre eq \"Ana\") {</code>", "<code>eq</code> no existe en Java."),
    ],
    pista: "Piensa en <code>==</code> frente a <code>equals()</code>.",
  },
  {
    id: "referencia-estatica",
    titulo: "Método de instancia desde la clase",
    momento: "compilación",
    codigo: MAIN(["int dado = Random.nextInt(6);", "System.out.println(dado);"]),
    linea: OFFSET,
    mensaje: "Cannot make a static reference to the non-static method nextInt(int) from the type Random",
    traduccion: "<code>nextInt</code> es de <b>instancia</b>: necesita un objeto <code>Random</code>, no se le puede pedir a la clase.",
    pregunta: "¿Cuál es el arreglo?",
    arreglos: [
      ok("Crear un objeto y pedírselo a él: <code>Random r = new Random(); int dado = r.nextInt(6);</code>", "Variable a la izquierda del punto = método de instancia."),
      ko("Cambiar a <code>Random.nextInt(6)()</code>", "No cambia nada: sigue llamándose sobre la clase."),
      ko("Añadir <code>static</code> delante de <code>int dado</code>", "<code>static</code> no se pone en variables locales."),
      ko("Cambiar a <code>Math.nextInt(6)</code>", "<code>Math</code> no tiene <code>nextInt</code>."),
    ],
    pista: "¿Hay algún objeto <code>Random</code> en el programa?",
  },
  {
    id: "comillas-simples",
    titulo: "Comillas de un solo carácter",
    momento: "compilación",
    codigo: MAIN(["String saludo = 'hola';", "System.out.println(saludo);"]),
    linea: OFFSET,
    mensaje: "Invalid character constant",
    traduccion: "Las comillas simples son para <b>un</b> carácter (<code>'a'</code>); un texto va entre comillas dobles.",
    pregunta: "¿Cuál es el arreglo?",
    arreglos: [
      ok("<code>String saludo = \"hola\";</code>", "Cadena = comillas dobles."),
      ko("<code>char saludo = 'hola';</code>", "Un <code>char</code> guarda un solo carácter: sigue el error."),
      ko("<code>String saludo = hola;</code>", "Sin comillas, Java busca una variable llamada <code>hola</code>."),
      ko("<code>String saludo = `hola`;</code>", "Las comillas invertidas no existen en Java."),
    ],
    pista: "Fíjate en el tipo de comillas.",
  },
  {
    id: "tipo-minuscula",
    titulo: "Mayúsculas importan",
    momento: "compilación",
    codigo: MAIN(['string nombre = "Ana";', "System.out.println(nombre.length());"]),
    linea: OFFSET,
    mensaje: "string cannot be resolved to a type",
    traduccion: "El tipo se llama <code>String</code> con mayúscula; <code>string</code> no existe.",
    pregunta: "¿Cuál es el arreglo?",
    arreglos: [
      ok("<code>String nombre = \"Ana\";</code>", "Las clases se escriben con mayúscula inicial."),
      ko("<code>import java.lang.string;</code>", "No hay ninguna clase <code>string</code> que importar."),
      ko("<code>var nombre = Ana;</code>", "Sin comillas, <code>Ana</code> sería una variable."),
      ko("<code>str nombre = \"Ana\";</code>", "<code>str</code> tampoco existe."),
    ],
    pista: "Compara cómo se escribe el tipo con el nombre real de la clase.",
  },
  {
    id: "round-long",
    titulo: "Redondear devuelve long",
    momento: "compilación",
    codigo: MAIN(["int nota = Math.round(7.5);", "System.out.println(nota);"]),
    linea: OFFSET,
    mensaje: "Type mismatch: cannot convert from long to int",
    traduccion: "Con un argumento <code>double</code>, <code>Math.round</code> devuelve un <code>long</code>, que es más ancho que <code>int</code>.",
    pregunta: "Queremos guardar el 8. ¿Cuál es el arreglo?",
    arreglos: [
      ok("Cambiar el tipo de la variable a <code>long</code>: <code>long nota = Math.round(7.5);</code>", "El tipo de la variable debe poder guardar lo que devuelve el método."),
      ko("<code>int nota = Math.round(7);</code>", "Con un <code>int</code> se promociona a <code>float</code> y devuelve <code>int</code>, pero el 7 no es el 7.5 que queremos redondear."),
      ko("<code>int nota = Math.round;</code>", "Faltan los paréntesis y los argumentos."),
      ko("<code>int nota = Math.round(7.5d);</code>", "El sufijo <code>d</code> solo dice que 7.5 es <code>double</code>, que es lo que ya era: <code>round</code> sigue devolviendo <code>long</code>."),
    ],
    pista: "Mira el tipo de retorno de <code>round</code> en el Javadoc.",
  },
  {
    id: "localdate-new",
    titulo: "Constructor escondido",
    momento: "compilación",
    codigo: MAIN(["LocalDate hoy = new LocalDate();", "System.out.println(hoy);"]),
    linea: OFFSET,
    mensaje: "The constructor LocalDate() is not visible",
    traduccion: "<code>LocalDate</code> existe, pero su constructor es privado: se crea con métodos de fábrica.",
    pregunta: "(Ya tiene el import.) ¿Cuál es el arreglo?",
    arreglos: [
      ok("<code>LocalDate hoy = LocalDate.now();</code>", "Método de fábrica estático: devuelve la fecha de hoy."),
      ko("<code>LocalDate hoy = new LocalDate(2026);</code>", "Sigue sin haber constructor visible."),
      ko("<code>LocalDate hoy = LocalDate();</code>", "Sin <code>new</code> ni método, no hay nada que llamar."),
      ko("<code>Date hoy = new LocalDate();</code>", "Cambiar el tipo no cambia el constructor."),
    ],
    pista: "Recuerda: <code>of</code>, <code>now</code>, <code>parse</code>.",
  },
  {
    id: "import-mal",
    titulo: "Un import en el paquete equivocado",
    momento: "compilación",
    codigo: ["import java.util.LocalDate;", "", "public class Main {", "    public static void main(String[] args) {", "        LocalDate hoy = LocalDate.now();", "    }", "}"],
    linea: 0,
    mensaje: "The import java.util.LocalDate cannot be resolved",
    traduccion: "En <code>java.util</code> no hay ninguna clase <code>LocalDate</code>: está en otro paquete.",
    pregunta: "¿Cuál es el arreglo?",
    arreglos: [
      ok("<code>import java.time.LocalDate;</code>", "<code>LocalDate</code> está en <code>java.time</code>."),
      ko("<code>import java.lang.LocalDate;</code>", "<code>java.lang</code> tampoco la tiene."),
      ko("<code>import LocalDate;</code>", "Un import necesita el paquete completo."),
      ko("Borrar el import y escribir <code>util.LocalDate hoy</code>", "Los nombres de paquete no se pueden abreviar así."),
    ],
    pista: "Busca la clase en el Javadoc: ¿en qué paquete aparece?",
  },
  {
    id: "unclosed",
    titulo: "Una cadena sin cerrar",
    momento: "compilación",
    codigo: MAIN(['System.out.println("Hola);', 'System.out.println("Adiós");']),
    linea: OFFSET,
    mensaje: "String literal is not properly closed by a double-quote",
    traduccion: "Abriste las comillas pero no las cerraste en esa línea.",
    pregunta: "¿Cuál es el arreglo?",
    arreglos: [
      ok("<code>System.out.println(\"Hola\");</code>", "Cierra las comillas antes del paréntesis."),
      ko("<code>System.out.println(Hola);</code>", "Sin comillas, <code>Hola</code> sería una variable que no existe."),
      ko("<code>System.out.println('Hola);</code>", "Las comillas simples son para caracteres y tampoco están cerradas."),
      ko("<code>System.out.println(\"Hola)\";</code>", "Mueve las comillas, pero deja el paréntesis dentro del texto."),
    ],
    pista: "Cuenta las comillas de la línea.",
  },
  {
    id: "npe",
    titulo: "La referencia que no apunta a nada",
    momento: "ejecución",
    codigo: MAIN(["String nombre = null;", 'System.out.println("Calculando…");', "System.out.println(nombre.length());"]),
    linea: OFFSET + 2,
    mensaje: 'Exception in thread "main" java.lang.NullPointerException: Cannot invoke "String.length()" because "nombre" is null',
    traduccion: "<b>No es de compilación</b>: el programa arranca y falla al ejecutar. <code>nombre</code> vale <code>null</code> y le pides un método.",
    pregunta: "¿Cuál es el arreglo?",
    arreglos: [
      ok("Hacer que <code>nombre</code> apunte a un objeto antes de usarlo: <code>String nombre = \"Ana\";</code>", "Una referencia solo puede recibir métodos si apunta a un objeto."),
      ko("Cambiar <code>length()</code> por <code>size()</code>", "<code>String</code> no tiene <code>size()</code> y el fallo no es el nombre del método."),
      ko("Escribir <code>new nombre.length()</code>", "<code>new</code> se usa con una clase, no con una variable."),
      ko("Escribir <code>String nombre;</code> (sin <code>= null</code>)", "Una variable local sin valor da un error de compilación distinto."),
    ],
    pista: "Lee el mensaje entero: te dice qué método y sobre qué variable.",
  },
  {
    id: "sioobe",
    titulo: "Fuera de rango",
    momento: "ejecución",
    codigo: MAIN(['String s = "Galileo";', "String trozo = s.substring(3, 10);", "System.out.println(trozo);"]),
    linea: OFFSET + 1,
    mensaje: 'Exception in thread "main" java.lang.StringIndexOutOfBoundsException: begin 3, end 10, length 7',
    traduccion: "Compila bien, pero al ejecutar pides hasta la posición 10 de una cadena de 7 caracteres.",
    pregunta: "Queremos desde la posición 3 hasta el final. ¿Cuál es el arreglo?",
    arreglos: [
      ok("<code>s.substring(3, s.length())</code> (o <code>s.substring(3)</code>)", "El final válido es <code>length()</code>, que además no se incluye."),
      ko("<code>s.substring(10, 3)</code>", "Invertir los números produce otro error: el inicio no puede ser mayor."),
      ko("<code>s.substring(3, 8)</code>", "Sigue pasándose de los 7 caracteres."),
      ko("<code>s.substring(3, -1)</code>", "Los índices negativos tampoco son válidos."),
    ],
    pista: "El mensaje dice «length 7».",
  },
  {
    id: "nfe",
    titulo: "Texto que no es un número",
    momento: "ejecución",
    codigo: MAIN(['String entrada = "diez";', "int n = Integer.parseInt(entrada);", "System.out.println(n + 1);"]),
    linea: OFFSET + 1,
    mensaje: 'Exception in thread "main" java.lang.NumberFormatException: For input string: "diez"',
    traduccion: "Compila bien, pero <code>parseInt</code> solo entiende cifras: «diez» no es un número.",
    pregunta: "¿Qué cambio hace que funcione?",
    arreglos: [
      ok("Que el texto contenga cifras: <code>String entrada = \"10\";</code>", "<code>parseInt</code> convierte textos formados por dígitos (en la UT09 aprenderás a capturar el fallo)."),
      ko("Cambiar <code>parseInt</code> por <code>parseDouble</code>", "«diez» tampoco es un <code>double</code>."),
      ko("Escribir <code>(int) entrada</code>", "No se puede convertir un <code>String</code> con un <i>cast</i>."),
      ko("Quitar las comillas: <code>String entrada = diez;</code>", "Sin comillas, <code>diez</code> sería una variable inexistente."),
    ],
    pista: "Mira de qué texto se pide convertir el número.",
  },
];

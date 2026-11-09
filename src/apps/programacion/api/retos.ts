// Retos de «Javadoc en juego». Dos tipos: `elige` (una opción correcta, y de las demás se explica por qué
// falla) y `escribe` (el alumno escribe lo que imprime el código). Se ordenan por criterio de evaluación.

export interface Opcion {
  codigo: string;
  ok: boolean;
  porque: string;
}

export interface RetoApi {
  id: string;
  ce: "c" | "d" | "e" | "f" | "g" | "h";
  titulo: string;
  enunciado: string;
  /** clases del Javadoc que se enseñan (claves de API) */
  clases: string[];
  tipo: "elige" | "escribe";
  /** código de partida (para «escribe») */
  codigo?: string[];
  opciones?: Opcion[];
  /** respuestas aceptadas (sin distinguir mayúsculas) */
  respuestas?: string[];
  pista: string;
  explicacion: string;
}

export const CE: Record<RetoApi["ce"], string> = {
  c: "Instanciar objetos",
  d: "Métodos y propiedades",
  e: "Métodos estáticos",
  f: "Parámetros",
  g: "Librerías e import",
  h: "Constructores",
};

const si = (codigo: string, porque: string): Opcion => ({ codigo, ok: true, porque });
const no = (codigo: string, porque: string): Opcion => ({ codigo, ok: false, porque });

function elige(id: string, ce: RetoApi["ce"], titulo: string, enunciado: string, clases: string[], opciones: Opcion[], pista: string, explicacion: string): RetoApi {
  return { id, ce, titulo, enunciado, clases, tipo: "elige", opciones, pista, explicacion };
}
function escribe(id: string, ce: RetoApi["ce"], titulo: string, enunciado: string, clases: string[], codigo: string[], respuestas: string[], pista: string, explicacion: string): RetoApi {
  return { id, ce, titulo, enunciado, clases, tipo: "escribe", codigo, respuestas, pista, explicacion };
}

export const RETOS_API: RetoApi[] = [
  // ============ CE c · Instanciar objetos ============
  elige("c-scanner", "c", "Leer del teclado", "Necesitas leer lo que teclea el usuario (ya has escrito <code>import java.util.Scanner;</code>). ¿Qué línea crea el objeto correcto?", ["Scanner"], [
    si("Scanner teclado = new Scanner(System.in);", "Tipo, nombre, <code>new</code> y constructor con la fuente (<code>System.in</code> es el teclado)."),
    no("Scanner teclado = Scanner(System.in);", "Falta <code>new</code>: sin él Java busca un <i>método</i> llamado <code>Scanner</code> y no existe."),
    no("scanner teclado = new Scanner(System.in);", "Java distingue mayúsculas: el tipo es <code>Scanner</code>. Eclipse diría «scanner cannot be resolved to a type»."),
    no("Scanner teclado = new Scanner();", "No hay constructor sin parámetros: <code>Scanner</code> necesita saber de dónde lee."),
  ], "Las cuatro piezas: tipo, nombre, <code>new</code> y constructor con lo que necesita.", "<code>new</code> reserva el objeto en el montón y la variable guarda su referencia."),
  elige("c-random", "c", "Un dado de 1 a 6", "Tienes <code>Random dado = new Random();</code>. ¿Qué línea da un número del <b>1 al 6</b> (ambos incluidos)?", ["Random"], [
    si("int n = dado.nextInt(1, 7);", "<code>nextInt(origin, bound)</code>: el origen se incluye y el límite <b>no</b>, así que 1 a 7 da 1…6."),
    no("int n = dado.nextInt(1, 6);", "El límite superior es excluyente: daría 1…5 y nunca saldría el 6."),
    no("int n = dado.nextInt(6);", "Da de 0 a 5: <code>nextInt(bound)</code> empieza en 0."),
    no("int n = Random.nextInt(1, 7);", "<code>nextInt</code> es de instancia: se llama sobre el objeto <code>dado</code>, no sobre la clase."),
  ], "Mira el Javadoc: ¿el segundo número se incluye o se excluye?", "Los intervalos en Java suelen ser semiabiertos: [inicio, fin)."),
  elige("c-localdate", "c", "Una fecha concreta", "Quieres el <b>24 de marzo de 2008</b> como objeto. ¿Qué línea es correcta? (<code>LocalDate</code> ya está importada.)", ["LocalDate"], [
    si("LocalDate f = LocalDate.of(2008, 3, 24);", "Método de fábrica estático: año, mes y día, en ese orden."),
    no("LocalDate f = new LocalDate(2008, 3, 24);", "<code>LocalDate</code> no tiene constructor público: se crea con métodos de fábrica (<code>of</code>, <code>now</code>, <code>parse</code>)."),
    no("LocalDate f = LocalDate.of(24, 3, 2008);", "Compila, pero el orden es año, mes, día: pedirías el día 2008 del año 24 y fallaría al ejecutar con <code>DateTimeException</code>."),
    no('LocalDate f = LocalDate.of(2008, "marzo", 24);', "El segundo parámetro es un número (o un <code>Month</code>), no un texto: no compila."),
  ], "Busca en el Javadoc cómo se crea una <code>LocalDate</code>: no es con <code>new</code>.", "Muchas clases modernas esconden el constructor y ofrecen métodos de fábrica estáticos."),
  elige("c-clase-texto", "c", "Elegir la clase: texto en un bucle", "Vas a construir un informe añadiendo trozos de texto dentro de un bucle de 50 000 vueltas. ¿Qué clase te conviene?", ["String", "StringBuilder"], [
    si("StringBuilder", "Es mutable: <code>append</code> añade al mismo buffer, con coste lineal."),
    no("String", "Es inmutable: cada <code>+=</code> crea un objeto nuevo copiando todo lo anterior (coste cuadrático)."),
    no("Scanner", "<code>Scanner</code> sirve para <i>leer</i> datos, no para construir texto."),
    no("Math", "<code>Math</code> es una caja de funciones matemáticas; no guarda texto."),
  ], "Piensa en qué clase es mutable.", "Requisito → clase: texto por trozos = <code>StringBuilder</code>; texto ya formado = <code>String</code>."),
  elige("c-clase-fechas", "c", "Elegir la clase: días que faltan", "Quieres saber cuántos <b>días</b> hay entre hoy y el examen (dos <code>LocalDate</code>). ¿Qué usas?", ["ChronoUnit", "Period"], [
    si("ChronoUnit.DAYS.between(hoy, examen)", "Mide en unidades homogéneas (días) y devuelve un <code>long</code>."),
    no("Math.abs(hoy - examen)", "No se pueden restar fechas con <code>-</code>: no son números."),
    no("new Random().nextInt(30)", "Eso es un número al azar, no una diferencia de fechas."),
    no("hoy.length() - examen.length()", "<code>LocalDate</code> no tiene <code>length()</code>, y no tendría sentido."),
  ], "Es la clase que mide «cuántas unidades hay entre».", "<code>ChronoUnit</code> para totales en una unidad; <code>Period</code> para «x años, y meses, z días»."),

  // ============ CE d · Métodos y propiedades ============
  escribe("d-length", "d", "Longitud", "¿Qué imprime este código?", ["String"], ['String s = "Programación";', "System.out.println(s.length());"], ["12"], "Cuenta las letras, incluida la «ó».", "<code>length()</code> devuelve el número de caracteres: 12."),
  escribe("d-charat", "d", "Un carácter", "¿Qué imprime?", ["String"], ['System.out.println("Galileo".charAt(0));'], ["G"], "La primera posición es la 0.", "En Java los índices empiezan en 0."),
  escribe("d-substring", "d", "Un trozo", "¿Qué imprime?", ["String"], ['System.out.println("Galileo".substring(0, 3));'], ["Gal"], "El segundo número no se incluye.", "<code>substring(0, 3)</code> toma las posiciones 0, 1 y 2."),
  escribe("d-indexof", "d", "Dónde está", "¿Qué imprime?", ["String"], ['System.out.println("Galileo".indexOf("l"));'], ["2"], "Cuenta desde 0 y para en la primera «l».", "G=0, a=1, l=2."),
  escribe("d-noesta", "d", "Si no está", "¿Qué imprime?", ["String"], ['System.out.println("Galileo".indexOf("z"));'], ["-1"], "Mira qué devuelve <code>indexOf</code> cuando no encuentra nada.", "Devuelve -1 cuando no encuentra la cadena."),
  escribe("d-inmutable", "d", "¿Cambia el String?", "¿Qué imprime?", ["String"], ['String s = "hola";', "s.toUpperCase();", "System.out.println(s);"], ["hola"], "¿Se guarda el resultado de <code>toUpperCase()</code> en algún sitio?", "Los <code>String</code> son inmutables: <code>toUpperCase()</code> devuelve un objeto nuevo que aquí se descarta."),
  escribe("d-trim", "d", "Encadenar métodos", "¿Qué imprime?", ["String"], ['System.out.println("  hola  ".trim().length());'], ["4"], "Primero se ejecuta <code>trim()</code> y sobre su resultado, <code>length()</code>.", "<code>trim()</code> devuelve «hola» (4 letras) y <code>length()</code> lo mide."),
  escribe("d-split", "d", "Partir un texto", "¿Qué imprime?", ["String"], ['System.out.println("a,b,c".split(",").length);'], ["3"], "<code>split</code> devuelve un array con las piezas.", "Las piezas son «a», «b» y «c». (Las longitudes de los arrays van sin paréntesis: UT04.)"),
  escribe("d-reverse", "d", "StringBuilder encadenado", "¿Qué imprime?", ["StringBuilder"], ['StringBuilder sb = new StringBuilder("abc");', "System.out.println(sb.reverse().toString());"], ["cba"], "<code>reverse()</code> devuelve el propio objeto.", "<code>reverse()</code> invierte el contenido y devuelve el mismo objeto, por eso se puede encadenar <code>toString()</code>."),
  elige("d-ultimo", "d", "El último carácter", "Dada <code>String s = \"Galileo\";</code>, ¿qué expresión da su <b>último</b> carácter?", ["String"], [
    si("s.charAt(s.length() - 1)", "La última posición es <code>length() - 1</code>."),
    no("s.charAt(s.length())", "Compila, pero la posición <code>length()</code> no existe: lanza <code>StringIndexOutOfBoundsException</code>."),
    no("s.last()", "<code>String</code> no tiene un método <code>last()</code>: no compila."),
    no("s[s.length() - 1]", "Los corchetes son para arrays; con un <code>String</code> no compila."),
  ], "Si hay 7 caracteres, ¿cuál es el índice del último?", "Los índices van de 0 a <code>length() - 1</code>."),
  escribe("d-mes", "d", "Un mes con sorpresa", "¿Qué imprime? (<code>LocalDate</code> imprime en formato aaaa-mm-dd.)", ["LocalDate"], ["LocalDate f = LocalDate.of(2026, 1, 31);", "System.out.println(f.plusMonths(1));"], ["2026-02-28"], "Febrero no tiene 31 días. Lee la descripción de <code>plusMonths</code>.", "Se ajusta al último día válido del mes: 28 de febrero de 2026."),
  escribe("d-bisiesto", "d", "Un día más en febrero", "¿Qué imprime? (2024 es bisiesto.)", ["LocalDate"], ["LocalDate f = LocalDate.of(2024, 2, 28);", "System.out.println(f.plusDays(2));"], ["2024-03-01"], "En un año bisiesto febrero tiene 29 días.", "28 + 1 = 29 de febrero; +1 más = 1 de marzo."),
  escribe("d-semana", "d", "Día de la semana", "¿Qué imprime? (Responde con el nombre en inglés, en mayúsculas.)", ["LocalDate"], ["LocalDate f = LocalDate.of(2026, 3, 15);", "System.out.println(f.getDayOfWeek());"], ["SUNDAY"], "El 1 de enero de 2026 fue jueves. Cuenta semanas.", "Devuelve un <code>DayOfWeek</code>; el 15 de marzo de 2026 es domingo."),
  escribe("d-period", "d", "Meses entre dos fechas", "¿Qué imprime?", ["Period"], ["LocalDate a = LocalDate.of(2026, 1, 15);", "LocalDate b = LocalDate.of(2026, 3, 20);", "System.out.println(Period.between(a, b).getMonths());"], ["2"], "Del 15 de enero al 15 de marzo hay dos meses completos; los días sobrantes van aparte.", "El <code>Period</code> es «2 meses y 5 días»; <code>getMonths()</code> solo devuelve la parte de meses."),
  escribe("d-dias", "d", "Días entre dos fechas", "¿Qué imprime?", ["ChronoUnit"], ["LocalDate a = LocalDate.of(2026, 12, 1);", "LocalDate b = LocalDate.of(2026, 12, 25);", "System.out.println(ChronoUnit.DAYS.between(a, b));"], ["24"], "El final no se cuenta.", "Del 1 al 25 hay 24 días de diferencia."),

  // ============ CE e · Métodos estáticos ============
  elige("e-cual", "e", "Reconocer un método estático", "¿Cuál de estas llamadas es a un método <b>estático</b>?", ["Math", "String"], [
    si("Math.sqrt(144)", "A la izquierda del punto hay un <b>nombre de clase</b> y no existe ningún objeto <code>Math</code>."),
    no('"Hola".length()', "A la izquierda hay un objeto (un <code>String</code>): es de instancia."),
    no("teclado.nextInt()", "<code>teclado</code> es una variable con un objeto <code>Scanner</code>: método de instancia."),
    no("fecha.plusDays(30)", "<code>fecha</code> es un objeto <code>LocalDate</code>: de instancia."),
  ], "Fíjate en qué hay a la izquierda del punto.", "Variable a la izquierda = instancia; nombre de clase = estático."),
  escribe("e-pow", "e", "Potencias", "¿Qué imprime?", ["Math"], ["System.out.println(Math.pow(2, 10));"], ["1024.0"], "Fíjate en el tipo que devuelve <code>pow</code>.", "<code>pow</code> devuelve <code>double</code>, así que imprime 1024.0 y no 1024."),
  escribe("e-round", "e", "Redondear", "¿Qué imprime?", ["Math"], ["System.out.println(Math.round(2.675));"], ["3"], "<code>round</code> devuelve el entero más cercano.", "2,675 está más cerca de 3 que de 2. El resultado es un <code>long</code>, por eso no lleva decimales."),
  escribe("e-floor", "e", "Suelo y techo", "¿Qué imprime?", ["Math"], ["System.out.println(Math.floor(-2.5));"], ["-3.0"], "<code>floor</code> baja al entero menor, y el resultado es <code>double</code>.", "El mayor entero menor o igual que -2,5 es -3, y se imprime como <code>-3.0</code>."),
  escribe("e-parseint", "e", "Texto o número", "¿Qué imprime?", ["Integer"], ['System.out.println("17" + 3);'], ["173"], "Con una cadena a la izquierda, <code>+</code> concatena.", "<code>\"17\" + 3</code> es concatenación: «173». Para sumar hay que convertir antes con <code>Integer.parseInt</code>."),
  escribe("e-parseint2", "e", "Convertir y sumar", "¿Qué imprime?", ["Integer"], ['System.out.println(Integer.parseInt("17") + 3);'], ["20"], "Primero se convierte el texto en número.", "<code>parseInt(\"17\")</code> da el número 17, y 17 + 3 = 20."),
  escribe("e-binario", "e", "A binario", "¿Qué imprime?", ["Integer"], ["System.out.println(Integer.toBinaryString(10));"], ["1010"], "10 = 8 + 2.", "10 en binario es 1010."),
  escribe("e-join", "e", "Unir con separador", "¿Qué imprime?", ["String"], ['System.out.println(String.join("-", "2026", "09", "16"));'], ["2026-09-16"], "El primer argumento es el separador.", "<code>join</code> pone el delimitador entre cada elemento."),
  elige("e-porque", "e", "¿Por qué es estático?", "¿Por qué <code>Integer.parseInt(\"42\")</code> es estático y <code>teclado.nextInt()</code> no?", ["Integer", "Scanner"], [
    si("<code>parseInt</code> solo depende de su argumento; <code>nextInt</code> necesita recordar por dónde va leyendo (tiene estado).", "La regla: si solo depende de los argumentos, estático; si necesita el estado de un objeto concreto, de instancia."),
    no("Porque <code>Integer</code> es más antigua que <code>Scanner</code>.", "La antigüedad no tiene nada que ver con el diseño."),
    no("Porque <code>static</code> hace el método más rápido.", "No es una cuestión de velocidad, sino de si hace falta un objeto con estado."),
    no("Porque <code>Scanner</code> no puede tener métodos estáticos.", "Puede tenerlos; simplemente <code>nextInt</code> necesita el estado del lector."),
  ], "¿Qué necesita recordar cada uno entre una llamada y la siguiente?", "Un buen argumento de examen: «<code>nextInt</code> es de instancia porque el <code>Scanner</code> debe recordar la posición del cursor»."),
  elige("e-math-new", "e", "¿Un objeto Math?", "Escribes <code>Math m = new Math();</code> para calcular raíces. ¿Qué pasa?", ["Math"], [
    si("No compila: el constructor de <code>Math</code> no es visible (es privado).", "<code>Math</code> es una caja de herramientas: no se instancia, se usa a través de la clase."),
    no("Compila y crea un objeto con todas las funciones.", "No se puede crear: no hay constructor accesible."),
    no("Compila, pero falla al ejecutar con <code>NullPointerException</code>.", "El error aparece antes: en compilación."),
    no("Compila y funciona igual que <code>Math.sqrt</code>.", "No compila: no hay ningún objeto <code>Math</code> que crear."),
  ], "El Javadoc dice que no tiene constructor público.", "Los métodos estáticos no necesitan objeto; por eso <code>Math</code> impide crearlo."),

  // ============ CE f · Parámetros ============
  elige("f-substring", "f", "Los argumentos correctos", "Con <code>String s = \"Programación\";</code> quieres obtener <code>\"Prog\"</code>. ¿Qué llamada es correcta?", ["String"], [
    si("s.substring(0, 4)", "Posiciones 0, 1, 2 y 3: el final (4) no se incluye."),
    no("s.substring(0, 3)", "Daría «Pro»: el segundo argumento es excluyente."),
    no("s.substring(4, 0)", "Compila (dos <code>int</code>) pero falla al ejecutar: el inicio no puede ser mayor que el final."),
    no('s.substring("Prog")', "El parámetro es un <code>int</code>; pasar un <code>String</code> no compila."),
  ], "El intervalo es [inicio, fin).", "El compilador te salva del número y del tipo de argumentos, pero no del orden ni del significado."),
  elige("f-replace", "f", "El orden importa", "Quieres cambiar «Eclipse» por «IntelliJ» en <code>String curso</code>. ¿Qué llamada lo consigue?", ["String"], [
    si('curso.replace("Eclipse", "IntelliJ")', "Primero lo buscado y después el sustituto."),
    no('curso.replace("IntelliJ", "Eclipse")', "Compila, pero busca «IntelliJ» (que no está) y no cambia nada: el compilador no vigila tus intenciones."),
    no('curso.replace("Eclipse")', "Falta un argumento: no hay una versión de <code>replace</code> con un solo parámetro."),
    no("curso.replace('Eclipse', 'IntelliJ')", "Las comillas simples son para <i>un</i> carácter; con varios no compila."),
  ], "El primer parámetro es <code>target</code> y el segundo <code>replacement</code>.", "Leer la firma en el Javadoc es la forma de acertar el orden."),
  escribe("f-substring2", "f", "Un solo argumento", "¿Qué imprime?", ["String"], ['System.out.println("Galileo".substring(2));'], ["lileo"], "Con un solo número, corta desde ahí hasta el final.", "G=0, a=1, l=2: desde la posición 2 hasta el final queda «lileo»."),
  escribe("f-indexof", "f", "Buscar desde una posición", "¿Qué imprime? (Posiciones: P0 r1 o2 g3 r4 a5 m6 a7…)", ["String"], ['String c = "Programación en Java";', 'System.out.println(c.indexOf("a", 6));'], ["7"], "Busca la primera «a» a partir de la posición 6 (incluida).", "La «a» de la posición 5 queda atrás; la siguiente está en la 7."),
  elige("f-sin-args", "f", "Leer el error", "Eclipse dice: <code>The method substring(int) in the type String is not applicable for the arguments ()</code>. ¿Qué ha pasado?", ["String"], [
    si("Has llamado al método sin pasar los argumentos que pide.", "El mensaje enumera la firma esperada, <code>substring(int)</code>, y los argumentos que le has dado, <code>()</code>: ninguno."),
    no("El método existe pero lanza una excepción al ejecutar.", "Eso es un error de ejecución; este mensaje es de compilación."),
    no("Te falta un <code>import</code>.", "Entonces diría «cannot be resolved to a type»."),
    no("Has pasado un argumento de tipo equivocado.", "Entre paréntesis hay <i>nada</i>: faltan argumentos, no sobra tipo."),
  ], "Compara la firma entre paréntesis con lo que has pasado.", "Un mensaje de compilación te dice qué esperaba y qué recibió."),
  elige("f-tipo", "f", "Promoción de tipos", "¿Qué ocurre con <code>double r = Math.pow(2, 10);</code> si se le pasan dos <code>int</code>?", ["Math"], [
    si("Compila: los <code>int</code> se convierten solos en <code>double</code> y <code>r</code> vale 1024.0.", "Un <code>int</code> cabe en un <code>double</code>, así que la conversión implícita es segura."),
    no("No compila: <code>pow</code> solo admite <code>double</code> escritos con decimales.", "Un <code>int</code> se promociona a <code>double</code> automáticamente."),
    no("Compila, pero falla al ejecutar.", "No hay ningún fallo al ejecutar."),
    no("Compila y <code>r</code> vale 1024 (entero).", "Una variable <code>double</code> guarda 1024.0."),
  ], "Piensa en la promoción de tipos de la UT01.", "De estrecho a ancho no hace falta <i>cast</i>."),
  elige("f-argumentos", "f", "Parámetro o argumento", "En la llamada <code>Math.max(12, 7)</code>, ¿qué son el 12 y el 7?", ["Math"], [
    si("Argumentos: los valores reales que pasas al llamar.", "El <b>parámetro</b> es el hueco de la firma (<code>int a</code>); el <b>argumento</b> es el valor que pones."),
    no("Parámetros.", "Los parámetros son los huecos declarados en la firma, <code>int a, int b</code>."),
    no("Atributos.", "Un atributo es una propiedad guardada dentro de un objeto."),
    no("Constructores.", "Un constructor crea objetos; esto es una llamada a un método."),
  ], "Uno es el hueco, otro es el valor.", "Terminología de examen: parámetro (declaración) frente a argumento (llamada)."),

  // ============ CE g · Librerías e import ============
  elige("g-import", "g", "El import que falta", "Eclipse marca <code>Scanner cannot be resolved to a type</code>. ¿Qué línea arregla el problema?", ["Scanner"], [
    si("import java.util.Scanner;", "<code>Scanner</code> vive en el paquete <code>java.util</code>."),
    no("import java.lang.Scanner;", "Ese import no se puede resolver: <code>Scanner</code> no está en <code>java.lang</code>."),
    no("import Scanner;", "Un import siempre lleva el nombre completo con su paquete."),
    no("include java.util.Scanner;", "<code>include</code> no existe en Java."),
  ], "Mira la cabecera del Javadoc de <code>Scanner</code>: ¿en qué paquete está?", "<code>Ctrl+Shift+O</code> en Eclipse lo añade solo."),
  elige("g-lang", "g", "Sin import", "¿Cuál de estas clases se puede usar <b>sin</b> escribir <code>import</code>?", ["String", "Scanner", "Random", "LocalDate"], [
    si("String", "Está en <code>java.lang</code>, el único paquete que Java importa siempre."),
    no("Scanner", "Está en <code>java.util</code>: hay que importarla."),
    no("Random", "Está en <code>java.util</code>: hay que importarla."),
    no("LocalDate", "Está en <code>java.time</code>: hay que importarla."),
  ], "Una de ellas es de <code>java.lang</code>.", "<code>String</code>, <code>Math</code>, <code>Integer</code> y <code>StringBuilder</code> son de <code>java.lang</code>."),
  elige("g-asterisco", "g", "El asterisco", "¿Qué hace <code>import java.time.*;</code>?", ["LocalDate", "ChronoUnit"], [
    si("Importa todas las clases del paquete <code>java.time</code>, pero no las de sus subpaquetes (como <code>java.time.temporal</code>).", "Por eso <code>ChronoUnit</code>, que está en <code>java.time.temporal</code>, necesita su propio import."),
    no("Importa <code>java.time</code> y todos sus subpaquetes.", "El asterisco no baja a los subpaquetes."),
    no("Importa solo <code>LocalDate</code>.", "Importa todas las clases del paquete, no una."),
    no("No hace nada: es un comentario.", "Es una sentencia <code>import</code> normal."),
  ], "Los paquetes son como carpetas.", "Para <code>ChronoUnit</code> hace falta <code>import java.time.temporal.ChronoUnit;</code>."),
  elige("g-leap", "g", "Buscar en el Javadoc", "Necesitas saber si el año de un <code>LocalDate</code> es bisiesto. ¿Qué método te da el Javadoc?", ["LocalDate"], [
    si("fecha.isLeapYear()", "Devuelve un <code>boolean</code>."),
    no("fecha.isBissextile()", "No existe en la API."),
    no("fecha.leap()", "No existe en la API."),
    no("LocalDate.checkYear(fecha)", "No existe en la API."),
  ], "Los métodos booleanos suelen empezar por <code>is</code>.", "Leer el Javadoc es la forma de descubrir qué sabe hacer una clase."),
  elige("g-between", "g", "Leer una firma", "Según <code>Period.between(LocalDate startDateInclusive, LocalDate endDateExclusive)</code>, ¿qué fecha NO se cuenta?", ["Period"], [
    si("La fecha final.", "Su nombre lo dice: <code>endDateExclusive</code>."),
    no("La fecha inicial.", "Es <code>startDateInclusive</code>: sí se incluye."),
    no("Ninguna.", "El extremo final es exclusivo."),
    no("Las dos.", "Solo el final es exclusivo."),
  ], "Los nombres de los parámetros cuentan cosas.", "Los intervalos semiabiertos son la norma en Java."),
  elige("g-edad", "g", "La edad de alguien", "¿Qué calcula bien la <b>edad en años</b> de una persona?", ["Period", "ChronoUnit"], [
    si("Period.between(nacimiento, hoy).getYears()", "El <code>Period</code> mide en años, meses y días de calendario."),
    no("ChronoUnit.DAYS.between(nacimiento, hoy) / 365", "Los años bisiestos hacen que dividir entre 365 falle en el cumpleaños."),
    no("hoy.getYear() - nacimiento.getYear()", "Ignora si ya ha cumplido años este año."),
    no("hoy.minusYears(nacimiento)", "<code>minusYears</code> espera un número, no una fecha."),
  ], "Hay una clase pensada para «x años, y meses, z días».", "Reutiliza la API en lugar de hacer la aritmética a mano."),

  // ============ CE h · Constructores ============
  elige("h-scanner", "h", "El constructor adecuado", "Quieres leer del <b>teclado</b>. ¿Qué constructor de <code>Scanner</code> usas?", ["Scanner"], [
    si("new Scanner(System.in)", "<code>Scanner(InputStream)</code>: <code>System.in</code> es el flujo del teclado."),
    no('new Scanner("System.in")', "Compila, pero usa <code>Scanner(String)</code>: leería el <i>texto</i> «System.in», no el teclado."),
    no("new Scanner()", "No existe un constructor sin parámetros."),
    no("new Scanner(System.out)", "<code>System.out</code> es una salida (<code>PrintStream</code>); no es un <code>InputStream</code>."),
  ], "Dos constructores aceptan un solo argumento: mira de qué tipo es.", "La sobrecarga elige el constructor según el <b>tipo</b> del argumento."),
  elige("h-reconocer", "h", "Reconocer un constructor", "¿Cuál de estas firmas de <code>StringBuilder</code> es un <b>constructor</b>?", ["StringBuilder"], [
    si("public StringBuilder(String str)", "Se llama igual que la clase y no declara tipo de retorno."),
    no("public StringBuilder append(String str)", "Tiene tipo de retorno (<code>StringBuilder</code>) y nombre distinto: es un método."),
    no("public int length()", "Es un método: devuelve <code>int</code>."),
    no("public String toString()", "Es un método: devuelve <code>String</code>."),
  ], "Se llama exactamente como la clase y no tiene tipo de retorno.", "Constructor = mismo nombre que la clase, sin tipo de retorno."),
  escribe("h-vacio", "h", "Sobrecarga de StringBuilder", "¿Qué imprime?", ["StringBuilder"], ['StringBuilder a = new StringBuilder("hola");', "StringBuilder b = new StringBuilder();", "System.out.println(a.length() + b.length());"], ["4"], "Cada constructor deja el objeto en un estado distinto.", "El primero tiene «hola» (4) y el segundo está vacío (0): 4 + 0 = 4."),
  escribe("h-capacidad", "h", "Un número no es un texto", "¿Qué imprime?", ["StringBuilder"], ["System.out.println(new StringBuilder(16).length());"], ["0"], "Mira el constructor que recibe un <code>int</code>.", "<code>StringBuilder(int capacity)</code> reserva sitio, pero el contenido sigue vacío: longitud 0."),
  elige("h-semilla", "h", "Reproducible", "Quieres un <code>Random</code> que dé <b>siempre la misma secuencia</b> (para poder repetir una prueba). ¿Cuál usas?", ["Random"], [
    si("new Random(42)", "El constructor con semilla: misma semilla, misma secuencia."),
    no("new Random()", "La semilla cambia cada vez: secuencia distinta."),
    no("Random.seed(42)", "<code>Random</code> no tiene ese método estático."),
    no('new Random("42")', "El constructor espera un <code>long</code>, no un texto."),
  ], "Mira el segundo constructor del Javadoc.", "La semilla (<i>seed</i>) fija el punto de partida del generador."),
];

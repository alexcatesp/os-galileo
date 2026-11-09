// Extracto del Javadoc de las clases de la UT02 (firmas reales; descripciones resumidas en español).

export interface Entrada {
  firma: string;
  descr: string;
}

export interface ClaseApi {
  nombre: string;
  paquete: string;
  resumen: string;
  constructores?: Entrada[];
  metodos: Entrada[];
}

export const API: Record<string, ClaseApi> = {
  String: {
    nombre: "String",
    paquete: "java.lang",
    resumen: "Cadena de caracteres inmutable. Sus métodos nunca modifican el objeto: devuelven uno nuevo. No necesita import.",
    metodos: [
      { firma: "public int length()", descr: "Número de caracteres." },
      { firma: "public char charAt(int index)", descr: "Carácter en esa posición. La primera es la 0; si no existe, lanza StringIndexOutOfBoundsException." },
      { firma: "public String substring(int beginIndex)", descr: "Desde beginIndex hasta el final." },
      { firma: "public String substring(int beginIndex, int endIndex)", descr: "Desde beginIndex (incluido) hasta endIndex (excluido). Lanza excepción si el intervalo no es válido." },
      { firma: "public int indexOf(String str)", descr: "Posición de la primera aparición de str, o -1 si no está." },
      { firma: "public int indexOf(String str, int fromIndex)", descr: "Como el anterior, buscando a partir de fromIndex (incluido)." },
      { firma: "public String replace(CharSequence target, CharSequence replacement)", descr: "Sustituye todas las apariciones de target por replacement." },
      { firma: "public String toUpperCase()", descr: "Devuelve la cadena en mayúsculas." },
      { firma: "public String trim()", descr: "Devuelve la cadena sin espacios al principio ni al final." },
      { firma: "public boolean equals(Object anObject)", descr: "true si el contenido es igual." },
      { firma: "public boolean contains(CharSequence s)", descr: "true si contiene esa secuencia." },
      { firma: "public String[] split(String regex)", descr: "Parte la cadena por el separador y devuelve las piezas." },
      { firma: "public static String valueOf(double d)", descr: "Representación en texto del valor (también existe para int, boolean, char…)." },
      { firma: "public static String join(CharSequence delimiter, CharSequence... elements)", descr: "Une los elementos poniendo el delimitador entre ellos." },
    ],
  },
  StringBuilder: {
    nombre: "StringBuilder",
    paquete: "java.lang",
    resumen: "Secuencia de caracteres mutable. Ideal para construir texto por trozos.",
    constructores: [
      { firma: "public StringBuilder()", descr: "Crea un constructor vacío." },
      { firma: "public StringBuilder(int capacity)", descr: "Crea un constructor vacío con esa capacidad inicial." },
      { firma: "public StringBuilder(String str)", descr: "Crea un constructor con el contenido de str." },
    ],
    metodos: [
      { firma: "public StringBuilder append(String str)", descr: "Añade al final y devuelve el propio objeto (también hay versiones para int, char, double…)." },
      { firma: "public StringBuilder reverse()", descr: "Invierte el contenido y devuelve el propio objeto." },
      { firma: "public int length()", descr: "Número de caracteres." },
      { firma: "public String toString()", descr: "Devuelve un String con el contenido." },
    ],
  },
  Math: {
    nombre: "Math",
    paquete: "java.lang",
    resumen: "Funciones matemáticas. Todos sus métodos son estáticos y no tiene constructor público.",
    metodos: [
      { firma: "public static double sqrt(double a)", descr: "Raíz cuadrada." },
      { firma: "public static double pow(double a, double b)", descr: "a elevado a b." },
      { firma: "public static int abs(int a)", descr: "Valor absoluto (hay versiones para long, float y double)." },
      { firma: "public static long round(double a)", descr: "Entero más cercano. Devuelve long." },
      { firma: "public static double floor(double a)", descr: "Mayor entero menor o igual que a (como double)." },
      { firma: "public static double ceil(double a)", descr: "Menor entero mayor o igual que a (como double)." },
      { firma: "public static int max(int a, int b)", descr: "El mayor de los dos (hay versiones para long, float y double)." },
      { firma: "public static final double PI", descr: "Constante π." },
    ],
  },
  Integer: {
    nombre: "Integer",
    paquete: "java.lang",
    resumen: "Envoltorio del tipo int, con utilidades estáticas de conversión.",
    metodos: [
      { firma: "public static int parseInt(String s)", descr: "Convierte el texto en un int. Lanza NumberFormatException si no es un número." },
      { firma: "public static String toBinaryString(int i)", descr: "El número en binario, como texto." },
      { firma: "public static String toHexString(int i)", descr: "El número en hexadecimal (minúsculas), como texto." },
      { firma: "public static final int MAX_VALUE", descr: "El mayor int posible: 2147483647." },
    ],
  },
  Scanner: {
    nombre: "Scanner",
    paquete: "java.util",
    resumen: "Lee y separa datos de una fuente (teclado, texto, fichero).",
    constructores: [
      { firma: "public Scanner(InputStream source)", descr: "Lee de un flujo de entrada, por ejemplo System.in (el teclado)." },
      { firma: "public Scanner(String source)", descr: "Lee de la cadena dada (el propio texto, no un fichero)." },
    ],
    metodos: [
      { firma: "public int nextInt()", descr: "Lee el siguiente entero." },
      { firma: "public double nextDouble()", descr: "Lee el siguiente número real." },
      { firma: "public String next()", descr: "Lee la siguiente palabra." },
      { firma: "public String nextLine()", descr: "Lee hasta el final de la línea." },
      { firma: "public void close()", descr: "Cierra el lector." },
    ],
  },
  Random: {
    nombre: "Random",
    paquete: "java.util",
    resumen: "Generador de números pseudoaleatorios.",
    constructores: [
      { firma: "public Random()", descr: "Semilla distinta cada vez." },
      { firma: "public Random(long seed)", descr: "Con esa semilla: la secuencia es siempre la misma." },
    ],
    metodos: [
      { firma: "public int nextInt(int bound)", descr: "Entero entre 0 (incluido) y bound (excluido)." },
      { firma: "public int nextInt(int origin, int bound)", descr: "Entero entre origin (incluido) y bound (excluido). Desde Java 17." },
      { firma: "public double nextDouble()", descr: "Real entre 0.0 (incluido) y 1.0 (excluido)." },
      { firma: "public boolean nextBoolean()", descr: "true o false al azar." },
    ],
  },
  LocalDate: {
    nombre: "LocalDate",
    paquete: "java.time",
    resumen: "Fecha sin hora ni zona (año-mes-día). Inmutable: los métodos devuelven fechas nuevas. No se crea con new.",
    metodos: [
      { firma: "public static LocalDate now()", descr: "La fecha de hoy." },
      { firma: "public static LocalDate of(int year, int month, int dayOfMonth)", descr: "Crea la fecha. Lanza DateTimeException si no existe." },
      { firma: "public static LocalDate parse(CharSequence text)", descr: "Interpreta un texto en formato ISO (aaaa-mm-dd)." },
      { firma: "public LocalDate plusDays(long daysToAdd)", descr: "Fecha resultante de sumar días." },
      { firma: "public LocalDate plusMonths(long monthsToAdd)", descr: "Suma meses; si el día no existe en el mes resultante, se ajusta al último día válido." },
      { firma: "public LocalDate minusYears(long yearsToSubtract)", descr: "Resta años." },
      { firma: "public int getYear()", descr: "El año." },
      { firma: "public int getMonthValue()", descr: "El mes, de 1 a 12." },
      { firma: "public int getDayOfMonth()", descr: "El día del mes." },
      { firma: "public DayOfWeek getDayOfWeek()", descr: "El día de la semana (MONDAY… SUNDAY)." },
      { firma: "public boolean isLeapYear()", descr: "true si el año es bisiesto." },
      { firma: "public boolean isAfter(ChronoLocalDate other)", descr: "true si es posterior a other." },
    ],
  },
  Period: {
    nombre: "Period",
    paquete: "java.time",
    resumen: "Cantidad de tiempo en años, meses y días (de calendario).",
    metodos: [
      { firma: "public static Period between(LocalDate startDateInclusive, LocalDate endDateExclusive)", descr: "Periodo entre dos fechas." },
      { firma: "public int getYears()", descr: "La parte de años." },
      { firma: "public int getMonths()", descr: "La parte de meses." },
      { firma: "public int getDays()", descr: "La parte de días." },
    ],
  },
  ChronoUnit: {
    nombre: "ChronoUnit",
    paquete: "java.time.temporal",
    resumen: "Unidades de tiempo (DAYS, MONTHS, YEARS…) para medir diferencias homogéneas.",
    metodos: [{ firma: "public long between(Temporal temporal1Inclusive, Temporal temporal2Exclusive)", descr: "Número de unidades completas entre dos fechas. Se usa así: ChronoUnit.DAYS.between(a, b)." }],
  },
};

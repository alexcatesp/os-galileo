// Ejercicios de «Pensar antes de programar» (serie de apuntes de FP). Aquí solo hay enunciados,
// datos de prueba y criterios de corrección: las soluciones no se incluyen en la aplicación.
// Marcas en los textos: ¦código¦ = código en línea; las líneas que empiezan por «- » son una lista.

import type { Estructura, Prueba } from "./comprobar";

export type Nivel = "base" | "medio" | "avanzado";
export type TipoEjercicio = "diseno" | "traza" | "error" | "traduccion" | "razona";

export type Pregunta =
  | { tipo: "texto"; texto: string; aceptadas: string[] }
  | { tipo: "vf"; texto: string; correcta: boolean }
  | { tipo: "libre"; texto: string };

export interface Parte {
  nombre: string;
  pruebas?: Prueba[];
  estructura?: Estructura;
}

export interface Ejercicio {
  id: string;
  bloque: number;
  titulo: string;
  nivel: Nivel;
  tipo: TipoEjercicio;
  enunciado: string;
  /** datos de prueba tal como se muestran al alumno */
  datos?: string;
  pista?: string;
  /** acepta pasos y condiciones en lenguaje natural */
  libre?: boolean;
  /** código con el que se abre el editor */
  inicial?: string;
  /** código que se muestra como diagrama en los ejercicios de traducción */
  diagrama?: string;
  pruebas?: Prueba[];
  estructura?: Estructura;
  /** si hay varias versiones del mismo ejercicio, cada una con sus criterios */
  partes?: Parte[];
  preguntas?: Pregunta[];
}

export const BLOQUES: Record<number, string> = {
  1: "Secuencia y datos",
  2: "Decisiones simples y dobles",
  3: "Decisiones anidadas y compuestas",
  4: "Selección múltiple",
  5: "Bucle MIENTRAS",
  6: "Bucle REPETIR",
  7: "Bucle PARA",
  8: "Contadores y acumuladores",
  9: "Subprocesos",
  10: "Problemas integradores",
};

export const EJERCICIOS: Ejercicio[] = [
  // ───────────── 1. Secuencia y datos ─────────────
  {
    id: "1.1", bloque: 1, titulo: "Lavarse los dientes", nivel: "base", tipo: "diseno", libre: true,
    enunciado: "Escribe el algoritmo de la tarea de lavarse los dientes, con un mínimo de seis pasos. Solo puedes usar óvalos y rectángulos: no hay decisiones ni bucles.",
    pista: "Revisa el orden: ¿se puede echar la pasta antes de coger el cepillo? ¿Y aclarar el cepillo antes de usarlo?",
    estructura: { minPasos: 6, noUsa: ["si", "mientras", "repetir", "para", "segun"] },
  },
  {
    id: "1.2", bloque: 1, titulo: "Cambiar una bombilla fundida", nivel: "base", tipo: "diseno", libre: true,
    enunciado: "Describe cómo cambiar una bombilla fundida de una lámpara de techo. El algoritmo debe incluir las precauciones de seguridad necesarias en el orden correcto.\n\nDespués, piensa qué ocurriría si se intercambiaran dos de los pasos que has escrito. Elige un par cuyo intercambio sea peligroso.",
    estructura: { minPasos: 5, noUsa: ["si", "mientras", "repetir", "para", "segun"] },
  },
  {
    id: "1.3", bloque: 1, titulo: "Instrucciones desordenadas", nivel: "base", tipo: "diseno", libre: true,
    enunciado: "Estas instrucciones sirven para hacer una foto con el móvil y enviarla a un amigo, pero están desordenadas. Ordénalas en el editor.",
    pista: "Hay un orden claramente correcto para casi todos los pasos. Si dudas entre dos, justifica tu elección.",
    inicial: `INICIO
  Pulsar el botón de enviar
  Desbloquear el móvil
  Abrir la aplicación de la cámara
  Elegir al amigo en la lista de contactos
  Encuadrar la foto
  Pulsar el botón de disparo
  Abrir la foto en la galería
  Pulsar el botón de compartir
FIN
`,
    estructura: {
      minPasos: 8,
      orden: [["desbloquear"], ["aplicación de la cámara|abrir la aplicacion"], ["encuadrar"], ["botón de disparo|disparo"], ["galería|galeria"], ["compartir"], ["amigo", "enviar"]],
    },
  },
  {
    id: "1.4", bloque: 1, titulo: "Las cuatro operaciones", nivel: "base", tipo: "diseno",
    enunciado: "Diseña un algoritmo que lea dos números y muestre su suma, su resta, su producto y su división. De momento, supón que el segundo número nunca es 0 (en el ejercicio 2.8 resolveremos ese caso).",
    datos: "10 y 4 → suma 14, resta 6, producto 40, división 2.5.",
    pruebas: [
      { entrada: [10, 4], numeros: [14, 6, 40, 2.5] },
      { entrada: [7, 2], numeros: [9, 5, 14, 3.5] },
      { entrada: [0, 5], numeros: [5, -5, 0, 0] },
      { entrada: [-3, 3], numeros: [0, -6, -9, -1] },
    ],
  },
  {
    id: "1.5", bloque: 1, titulo: "De euros a dólares", nivel: "base", tipo: "diseno",
    enunciado: "Diseña un algoritmo que convierta una cantidad de euros a dólares. El tipo de cambio varía cada día, así que debe pedirse como dato, igual que el porcentaje de IVA del apartado 4.5 de la Parte 1.",
    datos: "50 euros con un tipo de cambio de 1.10 → 55 dólares.",
    pruebas: [
      { entrada: [50, 1.1], numeros: [55] },
      { entrada: [100, 0.9], numeros: [90] },
      { entrada: [0, 1.2], numeros: [0] },
    ],
  },
  {
    id: "1.6", bloque: 1, titulo: "Nota final ponderada", nivel: "medio", tipo: "diseno",
    enunciado: "La nota final de un módulo se calcula así: el examen vale un 60 %, las prácticas un 30 % y la actitud un 10 %. Diseña un algoritmo que pida las tres notas (en ese orden) y muestre la nota final.",
    datos: "Examen 7, prácticas 8, actitud 10 → 7.6. Examen 5, prácticas 5, actitud 5 → 5.",
    pista: "Un 60 % es multiplicar por 0.6.",
    pruebas: [
      { entrada: [7, 8, 10], numeros: [7.6] },
      { entrada: [5, 5, 5], numeros: [5] },
      { entrada: [10, 0, 0], numeros: [6] },
      { entrada: [0, 10, 10], numeros: [4] },
    ],
  },
  {
    id: "1.7", bloque: 1, titulo: "Segundos a horas, minutos y segundos", nivel: "medio", tipo: "diseno",
    enunciado: "Diseña un algoritmo que lea una cantidad de segundos (un número entero) y la muestre expresada en horas, minutos y segundos.",
    datos: "3725 → 1 h 2 min 5 s. 59 → 0 h 0 min 59 s. 7200 → 2 h 0 min 0 s.",
    pista: "¦MOD¦ da el resto de una división entera. Si a un número le quitas su resto, lo que queda se divide exactamente: ¦(3725 - 3725 MOD 3600) / 3600¦ vale 1.",
    pruebas: [
      { entrada: [3725], numeros: [1, 2, 5] },
      { entrada: [59], numeros: [0, 0, 59] },
      { entrada: [7200], numeros: [2, 0, 0] },
      { entrada: [0], numeros: [0, 0, 0] },
      { entrada: [86399], numeros: [23, 59, 59] },
    ],
  },
  {
    id: "1.8", bloque: 1, titulo: "Intercambiar dos variables", nivel: "medio", tipo: "diseno",
    enunciado: "Diseña un algoritmo que lea dos números en las variables ¦a¦ y ¦b¦, intercambie sus valores y muestre las dos variables. Después del intercambio, ¦a¦ debe contener lo que tenía ¦b¦ y al revés.\n\nAntes de resolverlo, haz la prueba de escritorio de esta propuesta y explica por qué no funciona: ¦a <- b¦ seguido de ¦b <- a¦.",
    datos: "a = 3, b = 8 → a = 8, b = 3.",
    pista: "Piensa en cómo intercambiarías el contenido de un vaso de agua y uno de zumo. Necesitas un tercer vaso.",
    pruebas: [
      { entrada: [3, 8], numeros: [8, 3] },
      { entrada: [5, 5], numeros: [5, 5] },
      { entrada: [-2, 7], numeros: [7, -2] },
    ],
  },
  {
    id: "1.9", bloque: 1, titulo: "Ticket de compra", nivel: "avanzado", tipo: "diseno",
    enunciado: "Diseña un algoritmo que pida el precio unitario de un producto, la cantidad comprada, un porcentaje de descuento y el porcentaje de IVA (en ese orden). Debe mostrar el subtotal (precio por cantidad), el importe del descuento, la base imponible (subtotal menos descuento), el importe del IVA sobre la base y el total.",
    datos: "Precio 12.50, cantidad 4, descuento 10 %, IVA 21 % → subtotal 50, descuento 5, base 45, IVA 9.45, total 54.45.",
    pruebas: [
      { entrada: [12.5, 4, 10, 21], numeros: [50, 5, 45, 9.45, 54.45] },
      { entrada: [10, 1, 0, 0], numeros: [10, 0, 10, 0, 10] },
      { entrada: [20, 3, 50, 10], numeros: [60, 30, 30, 3, 33] },
    ],
  },
  {
    id: "1.10", bloque: 1, titulo: "¿Qué muestra este algoritmo?", nivel: "base", tipo: "traza",
    enunciado: "Haz la prueba de escritorio de este algoritmo y di qué aparece en pantalla. No lo resuelvas «de cabeza»: rellena la tabla fila a fila en tu cuaderno.",
    inicial: `// Misterio1
INICIO
  a <- 5
  b <- a + 2
  a <- b * 2
  b <- a - b
  c <- a MOD b
  ESCRIBIR a, " ", b, " ", c
FIN
`,
    preguntas: [{ tipo: "texto", texto: "¿Qué aparece en pantalla?", aceptadas: ["14 7 0"] }],
  },

  // ───────────── 2. Decisiones simples y dobles ─────────────
  {
    id: "2.1", bloque: 2, titulo: "Regar las plantas", nivel: "base", tipo: "diseno", libre: true,
    enunciado: "Escribe el algoritmo de regar una planta: se toca la tierra y, solo si está seca, se riega. En cualquier caso, al final se vuelve a dejar la maceta en su sitio. Usa una decisión simple.",
    estructura: { sinSino: true, ultimoEs: "accion", minPasos: 3 },
  },
  {
    id: "2.2", bloque: 2, titulo: "Ir al instituto", nivel: "base", tipo: "diseno", libre: true,
    enunciado: "Por la mañana miras el reloj. Si vas con retraso, vas en autobús; si no, vas andando. En los dos casos, al llegar entras en clase. Escribe el algoritmo con una decisión doble.",
    estructura: { siConSino: true, ultimoEs: "accion", minPasos: 4 },
  },
  {
    id: "2.3", bloque: 2, titulo: "Aprobado o suspenso", nivel: "base", tipo: "diseno",
    enunciado: "Diseña un algoritmo que lea una nota y muestre «Aprobado» si es mayor o igual que 5 y «Suspenso» en otro caso.",
    datos: "4.9 → Suspenso. 5 → Aprobado. 7 → Aprobado.",
    pruebas: [
      { entrada: [4.9], textos: ["suspenso"], sinTextos: ["aprobado"] },
      { entrada: [5], textos: ["aprobado"], sinTextos: ["suspenso"] },
      { entrada: [7], textos: ["aprobado"], sinTextos: ["suspenso"] },
      { entrada: [0], textos: ["suspenso"], sinTextos: ["aprobado"] },
      { entrada: [10], textos: ["aprobado"], sinTextos: ["suspenso"] },
    ],
  },
  {
    id: "2.4", bloque: 2, titulo: "Par o impar", nivel: "base", tipo: "diseno",
    enunciado: "Diseña un algoritmo que lea un número entero y diga si es par o impar.",
    datos: "7 → impar. 10 → par. 0 → par.",
    pista: "Un número es par si al dividirlo entre 2 el resto es 0.",
    pruebas: [
      { entrada: [7], textos: ["impar"], sinTextos: ["par"] },
      { entrada: [10], textos: ["par"], sinTextos: ["impar"] },
      { entrada: [0], textos: ["par"], sinTextos: ["impar"] },
      { entrada: [-3], textos: ["impar"], sinTextos: ["par"] },
    ],
  },
  {
    id: "2.5", bloque: 2, titulo: "Mayoría de edad", nivel: "base", tipo: "diseno",
    enunciado: "Diseña un algoritmo que lea la edad de una persona y diga si es mayor de edad (18 años o más). Si es menor, debe mostrar además cuántos años le faltan.",
    datos: "17 → «Menor de edad, te falta 1 año». 18 → «Mayor de edad». 30 → «Mayor de edad».",
    pruebas: [
      { entrada: [17], textos: ["menor"], numeros: [1], sinTextos: ["mayor"] },
      { entrada: [18], textos: ["mayor"], sinTextos: ["menor"] },
      { entrada: [30], textos: ["mayor"], sinTextos: ["menor"] },
      { entrada: [5], textos: ["menor"], numeros: [13], sinTextos: ["mayor"] },
    ],
  },
  {
    id: "2.6", bloque: 2, titulo: "Valor absoluto", nivel: "medio", tipo: "diseno",
    enunciado: "El valor absoluto de un número es ese mismo número sin signo. Diseña un algoritmo que lea un número y muestre su valor absoluto usando solo una decisión simple, sin ¦SI NO¦.",
    datos: "-8 → 8. 0 → 0. 5 → 5.",
    pista: "Si el número es negativo, cámbiale el signo guardando el resultado en la misma variable.",
    estructura: { sinSino: true },
    pruebas: [
      { entrada: [-8], exactos: [8] },
      { entrada: [0], exactos: [0] },
      { entrada: [5], exactos: [5] },
      { entrada: [-2.5], exactos: [2.5] },
    ],
  },
  {
    id: "2.7", bloque: 2, titulo: "Gastos de envío", nivel: "medio", tipo: "diseno",
    enunciado: "Una tienda en línea cobra 4.95 € de gastos de envío, pero el envío es gratis para pedidos de 50 € o más. Diseña un algoritmo que lea el importe del pedido y muestre el total a pagar.",
    datos: "49.99 → 54.94. 50 → 50. 80 → 80.",
    pruebas: [
      { entrada: [49.99], ultimo: 54.94 },
      { entrada: [50], ultimo: 50, sinNumeros: [54.95] },
      { entrada: [80], ultimo: 80 },
      { entrada: [10], ultimo: 14.95 },
    ],
  },
  {
    id: "2.8", bloque: 2, titulo: "División segura", nivel: "medio", tipo: "diseno",
    enunciado: "Retoma el ejercicio 1.4, pero solo con la división: lee dos números y muestra el resultado de dividir el primero entre el segundo. Si el segundo es 0, en lugar de dividir debe mostrar un mensaje de error.",
    datos: "10 y 4 → 2.5. 10 y 0 → «No se puede dividir entre 0». 0 y 5 → 0.",
    pruebas: [
      { entrada: [10, 4], ultimo: 2.5 },
      { entrada: [10, 0], hayTexto: true, sinTextos: ["infinity", "nan"] },
      { entrada: [0, 5], ultimo: 0 },
      { entrada: [9, 3], ultimo: 3 },
    ],
  },
  {
    id: "2.9", bloque: 2, titulo: "Dos números ordenados", nivel: "avanzado", tipo: "diseno",
    enunciado: "Diseña un algoritmo que lea dos números en ¦a¦ y ¦b¦ y los muestre ordenados de menor a mayor.\n\nCondición: la instrucción de escritura final debe ser siempre la misma, ¦ESCRIBIR a, \" \", b¦. Es decir, si hace falta, tienes que intercambiar los valores antes.",
    datos: "8 y 3 → 3 8. 2 y 9 → 2 9. 5 y 5 → 5 5.",
    pista: "Reutiliza lo que aprendiste en el ejercicio 1.8.",
    estructura: { maxEscribir: 1, ultimoEs: "escribir" },
    pruebas: [
      { entrada: [8, 3], exactos: [3, 8] },
      { entrada: [2, 9], exactos: [2, 9] },
      { entrada: [5, 5], exactos: [5, 5] },
      { entrada: [-1, -5], exactos: [-5, -1] },
    ],
  },
  {
    id: "2.10", bloque: 2, titulo: "Encuentra los errores", nivel: "medio", tipo: "error",
    enunciado: "Este algoritmo debería mostrar «Aprobado» o «Suspenso» según la nota. Tiene dos errores. Encuéntralos haciendo la prueba de escritorio con los datos 5 y 3, explica por qué son errores y corrígelos.",
    inicial: `// Calificar
INICIO
  LEER nota
  SI nota > 5 ENTONCES
    ESCRIBIR "Aprobado"
  SI NO
    ESCRIBIR "nota"
  FIN SI
FIN
`,
    pruebas: [
      { entrada: [5], textos: ["aprobado"], sinTextos: ["suspenso"] },
      { entrada: [3], textos: ["suspenso"], sinTextos: ["aprobado"] },
      { entrada: [7], textos: ["aprobado"], sinTextos: ["suspenso"] },
      { entrada: [4.99], textos: ["suspenso"], sinTextos: ["aprobado"] },
    ],
  },

  // ───────────── 3. Decisiones anidadas y compuestas ─────────────
  {
    id: "3.1", bloque: 3, titulo: "¿Qué me pongo?", nivel: "base", tipo: "diseno", libre: true,
    enunciado: "Antes de salir miras el tiempo. Si llueve, te pones el chubasquero. Si no llueve pero hace frío, te pones el abrigo. Si no llueve ni hace frío, sales en camiseta. Escribe el algoritmo con decisiones anidadas.",
    estructura: { anidado: true, minPasos: 5 },
  },
  {
    id: "3.2", bloque: 3, titulo: "Positivo, negativo o cero", nivel: "base", tipo: "diseno",
    enunciado: "Diseña un algoritmo que lea un número y diga si es positivo, negativo o cero.",
    datos: "7 → positivo. -2 → negativo. 0 → cero.",
    pruebas: [
      { entrada: [7], textos: ["positivo"], sinTextos: ["negativo", "cero"] },
      { entrada: [-2], textos: ["negativo"], sinTextos: ["positivo", "cero"] },
      { entrada: [0], textos: ["cero"], sinTextos: ["positivo", "negativo"] },
      { entrada: [0.5], textos: ["positivo"], sinTextos: ["negativo", "cero"] },
    ],
  },
  {
    id: "3.3", bloque: 3, titulo: "Evaluar condiciones", nivel: "base", tipo: "traza",
    enunciado: "Con los valores ¦a = 3¦, ¦b = 7¦ y ¦c = 3¦, indica si cada condición es verdadera o falsa. Para las compuestas, escribe primero en tu cuaderno el valor de cada parte.",
    preguntas: [
      { tipo: "vf", texto: "a < b Y b < c", correcta: false },
      { tipo: "vf", texto: "a = c O b = c", correcta: true },
      { tipo: "vf", texto: "NO (a > b)", correcta: true },
      { tipo: "vf", texto: "a <> c Y b > a", correcta: false },
      { tipo: "vf", texto: "(a < b O b < c) Y NO (a = c)", correcta: false },
      { tipo: "vf", texto: "a + c < b", correcta: true },
    ],
  },
  {
    id: "3.4", bloque: 3, titulo: "Calificación con decimales", nivel: "medio", tipo: "diseno",
    enunciado: "Diseña un algoritmo que lea una nota que puede tener decimales y muestre su calificación: Insuficiente (menos de 5), Suficiente (de 5 a menos de 6), Bien (de 6 a menos de 7), Notable (de 7 a menos de 9) y Sobresaliente (de 9 a 10). Si la nota es menor que 0 o mayor que 10, debe mostrar «Nota no válida».",
    datos: "4.99 → Insuficiente. 5 → Suficiente. 6.5 → Bien. 9 → Sobresaliente. 10.5 → Nota no válida. -1 → Nota no válida.",
    pista: "Recuerda el recuadro final del apartado 5.7: aquí ¦SEGÚN¦ no sirve. Empieza descartando las notas no válidas.",
    pruebas: [
      { entrada: [4.99], textos: ["insuficiente"], sinTextos: ["suficiente", "no valida"] },
      { entrada: [5], textos: ["suficiente"], sinTextos: ["insuficiente", "bien"] },
      { entrada: [5.99], textos: ["suficiente"], sinTextos: ["insuficiente", "bien"] },
      { entrada: [6.5], textos: ["bien"], sinTextos: ["notable"] },
      { entrada: [7], textos: ["notable"], sinTextos: ["bien", "sobresaliente"] },
      { entrada: [8.9], textos: ["notable"], sinTextos: ["sobresaliente"] },
      { entrada: [9], textos: ["sobresaliente"], sinTextos: ["notable"] },
      { entrada: [10], textos: ["sobresaliente"], sinTextos: ["no valida"] },
      { entrada: [0], textos: ["insuficiente"], sinTextos: ["no valida"] },
      { entrada: [10.5], textos: ["no valida|invalida|incorrecta|error"], sinTextos: ["sobresaliente"] },
      { entrada: [-1], textos: ["no valida|invalida|incorrecta|error"], sinTextos: ["insuficiente"] },
    ],
  },
  {
    id: "3.5", bloque: 3, titulo: "Año bisiesto", nivel: "medio", tipo: "diseno",
    enunciado: "Un año es bisiesto si es divisible entre 4 y no es divisible entre 100, o bien si es divisible entre 400. Diseña un algoritmo que lea un año y diga si es bisiesto (escribe «bisiesto» o «no bisiesto»). Resuélvelo con una sola decisión y una condición compuesta.",
    datos: "2024 → bisiesto. 1900 → no bisiesto. 2000 → bisiesto. 2026 → no bisiesto.",
    pista: "«Divisible entre 4» se escribe ¦anio MOD 4 = 0¦. Usa paréntesis para dejar claro qué se agrupa con qué.",
    estructura: { maxDecisiones: 1 },
    pruebas: [
      { entrada: [2024], textos: ["bisiesto"], sinTextos: ["no"] },
      { entrada: [1900], textos: ["no", "bisiesto"] },
      { entrada: [2000], textos: ["bisiesto"], sinTextos: ["no"] },
      { entrada: [2026], textos: ["no", "bisiesto"] },
      { entrada: [2100], textos: ["no", "bisiesto"] },
      { entrada: [1996], textos: ["bisiesto"], sinTextos: ["no"] },
    ],
  },
  {
    id: "3.6", bloque: 3, titulo: "Cuota del gimnasio", nivel: "medio", tipo: "diseno",
    enunciado: "La cuota mensual de un gimnasio es de 40 €. Los estudiantes y las personas de 65 años o más tienen un 30 % de descuento. Diseña un algoritmo que pregunte la edad y si la persona es estudiante (respondiendo «S» o «N») y muestre la cuota.",
    datos: "20 años, estudiante → 28. 70 años, no estudiante → 28. 65 años, no estudiante → 28. 40 años, no estudiante → 40.",
    pruebas: [
      { entrada: [20, "S"], ultimo: 28 },
      { entrada: [70, "N"], ultimo: 28 },
      { entrada: [65, "N"], ultimo: 28 },
      { entrada: [40, "N"], ultimo: 40 },
      { entrada: [64, "N"], ultimo: 40 },
      { entrada: [17, "S"], ultimo: 28 },
    ],
  },
  {
    id: "3.7", bloque: 3, titulo: "Tipo de triángulo", nivel: "avanzado", tipo: "diseno",
    enunciado: "Con tres segmentos solo se puede construir un triángulo si cada lado es menor que la suma de los otros dos. Diseña un algoritmo que lea tres longitudes y diga si forman un triángulo y, en caso afirmativo, de qué tipo es: equilátero (tres lados iguales), isósceles (dos iguales) o escaleno (todos distintos).",
    datos: "3, 3, 3 → equilátero. 3, 3, 5 → isósceles. 3, 4, 5 → escaleno. 1, 2, 5 → no es un triángulo. 2, 2, 4 → no es un triángulo.",
    pruebas: [
      { entrada: [3, 3, 3], textos: ["equilatero"], sinTextos: ["isosceles", "escaleno"] },
      { entrada: [3, 3, 5], textos: ["isosceles"], sinTextos: ["equilatero", "escaleno"] },
      { entrada: [5, 3, 5], textos: ["isosceles"], sinTextos: ["equilatero", "escaleno"] },
      { entrada: [3, 4, 5], textos: ["escaleno"], sinTextos: ["equilatero", "isosceles"] },
      { entrada: [2, 3, 4], textos: ["escaleno"], sinTextos: ["equilatero", "isosceles"] },
      { entrada: [1, 2, 5], textos: ["no es un triangulo|no forman|no es triangulo|no se puede|no existe|no forma"], sinTextos: ["equilatero", "isosceles", "escaleno"] },
      { entrada: [2, 2, 4], textos: ["no es un triangulo|no forman|no es triangulo|no se puede|no existe|no forma"], sinTextos: ["equilatero", "isosceles", "escaleno"] },
    ],
  },
  {
    id: "3.8", bloque: 3, titulo: "Tres números ordenados", nivel: "avanzado", tipo: "diseno",
    enunciado: "Diseña un algoritmo que lea tres números y los muestre ordenados de menor a mayor.",
    datos: "7, 2, 5 → 2 5 7. 4, 4, 1 → 1 4 4. 1, 2, 3 → 1 2 3. 3, 2, 1 → 1 2 3.",
    pista: "Una estrategia: compara ¦a¦ y ¦b¦ e intercámbialos si están desordenados; haz lo mismo con ¦b¦ y ¦c¦; y vuelve a comparar ¦a¦ y ¦b¦. Haz la traza con 3, 2, 1 para ver por qué hace falta el tercer paso.",
    pruebas: [
      { entrada: [7, 2, 5], exactos: [2, 5, 7] },
      { entrada: [4, 4, 1], exactos: [1, 4, 4] },
      { entrada: [1, 2, 3], exactos: [1, 2, 3] },
      { entrada: [3, 2, 1], exactos: [1, 2, 3] },
      { entrada: [5, 5, 5], exactos: [5, 5, 5] },
      { entrada: [-1, 0, -5], exactos: [-5, -1, 0] },
    ],
  },
  {
    id: "3.9", bloque: 3, titulo: "Coste de un envío", nivel: "avanzado", tipo: "diseno",
    enunciado: "Una empresa de mensajería cobra según el peso del paquete: 5 € hasta 1 kg, 8 € hasta 5 kg y 12 € si pesa más de 5 kg. Si el destino son las islas, el precio aumenta un 50 %. Diseña un algoritmo que lea el peso y el destino («P» para península, «I» para islas) y muestre el precio. Si el peso es 0 o negativo, debe mostrar un error.",
    datos: "0.5 kg, P → 5. 1 kg, I → 7.5. 3 kg, P → 8. 5.01 kg, I → 18. 0 kg → error.",
    pruebas: [
      { entrada: [0.5, "P"], ultimo: 5 },
      { entrada: [1, "I"], ultimo: 7.5 },
      { entrada: [3, "P"], ultimo: 8 },
      { entrada: [5, "P"], ultimo: 8 },
      { entrada: [5, "I"], ultimo: 12 },
      { entrada: [5.01, "I"], ultimo: 18 },
      { entrada: [10, "P"], ultimo: 12 },
      { entrada: [0, "P"], hayTexto: true, sinNumeros: [5, 8, 12, 7.5, 18] },
      { entrada: [-2, "I"], hayTexto: true, sinNumeros: [5, 8, 12, 7.5, 18], sobran: true },
    ],
  },
  {
    id: "3.10", bloque: 3, titulo: "El cine que nunca es gratis", nivel: "medio", tipo: "error",
    enunciado: "Este algoritmo intenta resolver el problema del cine del apartado 5.4 de la Parte 1 (menores de 4 años gratis, hasta 13 años infantil, 65 o más mayores, resto normal), pero hay dos tipos de entrada que no aparecen nunca. Haz la traza con las edades 2, 10, 30 y 70, localiza los dos errores y corrígelos.",
    inicial: `// EntradaCine
INICIO
  LEER edad
  SI edad < 14 ENTONCES
    ESCRIBIR "Infantil"
  SI NO
    SI edad < 4 ENTONCES
      ESCRIBIR "Gratis"
    SI NO
      SI edad < 14 Y edad >= 65 ENTONCES
        ESCRIBIR "Mayores"
      SI NO
        ESCRIBIR "Normal"
      FIN SI
    FIN SI
  FIN SI
FIN
`,
    pruebas: [
      { entrada: [2], textos: ["gratis"], sinTextos: ["infantil", "normal", "mayores"] },
      { entrada: [10], textos: ["infantil"], sinTextos: ["gratis", "normal", "mayores"] },
      { entrada: [30], textos: ["normal"], sinTextos: ["gratis", "infantil", "mayores"] },
      { entrada: [70], textos: ["mayores"], sinTextos: ["gratis", "infantil", "normal"] },
      { entrada: [3], textos: ["gratis"], sinTextos: ["infantil"] },
      { entrada: [4], textos: ["infantil"], sinTextos: ["gratis"] },
      { entrada: [13], textos: ["infantil"], sinTextos: ["normal"] },
      { entrada: [14], textos: ["normal"], sinTextos: ["infantil"] },
      { entrada: [65], textos: ["mayores"], sinTextos: ["normal"] },
    ],
  },
  {
    id: "3.11", bloque: 3, titulo: "Diagrama misterioso", nivel: "medio", tipo: "traduccion",
    enunciado: "Escribe el pseudocódigo de este diagrama (pulsa «Ver diagrama del enunciado»). Después, haz la traza con los pares de datos (12, 4), (10, 4) y (5, 0), y explica con una frase qué hace el algoritmo.",
    inicial: "INICIO\n  \nFIN\n",
    diagrama: `INICIO
  LEER a, b
  SI b = 0 ENTONCES
    ESCRIBIR "No se puede comprobar"
  SI NO
    SI a MOD b = 0 ENTONCES
      ESCRIBIR a, " es múltiplo de ", b
    SI NO
      ESCRIBIR a, " no es múltiplo de ", b
    FIN SI
  FIN SI
FIN
`,
    pruebas: [
      { entrada: [12, 4], textos: ["multiplo"], sinTextos: ["no es", "no se puede"] },
      { entrada: [10, 4], textos: ["no es multiplo|no son multiplo|no es un multiplo|no multiplo"], sinTextos: ["no se puede"] },
      { entrada: [5, 0], hayTexto: true, sinTextos: ["multiplo de"] },
      { entrada: [9, 3], textos: ["multiplo"], sinTextos: ["no es"] },
      { entrada: [7, 3], textos: ["no es multiplo|no son multiplo|no es un multiplo|no multiplo"] },
    ],
  },

  // ───────────── 4. Selección múltiple ─────────────
  {
    id: "4.1", bloque: 4, titulo: "Planes de la semana", nivel: "base", tipo: "diseno",
    enunciado: "Diseña un algoritmo que lea un número del 1 (lunes) al 7 (domingo) y muestre qué toca hacer: de lunes a viernes, «Ir a clase»; el sábado, «Hacer deporte»; el domingo, «Descansar». Cualquier otro número debe mostrar «Día no válido».",
    datos: "3 → Ir a clase. 6 → Hacer deporte. 7 → Descansar. 0 → Día no válido.",
    estructura: { usa: ["segun"] },
    pruebas: [
      { entrada: [3], textos: ["ir a clase"], sinTextos: ["deporte", "descansar", "no valido"] },
      { entrada: [1], textos: ["ir a clase"], sinTextos: ["no valido"] },
      { entrada: [5], textos: ["ir a clase"], sinTextos: ["no valido"] },
      { entrada: [6], textos: ["hacer deporte|deporte"], sinTextos: ["ir a clase", "descansar"] },
      { entrada: [7], textos: ["descansar"], sinTextos: ["ir a clase", "deporte"] },
      { entrada: [0], textos: ["no valido|invalido|incorrecto"], sinTextos: ["ir a clase", "descansar"] },
      { entrada: [8], textos: ["no valido|invalido|incorrecto"], sinTextos: ["ir a clase", "descansar"] },
    ],
  },
  {
    id: "4.2", bloque: 4, titulo: "Días de cada mes", nivel: "base", tipo: "diseno",
    enunciado: "Diseña un algoritmo que lea el número de un mes (del 1 al 12) y muestre cuántos días tiene. Para febrero, considera 28 días. Agrupa los meses que tienen el mismo número de días en un solo caso. Si el mes no existe, muestra «Mes no válido».",
    datos: "2 → 28. 4 → 30. 12 → 31. 13 → Mes no válido.",
    estructura: { maxCasos: 4 },
    pruebas: [
      { entrada: [2], numeros: [28] },
      { entrada: [4], numeros: [30] },
      { entrada: [12], numeros: [31] },
      { entrada: [1], numeros: [31] },
      { entrada: [6], numeros: [30] },
      { entrada: [9], numeros: [30] },
      { entrada: [11], numeros: [30] },
      { entrada: [8], numeros: [31] },
      { entrada: [13], textos: ["no valido|invalido|incorrecto"], sinNumeros: [28, 30, 31] },
      { entrada: [0], textos: ["no valido|invalido|incorrecto"], sinNumeros: [28, 30, 31] },
    ],
  },
  {
    id: "4.3", bloque: 4, titulo: "Calculadora con menú", nivel: "medio", tipo: "diseno",
    enunciado: "Diseña un algoritmo que lea dos números y después muestre un menú: 1. Sumar, 2. Restar, 3. Multiplicar, 4. Dividir. Según la opción elegida, muestra el resultado. Si se elige dividir y el segundo número es 0, muestra un error. Si la opción no existe, avisa.",
    datos: "10, 4, opción 1 → 14. 10, 4, opción 4 → 2.5. 10, 0, opción 4 → error. 10, 4, opción 7 → Opción no válida.",
    pista: "Dentro de un caso de ¦SEGÚN¦ puede haber cualquier estructura, también un ¦SI¦.",
    estructura: { usa: ["segun"] },
    pruebas: [
      { entrada: [10, 4, 1], numeros: [14] },
      { entrada: [10, 4, 2], numeros: [6] },
      { entrada: [10, 4, 3], numeros: [40] },
      { entrada: [10, 4, 4], numeros: [2.5] },
      { entrada: [10, 0, 4], hayTexto: true, sinTextos: ["infinity", "nan"] },
      { entrada: [10, 4, 7], textos: ["no valida|invalida|no existe|incorrecta"], sinNumeros: [14, 6, 40, 2.5] },
    ],
  },
  {
    id: "4.4", bloque: 4, titulo: "Máquina expendedora", nivel: "medio", tipo: "diseno",
    enunciado: "Una máquina vende cuatro productos: 1. Agua (1.00 €), 2. Zumo (1.50 €), 3. Café (1.20 €) y 4. Galletas (0.90 €). Diseña un algoritmo que lea el código del producto y el dinero introducido. Si el dinero es suficiente, muestra el cambio; si no, muestra cuánto falta. Si el código no existe, avisa.",
    datos: "Código 2 con 2.00 € → cambio 0.50. Código 3 con 1.00 € → faltan 0.20. Código 4 con 0.90 € → cambio 0. Código 9 → Producto no existe.",
    pista: "Usa el ¦SEGÚN¦ solo para averiguar el precio y guárdalo en una variable. Después, una única decisión calcula el cambio para cualquier producto. Así no repites la misma decisión cuatro veces.",
    estructura: { usa: ["segun"] },
    pruebas: [
      { entrada: [2, 2], numeros: [0.5], sinTextos: ["falta", "faltan"] },
      { entrada: [3, 1], numeros: [0.2], textos: ["falta|faltan"] },
      { entrada: [4, 0.9], numeros: [0], sinTextos: ["falta", "faltan"] },
      { entrada: [1, 1], numeros: [0], sinTextos: ["falta", "faltan"] },
      { entrada: [1, 5], numeros: [4] },
      { entrada: [2, 1], numeros: [0.5], textos: ["falta|faltan"] },
      { entrada: [9, 1], textos: ["no existe|no valido|invalido|incorrecto"], sobran: true },
    ],
  },
  {
    id: "4.5", bloque: 4, titulo: "Días del mes, con bisiestos", nivel: "avanzado", tipo: "diseno",
    enunciado: "Combina los ejercicios 4.2 y 3.5: el algoritmo lee el mes y el año (en ese orden) y muestra cuántos días tiene ese mes, teniendo en cuenta que febrero tiene 29 días en los años bisiestos.",
    datos: "Mes 2 de 2024 → 29. Mes 2 de 1900 → 28. Mes 11 de 2026 → 30. Mes 13 → Mes no válido.",
    pruebas: [
      { entrada: [2, 2024], numeros: [29] },
      { entrada: [2, 1900], numeros: [28] },
      { entrada: [2, 2000], numeros: [29] },
      { entrada: [11, 2026], numeros: [30] },
      { entrada: [1, 2023], numeros: [31] },
      { entrada: [13, 2026], textos: ["no valido|invalido|incorrecto"], sinNumeros: [28, 29, 30, 31], sobran: true },
    ],
  },
  {
    id: "4.6", bloque: 4, titulo: "¿SEGÚN o SI?", nivel: "medio", tipo: "razona",
    enunciado: "Para cada uno de estos problemas, indica si usarías ¦SEGÚN¦ o decisiones con ¦SI¦, y justifica tu respuesta en una o dos frases:\n\n- Mostrar el nombre de un día de la semana a partir de su número.\n- Clasificar una temperatura como fría (menos de 10 °C), templada o calurosa (más de 25 °C).\n- Ejecutar la opción elegida en un menú de cinco opciones.\n- Calcular la calificación a partir de una nota con decimales (ejercicio 3.4).\n- Decir si una letra introducida es una vocal.",
    preguntas: [{ tipo: "libre", texto: "Tu respuesta razonada para cada caso" }],
  },

  // ───────────── 5. Bucle MIENTRAS ─────────────
  {
    id: "5.1", bloque: 5, titulo: "Subir una escalera", nivel: "base", tipo: "diseno", libre: true,
    enunciado: "Escribe el algoritmo de subir una escalera de un número desconocido de escalones: mientras queden escalones, se sube uno. Al llegar arriba se abre la puerta. ¿Qué pasa con tu algoritmo si la escalera no tiene ningún escalón?",
    estructura: { usa: ["mientras"], ultimoEs: "accion", minPasos: 3 },
  },
  {
    id: "5.2", bloque: 5, titulo: "Contar hacia arriba y hacia abajo", nivel: "base", tipo: "diseno",
    enunciado: "Diseña un algoritmo que muestre los números del 1 al 10 usando un bucle ¦MIENTRAS¦. Después, modifícalo para que muestre una cuenta atrás del 10 al 1 y, al terminar, el mensaje «¡Despegue!».",
    pista: "Necesitas una variable que haga de contador, con su inicialización antes del bucle y su incremento (o decremento) dentro.",
    partes: [
      { nombre: "Del 1 al 10", estructura: { usa: ["mientras"] }, pruebas: [{ entrada: [], exactos: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }] },
      { nombre: "Cuenta atrás", estructura: { usa: ["mientras"] }, pruebas: [{ entrada: [], exactos: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1], textos: ["despegue"] }] },
    ],
  },
  {
    id: "5.3", bloque: 5, titulo: "Buscar un libro", nivel: "medio", tipo: "diseno", libre: true,
    enunciado: "Buscas un libro concreto en una estantería. Vas mirando los libros uno a uno mientras no lo hayas encontrado y queden libros por mirar. Al terminar, si lo has encontrado lo coges, y si no, preguntas en la biblioteca.",
    pista: "El bucle tiene dos motivos para terminar. Después del bucle hay que averiguar cuál de los dos ha sido.",
    estructura: { usa: ["mientras", "si"], minPasos: 5 },
  },
  {
    id: "5.4", bloque: 5, titulo: "Media hasta un negativo", nivel: "medio", tipo: "diseno",
    enunciado: "Diseña un algoritmo que lea números hasta que se introduzca uno negativo, que actúa como valor centinela y no cuenta. Al final muestra cuántos números se han introducido y su media. Si el primer número ya es negativo, debe mostrar «No hay datos».",
    datos: "6, 8, 4, -1 → 3 números, media 6. -5 → No hay datos. 0, -1 → 1 número, media 0.",
    pruebas: [
      { entrada: [6, 8, 4, -1], numeros: [3, 6] },
      { entrada: [-5], textos: ["no hay datos|sin datos|no hay"] },
      { entrada: [0, -1], numeros: [1, 0] },
      { entrada: [10, -2], numeros: [1, 10] },
      { entrada: [5, 5, 5, 5, -1], numeros: [4, 5] },
    ],
  },
  {
    id: "5.5", bloque: 5, titulo: "La hucha", nivel: "medio", tipo: "diseno",
    enunciado: "Quieres ahorrar para comprar algo. Diseña un algoritmo que lea el precio del objetivo y cuánto ahorras cada semana, y calcule cuántas semanas necesitas y cuánto habrás ahorrado al final.",
    datos: "Objetivo 100, 15 por semana → 7 semanas, 105 ahorrados. Objetivo 100, 25 por semana → 4 semanas, 100 ahorrados.",
    pista: "El segundo dato de prueba comprueba el valor frontera: si llegas justo a 100, ya no necesitas otra semana.",
    pruebas: [
      { entrada: [100, 15], numeros: [7, 105] },
      { entrada: [100, 25], numeros: [4, 100] },
      { entrada: [100, 100], numeros: [1, 100] },
      { entrada: [1, 5], numeros: [1, 5] },
    ],
  },
  {
    id: "5.6", bloque: 5, titulo: "Contar las cifras", nivel: "avanzado", tipo: "diseno",
    enunciado: "Diseña un algoritmo que lea un número entero positivo y muestre cuántas cifras tiene.",
    datos: "4721 → 4. 7 → 1. 0 → 1.",
    pista: "Quitar la última cifra de ¦n¦ es ¦n <- (n - n MOD 10) / 10¦. Repite hasta que no queden cifras. Comprueba con cuidado qué da tu algoritmo con el 0: en el ejercicio 6.5 volveremos sobre ello.",
    pruebas: [
      { entrada: [4721], ultimo: 4 },
      { entrada: [7], ultimo: 1 },
      { entrada: [0], ultimo: 1 },
      { entrada: [10], ultimo: 2 },
      { entrada: [99999], ultimo: 5 },
    ],
  },
  {
    id: "5.7", bloque: 5, titulo: "Adivina el número", nivel: "avanzado", tipo: "diseno",
    enunciado: "El algoritmo guarda un número secreto (¦secreto <- 37¦). El usuario va diciendo números y, tras cada intento, el algoritmo responde «Mayor» o «Menor» para orientarle. Cuando acierta, muestra en cuántos intentos lo ha conseguido.",
    datos: "Intentos 50, 20, 37 → «Menor», «Mayor», «¡Acertaste en 3 intentos!».",
    pruebas: [
      { entrada: [50, 20, 37], textos: ["menor", "mayor"], ultimo: 3 },
      { entrada: [37], ultimo: 1, sinTextos: ["menor", "mayor"] },
      { entrada: [10, 40, 37], textos: ["mayor", "menor"], ultimo: 3 },
      { entrada: [36, 38, 37], textos: ["mayor", "menor"], ultimo: 3 },
    ],
  },
  {
    id: "5.8", bloque: 5, titulo: "Multiplicar por tres", nivel: "base", tipo: "traza",
    enunciado: "Haz la prueba de escritorio de este algoritmo y responde. ¿Qué muestra? ¿Cuántas veces se ejecuta el cuerpo del bucle? ¿Qué mostraría si la primera línea fuera ¦n <- 20¦?",
    inicial: `// Misterio3
INICIO
  n <- 1
  veces <- 0
  MIENTRAS n < 20 HACER
    n <- n * 3
    veces <- veces + 1
  FIN MIENTRAS
  ESCRIBIR n, " ", veces
FIN
`,
    preguntas: [
      { tipo: "texto", texto: "¿Qué muestra?", aceptadas: ["27 3"] },
      { tipo: "texto", texto: "¿Cuántas veces se ejecuta el cuerpo del bucle?", aceptadas: ["3"] },
      { tipo: "texto", texto: "¿Qué mostraría con ¦n <- 20¦?", aceptadas: ["20 0"] },
    ],
  },
  {
    id: "5.9", bloque: 5, titulo: "Dos bucles con fallos", nivel: "medio", tipo: "error",
    enunciado: "Estos dos fragmentos tienen errores típicos de los bucles. Para cada uno, haz la traza, describe qué ocurre y corrígelo. El primero debería mostrar los números del 1 al 5; el segundo, sumar números hasta leer un 0 (usa los datos 4, 7, 0).",
    inicial: `INICIO
  // Fragmento A
  i <- 1
  MIENTRAS i <= 5 HACER
    ESCRIBIR i
  FIN MIENTRAS

  // Fragmento B
  suma <- 0
  LEER n
  MIENTRAS n <> 0 HACER
    LEER n
    suma <- suma + n
  FIN MIENTRAS
  ESCRIBIR suma
FIN
`,
    pruebas: [
      { entrada: [4, 7, 0], exactos: [1, 2, 3, 4, 5, 11] },
      { entrada: [0], exactos: [1, 2, 3, 4, 5, 0] },
      { entrada: [5, 0], exactos: [1, 2, 3, 4, 5, 5] },
    ],
  },
  {
    id: "5.10", bloque: 5, titulo: "Otro diagrama misterioso", nivel: "medio", tipo: "traduccion",
    enunciado: "Escribe el pseudocódigo de este diagrama (pulsa «Ver diagrama del enunciado») y haz la traza con ¦base = 2¦ y ¦exp = 3¦. ¿Qué calcula? ¿Qué muestra si ¦exp = 0¦ y por qué ese resultado es matemáticamente correcto?",
    inicial: "INICIO\n  \nFIN\n",
    diagrama: `INICIO
  LEER base, exp
  resultado <- 1
  i <- 0
  MIENTRAS i < exp HACER
    resultado <- resultado * base
    i <- i + 1
  FIN MIENTRAS
  ESCRIBIR resultado
FIN
`,
    pruebas: [
      { entrada: [2, 3], ultimo: 8 },
      { entrada: [5, 0], ultimo: 1 },
      { entrada: [3, 4], ultimo: 81 },
      { entrada: [7, 1], ultimo: 7 },
      { entrada: [2, 10], ultimo: 1024 },
    ],
  },

  // ───────────── 6. Bucle REPETIR ─────────────
  {
    id: "6.1", bloque: 6, titulo: "Probarse zapatos", nivel: "base", tipo: "diseno", libre: true,
    enunciado: "En una zapatería te pruebas zapatos: coges un par, te lo pones y das unos pasos. Repites hasta encontrar uno que te quede bien, y entonces lo compras. Diseña el algoritmo con un bucle ¦REPETIR¦ y explica por qué aquí es mejor que un ¦MIENTRAS¦.",
    estructura: { usa: ["repetir"], ultimoEs: "accion", minPasos: 4 },
  },
  {
    id: "6.2", bloque: 6, titulo: "Pedir una edad válida", nivel: "base", tipo: "diseno",
    enunciado: "Diseña un algoritmo que pida una edad y la vuelva a pedir mientras no esté entre 0 y 120, ambos incluidos. Cuando sea válida, muestra «Edad registrada».",
    datos: "-3, 130, 25 → pide tres veces y acepta el 25. 0 → acepta a la primera. 120 → acepta a la primera.",
    pruebas: [
      { entrada: [-3, 130, 25], repite: ["edad registrada", 1] },
      { entrada: [0], repite: ["edad registrada", 1] },
      { entrada: [120], repite: ["edad registrada", 1] },
      { entrada: [121, 121, -1, 50], repite: ["edad registrada", 1] },
    ],
  },
  {
    id: "6.3", bloque: 6, titulo: "Menú que se repite", nivel: "medio", tipo: "diseno",
    enunciado: "Diseña un algoritmo que muestre un menú con tres opciones: 1. Saludar, 2. Despedirse, 3. Salir. La opción 1 muestra «Hola», la 2 muestra «Adiós» y cualquier otra distinta de 3 muestra «Opción no válida». El menú se vuelve a mostrar hasta que se elige la opción 3.",
    datos: "1, 5, 2, 3 → Hola, Opción no válida, Adiós, y termina.",
    pruebas: [
      { entrada: [1, 5, 2, 3], textos: ["hola", "no valida|invalida|incorrecta", "adios"] },
      { entrada: [3], sinTextos: ["hola", "adios"] },
      { entrada: [2, 2, 3], repite: ["adios", 2], sinTextos: ["hola"] },
    ],
  },
  {
    id: "6.4", bloque: 6, titulo: "PIN con tres intentos", nivel: "medio", tipo: "diseno",
    enunciado: "Un móvil tiene el PIN 4321. Diseña un algoritmo que pida el PIN hasta que sea correcto o hasta que se hayan hecho tres intentos. Al terminar, muestra «Acceso concedido» o «Móvil bloqueado», según corresponda.",
    datos: "1111, 4321 → Acceso concedido. 1, 2, 3 → Móvil bloqueado. 1, 2, 4321 → Acceso concedido.",
    pista: "El bucle tiene dos motivos para terminar, como en el ejercicio 5.3. Fíjate en el tercer dato de prueba: acierta justo en el último intento.",
    pruebas: [
      { entrada: [1111, 4321], textos: ["acceso concedido"], sinTextos: ["bloqueado"] },
      { entrada: [1, 2, 3], textos: ["bloqueado"], sinTextos: ["acceso concedido"] },
      { entrada: [1, 2, 4321], textos: ["acceso concedido"], sinTextos: ["bloqueado"] },
      { entrada: [4321], textos: ["acceso concedido"], sinTextos: ["bloqueado"] },
    ],
  },
  {
    id: "6.5", bloque: 6, titulo: "Invertir un número", nivel: "avanzado", tipo: "diseno",
    enunciado: "Diseña un algoritmo que lea un número entero positivo y muestre sus cifras en orden inverso. Resuélvelo con un bucle ¦REPETIR¦ y explica por qué, a diferencia del ejercicio 5.6, este bucle trata bien el 0 sin necesidad de un caso especial.",
    datos: "1234 → 4321. 7 → 7. 0 → 0. 120 → 21.",
    pista: "¦n MOD 10¦ es la última cifra. Para ir construyendo el número invertido: ¦invertido <- invertido * 10 + cifra¦.",
    estructura: { usa: ["repetir"] },
    pruebas: [
      { entrada: [1234], ultimo: 4321 },
      { entrada: [7], ultimo: 7 },
      { entrada: [0], ultimo: 0 },
      { entrada: [120], ultimo: 21 },
      { entrada: [100], ultimo: 1 },
    ],
  },
  {
    id: "6.6", bloque: 6, titulo: "De REPETIR a MIENTRAS", nivel: "medio", tipo: "traduccion",
    enunciado: "Reescribe el algoritmo de validar una nota del apartado 6.5 de la Parte 1 usando un bucle ¦MIENTRAS¦ en lugar de ¦REPETIR¦. Debe comportarse exactamente igual. Explica qué dos cambios has tenido que hacer y por qué.",
    pista: "Revisa el recuadro «Mientras y Repetir se preguntan al revés» y la lectura adelantada del apartado 6.3.",
    inicial: `// ValidarNota
INICIO
  REPETIR
    ESCRIBIR "Nota (de 0 a 10):"
    LEER nota
  HASTA nota >= 0 Y nota <= 10
  ESCRIBIR "Nota guardada: ", nota
FIN
`,
    estructura: { usa: ["mientras"], noUsa: ["repetir"] },
    pruebas: [
      { entrada: [5], ultimo: 5 },
      { entrada: [-1, 11, 7], ultimo: 7 },
      { entrada: [0], ultimo: 0 },
      { entrada: [10], ultimo: 10 },
      { entrada: [10.5, 3], ultimo: 3 },
    ],
  },

  // ───────────── 7. Bucle PARA ─────────────
  {
    id: "7.1", bloque: 7, titulo: "Vueltas a la pista", nivel: "base", tipo: "diseno", libre: true,
    enunciado: "El entrenador te pide dar un número de vueltas a la pista. Diseña el algoritmo: se pregunta el número de vueltas y, al terminar cada una, se anuncia «Vuelta 1 terminada», «Vuelta 2 terminada», etcétera. Al final, se estira.",
    estructura: { usa: ["para"], ultimoEs: "accion", minPasos: 4 },
  },
  {
    id: "7.2", bloque: 7, titulo: "Del 1 al N", nivel: "base", tipo: "diseno",
    enunciado: "Diseña un algoritmo que lea un número ¦N¦ y muestre todos los números del 1 al ¦N¦.",
    datos: "N = 4 → 1 2 3 4. N = 1 → 1. N = 0 → no muestra nada.",
    estructura: { usa: ["para"] },
    pruebas: [
      { entrada: [4], numeros: [1, 2, 3, 4] },
      { entrada: [1], numeros: [1] },
      { entrada: [0], sinNumeros: [1] },
      { entrada: [7], numeros: [1, 2, 3, 4, 5, 6, 7] },
    ],
  },
  {
    id: "7.3", bloque: 7, titulo: "Tabla de multiplicar al revés", nivel: "base", tipo: "diseno",
    enunciado: "Modifica la tabla de multiplicar del apartado 6.7 de la Parte 1 (el usuario elige un número y se escribe su tabla, con líneas del tipo «7 x 1 = 7») para que se muestre en orden inverso, del 10 al 1.",
    pista: "El paso de un ¦PARA¦ puede ser negativo: ¦CON PASO -1¦. ¿Qué cambia entonces en la condición del diagrama?",
    estructura: { usa: ["para"] },
    pruebas: [
      { entrada: [7], numeros: [70, 63, 56, 49, 42, 35, 28, 21, 14, 7] },
      { entrada: [3], numeros: [30, 27, 24, 21, 18, 15, 12, 9, 6, 3] },
      { entrada: [1], numeros: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
    ],
  },
  {
    id: "7.4", bloque: 7, titulo: "Números pares hasta N", nivel: "medio", tipo: "diseno",
    enunciado: "Diseña un algoritmo que lea ¦N¦ y muestre los números pares comprendidos entre 1 y ¦N¦. Resuélvelo de dos formas: con un ¦PARA¦ de paso 1 y una decisión dentro, y con un ¦PARA¦ de paso 2 sin decisiones. ¿Cuántas iteraciones hace cada versión con ¦N = 10¦?",
    datos: "N = 9 → 2 4 6 8. N = 10 → 2 4 6 8 10. N = 1 → no muestra nada.",
    partes: [
      {
        nombre: "Paso 1 con decisión",
        estructura: { usa: ["para", "si"] },
        pruebas: [
          { entrada: [9], numeros: [2, 4, 6, 8], sinNumeros: [1, 3, 5, 7] },
          { entrada: [10], numeros: [2, 4, 6, 8, 10], sinNumeros: [1, 3, 5, 7, 9] },
          { entrada: [1], sinNumeros: [2, 4] },
        ],
      },
      {
        nombre: "Paso 2 sin decisiones",
        estructura: { usa: ["para"], noUsa: ["si"] },
        pruebas: [
          { entrada: [9], numeros: [2, 4, 6, 8], sinNumeros: [1, 3, 5, 7] },
          { entrada: [10], numeros: [2, 4, 6, 8, 10], sinNumeros: [1, 3, 5, 7, 9] },
          { entrada: [1], sinNumeros: [2, 4] },
        ],
      },
    ],
  },
  {
    id: "7.5", bloque: 7, titulo: "Suma de 1 a N", nivel: "medio", tipo: "diseno",
    enunciado: "Diseña un algoritmo que lea ¦N¦, sume todos los números del 1 al ¦N¦ con un bucle y muestre la suma. Después, muestra también el resultado de la fórmula ¦N * (N + 1) / 2¦ para comprobar que coinciden.",
    datos: "N = 10 → 55 y 55. N = 100 → 5050 y 5050. N = 1 → 1 y 1.",
    estructura: { usa: ["para"] },
    pruebas: [
      { entrada: [10], numeros: [55, 55] },
      { entrada: [100], numeros: [5050, 5050] },
      { entrada: [1], numeros: [1, 1] },
    ],
  },
  {
    id: "7.6", bloque: 7, titulo: "Factorial", nivel: "medio", tipo: "diseno",
    enunciado: "El factorial de un número ¦N¦ (se escribe N!) es el producto de todos los enteros de 1 a ¦N¦: 5! = 1 · 2 · 3 · 4 · 5 = 120. Por definición, 0! vale 1. Diseña un algoritmo que lea ¦N¦ y muestre su factorial.",
    datos: "5 → 120. 1 → 1. 0 → 1.",
    pista: "Es un acumulador, pero que multiplica. ¿Con qué valor hay que inicializarlo? Revisa la tabla del apartado 7.1.",
    pruebas: [
      { entrada: [5], ultimo: 120 },
      { entrada: [1], ultimo: 1 },
      { entrada: [0], ultimo: 1 },
      { entrada: [10], ultimo: 3628800 },
      { entrada: [3], ultimo: 6 },
    ],
  },
  {
    id: "7.7", bloque: 7, titulo: "Todas las tablas", nivel: "avanzado", tipo: "diseno",
    enunciado: "Diseña un algoritmo que muestre las tablas de multiplicar del 1 al 10 completas, cada una precedida de un título como «Tabla del 3».",
    pista: "Necesitas un bucle dentro de otro bucle. Como cada estructura tiene una entrada y una salida (apartado 2.3 de la Parte 1), el ¦PARA¦ interior encaja como una instrucción más dentro del cuerpo del exterior. Usa variables de contador distintas.",
    estructura: { usa: ["para"] },
    pruebas: [
      {
        entrada: [],
        textos: ["tabla del 1", "tabla del 2", "tabla del 3", "tabla del 4", "tabla del 5", "tabla del 6", "tabla del 7", "tabla del 8", "tabla del 9", "tabla del 10"],
        numeros: [100],
        lineasMin: 110,
      },
    ],
  },
  {
    id: "7.8", bloque: 7, titulo: "Divisores y números primos", nivel: "avanzado", tipo: "diseno",
    enunciado: "Diseña un algoritmo que lea un número entero positivo, muestre todos sus divisores y diga si es primo (escribe «es primo» o «no es primo»). Un número es primo cuando tiene exactamente dos divisores: el 1 y él mismo.",
    datos: "12 → 1 2 3 4 6 12, no es primo. 7 → 1 7, es primo. 1 → 1, no es primo.",
    pista: "¦d¦ es divisor de ¦n¦ si ¦n MOD d = 0¦. Cuenta los divisores mientras los muestras.",
    pruebas: [
      { entrada: [12], numeros: [1, 2, 3, 4, 6, 12], textos: ["no es primo|no primo|compuesto"] },
      { entrada: [7], numeros: [1, 7], textos: ["es primo|primo"], sinTextos: ["no es primo", "no primo", "compuesto"] },
      { entrada: [1], numeros: [1], textos: ["no es primo|no primo"] },
      { entrada: [2], numeros: [1, 2], textos: ["es primo|primo"], sinTextos: ["no es primo", "no primo", "compuesto"] },
      { entrada: [9], numeros: [1, 3, 9], textos: ["no es primo|no primo|compuesto"] },
      { entrada: [13], numeros: [1, 13], textos: ["es primo|primo"], sinTextos: ["no es primo", "no primo", "compuesto"] },
    ],
  },
  {
    id: "7.9", bloque: 7, titulo: "Un MIENTRAS que es un PARA", nivel: "medio", tipo: "traduccion",
    enunciado: "Este diagrama usa un ¦MIENTRAS¦ (pulsa «Ver diagrama del enunciado»), pero en realidad es un ¦PARA¦ disfrazado. Escribe su pseudocódigo de dos formas: tal como está dibujado y con un bucle ¦PARA¦. ¿Qué muestra?",
    inicial: "INICIO\n  \nFIN\n",
    diagrama: `INICIO
  suma <- 0
  i <- 2
  MIENTRAS i <= 20 HACER
    suma <- suma + i
    i <- i + 2
  FIN MIENTRAS
  ESCRIBIR suma
FIN
`,
    partes: [
      { nombre: "Tal como está dibujado (MIENTRAS)", estructura: { usa: ["mientras"], noUsa: ["para"] }, pruebas: [{ entrada: [], ultimo: 110 }] },
      { nombre: "Con un bucle PARA", estructura: { usa: ["para"], noUsa: ["mientras"] }, pruebas: [{ entrada: [], ultimo: 110 }] },
    ],
  },

  // ───────────── 8. Contadores y acumuladores ─────────────
  {
    id: "8.1", bloque: 8, titulo: "Clientes de la tienda", nivel: "base", tipo: "diseno", libre: true,
    enunciado: "El dependiente de una tienda cuenta cuántos clientes entran durante el día. Mientras la tienda esté abierta, cada vez que entra alguien suma uno. Al cerrar, apunta el total. Diseña el algoritmo.",
    estructura: { usa: ["mientras", "asignar"], minPasos: 4 },
  },
  {
    id: "8.2", bloque: 8, titulo: "Aprobados y suspensos", nivel: "base", tipo: "diseno",
    enunciado: "Diseña un algoritmo que lea las notas de 10 alumnos y muestre cuántos han aprobado y cuántos han suspendido.",
    datos: "5, 3, 7, 10, 4.5, 6, 2, 8, 5, 9 → 7 aprobados, 3 suspensos.",
    pruebas: [
      { entrada: [5, 3, 7, 10, 4.5, 6, 2, 8, 5, 9], numeros: [7, 3] },
      { entrada: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5], numeros: [10, 0] },
      { entrada: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], numeros: [0, 10] },
      { entrada: [4.9, 5, 4.9, 5, 4.9, 5, 4.9, 5, 4.9, 5], numeros: [5, 5] },
    ],
  },
  {
    id: "8.3", bloque: 8, titulo: "Temperaturas", nivel: "medio", tipo: "diseno",
    enunciado: "Diseña un algoritmo que lea ¦N¦ temperaturas y muestre la media, la máxima y la mínima. Puedes suponer que ¦N¦ es al menos 1.",
    datos: "N = 5: 12, -3, 8, 15, 0 → media 6.4, máxima 15, mínima -3. N = 1: 7 → media 7, máxima 7, mínima 7.",
    pista: "Es la pregunta «Para razonar» número 13 de la Parte 1. No inicialices la máxima a 0: ¿qué pasaría si todas las temperaturas fueran negativas?",
    pruebas: [
      { entrada: [5, 12, -3, 8, 15, 0], numeros: [6.4, 15, -3] },
      { entrada: [1, 7], numeros: [7, 7, 7] },
      { entrada: [3, -5, -2, -9], numeros: [-5.33, -2, -9] },
      { entrada: [4, 3, 5, 6, 9], numeros: [5.75, 9, 3] },
    ],
  },
  {
    id: "8.4", bloque: 8, titulo: "Caja registradora", nivel: "medio", tipo: "diseno",
    enunciado: "Diseña un algoritmo que lea los precios de los artículos de una compra hasta que se introduzca un 0. Debe mostrar el número de artículos, el total y el precio medio. Si el total supera los 100 €, se aplica un 5 % de descuento y se muestra también el importe final.",
    datos: "20, 30, 55, 0 → 3 artículos, total 105, precio medio 35, descuento 5.25, a pagar 99.75. 0 → «Compra vacía».",
    pruebas: [
      { entrada: [20, 30, 55, 0], numeros: [3, 105, 35, 5.25, 99.75] },
      { entrada: [0], textos: ["compra vacia|vacia|no hay"] },
      { entrada: [10, 20, 0], numeros: [2, 30, 15], sinNumeros: [1.5] },
      { entrada: [100, 0], numeros: [1, 100, 100], sinNumeros: [5, 95] },
      { entrada: [150, 0], numeros: [1, 150, 150, 7.5, 142.5] },
    ],
  },
  {
    id: "8.5", bloque: 8, titulo: "Estadística de la clase", nivel: "avanzado", tipo: "diseno",
    enunciado: "Diseña un algoritmo que lea notas hasta que se introduzca -1. Las notas fuera del intervalo de 0 a 10 (salvo el -1) se rechazan con un aviso y no cuentan. Al final muestra cuántas notas válidas hay, su media, el porcentaje de aprobados y la nota más alta.",
    datos: "7, 4, 11, 9, 5, -1 → se rechaza el 11; 4 notas válidas, media 6.25, 75 % de aprobados, nota más alta 9. -1 → No hay notas.",
    pruebas: [
      { entrada: [7, 4, 11, 9, 5, -1], numeros: [4, 6.25, 75, 9] },
      { entrada: [-1], textos: ["no hay notas|sin notas|no hay"] },
      { entrada: [10, 10, -1], numeros: [2, 10, 100, 10] },
      { entrada: [3, -1], numeros: [1, 3, 0, 3] },
      { entrada: [12, -3, -1], textos: ["no hay notas|sin notas|no hay"] },
    ],
  },
  {
    id: "8.6", bloque: 8, titulo: "La media que sale muy baja", nivel: "medio", tipo: "error",
    enunciado: "Este algoritmo calcula una media incorrecta. Haz la traza con 3 notas (6, 8 y 7), explica por qué muestra 2.33 en lugar de 7 y corrígelo. Hay además un caso que lo hace fallar de otra forma: encuéntralo y haz que muestre un aviso.",
    inicial: `// MediaErronea
INICIO
  LEER n
  PARA i DESDE 1 HASTA n HACER
    suma <- 0
    LEER nota
    suma <- suma + nota
  FIN PARA
  media <- suma / n
  ESCRIBIR "Media: ", media
FIN
`,
    pruebas: [
      { entrada: [3, 6, 8, 7], ultimo: 7 },
      { entrada: [1, 5], ultimo: 5 },
      { entrada: [2, 4, 6], ultimo: 5 },
      { entrada: [4, 10, 0, 10, 0], ultimo: 5 },
      { entrada: [0], hayTexto: true },
    ],
  },

  // ───────────── 9. Subprocesos ─────────────
  {
    id: "9.1", bloque: 9, titulo: "Preparar el desayuno", nivel: "base", tipo: "diseno", libre: true,
    enunciado: "Diseña el algoritmo de preparar el desayuno usando dos subprocesos: «Preparar un café» (puedes reutilizar el apartado 3.1 de la Parte 1) y «Hacer una tostada». El algoritmo principal debe ocupar como mucho cinco formas entre el inicio y el fin.",
    estructura: { subprocesos: 2, llamadas: 2, maxPrincipal: 5, minPasosSub: 2 },
  },
  {
    id: "9.2", bloque: 9, titulo: "Poner la mesa con subproceso", nivel: "medio", tipo: "diseno", libre: true,
    enunciado: "Rehaz el algoritmo de poner la mesa del apartado 6.6 de la Parte 1 sacando a un subproceso «Poner un cubierto» las acciones que se hacen para cada comensal. Escribe los dos diagramas (el principal y el del subproceso).",
    inicial: `// PonerLaMesa (apartado 6.6 de la Parte 1)
INICIO
  Preguntar cuántos comensales hay (N)
  PARA i DESDE 1 HASTA N HACER
    Poner un plato
    Poner los cubiertos
    Poner un vaso
  FIN PARA
FIN
`,
    estructura: { subprocesos: 1, llamadas: 1, usa: ["para"], minPasosSub: 2 },
  },
  {
    id: "9.3", bloque: 9, titulo: "Menú con subproceso", nivel: "medio", tipo: "diseno",
    enunciado: "Rehaz el ejercicio 6.3 sacando a un subproceso ¦MostrarMenu¦ las instrucciones que escriben las opciones en pantalla. ¿Qué parte del algoritmo principal se vuelve más fácil de leer?",
    estructura: { subprocesos: 1, llamadas: 1, minPasosSub: 3 },
    pruebas: [
      { entrada: [1, 5, 2, 3], textos: ["hola", "no valida|invalida|incorrecta", "adios"] },
      { entrada: [3], sinTextos: ["hola", "adios"] },
      { entrada: [2, 2, 3], repite: ["adios", 2], sinTextos: ["hola"] },
    ],
  },

  // ───────────── 10. Problemas integradores ─────────────
  {
    id: "10.1", bloque: 10, titulo: "Duelo de dados", nivel: "avanzado", tipo: "diseno",
    enunciado: "Dos jugadores tiran un dado en cada una de 5 rondas (el resultado de cada tirada se introduce por teclado: primero el jugador 1 y después el 2). En cada ronda gana quien saca más; si sacan lo mismo, la ronda queda empatada. Al final, el algoritmo muestra cuántas rondas ha ganado cada jugador y quién ha ganado la partida, o si ha habido empate.",
    datos: "Rondas (4, 2), (3, 6), (5, 5), (6, 1), (2, 3) → jugador 1: 2 rondas, jugador 2: 2 rondas, partida empatada.",
    pruebas: [
      { entrada: [4, 2, 3, 6, 5, 5, 6, 1, 2, 3], numeros: [2, 2], textos: ["empate|empatada|empatado|empatan|igualada"] },
      { entrada: [6, 1, 5, 1, 4, 1, 3, 1, 2, 1], numeros: [5, 0], sinTextos: ["empate", "empatada", "empatado"] },
      { entrada: [1, 6, 1, 5, 1, 4, 1, 3, 1, 2], numeros: [0, 5], sinTextos: ["empate", "empatada", "empatado"] },
      { entrada: [3, 3, 2, 2, 1, 1, 6, 6, 4, 4], numeros: [0, 0], textos: ["empate|empatada|empatado|empatan|igualada"] },
    ],
  },
  {
    id: "10.2", bloque: 10, titulo: "Cajero automático", nivel: "avanzado", tipo: "diseno",
    enunciado: "Diseña un cajero con un saldo inicial de 500 €. Muestra repetidamente un menú con las opciones 1. Consultar saldo, 2. Ingresar, 3. Retirar y 4. Salir, hasta que se elija salir. No se permite ingresar ni retirar cantidades de 0 o negativas, ni retirar más dinero del que hay en la cuenta; en esos casos se muestra un aviso y el saldo no cambia.",
    datos: "Opción 3 con 600 → aviso de saldo insuficiente. Opción 2 con 100 → saldo 600. Opción 3 con -20 → aviso. Opción 3 con 600 → saldo 0. Opción 1 → 0. Opción 4 → fin.",
    pruebas: [
      { entrada: [1, 4], numeros: [500] },
      { entrada: [3, 600, 1, 4], textos: ["insuficiente|no hay|no puedes|supera|excede|fondos|saldo"], numeros: [500] },
      { entrada: [2, 100, 1, 4], numeros: [600] },
      { entrada: [3, -20, 1, 4], textos: ["no|invalid|error|positiv|mayor|erron|valid"], numeros: [500] },
      { entrada: [2, 100, 3, 600, 1, 4], numeros: [0] },
      { entrada: [2, 0, 2, -5, 1, 4], numeros: [500] },
    ],
  },
  {
    id: "10.3", bloque: 10, titulo: "Números perfectos", nivel: "avanzado", tipo: "diseno",
    enunciado: "Un número es perfecto si es igual a la suma de sus divisores sin contarse a sí mismo. Por ejemplo, 6 es perfecto porque 1 + 2 + 3 = 6. Diseña un algoritmo que lea un número y diga si es perfecto (escribe «perfecto» o «no perfecto»). Después, amplíalo para que muestre todos los números perfectos entre 1 y 1000.",
    datos: "6 → perfecto. 28 → perfecto. 12 → no perfecto (sus divisores suman 16). Entre 1 y 1000: 6, 28, 496.",
    pista: "La primera parte es muy parecida al ejercicio 7.8. La ampliación necesita un bucle dentro de otro, como el 7.7.",
    partes: [
      {
        nombre: "Un número",
        pruebas: [
          { entrada: [6], textos: ["perfecto"], sinTextos: ["no"] },
          { entrada: [28], textos: ["perfecto"], sinTextos: ["no"] },
          { entrada: [12], textos: ["no", "perfecto"] },
          { entrada: [1], textos: ["no", "perfecto"] },
          { entrada: [496], textos: ["perfecto"], sinTextos: ["no"] },
        ],
      },
      {
        nombre: "Del 1 al 1000",
        pruebas: [{ entrada: [], exactos: [6, 28, 496] }],
      },
    ],
  },
  {
    id: "10.4", bloque: 10, titulo: "Factura del agua por tramos", nivel: "avanzado", tipo: "diseno",
    enunciado: "Una compañía de agua cobra una cuota fija de 8 € al mes más el consumo, que se factura por tramos: los primeros 10 m³ a 0.50 € cada uno, del 11 al 30 a 0.80 € y a partir del 31 a 1.20 €. Cada tramo solo se aplica a los metros cúbicos que caen dentro de él. Diseña un algoritmo que lea el consumo de varios clientes, hasta que se introduzca un consumo negativo, y muestre el importe de cada factura y la recaudación total.",
    datos: "8 m³ → 12. 25 m³ → 25. 40 m³ → 41. Recaudación con esos tres clientes → 78.",
    pista: "Con 25 m³: los 10 primeros cuestan 5 € y los 15 siguientes, 12 €. Resuelve primero una sola factura y, cuando funcione, métela en el bucle.",
    pruebas: [
      { entrada: [8, -1], numeros: [12, 12] },
      { entrada: [25, -1], numeros: [25, 25] },
      { entrada: [40, -1], numeros: [41, 41] },
      { entrada: [8, 25, 40, -1], numeros: [12, 25, 41, 78] },
      { entrada: [10, -1], numeros: [13, 13] },
      { entrada: [30, -1], numeros: [29, 29] },
      { entrada: [31, -1], numeros: [30.2, 30.2] },
    ],
  },
];

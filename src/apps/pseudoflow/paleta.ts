// Listado lateral del modo pseudocódigo: estructuras con huecos «…» que se rellenan,
// y ejemplos de los algoritmos de la UT03 §1 de Programación.

export interface Fragmento {
  etiqueta: string;
  ayuda: string;
  codigo: string;
}
export interface GrupoPaleta {
  titulo: string;
  items: Fragmento[];
}

export const PALETA: GrupoPaleta[] = [
  {
    titulo: "Entrada y salida",
    items: [
      { etiqueta: "LEER", ayuda: "Pide un dato por teclado", codigo: "LEER «variable»" },
      { etiqueta: "ESCRIBIR", ayuda: "Muestra un texto o un valor", codigo: "ESCRIBIR «texto o variable»" },
    ],
  },
  {
    titulo: "Variables",
    items: [{ etiqueta: "variable ← valor", ayuda: "Asigna un valor a una variable", codigo: "«variable» <- «valor»" }],
  },
  {
    titulo: "Decisiones",
    items: [
      { etiqueta: "SI … FIN SI", ayuda: "Hace algo solo si se cumple la condición", codigo: "SI «condición» ENTONCES\n  «acciones»\nFIN SI" },
      { etiqueta: "SI … SI NO", ayuda: "Dos caminos: se cumple o no se cumple", codigo: "SI «condición» ENTONCES\n  «acciones»\nSI NO\n  «otras acciones»\nFIN SI" },
      { etiqueta: "SEGÚN", ayuda: "Varios caminos según el valor", codigo: "SEGÚN «variable» HACER\n  CASO «valor»:\n    «acciones»\n  OTRO:\n    «acciones»\nFIN SEGÚN" },
    ],
  },
  {
    titulo: "Repeticiones",
    items: [
      { etiqueta: "MIENTRAS", ayuda: "Repite mientras se cumpla la condición (puede no ejecutarse nunca)", codigo: "MIENTRAS «condición» HACER\n  «acciones»\nFIN MIENTRAS" },
      { etiqueta: "REPETIR … HASTA", ayuda: "Repite hasta que se cumpla la condición (al menos una vez)", codigo: "REPETIR\n  «acciones»\nHASTA «condición»" },
      { etiqueta: "PARA", ayuda: "Repite un número conocido de veces", codigo: "PARA «i» DESDE «1» HASTA «n» HACER\n  «acciones»\nFIN PARA" },
    ],
  },
  {
    titulo: "Algoritmo",
    items: [{ etiqueta: "INICIO … FIN", ayuda: "Plantilla de algoritmo completo", codigo: "INICIO\n  «acciones»\nFIN" }],
  },
];

/** Operadores y funciones: se insertan tal cual en el cursor */
export const FICHAS = ["Y", "O", "NO", "MOD", "DIV", "<>", "<=", ">=", "ABS()", "RAIZ()", "ENTERO()", "REDONDEAR()"];

export interface Ejemplo {
  titulo: string;
  codigo: string;
}

export const EJEMPLOS: Ejemplo[] = [
  {
    titulo: "Aprobado o suspenso",
    codigo: `INICIO
  LEER nota
  SI nota >= 5 ENTONCES
    ESCRIBIR "Aprobado"
  SI NO
    ESCRIBIR "Suspenso"
  FIN SI
FIN
`,
  },
  {
    titulo: "Tres rangos (dos decisiones)",
    codigo: `INICIO
  LEER nota
  SI nota < 5 ENTONCES
    ESCRIBIR "Suspenso"
  SI NO
    SI nota >= 9 ENTONCES
      ESCRIBIR "Sobresaliente"
    SI NO
      ESCRIBIR "Aprobado"
    FIN SI
  FIN SI
FIN
`,
  },
  {
    titulo: "Notas hasta -1 (media y máximo)",
    codigo: `INICIO
  // Lee notas hasta que se teclee -1; muestra cuántas, la media, la máxima y los aprobados
  total <- 0
  suma <- 0
  aprobados <- 0
  LEER nota
  SI nota = -1 ENTONCES
    ESCRIBIR "No se ha introducido ninguna nota"
  SI NO
    maximo <- nota
    MIENTRAS nota <> -1 HACER
      total <- total + 1
      suma <- suma + nota
      SI nota > maximo ENTONCES
        maximo <- nota
      FIN SI
      SI nota >= 5 ENTONCES
        aprobados <- aprobados + 1
      FIN SI
      LEER nota
    FIN MIENTRAS
    ESCRIBIR "Notas leídas: ", total
    ESCRIBIR "Media: ", suma / total
    ESCRIBIR "Máxima: ", maximo
    ESCRIBIR "Aprobados: ", aprobados
  FIN SI
FIN
`,
  },
  {
    titulo: "Trazado: x desciende de 3 en 3",
    codigo: `INICIO
  x <- 10
  MIENTRAS x > 0 HACER
    x <- x - 3
    ESCRIBIR x
  FIN MIENTRAS
FIN
`,
  },
  {
    titulo: "Tabla de multiplicar (PARA)",
    codigo: `INICIO
  LEER n
  PARA i DESDE 1 HASTA 10 HACER
    ESCRIBIR n, " x ", i, " = ", n * i
  FIN PARA
FIN
`,
  },
  {
    titulo: "Pedir una nota válida (REPETIR)",
    codigo: `INICIO
  REPETIR
    ESCRIBIR "Nota entre 0 y 10:"
    LEER nota
  HASTA nota >= 0 Y nota <= 10
  ESCRIBIR "Nota aceptada: ", nota
FIN
`,
  },
  {
    titulo: "Día de la semana (SEGÚN)",
    codigo: `INICIO
  LEER dia
  SEGÚN dia HACER
    CASO 1:
      ESCRIBIR "Lunes"
    CASO 2:
      ESCRIBIR "Martes"
    OTRO:
      ESCRIBIR "Otro día"
  FIN SEGÚN
FIN
`,
  },
];

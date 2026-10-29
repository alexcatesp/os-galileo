// Estructura de un episodio de la aventura SQL: se pueden añadir más episodios sin tocar el motor.

export type EscenaId = "playa" | "valle" | "mercado" | "campos" | "archivo" | "aldea" | "observatorio";
export type PersonajeId = "coralina" | "olivia" | "marina" | "hugo" | "ada" | "irene";

export interface Mision {
  id: string;
  capitulo: number;
  personaje: PersonajeId;
  /** lo que dice el personaje */
  historia: string;
  /** lo que hay que conseguir, dicho claro */
  reto: string;
  /** consulta: se compara lo que devuelve; modifica: se compara cómo queda la isla */
  tipo: "consulta" | "modifica";
  /** solución de referencia (nunca se enseña antes de tres fallos) */
  solucion: string;
  /** en una consulta, importa el orden de las filas */
  ordenado?: boolean;
  /** en una misión que modifica: consultas que deben dar lo mismo en la isla del jugador y en la de referencia */
  verificar?: string[];
  pistas: string[];
  /** lo que dice el personaje al acertar; {codigo} se sustituye por el resultado de la consulta (último reto) */
  exito: string;
  /** consultas que NO deben aceptarse (para las pruebas del propio juego) */
  incorrectas?: string[];
  /** otras formas válidas de resolverla (para las pruebas del propio juego) */
  alternativas?: string[];
}

export interface Capitulo {
  id: number;
  titulo: string;
  tema: string;
  escena: EscenaId;
  intro: { personaje: PersonajeId; texto: string };
  /** recordatorio de sintaxis, sin dar soluciones */
  chuleta: string[];
}

export interface Episodio {
  id: string;
  titulo: string;
  /** SQL que crea el mundo */
  semilla: string;
  capitulos: Capitulo[];
  misiones: Mision[];
}

export const NOMBRES: Record<PersonajeId, string> = {
  coralina: "Coralina",
  olivia: "Olivia",
  marina: "Marina",
  hugo: "Hugo",
  ada: "Ada",
  irene: "Irene",
};

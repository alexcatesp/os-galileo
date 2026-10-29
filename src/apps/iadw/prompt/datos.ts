// Prompts de «Prompt o no prompt» (propios del proyecto). Cada uno es bueno o tiene uno o varios defectos.

export type Criterio = "objetivo" | "contexto" | "datos" | "formato" | "restricciones" | "privacidad";

export const CRITERIOS: Record<Criterio, { nombre: string; pregunta: string }> = {
  objetivo: { nombre: "Objetivo", pregunta: "No queda claro qué se pide exactamente" },
  contexto: { nombre: "Contexto", pregunta: "Falta contexto: tecnología, versión, nivel o qué se ha probado" },
  datos: { nombre: "Datos", pregunta: "Falta el material de trabajo: el código, el error o el texto" },
  formato: { nombre: "Formato", pregunta: "No dice cómo quiere la respuesta (longitud, estructura, tipo)" },
  restricciones: { nombre: "Restricciones", pregunta: "Faltan límites o requisitos, o lo pedido es imposible o contradictorio" },
  privacidad: { nombre: "Privacidad", pregunta: "Incluye claves, contraseñas o datos personales reales" },
};

export interface Prompt {
  texto: string;
  /** vacío = prompt bueno */
  fallos: Criterio[];
  explicacion: string;
  /** versión mejorada (solo si tiene fallos) */
  mejora?: string;
}

export const PROMPTS: Prompt[] = [
  {
    texto: "Hazme una web.",
    fallos: ["objetivo", "contexto", "formato", "restricciones"],
    explicacion: "No dice de qué es la web, para quién, con qué tecnología ni qué se espera recibir. El modelo tendrá que inventárselo todo.",
    mejora: "Hazme una página de presentación de una cafetería con HTML y CSS sin librerías: cabecera, carta con 6 productos y un formulario de contacto. Responde con un único archivo index.html.",
  },
  {
    texto: "No funciona, arréglalo.",
    fallos: ["objetivo", "datos", "contexto"],
    explicacion: "Falta lo esencial: qué es lo que no funciona, cuál es el código y cuál es el error.",
    mejora: "Mi función `sumar(a, b)` en JavaScript devuelve «12» al llamarla con 1 y 2. Aquí está el código: … ¿Por qué ocurre y cómo lo corrijo?",
  },
  {
    texto:
      "Soy alumno de DAW. En una app Express 4 con Node 20 me sale `TypeError: Cannot read properties of undefined (reading 'id')` en routes/users.js, línea 14: `const id = req.user.id;`. Explícame la causa probable en máximo 5 líneas y propón la corrección con el código resultante.",
    fallos: [],
    explicacion: "Tiene nivel, tecnología y versión, el error exacto, la línea de código, y pide una longitud y un contenido concretos.",
  },
  {
    texto: "Explícame JavaScript.",
    fallos: ["objetivo", "contexto", "formato"],
    explicacion: "JavaScript es enorme: ¿variables?, ¿promesas?, ¿el DOM? Sin nivel ni formato, la respuesta será genérica.",
    mejora: "Explícame qué es una promesa en JavaScript a alguien que ya domina funciones y callbacks. Usa un ejemplo con fetch y no pases de 200 palabras.",
  },
  {
    texto:
      "Actúa como revisor de código. Revisa esta función TypeScript que valida un DNI español:\n`function dniValido(d: string) { return /^\\d{8}[A-Z]$/.test(d); }`\nLista como máximo 5 problemas, de más a menos grave, en una tabla con las columnas: problema, causa y corrección.",
    fallos: [],
    explicacion: "Da un rol, aporta el código, limita la cantidad y especifica el formato de salida.",
  },
  {
    texto: "Mi clave de OpenAI es sk-proj-8f3kQ91xTz y la contraseña de mi base de datos es Galileo2026!. ¿Por qué no conecta mi backend?",
    fallos: ["privacidad", "datos", "contexto"],
    explicacion: "Nunca se pegan claves ni contraseñas en un chat: quedan fuera de tu control. Además, no se aporta el error ni el código.",
    mejora: "Mi backend en Node no conecta con MySQL; el error es `ECONNREFUSED 127.0.0.1:3306`. Uso las variables DB_USER y DB_PASS desde un .env. ¿Qué compruebo primero?",
  },
  {
    texto: "Escribe un CSS bonito para mi página.",
    fallos: ["contexto", "restricciones", "formato"],
    explicacion: "«Bonito» no se puede medir y el modelo no ve tu HTML. Hace falta estructura, estilo deseado y límites.",
    mejora: "Aquí está mi HTML: … Escribe un CSS con un estilo sobrio (fondo claro, un color de acento morado), tipografía del sistema y diseño adaptable a móvil, sin frameworks. Solo el CSS, comentado.",
  },
  {
    texto: "Dame 3 nombres para una app de tareas para estudiantes de FP. Cada nombre en una línea, con una frase de máximo 10 palabras que lo justifique. Evita nombres en inglés.",
    fallos: [],
    explicacion: "Pide una cantidad exacta, define el público, el formato y una restricción clara.",
  },
  {
    texto: "Haz un resumen.",
    fallos: ["datos", "objetivo"],
    explicacion: "No hay nada que resumir ni se dice con qué fin o longitud.",
    mejora: "Resume en 5 viñetas de máximo 15 palabras el texto siguiente, para repasar antes de un examen: …",
  },
  {
    texto: "Necesito una función que ordene una lista, pero que sea rápida, bonita, segura y que sirva para todo.",
    fallos: ["objetivo", "restricciones", "contexto"],
    explicacion: "No dice el lenguaje ni qué hay en la lista, y los requisitos son vagos y en parte contradictorios («para todo» y «rápida»).",
    mejora: "En TypeScript, escribe una función que ordene un array de objetos `{nombre: string, nota: number}` por nota descendente y, en empate, por nombre. No debe modificar el array original.",
  },
  {
    texto:
      "Convierte esta consulta de MySQL 8 para que use un JOIN explícito en lugar de la subconsulta. Mantén los mismos nombres de columna y explica en dos frases qué cambia:\nSELECT nombre FROM alumno WHERE id IN (SELECT alumno_id FROM matricula WHERE modulo = 'BBDD');",
    fallos: [],
    explicacion: "Indica motor y versión, aporta la consulta, fija una restricción (mismos nombres) y limita la explicación.",
  },
  {
    texto: "Este es el listado de mis alumnos con nombre completo, DNI y notas: Marta López, 12345678Z, 4,5; Iván Pérez, 87654321X, 7,2… Dime quién suspende.",
    fallos: ["privacidad"],
    explicacion: "Son datos personales reales de menores o de terceros: no se envían a un servicio externo. Para la tarea basta con datos anónimos.",
    mejora: "Tengo una lista de notas con identificadores ficticios (A1: 4,5; A2: 7,2…). Dime cuáles están por debajo de 5 y cuál es la media.",
  },
  {
    texto: "¿Cómo hago un login?",
    fallos: ["contexto", "objetivo", "restricciones"],
    explicacion: "¿Un formulario?, ¿con qué tecnología?, ¿con base de datos?, ¿con contraseñas cifradas? Hay mil respuestas posibles.",
    mejora: "Quiero un login con Node, Express y MySQL. Explícame los pasos para guardar la contraseña cifrada con bcrypt y comprobarla al entrar. Código mínimo y comentado.",
  },
  {
    texto:
      "Tengo un formulario HTML con los campos nombre y email. Escribe el JavaScript (sin librerías) que valide en el navegador antes de enviar: nombre no vacío y email con formato válido. Muestra el error debajo de cada campo. Devuelve solo el código, comentado en español.",
    fallos: [],
    explicacion: "Describe la situación, el lenguaje, las reglas exactas, el comportamiento esperado y el formato de la respuesta.",
  },
  {
    texto: "Dame ideas.",
    fallos: ["objetivo", "contexto", "formato"],
    explicacion: "¿Ideas de qué, para quién y cuántas? Un modelo no puede adivinarlo.",
    mejora: "Dame 5 ideas de proyecto final de DAW que se puedan hacer en 3 meses por una persona, con una frase y una tecnología principal para cada una.",
  },
  {
    texto: "Corrige mi código para que funcione bien.",
    fallos: ["datos", "objetivo"],
    explicacion: "No hay código adjunto y «funcionar bien» no dice qué comportamiento se espera.",
    mejora: "Este código debería imprimir los números pares del 1 al 20 pero imprime los impares: … Corrígelo y explica el error en una frase.",
  },
  {
    texto: "Clasifica cada comentario como POSITIVO, NEGATIVO o NEUTRO. Responde solo con la etiqueta. Ejemplo: «Llegó rápido y bien embalado» → POSITIVO. Comentario: «El producto tardó tres semanas».",
    fallos: [],
    explicacion: "Define las etiquetas, el formato de salida y da un ejemplo (prompt de «pocos ejemplos»).",
  },
  {
    texto: "Escribe un ensayo de 5000 palabras sobre la IA en la educación en un solo mensaje, con 40 referencias reales y verificadas con enlace.",
    fallos: ["restricciones", "datos"],
    explicacion: "Pide más de lo que cabe en una respuesta y referencias «reales» sin aportar fuentes: un modelo puede inventarlas con total seguridad.",
    mejora: "Redacta un esquema de ensayo sobre IA en la educación con 6 apartados. Después desarrollaremos cada uno por separado y yo aportaré las fuentes.",
  },
  {
    texto: "Hazlo como antes.",
    fallos: ["contexto", "datos", "objetivo"],
    explicacion: "En una conversación nueva no hay «antes». Incluso en una larga, conviene repetir lo esencial.",
    mejora: "Repite el formato de la tabla anterior (columnas: función, parámetros, devuelve) pero para este otro código: …",
  },
  {
    texto: "Estoy aprendiendo Git. Explícame la diferencia entre `merge` y `rebase` con una analogía cotidiana y un ejemplo de 4 comandos. Nivel principiante, sin jerga. Máximo 150 palabras.",
    fallos: [],
    explicacion: "Nivel, tema, tipo de explicación, extensión y estilo: todo está dicho.",
  },
  {
    texto: "Programa un videojuego completo en Python con gráficos, multijugador online, inteligencia artificial y tienda de pago.",
    fallos: ["restricciones", "contexto", "formato"],
    explicacion: "Es un proyecto de meses, no una petición. Hay que acotarlo y pedirlo por partes.",
    mejora: "Voy a hacer un juego en Python con pygame. Empecemos por lo mínimo: una ventana con un jugador que se mueve con las flechas. Dame solo ese código y explícame cada bloque.",
  },
  {
    texto:
      "Esta es la respuesta JSON de mi API: {\"id\": 7, \"nombre\": \"Ana\", \"telefono\": null}. Escribe una interfaz TypeScript que la describa; marca como opcional lo que pueda faltar y no uses `any`. Solo el código.",
    fallos: [],
    explicacion: "Aporta el dato real, el objetivo, dos restricciones técnicas y el formato de salida.",
  },
  {
    texto: "ayuda",
    fallos: ["objetivo", "contexto", "datos", "formato"],
    explicacion: "Una sola palabra no contiene ninguna información sobre qué ayuda necesitas.",
    mejora: "Necesito ayuda con un bucle `for` en Python que debería recorrer una lista de 5 nombres pero se detiene en el tercero. Este es el código: …",
  },
];

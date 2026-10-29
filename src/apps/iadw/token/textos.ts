// Textos de ejemplo para entrenar el BPE de juguete (propios del proyecto). El mismo tema en español e inglés
// sirve para ver que un vocabulario aprendido en un idioma trocea peor el otro.

export const CORPUS_ES = `Un modelo de lenguaje no lee letras ni palabras: lee tokens. Antes de que el modelo vea una frase, un tokenizador la trocea en pedazos y a cada pedazo le asigna un número. Esos números son lo único que el modelo recibe.
Cuando desarrollamos una aplicación web que usa inteligencia artificial, cada petición al modelo se paga por tokens y cabe en una ventana de contexto limitada. Por eso conviene saber cuántos tokens ocupa un mensaje, una conversación o un documento entero.
Los tokenizadores modernos aprenden su vocabulario a partir de muchísimo texto. Empiezan con los bytes sueltos y van uniendo los pares que más se repiten: primero las letras que suelen ir juntas, después sílabas, y al final palabras enteras que aparecen a menudo.
Las palabras frecuentes ocupan un solo token. Las palabras raras, los nombres propios o los términos técnicos se parten en varios. Un programador escribe funciones, variables y servidores; una programadora prueba la aplicación, corrige los errores y despliega la versión nueva en el servidor.
Los acentos y la eñe ocupan más de un byte en UTF-8, así que el español suele necesitar más tokens que el inglés cuando el vocabulario se aprendió sobre todo con textos en inglés. La educación, la información y la comunicación son palabras largas pero muy comunes.
Escribir un buen prompt consiste en dar contexto, indicar el formato de la respuesta y pedir pasos concretos. Un mensaje claro y corto gasta menos tokens, responde antes y cuesta menos dinero.`;

export const CORPUS_EN = `A language model does not read letters or words: it reads tokens. Before the model sees a sentence, a tokenizer cuts it into pieces and gives every piece a number. Those numbers are the only thing the model receives.
When we build a web application that uses artificial intelligence, every request to the model is paid by tokens and must fit in a limited context window. That is why it helps to know how many tokens a message, a conversation or a whole document takes.
Modern tokenizers learn their vocabulary from a huge amount of text. They start with single bytes and keep merging the pairs that repeat the most: first the letters that usually go together, then syllables, and in the end whole words that appear often.
Common words take a single token. Rare words, proper names or technical terms are split into several. A developer writes functions, variables and servers; a tester checks the application, fixes the errors and deploys the new version to the server.
The education, the information and the communication are long words but very common ones. Writing a good prompt means giving context, stating the format of the answer and asking for concrete steps. A short and clear message uses fewer tokens, answers sooner and costs less money.`;

export const TEXTO_INICIAL = "La programación web con inteligencia artificial: ¡hola, mundo! 🚀";

/** Mini corpus clásico para ver el algoritmo paso a paso */
export const CORPUS_MINI = "low low low low low lower lower newest newest newest newest newest newest widest widest widest";

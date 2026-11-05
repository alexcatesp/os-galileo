// Tokenizadores reales para «Token».
// - OpenAI (cl100k_base y o200k_base): vocabularios oficiales de tiktoken vía `js-tiktoken`; pesan 1–2 MB y se cargan
//   bajo demanda (import dinámico → trozo aparte en el build).
// - DeepSeek V4 y GLM-5.3: su `tokenizer.json` oficial se descarga de Hugging Face solo si el alumno pulsa el botón
//   (6 y 20 MB; no se guardan en el repositorio: la licencia de GLM-5.3 no es abierta) y se interpreta con
//   `@huggingface/tokenizers`. Hugging Face permite la descarga desde otro dominio (CORS).
// Anthropic y Google no publican su vocabulario: solo se pueden contar sus tokens con su API, por eso no están.

import { visible } from "./bpe";
import type { Ficha } from "./bpe";

export type Codificacion = "cl100k_base" | "o200k_base" | "deepseek_v4" | "glm_5_3";

export interface InfoCodif {
  nombre: string;
  modelos: string;
  /** vocabulario con el que se descarga de Hugging Face (solo los modelos chinos) */
  remoto?: { url: string; mb: number };
}

export const CODIFICACIONES: Record<Codificacion, InfoCodif> = {
  cl100k_base: { nombre: "cl100k_base", modelos: "GPT-3.5 y GPT-4" },
  o200k_base: { nombre: "o200k_base", modelos: "GPT-4o, GPT-4.1, GPT-5 y GPT-5.6 (Sol, Terra y Luna)" },
  deepseek_v4: { nombre: "DeepSeek V4", modelos: "DeepSeek V4 (Pro y Flash)", remoto: { url: "https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro/resolve/main/tokenizer.json", mb: 6 } },
  glm_5_3: { nombre: "GLM-5.3", modelos: "GLM-5.3 (Z.ai / Zhipu)", remoto: { url: "https://huggingface.co/zai-org/GLM-5.3/resolve/main/tokenizer.json", mb: 20 } },
};

export const CODIFS = Object.keys(CODIFICACIONES) as Codificacion[];
export const REMOTAS = CODIFS.filter((c) => CODIFICACIONES[c].remoto);
export const MB_REMOTAS = REMOTAS.reduce((s, c) => s + CODIFICACIONES[c].remoto!.mb, 0);

export interface ModeloApi {
  id: string;
  nombre: string;
  codif: Codificacion;
  /** ventana de contexto en tokens */
  ventana: number;
  /** precio orientativo de entrada, dólares por millón de tokens; 0 = sin dato (el alumno lo escribe) */
  precio: number;
}

// Los precios cambian a menudo (GPT-5.6 Luna y Terra bajaron poco después de salir): son valores de partida editables.
export const MODELOS: ModeloApi[] = [
  { id: "gpt-4", nombre: "GPT-4", codif: "cl100k_base", ventana: 8192, precio: 30 },
  { id: "gpt-4o", nombre: "GPT-4o", codif: "o200k_base", ventana: 128000, precio: 2.5 },
  { id: "gpt-5.6-luna", nombre: "GPT-5.6 Luna", codif: "o200k_base", ventana: 1000000, precio: 0.2 },
  { id: "gpt-5.6-terra", nombre: "GPT-5.6 Terra", codif: "o200k_base", ventana: 1000000, precio: 2 },
  { id: "gpt-5.6-sol", nombre: "GPT-5.6 Sol", codif: "o200k_base", ventana: 1000000, precio: 5 },
  { id: "deepseek-v4", nombre: "DeepSeek V4", codif: "deepseek_v4", ventana: 1048576, precio: 0 },
  { id: "glm-5.3", nombre: "GLM-5.3", codif: "glm_5_3", ventana: 1048576, precio: 0 },
];

export interface MotorReal {
  contar(texto: string): number;
  trocear(texto: string): Ficha[];
}

const promesas = new Map<Codificacion, Promise<MotorReal>>();
const listos = new Map<Codificacion, MotorReal>();

/** Motor ya cargado (sin esperar), o undefined */
export const listo = (c: Codificacion): MotorReal | undefined => listos.get(c);

const bonito = (s: string) => s.replace(/ /g, "·").replace(/\n/g, "↵").replace(/\t/g, "→");

async function crear(c: Codificacion): Promise<MotorReal> {
  if (c === "cl100k_base" || c === "o200k_base") {
    const { Tiktoken } = await import("js-tiktoken/lite");
    const rangos = c === "cl100k_base" ? (await import("js-tiktoken/ranks/cl100k_base")).default : (await import("js-tiktoken/ranks/o200k_base")).default;
    const t = new Tiktoken(rangos);
    // js-tiktoken guarda los bytes de cada token en `textMap` (no está en los tipos)
    const bytesDe = (t as unknown as { textMap: Map<number, ArrayLike<number>> }).textMap;
    return {
      contar: (texto) => t.encode(texto).length,
      trocear: (texto) =>
        t.encode(texto).map((id) => {
          const bs = Array.from(bytesDe.get(id) ?? []);
          return { texto: visible(bs), id, bytes: bs.length };
        }),
    };
  }
  const url = CODIFICACIONES[c].remoto!.url;
  const [{ Tokenizer }, resp] = await Promise.all([import("@huggingface/tokenizers"), fetch(url)]);
  if (!resp.ok) throw new Error(`No se pudo descargar ${CODIFICACIONES[c].nombre} (${resp.status})`);
  const t = new Tokenizer(await resp.json(), {});
  const ids = (texto: string) => t.encode(texto, { add_special_tokens: false }).ids as number[];
  const enc = new TextEncoder();
  return {
    contar: (texto) => ids(texto).length,
    trocear: (texto) =>
      ids(texto).map((id) => {
        const s = t.decode([id], { skip_special_tokens: false });
        return { texto: bonito(s), id, bytes: enc.encode(s).length };
      }),
  };
}

/** Carga (una sola vez) el vocabulario real de una codificación */
export function cargar(c: Codificacion): Promise<MotorReal> {
  let p = promesas.get(c);
  if (!p) {
    p = crear(c).then((m) => {
      listos.set(c, m);
      return m;
    });
    p.catch(() => promesas.delete(c));
    promesas.set(c, p);
  }
  return p;
}

/** Misma frase en varios idiomas para comparar cuántos tokens necesita cada uno */
export const FRASES_IDIOMAS: { idioma: string; texto: string }[] = [
  { idioma: "Inglés", texto: "Artificial intelligence helps students learn to build web applications." },
  { idioma: "Español", texto: "La inteligencia artificial ayuda al alumnado a aprender a crear aplicaciones web." },
  { idioma: "Catalán", texto: "La intel·ligència artificial ajuda l'alumnat a aprendre a crear aplicacions web." },
  { idioma: "Francés", texto: "L'intelligence artificielle aide les élèves à apprendre à créer des applications web." },
  { idioma: "Alemán", texto: "Künstliche Intelligenz hilft den Schülern, Webanwendungen zu entwickeln." },
  { idioma: "Ruso", texto: "Искусственный интеллект помогает ученикам научиться создавать веб-приложения." },
  { idioma: "Chino", texto: "人工智能帮助学生学习创建网络应用程序。" },
  { idioma: "Japonés", texto: "人工知能は生徒がウェブアプリを作る方法を学ぶのに役立ちます。" },
  { idioma: "Árabe", texto: "يساعد الذكاء الاصطناعي الطلاب على تعلم إنشاء تطبيقات الويب." },
  { idioma: "Hindi", texto: "कृत्रिम बुद्धिमत्ता छात्रों को वेब एप्लिकेशन बनाना सीखने में मदद करती है।" },
];

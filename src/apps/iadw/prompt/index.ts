import type { AppDef } from "../../../kernel/kernel";
import { CRITERIOS, PROMPTS, type Criterio, type Prompt } from "./datos";

const CLAVE = "osg-prompt";
const RONDA = 10;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

interface Registro {
  mejor: number;
  rondas: number;
}
function cargar(): Registro {
  try {
    return { mejor: 0, rondas: 0, ...(JSON.parse(localStorage.getItem(CLAVE) ?? "{}") as Partial<Registro>) };
  } catch {
    return { mejor: 0, rondas: 0 };
  }
}
function guardar(r: Registro): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(r));
  } catch {
    /* sin almacenamiento */
  }
}

function barajar<T>(a: readonly T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/** Puntos de un prompt: 1 por acertar si es bueno o mejorable, y 1 por señalar bien los fallos (0,5 si aciertas parte sin sobrar) */
function puntuar(p: Prompt, dijoBueno: boolean, marcados: Set<Criterio>): { veredicto: boolean; criterios: number } {
  const bueno = p.fallos.length === 0;
  const veredicto = dijoBueno === bueno;
  if (!veredicto) return { veredicto, criterios: 0 };
  if (bueno) return { veredicto, criterios: 1 };
  const aciertos = p.fallos.filter((f) => marcados.has(f)).length;
  const sobran = [...marcados].filter((m) => !p.fallos.includes(m)).length;
  if (aciertos === p.fallos.length && sobran === 0) return { veredicto, criterios: 1 };
  return { veredicto, criterios: aciertos > 0 && sobran <= 1 ? 0.5 : 0 };
}

export const promptONoPrompt: AppDef = {
  id: "prompt",
  nombre: "Prompt o no prompt",
  carpeta: "IADW",
  icono: `<svg viewBox="0 0 48 48"><rect x="4" y="6" width="40" height="30" rx="7" fill="#0d0b1e" stroke="#6fd08c" stroke-width="2.5"/><path d="M12 36l-2 8 10-8z" fill="#0d0b1e" stroke="#6fd08c" stroke-width="2"/><path d="M13 16l6 5-6 5" fill="none" stroke="#f7e26b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><rect x="23" y="24" width="12" height="3.5" rx="1.7" fill="#6fd08c"/></svg>`,
  ancho: 600,
  alto: 680,
  iniciar({ ventana, raiz }) {
    raiz.classList.add("pp");
    ventana.fijarTitulo("Prompt o no prompt");
    const reg = cargar();

    let fase: "inicio" | "jugando" | "fin" = "inicio";
    let ronda: Prompt[] = [];
    let idx = 0;
    let puntos = 0;
    let veredictos = 0;
    let revisada: { veredicto: boolean; criterios: number; dijoBueno: boolean; marcados: Set<Criterio> } | null = null;
    let eleccion: "bueno" | "mejorable" | null = null;
    let marcados = new Set<Criterio>();
    const falladas: Prompt[] = [];

    function pintar(): void {
      if (fase === "inicio") {
        raiz.innerHTML = `<div class="pp-caja">
          <h2>¿Prompt o no prompt?</h2>
          <p>Te enseño ${RONDA} mensajes que alguien escribiría a un asistente de IA. Decide si el prompt es <b>bueno</b> o <b>mejorable</b>; si es mejorable, marca <b>qué le falta</b>.</p>
          <p class="pp-peq">Un buen prompt dice qué se quiere, en qué contexto, con qué material, cómo se quiere la respuesta y con qué límites, y no incluye datos sensibles.</p>
          <p class="pp-peq">${reg.rondas ? `Mejor ronda: <b>${reg.mejor}</b> de ${RONDA * 2} puntos · rondas jugadas: ${reg.rondas}` : "Todavía no has jugado ninguna ronda."}</p>
          <button class="pp-primario" data-a="empezar" autofocus>Empezar la ronda</button></div>`;
        return;
      }
      if (fase === "fin") {
        raiz.innerHTML = `<div class="pp-caja">
          <p class="pp-grande">${puntos} / ${RONDA * 2}</p>
          <p>Veredictos acertados: <b>${veredictos} de ${RONDA}</b></p>
          <p class="pp-msg ${puntos >= 16 ? "ok" : ""}">${puntos >= 18 ? "🎉 ¡Ojo de editor! Detectas casi todo." : puntos >= 14 ? "¡Muy bien! Ya distingues un buen prompt a primera vista." : "Sigue practicando: repasa la lista de criterios y vuelve a intentarlo."}</p>
          ${
            falladas.length
              ? `<details class="pp-rep" open><summary>Para repasar (${falladas.length})</summary>${falladas.map((p) => `<div class="pp-rev"><q>${esc(p.texto)}</q><span>${p.fallos.length ? "Mejorable: " + p.fallos.map((f) => CRITERIOS[f].nombre).join(", ") : "Era un buen prompt"}</span></div>`).join("")}</details>`
              : ""
          }
          <button class="pp-primario" data-a="empezar" autofocus>Otra ronda</button></div>`;
        return;
      }
      const p = ronda[idx];
      const checks = (Object.keys(CRITERIOS) as Criterio[])
        .map((c) => {
          const estado = revisada ? (p.fallos.includes(c) ? (marcados.has(c) ? " acierto" : " falta") : marcados.has(c) ? " sobra" : "") : "";
          return `<label class="pp-crit${estado}"><input type="checkbox" data-c="${c}" ${marcados.has(c) ? "checked" : ""} ${revisada ? "disabled" : ""} /> <b>${CRITERIOS[c].nombre}</b> <span>${CRITERIOS[c].pregunta}</span></label>`;
        })
        .join("");
      raiz.innerHTML = `<div class="pp-caja">
        <div class="pp-prog"><span>Prompt ${idx + 1} de ${RONDA}</span><span>Puntos: <b>${puntos}</b></span></div>
        <div class="pp-barra"><i style="width:${(idx / RONDA) * 100}%"></i></div>
        <blockquote class="pp-prompt">${esc(p.texto).replace(/\n/g, "<br>")}</blockquote>
        <div class="pp-elige">
          <button data-a="bueno" class="${eleccion === "bueno" ? "on" : ""}" ${revisada ? "disabled" : ""}>✓ Es un buen prompt</button>
          <button data-a="mejorable" class="${eleccion === "mejorable" ? "on" : ""}" ${revisada ? "disabled" : ""}>✎ Es mejorable</button>
        </div>
        ${eleccion === "mejorable" ? `<p class="pp-peq">Marca lo que le falla:</p><div class="pp-crits">${checks}</div>` : ""}
        ${eleccion && !revisada ? `<button class="pp-primario" data-a="comprobar" autofocus>Comprobar</button>` : ""}
        ${
          revisada
            ? `<div class="pp-res ${revisada.veredicto ? "ok" : "mal"}">
                <p><b>${revisada.veredicto ? "✓ Veredicto correcto" : p.fallos.length ? "✗ Era mejorable" : "✗ Era un buen prompt"}</b> · +${(revisada.veredicto ? 1 : 0) + revisada.criterios} ${p.fallos.length && revisada.veredicto ? `(criterios: ${revisada.criterios === 1 ? "todos" : revisada.criterios === 0.5 ? "parte" : "ninguno"})` : ""}</p>
                <p>${esc(p.explicacion)}</p>
                ${p.fallos.length ? `<p class="pp-peq">Le fallaba: <b>${p.fallos.map((f) => CRITERIOS[f].nombre).join(", ")}</b></p>` : ""}
                ${p.mejora ? `<div class="pp-mejora"><span>Una versión mejor</span>${esc(p.mejora)}</div>` : ""}
              </div>
              <button class="pp-primario" data-a="siguiente" autofocus>${idx === RONDA - 1 ? "Ver resultado" : "Siguiente ▸"}</button>`
            : ""
        }</div>`;
    }

    function empezar(): void {
      ronda = barajar(PROMPTS).slice(0, RONDA);
      idx = 0;
      puntos = 0;
      veredictos = 0;
      falladas.length = 0;
      revisada = null;
      eleccion = null;
      marcados = new Set();
      fase = "jugando";
      pintar();
    }

    function comprobar(): void {
      const p = ronda[idx];
      const r = puntuar(p, eleccion === "bueno", eleccion === "bueno" ? new Set() : marcados);
      revisada = { ...r, dijoBueno: eleccion === "bueno", marcados: new Set(marcados) };
      puntos += (r.veredicto ? 1 : 0) + r.criterios;
      if (r.veredicto) veredictos++;
      if (!r.veredicto || r.criterios < 1) falladas.push(p);
      pintar();
    }

    raiz.addEventListener("click", (e) => {
      const a = (e.target as HTMLElement).closest<HTMLElement>("[data-a]")?.dataset.a;
      if (!a) return;
      if (a === "empezar") empezar();
      else if (a === "bueno" || a === "mejorable") {
        eleccion = a;
        pintar();
      } else if (a === "comprobar") comprobar();
      else if (a === "siguiente") {
        revisada = null;
        eleccion = null;
        marcados = new Set();
        if (idx === RONDA - 1) {
          fase = "fin";
          reg.rondas++;
          reg.mejor = Math.max(reg.mejor, puntos);
          guardar(reg);
        } else idx++;
        pintar();
      }
    });
    raiz.addEventListener("change", (e) => {
      const c = (e.target as HTMLInputElement).dataset.c as Criterio | undefined;
      if (!c) return;
      if ((e.target as HTMLInputElement).checked) marcados.add(c);
      else marcados.delete(c);
    });
    pintar();
  },
};

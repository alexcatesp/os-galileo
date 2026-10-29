import type { AppDef } from "../../../kernel/kernel";
import { DESCRIPCION, PUERTAS, aBinario, aHex, combinaciones, generarCircuito, leerNumero, tabla, type Circuito, type Expr, type Puerta } from "./logica";

const CLAVE = "osg-binario";

interface Registro {
  /** bombillas: aciertos y mejor racha */
  bombillas: { aciertos: number; racha: number };
  /** pruebas rápidas: mejor ronda por nivel (aciertos y segundos) */
  rapidas: Record<string, { aciertos: number; segundos: number }>;
  /** puertas lógicas: circuitos resueltos por nivel */
  puertas: Record<string, number>;
}

function cargar(): Registro {
  const vacio: Registro = { bombillas: { aciertos: 0, racha: 0 }, rapidas: {}, puertas: {} };
  try {
    return { ...vacio, ...(JSON.parse(localStorage.getItem(CLAVE) ?? "{}") as Partial<Registro>) };
  } catch {
    return vacio;
  }
}
function guardar(r: Registro): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(r));
  } catch {
    /* sin almacenamiento */
  }
}

const azar = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const elegir = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

function bombilla(encendida: boolean): string {
  return `<svg viewBox="0 0 40 56" aria-hidden="true"><path d="M20 3C10 3 4 10 4 19c0 6 3 10 7 14 2 2 3 4 3 7h12c0-3 1-5 3-7 4-4 7-8 7-14C36 10 30 3 20 3z" fill="${encendida ? "#ffd54a" : "#d8d4ee"}" stroke="${encendida ? "#e0a800" : "#9a94c7"}" stroke-width="2"/><rect x="13" y="42" width="14" height="5" rx="2" fill="#6a62a8"/><rect x="15" y="48" width="10" height="4" rx="2" fill="#6a62a8"/></svg>`;
}

const descomposicion = (n: number, pesos: number[]) => {
  const partes = pesos.filter((p) => n & p);
  return `${n} = ${partes.length ? partes.join(" + ") : "0"}`;
};

type Modo = "bombillas" | "rapidas" | "puertas";

export const binario: AppDef = {
  id: "binario",
  nombre: "Binario",
  carpeta: "Juegos",
  icono: `<svg viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="7" fill="#0d0b1e" stroke="#6fd08c" stroke-width="2.5"/><g font-family="Consolas, monospace" font-weight="700" font-size="14" text-anchor="middle"><text x="15" y="21" fill="#6fd08c">1</text><text x="33" y="21" fill="#f7e26b">0</text><text x="15" y="39" fill="#f7e26b">0</text><text x="33" y="39" fill="#6fd08c">1</text></g></svg>`,
  ancho: 560,
  alto: 680,
  iniciar({ ventana, raiz }) {
    raiz.classList.add("bin");
    raiz.innerHTML = `
      <div class="bin-tabs" role="tablist">
        <button data-m="bombillas">💡 Bombillas</button><button data-m="rapidas">⚡ Pruebas rápidas</button><button data-m="puertas">🔌 Puertas lógicas</button>
      </div>
      <div class="bin-cuerpo"></div>`;
    const cuerpo = raiz.querySelector<HTMLElement>(".bin-cuerpo")!;
    const reg = cargar();
    let limpiarModo: (() => void) | null = null;

    function abrir(m: Modo): void {
      limpiarModo?.();
      limpiarModo = null;
      raiz.querySelectorAll<HTMLElement>("[data-m]").forEach((b) => b.classList.toggle("on", b.dataset.m === m));
      const caja = document.createElement("div");
      caja.className = "bin-modo";
      cuerpo.replaceChildren(caja);
      ventana.fijarTitulo(`Binario · ${m === "bombillas" ? "Bombillas" : m === "rapidas" ? "Pruebas rápidas" : "Puertas lógicas"}`);
      limpiarModo = m === "bombillas" ? bombillas(caja) : m === "rapidas" ? rapidas(caja) : puertas(caja);
    }
    raiz.querySelector(".bin-tabs")!.addEventListener("click", (e) => {
      const m = (e.target as HTMLElement).dataset.m as Modo | undefined;
      if (m) abrir(m);
    });

    // ============ 1. Bombillas ============
    function bombillas(caja: HTMLElement): () => void {
      let nivel: "facil" | "medio" | "dificil" = "facil";
      let tipo: "formar" | "leer" = "formar";
      let bits = 4;
      let objetivo = 0;
      let estado: boolean[] = [];
      let resuelto = false;
      let mensaje = "";
      let malo = false;
      let racha = 0;
      let pesos: number[] = [];

      const valor = () => estado.reduce((a, on, i) => a + (on ? pesos[i] : 0), 0);

      function nueva(): void {
        bits = nivel === "facil" ? 4 : 8;
        pesos = Array.from({ length: bits }, (_, i) => 1 << (bits - 1 - i));
        resuelto = false;
        mensaje = "";
        malo = false;
        if (tipo === "formar") {
          objetivo = azar(1, (1 << bits) - 1);
          estado = pesos.map(() => false);
        } else {
          objetivo = azar(1, (1 << bits) - 1);
          estado = pesos.map((p) => !!(objetivo & p));
        }
        pintar();
      }

      function pintar(): void {
        const ayuda = nivel !== "dificil";
        const v = valor();
        caja.innerHTML = `
          <div class="bin-opciones">
            <label>Nivel <select data-b="nivel"><option value="facil">Fácil · 4 bombillas con suma</option><option value="medio">Medio · 8 bombillas con suma</option><option value="dificil">Difícil · 8 bombillas sin suma</option></select></label>
            <label>Reto <select data-b="tipo"><option value="formar">Formar el número</option><option value="leer">Leer las bombillas</option></select></label>
          </div>
          <p class="bin-enunciado">${tipo === "formar" ? `Enciende las bombillas para formar el número <b class="bin-grande">${objetivo}</b>` : "¿Qué número decimal representan las bombillas encendidas?"}</p>
          <div class="bin-bombillas${tipo === "leer" ? " inerte" : ""}">
            ${pesos.map((p, i) => `<button class="bin-bombilla${estado[i] ? " on" : ""}" data-i="${i}" ${tipo === "leer" || resuelto ? "disabled" : ""} aria-label="Bombilla de valor ${p}, ${estado[i] ? "encendida" : "apagada"}">${bombilla(estado[i])}<span class="peso">${p}</span><span class="bit">${estado[i] ? 1 : 0}</span></button>`).join("")}
          </div>
          ${
            tipo === "formar"
              ? `<p class="bin-suma">${ayuda ? `Suma: <b>${pesos.filter((_, i) => estado[i]).join(" + ") || "0"}</b> = <b>${v}</b>${!resuelto && v > objetivo ? " · te has pasado" : ""}` : "&nbsp;"}</p>`
              : `<form class="bin-form"><input inputmode="numeric" autocomplete="off" placeholder="Número decimal" ${resuelto ? "disabled" : ""} aria-label="Número decimal" /><button class="bin-ok" ${resuelto ? "disabled" : ""}>Comprobar</button></form>`
          }
          <p class="bin-mensaje${resuelto ? " ok" : malo ? " mal" : ""}">${mensaje}</p>
          <div class="bin-pie">
            ${tipo === "formar" && !resuelto ? `<button data-b="apagar">Apagar todas</button>` : ""}
            ${resuelto || malo ? `<button class="bin-primario" data-b="siguiente" autofocus>Siguiente ▸</button>` : tipo === "formar" ? "" : `<button data-b="siguiente">Otro número</button>`}
            <span class="bin-marcador">Aciertos: <b>${reg.bombillas.aciertos}</b> · Racha: <b>${racha}</b> · Mejor racha: <b>${reg.bombillas.racha}</b></span>
          </div>`;
        caja.querySelector<HTMLSelectElement>('[data-b="nivel"]')!.value = nivel;
        caja.querySelector<HTMLSelectElement>('[data-b="tipo"]')!.value = tipo;
        caja.querySelector<HTMLInputElement>(".bin-form input")?.focus();
      }

      function acierto(): void {
        resuelto = true;
        racha++;
        reg.bombillas.aciertos++;
        reg.bombillas.racha = Math.max(reg.bombillas.racha, racha);
        guardar(reg);
        mensaje = `✓ ¡Correcto! ${descomposicion(objetivo, pesos)} (en binario: ${aBinario(objetivo, bits)})`;
      }

      caja.addEventListener("click", (e) => {
        const b = (e.target as HTMLElement).closest<HTMLElement>("button");
        if (!b) return;
        if (b.dataset.i !== undefined && tipo === "formar" && !resuelto) {
          const i = Number(b.dataset.i);
          estado[i] = !estado[i];
          if (valor() === objetivo) acierto();
          pintar();
        } else if (b.dataset.b === "apagar") {
          estado = estado.map(() => false);
          pintar();
        } else if (b.dataset.b === "siguiente") {
          if (!resuelto && tipo === "leer") racha = 0;
          nueva();
        }
      });
      caja.addEventListener("change", (e) => {
        const s = e.target as HTMLSelectElement;
        if (s.dataset.b === "nivel") nivel = s.value as typeof nivel;
        else if (s.dataset.b === "tipo") tipo = s.value as typeof tipo;
        else return;
        racha = 0;
        nueva();
      });
      caja.addEventListener("submit", (e) => {
        e.preventDefault();
        const t = caja.querySelector<HTMLInputElement>(".bin-form input")!.value;
        const n = leerNumero(t, 10);
        if (n === null) {
          malo = false;
          mensaje = "Escribe un número decimal.";
          return pintar();
        }
        if (n === objetivo) acierto();
        else {
          racha = 0;
          malo = true;
          mensaje = `✗ No: son ${descomposicion(objetivo, pesos)}. Suma el valor de las bombillas encendidas.`;
        }
        pintar();
      });
      nueva();
      return () => {};
    }

    // ============ 2. Pruebas rápidas ============
    function rapidas(caja: HTMLElement): () => void {
      type Nivel = "facil" | "medio" | "dificil";
      let nivel: Nivel = "facil";
      interface Pregunta { texto: string; base: 2 | 10 | 16; correcta: number; mostrar: string }
      let preguntas: Pregunta[] = [];
      let idx = 0;
      let aciertos = 0;
      let racha = 0;
      let mejorRacha = 0;
      let t0 = 0;
      let fase: "inicio" | "jugando" | "fin" = "inicio";
      let respondida: { ok: boolean; correcta: string } | null = null;
      let segundos = 0;
      let reloj = 0;

      function crear(): Pregunta {
        const bits = nivel === "facil" ? 4 : 8;
        const n = azar(0, (1 << bits) - 1);
        const tipos = nivel === "dificil" ? ["d2b", "b2d", "d2h", "h2d", "b2h", "h2b"] : ["d2b", "b2d"];
        switch (elegir(tipos)) {
          case "d2b": return { texto: `Pasa a binario (${bits} bits): <b>${n}</b>`, base: 2, correcta: n, mostrar: aBinario(n, bits) };
          case "b2d": return { texto: `Pasa a decimal: <b class="mono">${aBinario(n, bits)}</b>`, base: 10, correcta: n, mostrar: String(n) };
          case "d2h": return { texto: `Pasa a hexadecimal: <b>${n}</b>`, base: 16, correcta: n, mostrar: aHex(n) };
          case "h2d": return { texto: `Pasa a decimal: <b class="mono">0x${aHex(n)}</b>`, base: 10, correcta: n, mostrar: String(n) };
          case "b2h": return { texto: `Pasa a hexadecimal: <b class="mono">${aBinario(n, 8)}</b>`, base: 16, correcta: n, mostrar: aHex(n) };
          default: return { texto: `Pasa a binario (8 bits): <b class="mono">0x${aHex(n)}</b>`, base: 2, correcta: n, mostrar: aBinario(n, 8) };
        }
      }

      function pintar(): void {
        const marcador = `<span class="bin-marcador">Racha: <b>${racha}</b> · Mejor racha de la ronda: <b>${mejorRacha}</b></span>`;
        if (fase === "inicio") {
          const mejor = reg.rapidas[nivel];
          caja.innerHTML = `
            <div class="bin-opciones"><label>Nivel <select data-r="nivel"><option value="facil">Fácil · 4 bits</option><option value="medio">Medio · 8 bits</option><option value="dificil">Difícil · 8 bits y hexadecimal</option></select></label></div>
            <p class="bin-enunciado">Una ronda son <b>10 preguntas</b>. Se mide el tiempo y los aciertos.</p>
            <p class="bin-mensaje">${mejor ? `Tu mejor ronda en este nivel: <b>${mejor.aciertos}/10</b> en <b>${mejor.segundos} s</b>.` : "Todavía no has jugado este nivel."}</p>
            <div class="bin-pie"><button class="bin-primario" data-r="empezar" autofocus>Empezar la ronda</button></div>`;
          caja.querySelector<HTMLSelectElement>('[data-r="nivel"]')!.value = nivel;
        } else if (fase === "jugando") {
          const q = preguntas[idx];
          caja.innerHTML = `
            <div class="bin-progreso"><span>Pregunta ${idx + 1} de 10</span><span class="bin-reloj">${segundos} s</span></div>
            <div class="bin-barra"><i style="width:${(idx / 10) * 100}%"></i></div>
            <p class="bin-pregunta">${q.texto}</p>
            <form class="bin-form"><input autocomplete="off" spellcheck="false" placeholder="Tu respuesta" ${respondida ? "disabled" : ""} aria-label="Respuesta" /><button class="bin-ok" ${respondida ? "disabled" : ""}>Comprobar</button></form>
            <p class="bin-mensaje${respondida ? (respondida.ok ? " ok" : " mal") : ""}">${respondida ? (respondida.ok ? "✓ ¡Correcto!" : `✗ Era <b class="mono">${respondida.correcta}</b>`) : ""}</p>
            <div class="bin-pie">${respondida ? `<button class="bin-primario" data-r="siguiente" autofocus>${idx === 9 ? "Ver resultado" : "Siguiente ▸"}</button>` : ""}${marcador}</div>`;
          if (!respondida) caja.querySelector<HTMLInputElement>(".bin-form input")!.focus();
        } else {
          const mejor = reg.rapidas[nivel];
          caja.innerHTML = `
            <p class="bin-resultado">${aciertos} / 10</p>
            <p class="bin-enunciado">Tiempo: <b>${segundos} s</b> · Mejor racha: <b>${mejorRacha}</b></p>
            <p class="bin-mensaje ok">${aciertos === 10 ? "🎉 ¡Ronda perfecta!" : aciertos >= 7 ? "¡Muy bien!" : "Sigue practicando: cada intento te acerca a leer binario sin pensar."}</p>
            <p class="bin-mensaje">${mejor ? `Mejor ronda de este nivel: ${mejor.aciertos}/10 en ${mejor.segundos} s.` : ""}</p>
            <div class="bin-pie"><button class="bin-primario" data-r="empezar" autofocus>Otra ronda</button><button data-r="inicio">Cambiar de nivel</button></div>`;
        }
      }

      function empezar(): void {
        preguntas = Array.from({ length: 10 }, crear);
        idx = 0;
        aciertos = 0;
        racha = 0;
        mejorRacha = 0;
        respondida = null;
        segundos = 0;
        t0 = Date.now();
        fase = "jugando";
        window.clearInterval(reloj);
        reloj = window.setInterval(() => {
          segundos = Math.round((Date.now() - t0) / 1000);
          const r = caja.querySelector(".bin-reloj");
          if (r) r.textContent = `${segundos} s`;
        }, 500);
        pintar();
      }

      function terminar(): void {
        window.clearInterval(reloj);
        segundos = Math.round((Date.now() - t0) / 1000);
        fase = "fin";
        const mejor = reg.rapidas[nivel];
        if (!mejor || aciertos > mejor.aciertos || (aciertos === mejor.aciertos && segundos < mejor.segundos)) {
          reg.rapidas[nivel] = { aciertos, segundos };
          guardar(reg);
        }
        pintar();
      }

      caja.addEventListener("click", (e) => {
        const a = (e.target as HTMLElement).dataset.r;
        if (a === "empezar") empezar();
        else if (a === "inicio") {
          fase = "inicio";
          pintar();
        } else if (a === "siguiente") {
          respondida = null;
          if (idx === 9) terminar();
          else {
            idx++;
            pintar();
          }
        }
      });
      caja.addEventListener("change", (e) => {
        const s = e.target as HTMLSelectElement;
        if (s.dataset.r === "nivel") {
          nivel = s.value as Nivel;
          pintar();
        }
      });
      caja.addEventListener("submit", (e) => {
        e.preventDefault();
        if (respondida) return;
        const q = preguntas[idx];
        const t = caja.querySelector<HTMLInputElement>(".bin-form input")!.value;
        const n = leerNumero(t, q.base);
        if (n === null && !t.trim()) return;
        const ok = n === q.correcta;
        respondida = { ok, correcta: q.mostrar };
        if (ok) {
          aciertos++;
          racha++;
          mejorRacha = Math.max(mejorRacha, racha);
        } else racha = 0;
        pintar();
      });
      pintar();
      return () => window.clearInterval(reloj);
    }

    // ============ 3. Puertas lógicas ============
    function puertas(caja: HTMLElement): () => void {
      let nivel: 1 | 2 | 3 = 1;
      let c: Circuito = generarCircuito(1);
      let sel: Puerta[] = [];
      let resuelto = false;

      const nuevo = () => {
        c = generarCircuito(nivel);
        sel = Array.from({ length: c.huecos }, () => "AND" as Puerta);
        resuelto = false;
        pintar();
      };

      /** la fórmula con un selector en cada hueco */
      function formula(e: Expr): string {
        switch (e.t) {
          case "in": return `<span class="bin-in">${e.n}</span>`;
          case "no": return `<span class="bin-no">NO</span> ${formula(e.x)}`;
          case "p": {
            const opciones = PUERTAS.map((p) => `<option value="${p}" title="${DESCRIPCION[p]}" ${sel[e.id] === p ? "selected" : ""}>${p}</option>`).join("");
            return `<span class="bin-par">( ${formula(e.a)} <select data-g="${e.id}" aria-label="Puerta ${e.id + 1}" ${resuelto ? "disabled" : ""}>${opciones}</select> ${formula(e.b)} )</span>`;
          }
        }
      }

      function pintar(): void {
        const tuya = tabla(c, sel);
        const filas = combinaciones(c.entradas);
        const aciertos = tuya.filter((x, i) => x === c.objetivo[i]).length;
        resuelto = aciertos === tuya.length;
        const cuerpoTabla = filas
          .map(
            (f, i) =>
              `<tr class="${tuya[i] === c.objetivo[i] ? "ok" : "mal"}">${c.entradas.map((n) => `<td>${f[n] ? 1 : 0}</td>`).join("")}<td class="esp">${c.objetivo[i] ? 1 : 0}</td><td class="tuya">${tuya[i] ? 1 : 0}</td><td>${tuya[i] === c.objetivo[i] ? "✓" : "✗"}</td></tr>`,
          )
          .join("");
        if (resuelto && !caja.dataset.contado) {
          caja.dataset.contado = "1";
          reg.puertas[nivel] = (reg.puertas[nivel] ?? 0) + 1;
          guardar(reg);
        }
        caja.innerHTML = `
          <div class="bin-opciones"><label>Nivel <select data-p="nivel"><option value="1">Fácil · 2 entradas</option><option value="2">Medio · 3 entradas</option><option value="3">Difícil · 4 entradas</option></select></label></div>
          <p class="bin-enunciado">Elige la puerta de cada hueco para que la salida <b>Q</b> sea la de la columna <b>Esperado</b> en todas las filas.</p>
          <div class="bin-formula"><b>Q</b> = ${formula(c.expr)}</div>
          <div class="bin-tabla"><table><thead><tr>${c.entradas.map((n) => `<th>${n}</th>`).join("")}<th>Esperado</th><th>Tu Q</th><th></th></tr></thead><tbody>${cuerpoTabla}</tbody></table></div>
          <p class="bin-mensaje${resuelto ? " ok" : ""}">${resuelto ? "✓ ¡Circuito correcto! La salida coincide en todas las filas." : `Coinciden ${aciertos} de ${tuya.length} filas.`}</p>
          <div class="bin-pie">${resuelto ? `<button class="bin-primario" data-p="siguiente" autofocus>Otro circuito ▸</button>` : `<button data-p="siguiente">Cambiar circuito</button>`}<span class="bin-marcador">Resueltos en este nivel: <b>${reg.puertas[nivel] ?? 0}</b></span></div>
          <details class="bin-ayuda"><summary>¿Qué hace cada puerta?</summary><ul>${PUERTAS.map((p) => `<li><b>${p}</b>: ${DESCRIPCION[p]}</li>`).join("")}</ul></details>`;
        caja.querySelector<HTMLSelectElement>('[data-p="nivel"]')!.value = String(nivel);
      }

      caja.addEventListener("change", (e) => {
        const s = e.target as HTMLSelectElement;
        if (s.dataset.p === "nivel") {
          nivel = Number(s.value) as 1 | 2 | 3;
          delete caja.dataset.contado;
          nuevo();
        } else if (s.dataset.g !== undefined) {
          sel[Number(s.dataset.g)] = s.value as Puerta;
          pintar();
          caja.querySelector<HTMLSelectElement>(`[data-g="${s.dataset.g}"]`)?.focus();
        }
      });
      caja.addEventListener("click", (e) => {
        if ((e.target as HTMLElement).dataset.p === "siguiente") {
          delete caja.dataset.contado;
          nuevo();
        }
      });
      nuevo();
      return () => {};
    }

    abrir("bombillas");
    return () => limpiarModo?.();
  },
};

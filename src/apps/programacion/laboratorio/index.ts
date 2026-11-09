// «Laboratorio de String y fechas» (0485 · UT02 §10, §11 y Profundización D): tres experimentos.
// 1) Los métodos de String no modifican el objeto. 2) Por qué concatenar en un bucle sale caro.
// 3) Aritmética de fechas con las reglas de java.time (meses cortos, bisiestos, Period frente a ChronoUnit).

import type { AppDef } from "../../../kernel/kernel";
import { bloqueJava, esc } from "../comun";
import { DIAS_EN, DIAS_ES, diasDelMes, diasEntre, diasHabiles, esBisiesto, español, iso, parsear, periodo, plusDays, plusMonths, plusYears, semanaIso, siguienteLunes, diaSemana, type Fecha } from "./fechas";

type Pestana = "strings" | "coste" | "fechas";

// ---------------------------------------------------------------------------------- 1. Strings

const javaTrim = (s: string) => s.replace(/^[\u0000- ]+|[\u0000- ]+$/g, "");

interface OpString {
  llamada: string;
  aplicar(s: string): string;
}

const OPS_STRING: OpString[] = [
  { llamada: "toUpperCase()", aplicar: (s) => s.toUpperCase() },
  { llamada: "toLowerCase()", aplicar: (s) => s.toLowerCase() },
  { llamada: "trim()", aplicar: javaTrim },
  { llamada: 'replace("a", "4")', aplicar: (s) => s.split("a").join("4") },
  { llamada: 'concat("!")', aplicar: (s) => s + "!" },
  {
    llamada: "substring(1, 3)",
    aplicar(s) {
      if (s.length < 3) throw new Error(`java.lang.StringIndexOutOfBoundsException: begin 1, end 3, length ${s.length}`);
      return s.slice(1, 3);
    },
  },
];

function pestanaStrings(c: HTMLElement): void {
  c.innerHTML = `
    <div class="cj-ficha"><span class="cj-bloque">§10 · String por dentro</span><h3>Un String nunca cambia</h3>
      <p>Escribe una cadena y elige una llamada. Mira qué pasa con la variable <code>s</code> y con lo que devuelve el método.</p></div>
    <form class="cj-form"><span class="cj-pre">s =</span><input class="jv-s" value="  Galileo  " spellcheck="false" autocomplete="off" aria-label="Valor de la variable s" /></form>
    <div class="jv-ops" role="group" aria-label="Llamadas">${OPS_STRING.map((o, i) => `<button data-op="${i}" class="${i === 0 ? "on" : ""}">${esc(o.llamada)}</button>`).join("")}</div>
    <div class="jv-lab-res"></div>`;
  let op = 0;
  const campo = c.querySelector<HTMLInputElement>(".jv-s")!;
  const q = (t: string) => `"${t.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  function pintar(): void {
    const s = campo.value;
    const o = OPS_STRING[op];
    let resultado = "";
    let error = "";
    try {
      resultado = o.aplicar(s);
    } catch (e) {
      error = (e as Error).message;
    }
    const sb = [`StringBuilder sb = new StringBuilder(${q(s)});`, 'sb.append("!");', "sb.reverse();"];
    c.querySelector(".jv-lab-res")!.innerHTML = `
      <div class="jv-dos">
        <div>
          <h4>String: se crea otro objeto</h4>
          ${bloqueJava([`String s = ${q(s)};`, `s.${o.llamada};   // ¿cambia s?`, "System.out.println(s);", `String t = s.${o.llamada};`])}
          <div class="jv-caja"><div><span class="jv-etq">s sigue valiendo</span> <b class="jv-v">${esc(q(s))}</b></div>${
            error ? `<div class="jv-err2">${esc(error)}</div>` : `<div><span class="jv-etq">t (lo que devuelve)</span> <b class="jv-v">${esc(q(resultado))}</b></div>`
          }</div>
          <p class="jv-nota-peq">Las llamadas a un <code>String</code> <b>devuelven</b> un resultado; el objeto original no se toca. Para quedarte con el resultado hay que asignarlo: <code>s = s.${esc(o.llamada)};</code></p>
        </div>
        <div>
          <h4>StringBuilder: se modifica el mismo objeto</h4>
          ${bloqueJava(sb)}
          <div class="jv-caja"><div><span class="jv-etq">tras append</span> <b class="jv-v">${esc(q(s + "!"))}</b></div><div><span class="jv-etq">tras reverse (mismo objeto)</span> <b class="jv-v">${esc(q([...(s + "!")].reverse().join("")))}</b></div></div>
          <p class="jv-nota-peq">Aquí <code>sb</code> <b>cambia</b>: <code>append</code> y <code>reverse</code> trabajan sobre el propio objeto y lo devuelven.</p>
        </div>
      </div>`;
  }
  c.addEventListener("input", (e) => {
    if ((e.target as HTMLElement).classList.contains("jv-s")) pintar();
  });
  c.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>("[data-op]");
    if (!b) return;
    op = Number(b.dataset.op);
    c.querySelectorAll(".jv-ops button").forEach((x) => x.classList.toggle("on", x === b));
    pintar();
  });
  pintar();
}

// ---------------------------------------------------------------------------------- 2. Coste de concatenar

/** Modelo exacto de `informe += i + ";"` (String) frente a `informe.append(i).append(';')` (StringBuilder). */
export function modeloConcatenar(n: number): { longitud: number; copiasString: number; copiasBuilder: number; objetosString: number } {
  let longitud = 0;
  let copiasString = 0;
  let copiasBuilder = 0;
  let capacidad = 16;
  for (let i = 1; i <= n; i++) {
    const trozo = String(i).length + 1;
    const antes = longitud;
    longitud += trozo;
    copiasString += longitud; // se copia todo lo anterior más lo nuevo en un String nuevo
    if (longitud > capacidad) {
      copiasBuilder += antes; // el buffer crece (≈ el doble) y se copia lo que había
      capacidad = Math.max(longitud, capacidad * 2 + 2);
    }
    copiasBuilder += trozo; // se escribe el trozo nuevo
  }
  copiasBuilder += longitud; // toString() final
  return { longitud, copiasString, copiasBuilder, objetosString: n };
}

const miles = (x: number) => Math.round(x).toLocaleString("es-ES");

/** Mide el efecto de verdad en este navegador copiando buffers (no son tiempos de Java). */
function medirReal(n: number): { string: number; builder: number } {
  let t0 = performance.now();
  let actual = new Uint16Array(0);
  for (let i = 1; i <= n; i++) {
    const trozo = `${i};`;
    const nuevo = new Uint16Array(actual.length + trozo.length);
    nuevo.set(actual);
    for (let j = 0; j < trozo.length; j++) nuevo[actual.length + j] = trozo.charCodeAt(j);
    actual = nuevo;
  }
  const tString = performance.now() - t0;
  t0 = performance.now();
  let buffer = new Uint16Array(16);
  let largo = 0;
  for (let i = 1; i <= n; i++) {
    const trozo = `${i};`;
    if (largo + trozo.length > buffer.length) {
      const mayor = new Uint16Array(Math.max(largo + trozo.length, buffer.length * 2 + 2));
      mayor.set(buffer.subarray(0, largo));
      buffer = mayor;
    }
    for (let j = 0; j < trozo.length; j++) buffer[largo++] = trozo.charCodeAt(j);
  }
  void buffer.slice(0, largo);
  return { string: tString, builder: performance.now() - t0 };
}

function pestanaCoste(c: HTMLElement): void {
  c.innerHTML = `
    <div class="cj-ficha"><span class="cj-bloque">§10 · String por dentro</span><h3>¿Por qué concatenar en un bucle sale caro?</h3>
      <p>Cada <code>+=</code> sobre un <code>String</code> crea uno nuevo y copia todo lo anterior. Mira cuánto trabajo es, con el mismo bucle de las dos formas.</p></div>
    ${bloqueJava(["String informe = \"\";", "for (int i = 1; i <= n; i++) {", '    informe += i + ";";   // String: un objeto nuevo en cada vuelta', "}", "", "StringBuilder sb = new StringBuilder();", "for (int i = 1; i <= n; i++) {", "    sb.append(i).append(';');   // StringBuilder: el mismo objeto", "}"])}
    <label class="jv-slider"><span>Vueltas del bucle (<code>n</code>): <b class="jv-nval">10.000</b></span><input type="range" min="1000" max="30000" step="1000" value="10000" aria-label="Número de vueltas" /></label>
    <div class="jv-lab-res"></div>
    <div class="jv-medir"><button class="cj-primario" data-a="medir">⏱ Medir en este navegador</button><span class="jv-midiendo" aria-live="polite"></span></div>
    <p class="jv-nota-peq">«Medir» ejecuta una simulación en JavaScript (copiando buffers como haría Java); sirve para ver el <b>efecto</b>, no los tiempos reales de Java. En clase, mídelo tú con <code>System.nanoTime()</code>.</p>`;
  const rango = c.querySelector<HTMLInputElement>('input[type="range"]')!;
  function pintar(): void {
    const n = Number(rango.value);
    c.querySelector(".jv-nval")!.textContent = miles(n);
    const m = modeloConcatenar(n);
    const max = m.copiasString;
    // barras en escala logarítmica para que se vea la del StringBuilder
    const ancho = (v: number) => `${Math.max(2, (Math.log10(v) / Math.log10(max)) * 100)}%`;
    c.querySelector(".jv-lab-res")!.innerHTML = `
      <div class="jv-barras">
        <div class="jv-barra"><span>String</span><div class="jv-pista"><div class="jv-rell mal" style="width:${ancho(m.copiasString)}"></div></div><b>${miles(m.copiasString)} caracteres copiados · ${miles(m.objetosString)} objetos String</b></div>
        <div class="jv-barra"><span>StringBuilder</span><div class="jv-pista"><div class="jv-rell ok" style="width:${ancho(m.copiasBuilder)}"></div></div><b>${miles(m.copiasBuilder)} caracteres copiados · 1 objeto + 1 String final</b></div>
      </div>
      <p class="jv-nota-peq">El texto final mide ${miles(m.longitud)} caracteres. Con <code>String</code> se copian <b>${miles(m.copiasString / m.copiasBuilder)} veces más</b> caracteres (escala logarítmica en las barras). Si duplicas <code>n</code>, el coste del <code>String</code> se multiplica por ~4 (crece con el cuadrado); el del <code>StringBuilder</code>, por ~2.</p>`;
  }
  rango.addEventListener("input", pintar);
  c.querySelector('[data-a="medir"]')!.addEventListener("click", () => {
    const aviso = c.querySelector<HTMLElement>(".jv-midiendo")!;
    aviso.textContent = "Midiendo…";
    setTimeout(() => {
      const r = medirReal(Number(rango.value));
      aviso.innerHTML = `<b>String</b>: ${r.string.toFixed(1)} ms · <b>StringBuilder</b>: ${r.builder.toFixed(1)} ms · ${r.builder > 0 ? `${(r.string / r.builder).toFixed(0)}× más lento` : ""}`;
    }, 30);
  });
  pintar();
}

// ---------------------------------------------------------------------------------- 3. Fechas

const periodoTexto = (p: { anios: number; meses: number; dias: number }) =>
  p.anios === 0 && p.meses === 0 && p.dias === 0 ? "P0D" : `P${p.anios ? p.anios + "Y" : ""}${p.meses ? p.meses + "M" : ""}${p.dias ? p.dias + "D" : ""}`;
const llamadaOf = (f: Fecha) => `LocalDate.of(${f.a}, ${f.m}, ${f.d})`;

interface OpFecha {
  nombre: string;
  aplicar(f: Fecha, n: number): Fecha;
}
const OPS_FECHA: OpFecha[] = [
  { nombre: "plusDays", aplicar: (f, n) => plusDays(f, n) },
  { nombre: "plusMonths", aplicar: (f, n) => plusMonths(f, n) },
  { nombre: "plusYears", aplicar: (f, n) => plusYears(f, n) },
  { nombre: "minusDays", aplicar: (f, n) => plusDays(f, -n) },
  { nombre: "minusMonths", aplicar: (f, n) => plusMonths(f, -n) },
  { nombre: "minusYears", aplicar: (f, n) => plusYears(f, -n) },
];

const TRAMPAS: { texto: string; fecha: string; op: number; n: number }[] = [
  { texto: "31 de enero + 1 mes", fecha: "2026-01-31", op: 1, n: 1 },
  { texto: "29 de febrero + 1 año", fecha: "2024-02-29", op: 2, n: 1 },
  { texto: "28 de febrero de 2024 + 2 días", fecha: "2024-02-28", op: 0, n: 2 },
  { texto: "30 de marzo − 1 mes", fecha: "2026-03-30", op: 4, n: 1 },
];

function pestanaFechas(c: HTMLElement): void {
  c.innerHTML = `
    <div class="cj-ficha"><span class="cj-bloque">§11 · java.time</span><h3>Fechas sin aritmética manual</h3>
      <p>Las mismas reglas que <code>LocalDate</code>: meses de distinta longitud, años bisiestos, <code>Period</code> frente a <code>ChronoUnit</code>.</p></div>
    <section class="jv-seccion"><h4>1 · Sumar y restar</h4>
      <div class="jv-fila">
        <label>Fecha <input type="date" class="jv-f1" value="2026-01-31" min="1000-01-01" max="9999-12-31" /></label>
        <label>Operación <select class="jv-op">${OPS_FECHA.map((o, i) => `<option value="${i}" ${i === 1 ? "selected" : ""}>${o.nombre}</option>`).join("")}</select></label>
        <label>Cantidad <input type="number" class="jv-nn" value="1" min="0" max="5000" /></label>
      </div>
      <div class="jv-trampas" role="group" aria-label="Casos curiosos"><span class="jv-etq">Casos curiosos:</span>${TRAMPAS.map((t, i) => `<button data-t="${i}">${t.texto}</button>`).join("")}</div>
      <div class="jv-res-suma"></div>
    </section>
    <section class="jv-seccion"><h4>2 · Diferencia entre dos fechas</h4>
      <div class="jv-fila">
        <label>Desde <input type="date" class="jv-a" value="2008-03-24" min="1000-01-01" max="9999-12-31" /></label>
        <label>Hasta <input type="date" class="jv-b" value="2026-09-16" min="1000-01-01" max="9999-12-31" /></label>
      </div>
      <div class="jv-res-dif"></div>
    </section>
    <section class="jv-seccion"><h4>3 · Reto D: calendario de vencimientos</h4>
      <p class="jv-nota-peq">Comprueba lo que debería mostrar tu programa de la Profundización D. Convenio usado: los días hábiles se cuentan <b>desde el día siguiente a la emisión hasta el vencimiento, ambos incluidos</b>, de lunes a viernes.</p>
      <div class="jv-fila">
        <label>Emisión <input type="date" class="jv-e" value="2026-09-16" min="1000-01-01" max="9999-12-31" /></label>
        <label>Plazo (días) <input type="number" class="jv-p" value="30" min="0" max="3650" /></label>
      </div>
      <div class="jv-res-venc"></div>
    </section>
    <section class="jv-seccion"><h4>4 · ¿Año bisiesto?</h4>
      <div class="jv-fila"><label>Año <input type="number" class="jv-y" value="1900" min="1000" max="9999" /></label></div>
      <div class="jv-res-bis"></div>
    </section>`;
  const q = <T extends HTMLElement>(s: string) => c.querySelector<T>(s)!;
  const fecha = (s: string) => parsear(s);
  const lineaRes = (k: string, v: string) => `<div><span class="jv-etq">${k}</span> <b class="jv-v">${v}</b></div>`;
  const imports = "import java.time.LocalDate;";

  function sumas(): void {
    const f = fecha(q<HTMLInputElement>(".jv-f1").value);
    const op = OPS_FECHA[Number(q<HTMLSelectElement>(".jv-op").value)];
    const n = Number(q<HTMLInputElement>(".jv-nn").value);
    const caja = q(".jv-res-suma");
    if (!f || !Number.isFinite(n)) return void (caja.innerHTML = `<p class="jv-nota-peq">Escribe una fecha válida.</p>`);
    const r = op.aplicar(f, n);
    caja.innerHTML = `
      ${bloqueJava([imports, `LocalDate f = ${llamadaOf(f)};`, `LocalDate r = f.${op.nombre}(${n});`, "System.out.println(r);"])}
      <div class="jv-caja">${lineaRes("f (no cambia: LocalDate es inmutable)", iso(f))}${lineaRes("r", iso(r))}${lineaRes("r.getDayOfWeek()", `${DIAS_EN[diaSemana(r)]} (${DIAS_ES[diaSemana(r)]})`)}${lineaRes("r.isLeapYear()", String(esBisiesto(r.a)))}</div>`;
  }

  function diferencia(): void {
    const a = fecha(q<HTMLInputElement>(".jv-a").value);
    const b = fecha(q<HTMLInputElement>(".jv-b").value);
    const caja = q(".jv-res-dif");
    if (!a || !b) return void (caja.innerHTML = `<p class="jv-nota-peq">Escribe dos fechas válidas.</p>`);
    const p = periodo(a, b);
    caja.innerHTML = `
      ${bloqueJava([imports, "import java.time.Period;", "import java.time.temporal.ChronoUnit;", "", `LocalDate a = ${llamadaOf(a)};`, `LocalDate b = ${llamadaOf(b)};`, "Period p = Period.between(a, b);", "long dias = ChronoUnit.DAYS.between(a, b);"])}
      <div class="jv-caja">${lineaRes("p (Period.toString)", periodoTexto(p))}${lineaRes("p.getYears() / getMonths() / getDays()", `${p.anios} / ${p.meses} / ${p.dias}`)}${lineaRes("ChronoUnit.DAYS.between(a, b)", miles(diasEntre(a, b)))}</div>
      <p class="jv-nota-peq">Para una <b>edad</b> usa <code>Period</code> (${p.anios} años y ${p.meses} meses); para «cuántos días faltan», <code>ChronoUnit</code>. Dividir los días entre 365 daría ${(diasEntre(a, b) / 365).toFixed(2)}: no es la edad exacta.</p>`;
  }

  function vencimiento(): void {
    const e = fecha(q<HTMLInputElement>(".jv-e").value);
    const plazo = Number(q<HTMLInputElement>(".jv-p").value);
    const caja = q(".jv-res-venc");
    if (!e || !Number.isFinite(plazo)) return void (caja.innerHTML = `<p class="jv-nota-peq">Escribe una fecha válida.</p>`);
    const v = plusDays(e, plazo);
    const dow = diaSemana(v);
    const finde = dow >= 5;
    const habil = finde ? siguienteLunes(v) : v;
    const w = semanaIso(v);
    caja.innerHTML = `<div class="jv-caja">
      ${lineaRes("1. Vencimiento (emisión + plazo)", `${iso(v)} · ${español(v)}`)}
      ${lineaRes("2. Día de la semana", DIAS_ES[dow])}
      ${lineaRes("3. Fecha hábil", finde ? `${iso(habil)} (cae en ${DIAS_ES[dow]}: el lunes siguiente)` : `${iso(v)} (ya es hábil)`)}
      ${lineaRes("4. Días hábiles entre emisión y vencimiento", String(diasHabiles(e, v)))}
      ${lineaRes("5. Semana ISO del vencimiento", `${w.semana}${w.anio !== v.a ? ` (del año ${w.anio})` : ""}`)}
    </div>`;
  }

  function bisiesto(): void {
    const y = Math.trunc(Number(q<HTMLInputElement>(".jv-y").value));
    if (!Number.isFinite(y)) return;
    const motivo = y % 400 === 0 ? "múltiplo de 400: sí" : y % 100 === 0 ? "múltiplo de 100 pero no de 400: no" : y % 4 === 0 ? "múltiplo de 4 y no de 100: sí" : "no es múltiplo de 4: no";
    q(".jv-res-bis").innerHTML = `<div class="jv-caja">${lineaRes(`Year.isLeap(${y})`, String(esBisiesto(y)))}${lineaRes("Por qué", motivo)}${lineaRes(`febrero de ${y} tiene`, `${diasDelMes(y, 2)} días`)}</div>`;
  }

  c.addEventListener("input", () => {
    sumas();
    diferencia();
    vencimiento();
    bisiesto();
  });
  c.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>("[data-t]");
    if (!b) return;
    const t = TRAMPAS[Number(b.dataset.t)];
    q<HTMLInputElement>(".jv-f1").value = t.fecha;
    q<HTMLSelectElement>(".jv-op").value = String(t.op);
    q<HTMLInputElement>(".jv-nn").value = String(t.n);
    sumas();
  });
  sumas();
  diferencia();
  vencimiento();
  bisiesto();
}

// ---------------------------------------------------------------------------------- app

export const laboratorioJava: AppDef = {
  id: "java-lab",
  nombre: "Laboratorio: String y fechas",
  carpeta: "0485 · Programación",
  icono: `<svg viewBox="0 0 48 48"><rect x="3" y="3" width="42" height="42" rx="8" fill="#0d0b1e" stroke="#6fd08c" stroke-width="2.5"/><path d="M19 8h10M21 8v11L12 36a4 4 0 0 0 3.6 6h16.8A4 4 0 0 0 36 36L27 19V8" fill="none" stroke="#6fd08c" stroke-width="2.6" stroke-linejoin="round"/><circle cx="21" cy="34" r="2.6" fill="#f7e26b"/><circle cx="28" cy="30" r="2" fill="#da251c"/></svg>`,
  ancho: 880,
  alto: 720,
  iniciar({ ventana, raiz }) {
    raiz.classList.add("cj", "jv");
    raiz.innerHTML = `
      <div class="cj-tabs" role="tablist"><button data-m="strings" role="tab">🔤 String es inmutable</button><button data-m="coste" role="tab">⏱ Concatenar: el coste</button><button data-m="fechas" role="tab">📅 Fechas (java.time)</button></div>
      <div class="cj-cuerpo"><div class="jv-cuerpo"></div></div>`;
    const cuerpo = raiz.querySelector<HTMLElement>(".jv-cuerpo")!;
    function abrir(m: Pestana): void {
      raiz.querySelectorAll<HTMLElement>("[data-m]").forEach((b) => b.classList.toggle("on", b.dataset.m === m));
      const caja = document.createElement("div");
      caja.className = "jv-pestana";
      cuerpo.replaceChildren(caja);
      ventana.fijarTitulo(`Laboratorio · ${m === "strings" ? "String es inmutable" : m === "coste" ? "Concatenar: el coste" : "Fechas"}`);
      (m === "strings" ? pestanaStrings : m === "coste" ? pestanaCoste : pestanaFechas)(caja);
    }
    raiz.querySelector(".cj-tabs")!.addEventListener("click", (e) => {
      const m = (e.target as HTMLElement).dataset.m as Pestana | undefined;
      if (m) abrir(m);
    });
    abrir("strings");
  },
};

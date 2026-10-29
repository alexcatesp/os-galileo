import type { AppDef } from "../kernel/kernel";

type Op = "+" | "−" | "×" | "÷";

const TECLAS: [string, string][] = [
  ["C", "limpiar"], ["±", "signo"], ["%", "porc"], ["÷", "op"],
  ["7", "num"], ["8", "num"], ["9", "num"], ["×", "op"],
  ["4", "num"], ["5", "num"], ["6", "num"], ["−", "op"],
  ["1", "num"], ["2", "num"], ["3", "num"], ["+", "op"],
  ["0", "num"], [",", "coma"], ["⌫", "borrar"], ["=", "igual"],
];

function calcular(a: number, b: number, op: Op): number {
  switch (op) {
    case "+": return a + b;
    case "−": return a - b;
    case "×": return a * b;
    case "÷": return b === 0 ? NaN : a / b;
  }
}

function formato(n: number): string {
  if (!Number.isFinite(n)) return "Error";
  const redondeado = Number(n.toPrecision(12));
  return String(redondeado).replace(".", ",");
}

export const calculadora: AppDef = {
  id: "calculadora",
  nombre: "Calculadora",
  icono: `<svg viewBox="0 0 48 48"><rect x="9" y="4" width="30" height="40" rx="5" fill="#2a1770"/><rect x="13" y="9" width="22" height="9" rx="2" fill="#8fd3ff"/><g fill="#f4f1ff"><circle cx="17" cy="26" r="2.6"/><circle cx="24" cy="26" r="2.6"/><circle cx="31" cy="26" r="2.6"/><circle cx="17" cy="33" r="2.6"/><circle cx="24" cy="33" r="2.6"/><circle cx="31" cy="33" r="2.6"/></g><circle cx="17" cy="39" r="2.2" fill="#f4f1ff"/><rect x="21.5" y="37" width="12" height="4.4" rx="2.2" fill="#da251c"/></svg>`,
  ancho: 300,
  alto: 440,
  iniciar({ raiz }) {
    raiz.classList.add("calc");
    raiz.innerHTML = `<div class="calc-pantalla" aria-live="polite"><small></small><output>0</output></div>
      <div class="calc-teclas">${TECLAS.map(([t, k]) => `<button data-k="${k}" data-t="${t}">${t}</button>`).join("")}</div>`;
    const salida = raiz.querySelector("output")!;
    const traza = raiz.querySelector("small")!;

    let actual = "0"; // texto que se está escribiendo
    let acumulado: number | null = null;
    let op: Op | null = null;
    let nuevo = true; // la siguiente cifra empieza número

    const pintar = () => {
      salida.textContent = actual;
      traza.textContent = acumulado !== null && op ? `${formato(acumulado)} ${op}` : "";
    };
    const valor = () => Number(actual.replace(",", "."));
    const resolver = () => {
      if (acumulado !== null && op) {
        actual = formato(calcular(acumulado, valor(), op));
        acumulado = null;
        op = null;
      }
    };

    raiz.querySelector(".calc-teclas")!.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest("button");
      if (!b) return;
      const t = b.dataset.t!;
      switch (b.dataset.k) {
        case "num":
          actual = nuevo || actual === "0" ? t : actual + t;
          nuevo = false;
          break;
        case "coma":
          if (nuevo) { actual = "0,"; nuevo = false; }
          else if (!actual.includes(",")) actual += ",";
          break;
        case "op":
          if (op && !nuevo) resolver();
          acumulado = valor();
          op = t as Op;
          nuevo = true;
          break;
        case "igual":
          resolver();
          nuevo = true;
          break;
        case "limpiar":
          actual = "0"; acumulado = null; op = null; nuevo = true;
          break;
        case "signo":
          if (actual !== "0" && actual !== "Error") actual = actual.startsWith("-") ? actual.slice(1) : "-" + actual;
          break;
        case "porc":
          actual = formato(valor() / 100);
          nuevo = true;
          break;
        case "borrar":
          if (!nuevo) actual = actual.length > 1 && actual !== "Error" ? actual.slice(0, -1) : "0";
          if (actual === "-") actual = "0";
          break;
      }
      pintar();
    });
    pintar();
  },
};

import type { AppDef } from "../kernel/kernel";

/** App que muestra una web del mismo dominio dentro de la ventana (por ejemplo GASA). */
export function appWeb(def: Pick<AppDef, "id" | "nombre" | "icono"> & { url: string; ancho?: number; alto?: number }): AppDef {
  return {
    id: def.id,
    nombre: def.nombre,
    icono: def.icono,
    ancho: def.ancho ?? 900,
    alto: def.alto ?? 600,
    iniciar({ raiz }) {
      raiz.classList.add("app-web");
      // GASA solo deja entrar a los edificios si se llega desde el campus
      const marco = document.createElement("iframe");
      marco.src = def.url;
      marco.title = def.nombre;
      marco.className = "app-web-marco";
      raiz.appendChild(marco);
    },
  };
}

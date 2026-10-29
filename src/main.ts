import "./styles.css";
import { iniciarRotacionFondos } from "./kernel/fondos";
import { Kernel } from "./kernel/kernel";
import { blocDeNotas } from "./apps/bloc-de-notas";
import { calculadora } from "./apps/calculadora";
import { explorador } from "./apps/explorador";
import { terminal } from "./apps/terminal";
import { pseudoFlow } from "./apps/pseudoflow";
import { appWeb } from "./apps/app-web";
import { arrancar, iniciarSesion } from "./shell/arranque";
import { montarEscritorio } from "./shell/escritorio";
import { montarMovil } from "./shell/movil";

const raiz = document.getElementById("so")!;
const so = new Kernel();
so.registrar(explorador);
so.registrar(terminal);
so.registrar(blocDeNotas);
so.registrar(pseudoFlow);
so.registrar(calculadora);
so.registrar(
  appWeb({
    id: "gasa",
    nombre: "GASA",
    url: "/gasa/",
    icono: `<svg viewBox="0 0 48 48"><rect x="4" y="6" width="40" height="30" rx="4" fill="#0d0b1e" stroke="#6fd08c" stroke-width="2.5"/><path d="M12 28l7-9 5 6 4-4 8 7z" fill="#6fd08c"/><circle cx="34" cy="15" r="3.4" fill="#f7e26b"/><rect x="14" y="39" width="20" height="3.5" rx="1.7" fill="#6fd08c"/></svg>`,
  }),
);

// El shell depende del tamaño de pantalla: móvil por debajo de 760 px de ancho.
const esMovil = window.matchMedia("(max-width: 760px)");

async function sesion(): Promise<void> {
  await iniciarSesion(raiz, so.usuario.visible);
  let desmontar = (esMovil.matches ? montarMovil : montarEscritorio)(raiz, so, apagar);
  const cambio = () => {
    desmontar();
    desmontar = (esMovil.matches ? montarMovil : montarEscritorio)(raiz, so, apagar);
  };
  esMovil.addEventListener("change", cambio);

  function apagar(): void {
    esMovil.removeEventListener("change", cambio);
    desmontar();
    void sesion();
  }
}

iniciarRotacionFondos();
void arrancar(raiz).then(sesion);

import "./styles.css";
import { Kernel } from "./kernel/kernel";
import { blocDeNotas } from "./apps/bloc-de-notas";
import { calculadora } from "./apps/calculadora";
import { arrancar, iniciarSesion } from "./shell/arranque";
import { montarEscritorio } from "./shell/escritorio";
import { montarMovil } from "./shell/movil";

const raiz = document.getElementById("so")!;
const so = new Kernel();
so.registrar(blocDeNotas);
so.registrar(calculadora);

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

void arrancar(raiz).then(sesion);

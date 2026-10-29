import "./styles.css";
import { iniciarRotacionFondos } from "./kernel/fondos";
import { Kernel } from "./kernel/kernel";
import { blocDeNotas } from "./apps/bloc-de-notas";
import { calculadora } from "./apps/calculadora";
import { explorador } from "./apps/explorador";
import { terminal } from "./apps/terminal";
import { pseudoFlow } from "./apps/pseudoflow";
import { sudoku } from "./apps/juegos/sudoku";
import { binario } from "./apps/juegos/binario";
import { arrancar, iniciarSesion } from "./shell/arranque";
import { montarEscritorio } from "./shell/escritorio";
import { montarMovil } from "./shell/movil";

const raiz = document.getElementById("so")!;

// Un móvil real no hace zoom dentro de las apps: se bloquea el pellizco (también en iOS, que ignora user-scalable)
for (const ev of ["gesturestart", "gesturechange", "gestureend"]) document.addEventListener(ev, (e) => e.preventDefault());
document.addEventListener("touchmove", (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
const so = new Kernel();
so.registrar(explorador);
so.registrar(terminal);
so.registrar(blocDeNotas);
so.registrar(pseudoFlow);
so.registrar(sudoku);
so.registrar(binario);
so.registrar(calculadora);
// GASA se añadirá más adelante con appWeb({ id: "gasa", nombre: "GASA", url: "/gasa/", icono: … })

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

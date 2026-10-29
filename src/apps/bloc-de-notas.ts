import type { AppDef } from "../kernel/kernel";

const RUTA_INICIAL = "/home/invitado/Documentos/sin-titulo.txt";

export const blocDeNotas: AppDef = {
  id: "bloc-de-notas",
  nombre: "Bloc de notas",
  icono: `<svg viewBox="0 0 48 48"><rect x="9" y="5" width="30" height="38" rx="4" fill="#f4f1ff"/><rect x="9" y="5" width="30" height="8" rx="4" fill="#da251c"/><g stroke="#2a1770" stroke-width="2.4" stroke-linecap="round"><path d="M15 21h18M15 27h18M15 33h11"/></g></svg>`,
  ancho: 520,
  alto: 380,
  iniciar({ so, ventana, raiz, args }) {
    raiz.classList.add("bloc");
    raiz.innerHTML = `
      <div class="bloc-barra">
        <input class="bloc-ruta" spellcheck="false" aria-label="Ruta del archivo" />
        <button data-acc="abrir">Abrir</button>
        <button data-acc="guardar">Guardar</button>
        <button data-acc="nuevo">Nuevo</button>
      </div>
      <textarea class="bloc-texto" spellcheck="false" aria-label="Texto"></textarea>
      <div class="bloc-estado"></div>`;
    const ruta = raiz.querySelector<HTMLInputElement>(".bloc-ruta")!;
    const texto = raiz.querySelector<HTMLTextAreaElement>(".bloc-texto")!;
    const estado = raiz.querySelector<HTMLElement>(".bloc-estado")!;
    ruta.value = RUTA_INICIAL;

    let sucio = false;
    const aviso = (m: string, error = false) => {
      estado.textContent = m;
      estado.classList.toggle("error", error);
    };
    const titulo = () => ventana.fijarTitulo(`${sucio ? "● " : ""}${ruta.value.split("/").pop()} — Bloc de notas`);
    texto.addEventListener("input", () => {
      sucio = true;
      titulo();
      aviso(`${texto.value.length} caracteres`);
    });
    ruta.addEventListener("change", titulo);

    const guardar = () => {
      try {
        so.vfs.escribir(ruta.value, texto.value);
        sucio = false;
        titulo();
        aviso(`Guardado en ${ruta.value}`);
      } catch (e) {
        aviso((e as Error).message, true);
      }
    };
    const abrir = () => {
      try {
        texto.value = so.vfs.leer(ruta.value);
        sucio = false;
        titulo();
        aviso(`Abierto ${ruta.value}`);
      } catch (e) {
        aviso((e as Error).message, true);
      }
    };
    raiz.querySelector('[data-acc="guardar"]')!.addEventListener("click", guardar);
    raiz.querySelector('[data-acc="abrir"]')!.addEventListener("click", abrir);
    raiz.querySelector('[data-acc="nuevo"]')!.addEventListener("click", () => {
      texto.value = "";
      ruta.value = RUTA_INICIAL;
      sucio = false;
      titulo();
      aviso("Documento nuevo");
    });
    raiz.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        guardar();
      }
    });
    titulo();
    aviso("Listo");
    if (args.ruta) {
      ruta.value = args.ruta;
      abrir();
    }
    texto.focus();
  },
};

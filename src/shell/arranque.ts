// Arranque simulado (mensajes de «núcleo») y pantalla de inicio de sesión.

const LOG = [
  "OS Galileo 0.1 — núcleo web",
  "[ ok ] Comprobando almacenamiento local",
  "[ ok ] Montando sistema de archivos virtual en /",
  "[ ok ] Cargando usuarios y permisos",
  "[ ok ] Registrando aplicaciones",
  "[ ok ] Iniciando gestor de ventanas",
  "[ ok ] Iniciando pantalla de acceso",
];

function pausa(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function arrancar(raiz: HTMLElement): Promise<void> {
  raiz.innerHTML = `
    <div class="arranque" tabindex="0">
      <img src="./logo.svg" alt="IES Galileo" class="arranque-logo" />
      <div class="arranque-barra"><i></i></div>
      <pre class="arranque-log" aria-hidden="true"></pre>
      <small>Pulsa cualquier tecla para saltar</small>
    </div>`;
  const cont = raiz.querySelector<HTMLElement>(".arranque")!;
  const barra = raiz.querySelector<HTMLElement>(".arranque-barra i")!;
  const log = raiz.querySelector<HTMLElement>(".arranque-log")!;
  let saltar = false;
  const salto = () => (saltar = true);
  cont.addEventListener("pointerdown", salto);
  window.addEventListener("keydown", salto, { once: true });
  cont.focus();

  for (let i = 0; i < LOG.length && !saltar; i++) {
    log.textContent += LOG[i] + "\n";
    barra.style.width = `${((i + 1) / LOG.length) * 100}%`;
    await pausa(260);
  }
  window.removeEventListener("keydown", salto);
}

export function iniciarSesion(raiz: HTMLElement, nombre: string): Promise<void> {
  return new Promise((resolver) => {
    raiz.innerHTML = `
      <div class="login">
        <div class="login-caja">
          <div class="avatar" aria-hidden="true">${nombre[0] ?? "?"}</div>
          <h1>${nombre}</h1>
          <button class="entrar" autofocus>Entrar</button>
          <p>Acceso como invitado</p>
        </div>
      </div>`;
    const boton = raiz.querySelector<HTMLButtonElement>(".entrar")!;
    boton.addEventListener("click", () => resolver());
    boton.focus();
  });
}

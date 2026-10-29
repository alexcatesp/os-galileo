// Fondos de escritorio: uno distinto en cada entrada y un cambio cada 10 minutos.
// Para añadir más, copiar la imagen a public/fondos/ y listarla aquí.

const FONDOS = ["fondos/fondo-1.png", "fondos/fondo-2.png"];
const CADA_MS = 10 * 60 * 1000;
const CLAVE = "osg-ultimo-fondo";

function ultimo(): number {
  try {
    return Number(sessionStorage.getItem(CLAVE) ?? "-1");
  } catch {
    return -1;
  }
}

/** Aplica un fondo distinto al anterior (si hay más de uno). */
function cambiar(): void {
  const anterior = ultimo();
  let i = Math.floor(Math.random() * FONDOS.length);
  if (FONDOS.length > 1 && i === anterior) i = (i + 1) % FONDOS.length;
  document.documentElement.style.setProperty("--fondo", `url("/${FONDOS[i]}")`);
  try {
    sessionStorage.setItem(CLAVE, String(i));
  } catch {
    /* sin almacenamiento */
  }
}

export function iniciarRotacionFondos(): void {
  cambiar();
  window.setInterval(cambiar, CADA_MS);
}

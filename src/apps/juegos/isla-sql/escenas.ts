// Escenas ilustradas en SVG de «La isla de los datos»: un fondo por capítulo y un personaje que habla.

import type { EscenaId, PersonajeId } from "./tipos";

interface Look {
  piel: string;
  ropa: string;
  pelo: string;
  extra: (s: number) => string;
}

const LOOKS: Record<PersonajeId | "tu", Look> = {
  tu: {
    piel: "#e0ac82", ropa: "#8b6b4a", pelo: "#3a2a1c",
    extra: () => `<path d="M-9 -22l3 5 3-5 3 5 3-5" stroke="#6a4f35" stroke-width="1.5" fill="none"/>`,
  },
  coralina: {
    piel: "#c98a5d", ropa: "#1f8fb3", pelo: "#2b1a12",
    extra: () => `<path d="M-9 -41q9 -7 18 0v4h-18z" fill="#da251c"/><path d="M13 -22l16 -12M13 -12l16 -10M13 -22l0 10" stroke="#caa86a" stroke-width="1.3" fill="none"/>`,
  },
  olivia: {
    piel: "#e3b48c", ropa: "#6fb36f", pelo: "#c9c9d6",
    extra: () => `<circle cx="0" cy="-47" r="5" fill="#c9c9d6"/><ellipse cx="17" cy="-8" rx="8" ry="5" fill="#a8742f"/><path d="M12 -9q5 -9 10 0" stroke="#4f9d4f" stroke-width="2" fill="none"/>`,
  },
  marina: {
    piel: "#b9784f", ropa: "#d9482b", pelo: "#1e1410",
    extra: () => `<ellipse cx="0" cy="-42" rx="17" ry="4" fill="#e8c36a"/><path d="M-8 -43q8 -12 16 0z" fill="#e8c36a"/><path d="M-9 -26q9 6 18 0" stroke="#ffd54a" stroke-width="3" fill="none"/>`,
  },
  hugo: {
    piel: "#d79a6e", ropa: "#5c8a3a", pelo: "#5a3b20",
    extra: () => `<ellipse cx="0" cy="-42" rx="16" ry="4" fill="#e6cf7c"/><path d="M-8 -43q8 -11 16 0z" fill="#e6cf7c"/><path d="M14 -4L22 -40M18 -42l9 4" stroke="#7b5a33" stroke-width="2" fill="none"/>`,
  },
  ada: {
    piel: "#d7a77f", ropa: "#7b4fb3", pelo: "#f1f1f5",
    extra: () => `<path d="M-10 -40q-4 14 -2 28M10 -40q4 14 2 28" stroke="#f1f1f5" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M16 4L16 -46" stroke="#7b5a33" stroke-width="2.5"/><circle cx="16" cy="-48" r="4" fill="#ffd54a"/>`,
  },
  irene: {
    piel: "#e3b08a", ropa: "#2a3f8f", pelo: "#3b2418",
    extra: () => `<circle cx="-4" cy="-35" r="3.4" fill="none" stroke="#1a1440" stroke-width="1.2"/><circle cx="4" cy="-35" r="3.4" fill="none" stroke="#1a1440" stroke-width="1.2"/><path d="M0 -35h0" stroke="#1a1440"/><path d="M12 -20l24 -14" stroke="#8d94a8" stroke-width="5" stroke-linecap="round"/>`,
  },
};

function figura(l: Look, s = 1): string {
  return `<g transform="scale(${s})">
    <rect x="-8" y="-3" width="6" height="14" rx="2" fill="#3b2c4d"/><rect x="2" y="-3" width="6" height="14" rx="2" fill="#3b2c4d"/>
    <path d="M-10 -26h20l3 25h-26z" fill="${l.ropa}"/>
    <path d="M-10 -24l-8 14M10 -24l8 14" stroke="${l.piel}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="0" cy="-35" r="9" fill="${l.piel}"/>
    <path d="M-9 -37q9 -13 18 0q-5 -4 -9 -3q-4 -1 -9 3z" fill="${l.pelo}"/>
    <circle cx="-3" cy="-35" r="1.1" fill="#1a1440"/><circle cx="3" cy="-35" r="1.1" fill="#1a1440"/>
    <path d="M-3 -31q3 3 6 0" stroke="#1a1440" stroke-width="1" fill="none"/>
    ${l.extra(s)}
  </g>`;
}

/** el personaje que habla, en pie, sobre su escena */
export function persona(id: PersonajeId | "tu", x: number, y: number, s = 1.15): string {
  return `<g transform="translate(${x} ${y})">${figura(LOOKS[id], s)}</g>`;
}

/** retrato (cabeza y hombros) para el cuadro de diálogo */
export function retrato(id: PersonajeId | "tu"): string {
  return `<svg viewBox="-17 -52 34 34" aria-hidden="true"><rect x="-17" y="-52" width="34" height="34" fill="#c9d9ff"/>${figura(LOOKS[id], 1)}</svg>`;
}

const palmera = (x: number, y: number, h = 70) =>
  `<g transform="translate(${x} ${y})"><path d="M0 0q6 -${h / 2} -4 -${h}" stroke="#7b5a33" stroke-width="6" fill="none" stroke-linecap="round"/>
    <g transform="translate(-4 -${h})" fill="#2f9d4a"><ellipse rx="26" ry="6" transform="rotate(-25)"/><ellipse rx="26" ry="6" transform="rotate(25)"/><ellipse rx="24" ry="6" transform="rotate(-70)"/><ellipse rx="24" ry="6" transform="rotate(70)"/><ellipse rx="22" ry="5"/></g>
    <circle cx="-8" cy="-${h - 6}" r="3.5" fill="#8b5a2b"/><circle cx="0" cy="-${h - 4}" r="3.5" fill="#8b5a2b"/></g>`;

const choza = (x: number, y: number, c = "#d9a441") =>
  `<g transform="translate(${x} ${y})"><rect x="-22" y="-26" width="44" height="26" fill="#a9743a"/><path d="M-30 -24L0 -52l30 28z" fill="${c}"/><rect x="-6" y="-18" width="12" height="18" fill="#5a3b20"/></g>`;

const nube = (x: number, y: number) => `<g fill="#fff" opacity="0.9"><ellipse cx="${x}" cy="${y}" rx="22" ry="7"/><ellipse cx="${x + 14}" cy="${y - 5}" rx="14" ry="7"/></g>`;

export function escena(id: EscenaId, quien: PersonajeId): string {
  const cuerpo = (() => {
    switch (id) {
      case "playa":
        return `
          <defs><linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6ec6f5"/><stop offset="1" stop-color="#ffe7a8"/></linearGradient></defs>
          <rect width="480" height="190" fill="url(#cielo)"/><circle cx="410" cy="38" r="20" fill="#ffd54a"/>${nube(90, 34)}${nube(250, 22)}
          <rect y="88" width="480" height="48" fill="#2aa8d8"/><path d="M0 100q20 -6 40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0" stroke="#fff" stroke-width="2" fill="none" opacity="0.6"/>
          <path d="M0 130q120 -14 240 -4t240 -8v72H0z" fill="#f3d58a"/>
          ${palmera(46, 156, 84)}${palmera(436, 162, 74)}
          <g transform="translate(150 162)"><path d="M-30 0l8 -14h46l10 14z" fill="#8b5a2b"/><path d="M-4 -14l16 -34" stroke="#6a4326" stroke-width="3"/><path d="M12 -48l22 8-20 10z" fill="#e7e1d0"/></g>
          ${persona("tu", 118, 176, 1)}`;
      case "valle":
        return `
          <rect width="480" height="190" fill="#bfe8ff"/>${nube(70, 30)}${nube(300, 40)}
          <path d="M0 110q80 -50 170 -14t170 -22t140 24v92H0z" fill="#79c36a"/><path d="M0 140q120 -36 250 -6t230 -14v70H0z" fill="#58a850"/>
          ${choza(330, 128)}${choza(410, 140, "#c98d3b")}
          <g fill="#2f7d3a"><circle cx="60" cy="120" r="16"/><circle cx="90" cy="128" r="12"/></g><rect x="57" y="124" width="6" height="22" fill="#7b5a33"/>
          <g fill="#ff7aa8"><circle cx="150" cy="160" r="3"/><circle cx="170" cy="168" r="3"/><circle cx="200" cy="158" r="3"/></g><g fill="#fff17a"><circle cx="160" cy="172" r="3"/><circle cx="190" cy="174" r="3"/></g>
          <path d="M0 170q80 -14 160 2t160 -4" stroke="#4aa8e8" stroke-width="5" fill="none"/>
          ${persona("tu", 120, 178, 1)}`;
      case "mercado":
        return `
          <rect width="480" height="190" fill="#ffe9c2"/><rect y="150" width="480" height="40" fill="#d9b27a"/>
          <g><rect x="40" y="96" width="120" height="54" fill="#8b5a2b"/><path d="M30 96l10 -30h120l10 30z" fill="#da251c"/><path d="M60 66l-8 30M100 66l-4 30M140 66l4 30" stroke="#fff" stroke-width="7"/>
            <circle cx="62" cy="92" r="7" fill="#ff9800"/><circle cx="80" cy="90" r="7" fill="#ffd54a"/><circle cx="98" cy="92" r="7" fill="#e53935"/><circle cx="116" cy="90" r="7" fill="#7cb342"/></g>
          <g><rect x="190" y="104" width="110" height="46" fill="#a9743a"/><path d="M182 104l10 -26h106l10 26z" fill="#1f8fb3"/><path d="M206 78l-8 26M244 78l-2 26M282 78l4 26" stroke="#fff" stroke-width="7"/>
            <rect x="204" y="86" width="22" height="16" rx="3" fill="#7b4fb3"/><rect x="236" y="88" width="22" height="14" rx="3" fill="#2f9d4a"/></g>
          <g fill="#7b5a33"><rect x="8" y="132" width="26" height="18"/><rect x="440" y="128" width="28" height="22"/></g>
          ${persona("tu", 160, 182, 1)}`;
      case "campos":
        return `
          <rect width="480" height="190" fill="#cdeeff"/><circle cx="70" cy="36" r="20" fill="#ffd54a"/>${nube(250, 30)}
          <path d="M0 96q120 -22 240 -4t240 -6v100H0z" fill="#a8d86a"/>
          <g stroke="#3f8a2f" stroke-width="5" stroke-linecap="round"><path d="M10 120h200M0 138h220M-10 160h240"/></g>
          <g stroke="#7bbf4a" stroke-width="5" stroke-linecap="round"><path d="M240 112h230M250 132h240M260 156h230"/></g>
          <g fill="#2f7d3a"><circle cx="300" cy="90" r="22"/><circle cx="420" cy="86" r="20"/></g><rect x="296" y="96" width="8" height="24" fill="#7b5a33"/><rect x="416" y="94" width="8" height="24" fill="#7b5a33"/>
          <g fill="#ff7043"><circle cx="292" cy="84" r="4"/><circle cx="308" cy="92" r="4"/><circle cx="414" cy="80" r="4"/><circle cx="428" cy="90" r="4"/></g>
          <path d="M40 176l30 -6l6 -18h-34z" fill="#8b5a2b"/><circle cx="48" cy="180" r="6" fill="#444"/>
          ${persona("tu", 150, 182, 1)}`;
      case "archivo":
        return `
          <rect width="480" height="190" fill="#8a5a2b"/><path d="M0 0h480v26H0z" fill="#6a4326"/>
          <g fill="#5a3b20"><rect x="14" y="40" width="130" height="8"/><rect x="14" y="84" width="130" height="8"/><rect x="14" y="128" width="130" height="8"/></g>
          <g><rect x="22" y="22" width="14" height="18" fill="#c0392b"/><rect x="38" y="24" width="12" height="16" fill="#2980b9"/><rect x="52" y="20" width="16" height="20" fill="#27ae60"/><rect x="78" y="26" width="40" height="14" rx="7" fill="#f4e4b8"/>
            <rect x="24" y="66" width="12" height="18" fill="#8e44ad"/><rect x="40" y="68" width="16" height="16" fill="#d35400"/><rect x="62" y="64" width="36" height="20" rx="10" fill="#f4e4b8"/>
            <rect x="26" y="108" width="14" height="20" fill="#2c3e50"/><rect x="44" y="110" width="12" height="18" fill="#c0392b"/><rect x="70" y="112" width="44" height="16" rx="8" fill="#f4e4b8"/></g>
          <rect x="170" y="128" width="170" height="14" fill="#5a3b20"/><rect x="180" y="142" width="10" height="40" fill="#5a3b20"/><rect x="320" y="142" width="10" height="40" fill="#5a3b20"/>
          <g><path d="M200 128l-20 -26h80z" fill="#f4e4b8" opacity="0"/><path d="M190 128v-18l65 -10 65 10v18z" fill="#f7f1d8" stroke="#3b2418" stroke-width="2"/><path d="M255 100v28" stroke="#3b2418" stroke-width="2"/>
            <path d="M200 114h42M200 120h38M268 114h44M268 120h36" stroke="#6a62a8" stroke-width="2"/><text x="255" y="94" text-anchor="middle" font-family="Segoe UI" font-size="11" font-weight="700" fill="#ffd54a">Gran Libro</text></g>
          <circle cx="230" cy="100" r="40" fill="#ffd54a" opacity="0.12"/>
          <g transform="translate(400 70)"><rect x="-4" y="0" width="8" height="12" fill="#444"/><ellipse cx="0" cy="-6" rx="9" ry="12" fill="#ffb300"/><ellipse cx="0" cy="-6" rx="18" ry="22" fill="#ffd54a" opacity="0.25"/></g>
          ${persona("tu", 100, 184, 1)}`;
      case "aldea":
        return `
          <defs><linearGradient id="ocaso" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6a35a"/><stop offset="1" stop-color="#ffe0a3"/></linearGradient></defs>
          <rect width="480" height="190" fill="url(#ocaso)"/><circle cx="60" cy="50" r="18" fill="#fff3c4" opacity="0.8"/>
          <path d="M170 150L252 32h24l82 118z" fill="#6b5b53"/><path d="M252 32l8 12 8 -12z" fill="#e8532b"/><path d="M262 44q-12 40 -34 60M262 44q12 40 38 60" stroke="#e8532b" stroke-width="3" fill="none"/>
          <g fill="#8a8a96" opacity="0.8"><circle cx="262" cy="20" r="12"/><circle cx="276" cy="8" r="10"/><circle cx="252" cy="6" r="9"/></g>
          <rect y="148" width="480" height="42" fill="#7a5a3a"/>${choza(70, 160, "#c98d3b")}${choza(410, 160)}
          <g transform="translate(130 160)"><path d="M-8 0l8 -22 8 22z" fill="#e8532b"/><path d="M-4 0l4 -14 4 14z" fill="#ffd54a"/></g>
          ${persona("tu", 200, 182, 1)}`;
      default:
        return `
          <defs><linearGradient id="noche" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1233"/><stop offset="1" stop-color="#2a3f8f"/></linearGradient></defs>
          <rect width="480" height="190" fill="url(#noche)"/>
          <g fill="#fff"><circle cx="40" cy="30" r="1.6"/><circle cx="110" cy="60" r="1.2"/><circle cx="180" cy="24" r="1.8"/><circle cx="240" cy="64" r="1.2"/><circle cx="300" cy="30" r="1.6"/><circle cx="360" cy="70" r="1.2"/><circle cx="440" cy="26" r="1.8"/><circle cx="90" cy="100" r="1.2"/><circle cx="330" cy="104" r="1.4"/></g>
          <circle cx="400" cy="50" r="22" fill="#f4efd0"/><circle cx="392" cy="44" r="22" fill="#14205a" opacity="0.9"/>
          <path d="M120 66q40 10 80 -12" stroke="#ffd54a" stroke-width="1.4" fill="none" stroke-dasharray="3 3"/><circle cx="200" cy="54" r="4" fill="#ffd54a"/>
          <path d="M0 160h480v30H0z" fill="#16204d"/>
          <g transform="translate(240 160)"><path d="M-70 0v-40a70 70 0 0 1 140 0v40z" fill="#d8dcea"/><path d="M-70 -40a70 70 0 0 1 140 0z" fill="#aab3d0"/><path d="M-6 -78l12 0l0 70l-12 0z" fill="#0b1233"/><g transform="rotate(-38 0 -40)"><rect x="-6" y="-80" width="12" height="48" rx="3" fill="#b8bfd6"/><rect x="-8" y="-84" width="16" height="8" rx="2" fill="#8d94a8"/></g></g>
          ${persona("tu", 90, 184, 1)}`;
    }
  })();
  return `<svg viewBox="0 0 480 190" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Escena: ${id}">${cuerpo}${persona(quien, 390, 186, 1.25)}</svg>`;
}

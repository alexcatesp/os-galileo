// Réplica de la aritmética de `java.time.LocalDate` (calendario ISO) para comprobar resultados sin Java.
// Fechas como {a, m, d}; los días de época se calculan en UTC, sin husos ni horario de verano.

export interface Fecha {
  a: number;
  m: number;
  d: number;
}

export const esBisiesto = (a: number): boolean => (a % 4 === 0 && a % 100 !== 0) || a % 400 === 0;
export const diasDelMes = (a: number, m: number): number => [31, esBisiesto(a) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];

const aUtc = (f: Fecha) => Date.UTC(f.a, f.m - 1, f.d);
/** Date.UTC trata los años 0–99 como 1900–1999: se corrige */
function deUtc(ms: number): Fecha {
  const x = new Date(ms);
  return { a: x.getUTCFullYear(), m: x.getUTCMonth() + 1, d: x.getUTCDate() };
}
export const diaEpoca = (f: Fecha): number => Math.round(aUtc(f) / 86400000);

export function parsear(iso: string): Fecha | null {
  const r = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!r) return null;
  const f = { a: +r[1], m: +r[2], d: +r[3] };
  return f.m >= 1 && f.m <= 12 && f.d >= 1 && f.d <= diasDelMes(f.a, f.m) ? f : null;
}
export const iso = (f: Fecha): string => `${String(f.a).padStart(4, "0")}-${String(f.m).padStart(2, "0")}-${String(f.d).padStart(2, "0")}`;
export const español = (f: Fecha): string => `${String(f.d).padStart(2, "0")}/${String(f.m).padStart(2, "0")}/${String(f.a).padStart(4, "0")}`;

export const plusDays = (f: Fecha, n: number): Fecha => deUtc(aUtc(f) + n * 86400000);

export function plusMonths(f: Fecha, n: number): Fecha {
  const total = f.a * 12 + (f.m - 1) + n;
  const a = Math.floor(total / 12);
  const m = total - a * 12 + 1;
  return { a, m, d: Math.min(f.d, diasDelMes(a, m)) };
}
export function plusYears(f: Fecha, n: number): Fecha {
  const a = f.a + n;
  return { a, m: f.m, d: Math.min(f.d, diasDelMes(a, f.m)) };
}

export const DIAS_EN = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const;
export const DIAS_ES = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"] as const;
/** 0 = lunes … 6 = domingo (el día de época 0, 1970-01-01, fue jueves) */
export const diaSemana = (f: Fecha): number => (((diaEpoca(f) + 3) % 7) + 7) % 7;

/** `Period.between(a, b)`: mismo algoritmo que la API de Java. */
export function periodo(a: Fecha, b: Fecha): { anios: number; meses: number; dias: number } {
  let totalMeses = (b.a * 12 + b.m - 1) - (a.a * 12 + a.m - 1);
  let dias = b.d - a.d;
  if (totalMeses > 0 && dias < 0) {
    totalMeses--;
    const calc = plusMonths(a, totalMeses);
    dias = diaEpoca(b) - diaEpoca(calc);
  } else if (totalMeses < 0 && dias > 0) {
    totalMeses++;
    dias -= diasDelMes(b.a, b.m);
  }
  return { anios: Math.trunc(totalMeses / 12), meses: totalMeses % 12, dias };
}

export const diasEntre = (a: Fecha, b: Fecha): number => diaEpoca(b) - diaEpoca(a);

/** Número de semana ISO (`WeekFields.ISO.weekOfWeekBasedYear()`) y año al que pertenece. */
export function semanaIso(f: Fecha): { semana: number; anio: number } {
  const dow = diaSemana(f); // 0 = lunes
  const jueves = plusDays(f, 3 - dow);
  const inicioAnio: Fecha = { a: jueves.a, m: 1, d: 1 };
  return { semana: Math.floor((diaEpoca(jueves) - diaEpoca(inicioAnio)) / 7) + 1, anio: jueves.a };
}

/** Días hábiles (lunes a viernes) desde `desde` (excluido) hasta `hasta` (incluido). */
export function diasHabiles(desde: Fecha, hasta: Fecha): number {
  let n = 0;
  for (let k = diaEpoca(desde) + 1; k <= diaEpoca(hasta); k++) if ((((k + 3) % 7) + 7) % 7 < 5) n++;
  return n;
}

/** Siguiente lunes (`TemporalAdjusters.next(MONDAY)`): estrictamente posterior. */
export const siguienteLunes = (f: Fecha): Fecha => plusDays(f, 7 - diaSemana(f));

/**
 * Autoría del sitio. Un solo lugar para que el crédito no quede desincronizado
 * entre el footer, los metadatos del HTML y los datos estructurados.
 */
export const ESTUDIO = {
  nombre: 'Visual Solution',
  url: 'https://visual-solution.vercel.app',
} as const;

export const MARCA = 'BYKODA';

/** Año de publicación del sitio; el rango del copyright arranca acá. */
export const ANIO_INICIO = 2026;

/** "2026" o "2026–2028" según corresponda. */
export function rangoCopyright(hasta = new Date().getFullYear()): string {
  return hasta > ANIO_INICIO ? `${ANIO_INICIO}–${hasta}` : String(ANIO_INICIO);
}

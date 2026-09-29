/**
 * Conexión con el catálogo de la plataforma Visual App.
 *
 * El catálogo se administra desde el panel de la plataforma: precios, stock y
 * productos nuevos aparecen acá solos, sin tocar código ni redeployar.
 */
export const TIENDA = {
  /** Origen de la API de la plataforma. */
  origen: 'https://visual-app-licencias.visual-app-licencias.workers.dev',

  /** Identificador de BYKODA en la plataforma. */
  slug: import.meta.env.VITE_VISUAL_APP_SLUG || 'bykoda',

  /** Cada cuánto se refresca precio y stock con la pestaña visible. */
  refrescoMs: 30_000,

  /** Si la plataforma no responde en este tiempo, se corta el intento y se reintenta. */
  timeoutMs: 8_000,
} as const;

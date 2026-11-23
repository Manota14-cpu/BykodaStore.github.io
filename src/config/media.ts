/**
 * Videos de ambiente del sitio (hoy, solo la banda "la calle" de la home; el hero
 * pasó a ser una imagen fija clara, `public/imagenes/hero-figuras.webp`). Las fuentes editables están en `videos/`
 * (proyectos HyperFrames); se renderizan a MP4 y se copian a `public/videos/`.
 *
 * Mientras `videosListos` sea false, el sitio muestra solo los pósters (el
 * cuadro 0 exacto de cada loop), así no pide archivos que todavía no existen.
 */
export const MEDIA = {
  videosListos: false as boolean,
  calle: {
    video: '/videos/calle.mp4',
    poster: '/videos/calle-poster.webp',
  },
} as const;

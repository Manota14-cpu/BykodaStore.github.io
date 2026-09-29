/**
 * Videos de ambiente del sitio. Las fuentes editables están en `videos/`
 * (proyectos HyperFrames); se renderizan a MP4 y se copian a `public/videos/`.
 *
 * Mientras `videosListos` sea false, el sitio muestra solo los pósters (el
 * cuadro 0 exacto de cada loop), así no pide archivos que todavía no existen.
 */
export const MEDIA = {
  videosListos: false as boolean,
  hero: {
    escritorio: '/videos/hero.mp4',
    movil: '/videos/hero-movil.mp4',
    poster: '/videos/hero-poster.webp',
    posterMovil: '/videos/hero-movil-poster.webp',
  },
  calle: {
    video: '/videos/calle.mp4',
    poster: '/videos/calle-poster.webp',
  },
} as const;

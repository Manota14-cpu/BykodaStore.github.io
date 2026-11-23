import * as m from 'motion/react-m';
import { ButtonLink } from '../ui';
import { EASE_SUAVE } from '../motion/curvas';

/**
 * Hero: el logo de KODA grande y centrado, en negro sobre blanco, con el lema
 * abajo. `logo-recortado.webp` es el mismo logo recortado sin el margen transparente;
 * es blanco con detalles negros y `invert` lo pasa a negro, como en el encabezado.
 */
export function HeroHome() {
  return (
    <section
      aria-labelledby="titulo-hero"
      className="relative overflow-hidden border-b border-line bg-[radial-gradient(ellipse_at_center,var(--color-ground)_35%,var(--color-tile)_100%)]"
    >
      <div className="area-pagina flex min-h-[min(74svh,42rem)] flex-col items-center justify-center py-[clamp(3rem,8vh,5rem)] text-center">
        <m.p
          className="inline-flex items-center gap-2.5 border border-line-strong px-3.5 py-1.5 text-[0.62rem] font-semibold tracking-[0.3em] text-ink uppercase"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_SUAVE, delay: 0.1 }}
        >
          <span className="size-1.5 rounded-full bg-ink" aria-hidden="true" />
          Drop 2026 · Ediciones limitadas
        </m.p>

        <h1 id="titulo-hero" className="mt-8 w-full">
          <span className="sr-only">BYKODA — Vestí tu actitud.</span>
          <m.img
            src="/imagenes/logo-recortado.webp"
            alt=""
            width={1294}
            height={756}
            fetchPriority="high"
            decoding="async"
            className="mx-auto w-[min(100%,44rem)] invert"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: EASE_SUAVE, delay: 0.15 }}
          />
        </h1>

        <m.div
          className="mt-8 flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_SUAVE, delay: 0.5 }}
        >
          <p
            aria-hidden="true"
            className="titulo-display text-[clamp(2rem,4.4vw,3.2rem)] leading-none text-ink uppercase"
          >
            Vestí tu actitud.
          </p>
          <p className="max-w-[44ch] text-[clamp(0.92rem,1.3vw,1rem)] leading-relaxed text-ink-2">
            Streetwear argentino en drops chicos. Cuando una prenda se agota, no vuelve.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink to="/catalogo" tamano="lg">
              Ver catálogo
            </ButtonLink>
            <ButtonLink
              to="/info/como-comprar"
              tamano="lg"
              variante="secundario"
              className="bg-ground"
            >
              Cómo comprar
            </ButtonLink>
          </div>
        </m.div>
      </div>
    </section>
  );
}

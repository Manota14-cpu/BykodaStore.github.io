import * as m from 'motion/react-m';
import { ButtonLink } from '../ui';
import { EASE_SUAVE } from '../motion/curvas';

const LINEAS = ['Vestí tu', 'actitud.'];

/**
 * Hero claro: tres figuras recortadas sobre el mismo gris de las fotos de
 * producto, paradas sobre el borde inferior. El texto sube línea por línea
 * apenas carga la página. En celular las figuras van arriba y el texto abajo.
 */
export function HeroHome() {
  return (
    <section aria-labelledby="titulo-hero" className="overflow-hidden border-b border-line bg-tile">
      <div className="area-pagina grid grid-cols-[minmax(0,1fr)] items-end gap-2 pt-6 md:min-h-[min(80svh,46rem)] md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10 md:pt-0">
        <div className="order-2 pb-10 md:order-1 md:self-center md:pb-0">
          <m.p
            className="inline-flex items-center gap-2.5 border border-line-strong px-3.5 py-1.5 text-[0.62rem] font-semibold tracking-[0.3em] text-ink uppercase"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_SUAVE, delay: 0.1 }}
          >
            <span className="size-1.5 rounded-full bg-ink" aria-hidden="true" />
            Drop 2026 · Ediciones limitadas
          </m.p>

          <h1
            id="titulo-hero"
            className="mt-5 titulo-display text-[clamp(3.6rem,9vw,8rem)] leading-[0.86] text-ink uppercase"
          >
            <span className="sr-only">BYKODA, streetwear argentino: </span>
            {/* El margen de arriba deja lugar a la tilde de "Vestí", que la máscara recortaba. */}
            {LINEAS.map((linea, i) => (
              <span
                key={linea}
                className="-mt-[0.12em] block overflow-hidden pt-[0.12em] pb-[0.04em]"
              >
                <m.span
                  className="block"
                  initial={{ y: '105%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1, ease: EASE_SUAVE, delay: 0.2 + i * 0.12 }}
                >
                  {linea}
                </m.span>
              </span>
            ))}
          </h1>

          <m.div
            className="mt-6 flex max-w-xl flex-col gap-7"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_SUAVE, delay: 0.55 }}
          >
            <p className="max-w-[40ch] text-[clamp(0.95rem,1.4vw,1.05rem)] leading-relaxed text-ink-2">
              Streetwear argentino en drops chicos. Cuando una prenda se agota, no vuelve.
            </p>
            <div className="flex flex-wrap gap-3">
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

        <m.img
          src="/imagenes/hero-figuras.webp"
          alt="Tres modelos con prendas de BYKODA: campera con capucha y jean baggy, campera de carreras roja y blanca, y buzo negro con pantalón estampado"
          width={962}
          height={916}
          fetchPriority="high"
          decoding="async"
          className="order-1 mx-auto w-full max-w-[24rem] self-end md:order-2 md:max-w-[44rem] md:pt-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE_SUAVE, delay: 0.15 }}
        />
      </div>
    </section>
  );
}

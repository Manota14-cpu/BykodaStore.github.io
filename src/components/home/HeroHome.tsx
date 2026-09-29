import * as m from 'motion/react-m';
import { MEDIA } from '@/config/media';
import { VideoAmbiente } from '../VideoAmbiente';
import { ButtonLink } from '../ui';
import { EASE_SUAVE } from '../motion/curvas';

const LINEAS = ['Vestí tu', 'actitud.'];

/**
 * Hero: las cuatro figuras del loop salen de la oscuridad detrás del texto.
 * El texto sube desde una máscara, línea por línea, apenas carga la página.
 */
export function HeroHome() {
  return (
    <VideoAmbiente
      video={{ escritorio: MEDIA.hero.escritorio, movil: MEDIA.hero.movil }}
      poster={{ escritorio: MEDIA.hero.poster, movil: MEDIA.hero.posterMovil }}
      prioridad
      etiqueta="video de presentación"
      claseControl="right-[clamp(1rem,4vw,2.5rem)] bottom-8"
      className="h-[min(86svh,54rem)] min-h-[34rem] text-white"
    >
      {/* Oscurece la zona del texto sin tapar la figura del centro. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_top,rgb(0_0_0/0.82)_0%,rgb(0_0_0/0.35)_38%,transparent_62%),linear-gradient(to_right,rgb(0_0_0/0.55)_0%,transparent_55%)]"
      />

      <div className="area-pagina absolute inset-x-0 bottom-0 pb-[clamp(2.5rem,8vh,5rem)]">
        <m.p
          className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[0.62rem] font-semibold tracking-[0.3em] uppercase backdrop-blur-md"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_SUAVE, delay: 0.1 }}
        >
          <span className="size-1.5 rounded-full bg-white" aria-hidden="true" />
          Drop 2026 · Ediciones limitadas
        </m.p>

        <h1 className="titulo-display mt-5 text-[clamp(3.6rem,11vw,9.5rem)] leading-[0.86] uppercase">
          <span className="sr-only">BYKODA, streetwear argentino: </span>
          {LINEAS.map((linea, i) => (
            <span key={linea} className="block overflow-hidden pb-[0.04em]">
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
          <p className="max-w-[40ch] text-[clamp(0.95rem,1.4vw,1.05rem)] leading-relaxed text-white/80">
            Streetwear argentino en tiradas cortas. Cuando una prenda se agota, no vuelve.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink to="/catalogo" tamano="lg" className="bg-white text-black hover:bg-white/90 hover:opacity-100">
              Ver catálogo
            </ButtonLink>
            <ButtonLink
              to="/info#faq"
              tamano="lg"
              variante="secundario"
              className="border-white/30 text-white hover:border-white/60 hover:bg-white/10"
            >
              Cómo comprar
            </ButtonLink>
          </div>
        </m.div>
      </div>
    </VideoAmbiente>
  );
}

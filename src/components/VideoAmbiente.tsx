import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import { MEDIA } from '@/config/media';
import { cn } from '@/lib/cn';

interface Fuentes {
  escritorio: string;
  /** Versión para pantallas de hasta 767 px. */
  movil?: string;
}

const MOVIL = '(max-width: 767px)';

function ahorroDeDatos(): boolean {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  return nav.connection?.saveData === true;
}

/**
 * Video de fondo en loop, silencioso y decorativo.
 *
 * - El póster (cuadro 0 exacto del loop) está siempre debajo: es lo que carga
 *   primero y lo que queda si el video no se puede o no se debe reproducir.
 * - El video se reproduce solo mientras está en pantalla.
 * - Con "reducir movimiento" o ahorro de datos, se queda el póster.
 * - Tiene botón de pausa: contenido que se mueve más de 5 s necesita uno (WCAG 2.2.2).
 */
export function VideoAmbiente({
  video,
  poster,
  prioridad = false,
  etiqueta,
  className,
  claseControl,
  children,
}: {
  video: Fuentes;
  poster: Fuentes;
  /** true en el hero: el póster es el LCP de la página. */
  prioridad?: boolean;
  /** Qué muestra el video, para el botón de pausa ("video de la colección"). */
  etiqueta: string;
  className?: string;
  /** Posición del botón de pausa dentro del contenedor. */
  claseControl?: string;
  children?: ReactNode;
}) {
  const contenedor = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLVideoElement>(null);
  const enPantalla = useInView(contenedor, { amount: 0.25 });
  const reducirMovimiento = useReducedMotion();
  const [src] = useState(() =>
    video.movil && window.matchMedia(MOVIL).matches ? video.movil : video.escritorio,
  );
  const [pausado, setPausado] = useState(false);
  const [reproduciendo, setReproduciendo] = useState(false);

  const usarVideo = MEDIA.videosListos && !reducirMovimiento && !ahorroDeDatos();

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    // React no escribe `muted` como atributo y algunos navegadores lo exigen
    // para permitir el autoplay: se asegura por propiedad.
    v.muted = true;
    if (enPantalla && !pausado) v.play().catch(() => setReproduciendo(false));
    else v.pause();
  }, [enPantalla, pausado, usarVideo]);

  return (
    <div ref={contenedor} className={cn('relative isolate overflow-hidden bg-black', className)}>
      <picture>
        {poster.movil && <source media={MOVIL} srcSet={poster.movil} />}
        <img
          src={poster.escritorio}
          alt=""
          decoding="async"
          loading={prioridad ? 'eager' : 'lazy'}
          {...{ fetchpriority: prioridad ? 'high' : 'auto' }}
          className="absolute inset-0 size-full object-cover"
        />
      </picture>

      {usarVideo && (
        <video
          ref={ref}
          src={src}
          muted
          loop
          playsInline
          preload={prioridad ? 'auto' : 'metadata'}
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => setReproduciendo(true)}
          className={cn(
            'absolute inset-0 size-full object-cover transition-opacity duration-700',
            reproduciendo ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}

      {children}

      {usarVideo && (
        <button
          type="button"
          onClick={() => setPausado((p) => !p)}
          aria-pressed={pausado}
          aria-label={pausado ? `Reproducir ${etiqueta}` : `Pausar ${etiqueta}`}
          className={cn(
            'absolute z-20 grid size-10 place-items-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-md transition-colors hover:border-white/50 hover:bg-black/55',
            claseControl ?? 'right-4 bottom-4',
          )}
        >
          {pausado ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7 4.5v15l13-7.5z" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}

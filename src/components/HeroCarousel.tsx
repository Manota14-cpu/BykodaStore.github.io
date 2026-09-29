import { useCallback, useEffect, useRef, useState } from 'react';
import { ButtonLink } from './ui';
import { cn } from '@/lib/cn';

export interface HeroSlide {
  img: string;
  eyebrow: string;
  title: string;
  desc: string;
  btn: string;
  to: string;
}

const DURACION_MS = 6000;

/**
 * Carrusel del hero: fade cruzado, autoplay con barra de progreso, flechas,
 * teclado y swipe. Escrito a mano en lugar de Swiper, que aportaba ~100 KB al
 * bundle inicial para esta única pantalla.
 */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);
  const progresoRef = useRef<HTMLSpanElement>(null);
  const tactilRef = useRef<number | null>(null);

  const ir = useCallback(
    (delta: number) => setIndice((i) => (i + delta + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (pausado || slides.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    const inicio = performance.now();
    const tick = (ahora: number) => {
      const avance = Math.min(1, (ahora - inicio) / DURACION_MS);
      if (progresoRef.current) progresoRef.current.style.width = `${avance * 100}%`;
      if (avance < 1) raf = requestAnimationFrame(tick);
      else ir(1);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [indice, pausado, slides.length, ir]);

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Destacados"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') ir(1);
        else if (e.key === 'ArrowLeft') ir(-1);
      }}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
      onTouchStart={(e) => (tactilRef.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        const inicio = tactilRef.current;
        tactilRef.current = null;
        if (inicio === null) return;
        const delta = (e.changedTouches[0]?.clientX ?? inicio) - inicio;
        if (Math.abs(delta) > 50) ir(delta < 0 ? 1 : -1);
      }}
      className="relative h-[clamp(26rem,72vh,46rem)] overflow-hidden bg-black focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white/60"
    >
      {slides.map((slide, i) => {
        const activo = i === indice;
        return (
          <div
            key={slide.img}
            role="group"
            aria-roledescription="diapositiva"
            aria-label={`${i + 1} de ${slides.length}`}
            aria-hidden={!activo}
            className={cn(
              'absolute inset-0 transition-opacity duration-1000 ease-(--ease-suave)',
              activo ? 'visible opacity-100' : 'invisible opacity-0',
            )}
          >
            <img
              src={slide.img}
              alt=""
              loading={activo ? 'eager' : 'lazy'}
              {...{ fetchpriority: activo ? 'high' : 'low' }}
              className="size-full object-cover object-[center_30%]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(to_right,rgb(0_0_0/0.78)_0%,rgb(0_0_0/0.3)_55%,transparent_100%),linear-gradient(to_top,rgb(0_0_0/0.65)_0%,transparent_55%)]"
            />

            <div className="absolute inset-x-0 bottom-[clamp(4.5rem,12vh,7.5rem)] px-[clamp(1.25rem,6vw,6rem)]">
              <div
                className={cn(
                  'max-w-2xl text-white transition-all duration-700 ease-(--ease-suave)',
                  activo ? 'translate-y-0 opacity-100 delay-200' : 'translate-y-4 opacity-0',
                )}
              >
                <span className="inline-block rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[0.62rem] font-semibold tracking-[0.3em] uppercase backdrop-blur-md">
                  {slide.eyebrow}
                </span>
                <p className="titulo-display mt-4 text-[clamp(2.6rem,7vw,5.4rem)]">{slide.title}</p>
                <p className="mt-3 max-w-[44ch] text-[clamp(0.86rem,1.4vw,1rem)] leading-relaxed text-white/85">
                  {slide.desc}
                </p>
                <div className="mt-7">
                  <ButtonLink
                    to={slide.to}
                    tamano="lg"
                    tabIndex={activo ? undefined : -1}
                    className="bg-white text-black hover:bg-white/90"
                  >
                    {slide.btn}
                  </ButtonLink>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-10 h-0.5 bg-white/15">
        <span ref={progresoRef} className="block h-full bg-white" style={{ width: '0%' }} />
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-[clamp(1.75rem,5vh,3rem)] left-[clamp(1.25rem,6vw,6rem)] z-10 flex items-baseline gap-2 text-xs tracking-[0.16em] text-white/50 tabular-nums"
      >
        <span className="text-[0.95rem] font-bold text-white">
          {String(indice + 1).padStart(2, '0')}
        </span>
        <span>/</span>
        <span>{String(slides.length).padStart(2, '0')}</span>
      </div>

      {[
        { dir: -1, label: 'Anterior', pos: 'left-[clamp(0.75rem,2vw,1.75rem)]', d: 'M15 6l-6 6 6 6' },
        { dir: 1, label: 'Siguiente', pos: 'right-[clamp(0.75rem,2vw,1.75rem)]', d: 'M9 6l6 6-6 6' },
      ].map((b) => (
        <button
          key={b.label}
          type="button"
          aria-label={b.label}
          onClick={() => ir(b.dir)}
          className={cn(
            'absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md transition-colors hover:border-white/45 hover:bg-black/55 md:grid',
            b.pos,
          )}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d={b.d} />
          </svg>
        </button>
      ))}
    </section>
  );
}

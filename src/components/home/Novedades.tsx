import { useRef } from 'react';
import * as m from 'motion/react-m';
import { useCatalogo } from '@/hooks/useCatalogo';
import { ProductCard, ProductoSkeleton } from '../ProductCard';
import { SectionHeading } from '../SectionHeading';
import { VIEWPORT, variantesGrupo, variantesItem } from '../motion/curvas';

const CANTIDAD = 8;

/**
 * Carril horizontal con lo último del catálogo. Los productos de la plataforma
 * van primero (son los nuevos); se muestran solo los que ya tienen foto, así la
 * vidriera de la home nunca arranca con un lugar vacío.
 */
export function Novedades() {
  const { productos, cargando } = useCatalogo();
  const carril = useRef<HTMLUListElement>(null);
  const lista = productos.filter((p) => p.imagenes.length > 0 && p.stock !== 'sin-stock').slice(0, CANTIDAD);

  function mover(direccion: 1 | -1) {
    const el = carril.current;
    if (!el) return;
    el.scrollBy({ left: direccion * el.clientWidth * 0.8, behavior: 'smooth' });
  }

  // Sin prendas con foto todavía, la sección no aparece (en vez de quedar vacía).
  if (!cargando && lista.length === 0) return null;

  return (
    <section aria-labelledby="titulo-novedades" className="py-[clamp(4rem,10vw,8rem)]">
      <div className="area-pagina">
        <SectionHeading
          id="titulo-novedades"
          eyebrow="Novedades"
          titulo="Recién llegados"
          link={{ to: '/catalogo', label: 'Ver todo' }}
        />
      </div>

      <div className="relative">
        <m.ul
          ref={carril}
          variants={variantesGrupo}
          initial="oculto"
          whileInView="visible"
          viewport={VIEWPORT}
          className="flex snap-x snap-mandatory scroll-px-[max(clamp(1rem,4vw,2.5rem),calc((100vw-var(--container-pagina))/2+clamp(1rem,4vw,2.5rem)))] gap-4 overflow-x-auto px-[max(clamp(1rem,4vw,2.5rem),calc((100vw-var(--container-pagina))/2+clamp(1rem,4vw,2.5rem)))] pb-4 [scrollbar-width:none] md:gap-6"
        >
          {cargando
            ? Array.from({ length: 5 }, (_, i) => (
                <li key={i} className="w-[68vw] shrink-0 sm:w-[17rem]">
                  <ProductoSkeleton />
                </li>
              ))
            : lista.map((p, i) => (
                <m.li key={p.id} variants={variantesItem} className="w-[68vw] shrink-0 snap-start sm:w-[17rem]">
                  <ProductCard producto={p} prioridad={i < 2} />
                </m.li>
              ))}
        </m.ul>

        <div className="area-pagina mt-6 hidden justify-end gap-2 md:flex">
          {([-1, 1] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => mover(d)}
              aria-label={d === -1 ? 'Ver anteriores' : 'Ver siguientes'}
              className="grid size-11 place-items-center rounded-full border border-line text-ink transition-colors hover:border-line-strong hover:bg-hover"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d={d === -1 ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

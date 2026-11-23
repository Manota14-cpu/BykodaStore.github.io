import { Link } from 'react-router-dom';
import * as m from 'motion/react-m';
import { useCatalogo } from '@/hooks/useCatalogo';
import { categoriasConProductos } from '@/lib/catalogo';
import { cn } from '@/lib/cn';
import { VIEWPORT, variantesGrupo, variantesItem } from '../motion/curvas';

/** Foto de ambiente para las categorías principales. El resto usa la foto de una de sus prendas. */
const FOTOS: Record<string, { img: string; label: string }> = {
  remera: { img: '/imagenes/chat8-640.webp', label: 'remeras' },
  buzo: { img: '/imagenes/chat6-640.webp', label: 'buzos' },
  pantalon: { img: '/imagenes/chat7-640.webp', label: 'pantalones' },
};

/** Cuántas columnas usa la grilla en escritorio según la cantidad de categorías. */
const COLUMNAS: Record<number, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
};

/**
 * Fotos de punta a punta de la pantalla, sin bordes ni separación, con el
 * nombre de la categoría abajo. Solo aparecen las categorías que tienen
 * prendas; con menos de dos, la sección no se muestra. En celular se deslizan.
 */
export function Categorias() {
  const { productos, cargando } = useCatalogo();
  const categorias = categoriasConProductos(productos)
    .map((c) => ({
      key: c.key,
      label: FOTOS[c.key]?.label ?? c.label.toLowerCase(),
      img:
        FOTOS[c.key]?.img ??
        productos.find((p) => p.categoria === c.key && p.imagenes.length > 0)?.imagenes[0],
    }))
    .filter((c): c is { key: string; label: string; img: string } => Boolean(c.img))
    .slice(0, 4);

  if (cargando || categorias.length < 2) return null;

  return (
    <section aria-labelledby="titulo-categorias" className="pb-[clamp(3rem,7vw,5.5rem)]">
      <h2 id="titulo-categorias" className="sr-only">
        Comprá por categoría
      </h2>
      <m.ul
        variants={variantesGrupo}
        initial="oculto"
        whileInView="visible"
        viewport={VIEWPORT}
        className={cn(
          'flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto md:grid md:overflow-visible',
          COLUMNAS[categorias.length],
        )}
      >
        {categorias.map((cat) => (
          <m.li
            key={cat.key}
            variants={variantesItem}
            className="w-[88%] shrink-0 snap-start md:w-auto"
          >
            <Link
              to={`/catalogo#cat=${cat.key}`}
              className="group relative block aspect-3/4 overflow-hidden bg-black text-white md:aspect-[4/5]"
            >
              <img
                src={cat.img}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover transition-transform duration-[1.2s] ease-(--ease-suave) group-hover:scale-[1.04]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(to_top,rgb(0_0_0/0.55)_0%,transparent_35%)]"
              />
              <span className="absolute inset-x-0 bottom-[clamp(1.25rem,3vw,2rem)] text-center text-[clamp(1.4rem,2.4vw,2rem)] font-semibold tracking-[0.01em]">
                {cat.label}
              </span>
            </Link>
          </m.li>
        ))}
      </m.ul>
    </section>
  );
}

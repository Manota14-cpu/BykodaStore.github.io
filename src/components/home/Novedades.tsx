import * as m from 'motion/react-m';
import { useCatalogo } from '@/hooks/useCatalogo';
import { ProductCard, ProductoSkeleton } from '../ProductCard';
import { TituloTienda } from '../SectionHeading';
import { ButtonLink } from '../ui';
import { VIEWPORT, variantesGrupo, variantesItem } from '../motion/curvas';

const CANTIDAD = 8;

/**
 * Vidriera de la home, apenas abajo del hero: grilla con lo último del
 * catálogo. Se muestran solo prendas con foto y con stock, así nunca arranca
 * con un lugar vacío.
 */
export function Novedades() {
  const { productos, cargando } = useCatalogo();
  const lista = productos.filter((p) => p.imagenes.length > 0 && p.stock !== 'sin-stock').slice(0, CANTIDAD);

  // Sin prendas con foto todavía, la sección no aparece (en vez de quedar vacía).
  if (!cargando && lista.length === 0) return null;

  return (
    <section aria-labelledby="titulo-novedades" className="area-pagina py-[clamp(3rem,7vw,5.5rem)]">
      <TituloTienda id="titulo-novedades">Recién llegados — BYKODA</TituloTienda>

      <m.ul
        variants={variantesGrupo}
        initial="oculto"
        whileInView="visible"
        viewport={VIEWPORT}
        className="grid grid-cols-2 gap-x-3 gap-y-9 md:grid-cols-4 md:gap-x-4"
      >
        {cargando
          ? Array.from({ length: 4 }, (_, i) => (
              <li key={i}>
                <ProductoSkeleton />
              </li>
            ))
          : lista.map((p, i) => (
              <m.li key={p.id} variants={variantesItem}>
                <ProductCard producto={p} prioridad={i < 4} />
              </m.li>
            ))}
      </m.ul>

      <div className="mt-12 flex justify-center">
        <ButtonLink to="/catalogo" variante="secundario">
          Ver todo
        </ButtonLink>
      </div>
    </section>
  );
}

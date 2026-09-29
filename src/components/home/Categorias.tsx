import { Link } from 'react-router-dom';
import * as m from 'motion/react-m';
import { useCatalogo } from '@/hooks/useCatalogo';
import { SectionHeading } from '../SectionHeading';
import { IconFlecha } from '../icons';
import { VIEWPORT, variantesGrupo, variantesItem } from '../motion/curvas';

const CATEGORIAS = [
  { key: 'remera', label: 'Remeras', img: '/imagenes/chat8.webp', detalle: 'Boxy, oversize y clásicas' },
  { key: 'buzo', label: 'Buzos & Camperas', img: '/imagenes/chat6.webp', detalle: 'Hoodies, sweaters y track jackets' },
  { key: 'pantalon', label: 'Pantalones', img: '/imagenes/chat7.webp', detalle: 'Baggy, cargo y joggers' },
];

export function Categorias() {
  const { productos, cargando } = useCatalogo();
  const cantidad = (key: string) => productos.filter((p) => p.categoria === key).length;

  return (
    <section aria-labelledby="titulo-categorias" className="area-pagina py-[clamp(4rem,10vw,8rem)]">
      <SectionHeading
        id="titulo-categorias"
        eyebrow="Categorías"
        titulo="Comprá por categoría"
        link={{ to: '/catalogo', label: 'Ver todo el catálogo' }}
      />

      <m.ul
        variants={variantesGrupo}
        initial="oculto"
        whileInView="visible"
        viewport={VIEWPORT}
        className="-mx-[clamp(1rem,4vw,2.5rem)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[clamp(1rem,4vw,2.5rem)] pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0"
      >
        {CATEGORIAS.map((cat) => (
          <m.li key={cat.key} variants={variantesItem} className="w-[78%] shrink-0 snap-start md:w-auto">
            <Link
              to={`/catalogo#cat=${cat.key}`}
              className="group relative block aspect-3/4 overflow-hidden rounded-2xl bg-black text-white"
            >
              <img
                src={cat.img}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover transition-transform duration-[1.2s] ease-(--ease-suave) group-hover:scale-[1.06]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(to_top,rgb(0_0_0/0.8)_0%,rgb(0_0_0/0.15)_45%,transparent_70%)]"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
                <div>
                  <h3 className="titulo-display text-[clamp(2rem,3.4vw,2.9rem)] uppercase">{cat.label}</h3>
                  <p className="mt-1.5 text-xs text-white/75">
                    {cat.detalle}
                    {!cargando &&
                      cantidad(cat.key) > 0 &&
                      ` · ${cantidad(cat.key)} ${cantidad(cat.key) === 1 ? 'prenda' : 'prendas'}`}
                  </p>
                </div>
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/30 transition-all duration-300 ease-(--ease-suave) group-hover:border-white group-hover:bg-white group-hover:text-black">
                  <IconFlecha />
                </span>
              </div>
            </Link>
          </m.li>
        ))}
      </m.ul>
    </section>
  );
}

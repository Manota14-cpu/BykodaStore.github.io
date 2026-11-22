import { Link } from 'react-router-dom';
import * as m from 'motion/react-m';
import { VIEWPORT, variantesGrupo, variantesItem } from '../motion/curvas';

const CATEGORIAS = [
  { key: 'remera', label: 'remeras', img: '/imagenes/chat8.webp' },
  { key: 'buzo', label: 'buzos', img: '/imagenes/chat6.webp' },
  { key: 'pantalon', label: 'pantalones', img: '/imagenes/chat7.webp' },
];

/**
 * Tres fotos de punta a punta de la pantalla, sin bordes ni separación, con el
 * nombre de la categoría abajo. En celular se deslizan de a una.
 */
export function Categorias() {
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
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] md:grid md:grid-cols-3 md:overflow-visible"
      >
        {CATEGORIAS.map((cat) => (
          <m.li key={cat.key} variants={variantesItem} className="w-[88%] shrink-0 snap-start md:w-auto">
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

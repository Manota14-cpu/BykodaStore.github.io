import type { ReactNode } from 'react';
import { SectionHeading } from '../SectionHeading';
import { ButtonExterno, ButtonLink } from '../ui';
import { IconInstagram } from '../icons';
import { Revelar, RevelarGrupo, RevelarItem } from '../motion/Revelar';

const trazo = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

const GARANTIAS: { icono: ReactNode; titulo: string; texto: string }[] = [
  {
    icono: (
      <svg {...trazo}>
        <path d="M1 7h12v8H1zM13 10h3l3 3v2h-6" />
        <circle cx="6" cy="17" r="1.6" />
        <circle cx="15" cy="17" r="1.6" />
      </svg>
    ),
    titulo: 'Envíos a todo el país',
    texto: 'Llega en 4 a 8 días hábiles, con seguimiento.',
  },
  {
    icono: (
      <svg {...trazo}>
        <path d="M13 2 3 14h6l-2 8L17 10h-6l2-8z" />
      </svg>
    ),
    titulo: 'Ediciones limitadas',
    texto: 'Pocas unidades por talle. Lo que se agota no vuelve.',
  },
  {
    icono: (
      <svg {...trazo}>
        <path d="M3 12a9 9 0 0 1 15.5-6.2M21 12a9 9 0 0 1-15.5 6.2" />
        <path d="M18 2v4h-4M6 22v-4h4" />
      </svg>
    ),
    titulo: 'Cambio de talle',
    texto: 'Sin cargo dentro de los 7 días de recibido.',
  },
  {
    icono: (
      <svg {...trazo}>
        <path d="M21 12a8 8 0 0 1-8 8H4l2.5-3A8 8 0 1 1 21 12z" />
      </svg>
    ),
    titulo: 'Atención directa',
    texto: 'Coordinás pago y envío por WhatsApp, con una persona.',
  },
];

export function Garantias() {
  return (
    <section aria-label="Garantías de compra" className="area-pagina py-[clamp(3rem,7vw,5rem)]">
      <RevelarGrupo className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {GARANTIAS.map((g) => (
          <RevelarItem key={g.titulo} className="grid content-start gap-3 bg-ground p-7">
            <span className="text-ink">{g.icono}</span>
            <h3 className="text-sm font-semibold text-ink">{g.titulo}</h3>
            <p className="text-sm leading-relaxed text-ink-2">{g.texto}</p>
          </RevelarItem>
        ))}
      </RevelarGrupo>
    </section>
  );
}

const TESTIMONIOS = [
  {
    texto: 'La calidad es excelente y la atención por WhatsApp fue súper rápida. Ya hice dos pedidos.',
    nombre: 'Mateo A.',
    localidad: 'Rosario',
  },
  {
    texto: 'El hoodie es increíble y llegó antes de lo esperado. Sin dudas vuelvo a comprar.',
    nombre: 'Juli P.',
    localidad: 'Córdoba',
  },
  {
    texto: 'Prendas únicas, nadie más las tiene. La mejor tienda de streetwear del país.',
    nombre: 'Nico R.',
    localidad: 'Buenos Aires',
  },
];

export function Testimonios() {
  return (
    <section aria-labelledby="titulo-resenas" className="area-pagina py-[clamp(4rem,10vw,8rem)]">
      <SectionHeading id="titulo-resenas" eyebrow="Reseñas" titulo="Lo que dicen quienes compraron" />
      <RevelarGrupo className="grid gap-5 md:grid-cols-3">
        {TESTIMONIOS.map((t) => (
          <RevelarItem key={t.nombre}>
            <figure className="flex h-full flex-col justify-between gap-8 rounded-2xl border border-line bg-surface p-7">
              <div>
                <div className="flex gap-1 text-ink" aria-label="5 de 5 estrellas" role="img">
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="mt-5 text-[1.02rem] leading-relaxed text-ink">“{t.texto}”</blockquote>
              </div>
              <figcaption className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-invert text-xs font-bold text-on-invert">
                  {t.nombre
                    .split(' ')
                    .map((s) => s[0])
                    .join('')}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink">{t.nombre}</span>
                  <span className="block text-xs text-ink-3">{t.localidad}</span>
                </span>
              </figcaption>
            </figure>
          </RevelarItem>
        ))}
      </RevelarGrupo>
    </section>
  );
}

const INSTAGRAM = 'https://www.instagram.com/__bykoda/';
const POSTS = ['chat1', 'chat6', 'chat3', 'chat8', 'chat4', 'chat7'];

export function Instagram() {
  return (
    <section aria-labelledby="titulo-instagram" className="area-pagina pb-[clamp(4rem,10vw,8rem)]">
      <SectionHeading
        id="titulo-instagram"
        eyebrow="Instagram"
        titulo="@__bykoda"
        bajada="Los drops salen primero ahí. Seguinos para enterarte antes."
      />
      <RevelarGrupo className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {POSTS.map((img) => (
          <RevelarItem key={img}>
            <a
              href={INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ver en Instagram"
              className="group relative block aspect-square overflow-hidden rounded-xl bg-black"
            >
              <img
                src={`/imagenes/${img}.webp`}
                alt=""
                loading="lazy"
                decoding="async"
                className="size-full object-cover transition-transform duration-700 ease-(--ease-suave) group-hover:scale-105"
              />
              <span className="absolute inset-0 grid place-items-center bg-black/0 text-white opacity-0 transition-all duration-300 group-hover:bg-black/45 group-hover:opacity-100">
                <IconInstagram size={26} />
              </span>
            </a>
          </RevelarItem>
        ))}
      </RevelarGrupo>
      <Revelar className="mt-8 flex justify-center">
        <ButtonExterno href={INSTAGRAM} variante="secundario">
          <IconInstagram size={16} />
          Seguir en Instagram
        </ButtonExterno>
      </Revelar>
    </section>
  );
}

export function CtaFinal() {
  return (
    <section aria-labelledby="titulo-cta" className="bg-invert text-on-invert">
      <div className="area-pagina flex flex-col items-start justify-between gap-8 py-[clamp(4rem,9vw,7rem)] md:flex-row md:items-end">
        <Revelar>
          <p className="text-[0.66rem] tracking-[0.22em] uppercase opacity-60">Ediciones limitadas</p>
          <h2 id="titulo-cta" className="titulo-display mt-3 max-w-[14ch] text-[clamp(3rem,7vw,6rem)] uppercase">
            No te quedes sin el tuyo
          </h2>
        </Revelar>
        <Revelar delay={0.1}>
          <ButtonLink to="/catalogo" tamano="lg" className="bg-ground text-ink hover:opacity-90">
            Ver catálogo
          </ButtonLink>
        </Revelar>
      </div>
    </section>
  );
}

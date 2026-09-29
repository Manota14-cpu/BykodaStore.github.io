import { useRef } from 'react';
import { useScroll, useTransform } from 'motion/react';
import * as m from 'motion/react-m';
import { MEDIA } from '@/config/media';
import { VideoAmbiente } from '../VideoAmbiente';
import { ButtonLink } from '../ui';
import { Revelar, RevelarGrupo, RevelarItem } from '../motion/Revelar';

const DATOS = [
  { titulo: 'Denim de gramaje pesado', texto: 'Caída estructurada que no se deforma con el uso.' },
  { titulo: 'Frisa perchada', texto: 'Interior afelpado, capucha forrada, puños acanalados.' },
  { titulo: 'Tiradas cortas', texto: 'Pocas unidades por talle. No se reponen.' },
];

/** La colección en la calle: video vertical a un lado, el porqué de la ropa al otro. */
export function BandaCalle() {
  const seccion = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: seccion, offset: ['start end', 'end start'] });
  // Parallax sutil: el video viaja un poco más lento que la página.
  const y = useTransform(scrollYProgress, [0, 1], ['6%', '-6%']);

  return (
    <section
      ref={seccion}
      aria-labelledby="titulo-calle"
      className="overflow-hidden border-y border-line bg-surface py-[clamp(4rem,10vw,8rem)]"
    >
      <div className="area-pagina grid items-center gap-12 md:grid-cols-12 md:gap-16">
        <m.div style={{ y }} className="md:col-span-6 lg:col-span-5">
          <VideoAmbiente
            video={{ escritorio: MEDIA.calle.video }}
            poster={{ escritorio: MEDIA.calle.poster }}
            etiqueta="video de la colección en la calle"
            className="aspect-4/5 rounded-2xl"
          />
        </m.div>

        <div className="md:col-span-6 lg:col-span-6 lg:col-start-7">
          <Revelar>
            <p className="eyebrow">Lookbook</p>
            <h2 id="titulo-calle" className="titulo-display mt-3 text-[clamp(2.8rem,6.5vw,5.4rem)] text-ink uppercase">
              Hecho para la calle
            </h2>
            <p className="mt-5 max-w-[46ch] text-[0.98rem] leading-relaxed text-ink-2">
              Diseñamos y seleccionamos cada prenda para el uso real: asfalto, colectivo, noche. La
              ficha de cada una dice qué tela lleva, cómo calza y cómo cuidarla.
            </p>
          </Revelar>

          <RevelarGrupo className="mt-9 grid border-t border-line">
            {DATOS.map((d) => (
              <RevelarItem key={d.titulo} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[14rem_1fr] sm:gap-6">
                <p className="text-sm font-semibold text-ink">{d.titulo}</p>
                <p className="text-sm text-ink-2">{d.texto}</p>
              </RevelarItem>
            ))}
          </RevelarGrupo>

          <Revelar delay={0.1} className="mt-9">
            <ButtonLink to="/catalogo" tamano="lg">
              Ver la colección
            </ButtonLink>
          </Revelar>
        </div>
      </div>
    </section>
  );
}

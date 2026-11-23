import { Link } from 'react-router-dom';
import * as m from 'motion/react-m';
import { WA_TEL_VISIBLE } from '@/lib/whatsapp';
import { EASE_SUAVE } from '../motion/curvas';

/** Foto del hero. Para cambiarla, reemplazá el archivo o esta ruta (horizontal, 1600 px o más). */
const FOTO = '/imagenes/hero-koda.webp';

/** Bloques de datos arriba a la derecha: "ETIQUETA / DATO" y una línea de detalle. */
const DATOS = [
  { etiqueta: 'Drop', dato: '2026', detalle: 'Ediciones limitadas' },
  { etiqueta: 'Envíos', dato: 'Todo el país', detalle: '4 a 8 días hábiles' },
  { etiqueta: 'Pedidos', dato: 'WhatsApp', detalle: WA_TEL_VISIBLE },
  { etiqueta: 'Instagram', dato: '@__bykoda', detalle: 'Los drops salen primero ahí' },
];

/**
 * Hero editorial: una foto a pantalla completa, el logo en blanco arriba a la
 * izquierda, datos chicos arriba a la derecha y el lema abajo. Los degradés
 * de arriba y abajo oscurecen la foto solo donde va texto.
 */
export function HeroHome() {
  return (
    <section
      aria-labelledby="titulo-hero"
      className="relative isolate h-[min(68svh,40rem)] min-h-[30rem] overflow-hidden bg-black text-white md:h-[min(82svh,52rem)] md:min-h-[32rem]"
    >
      <m.img
        src={FOTO}
        alt="Chico de espaldas con una remera blanca de BYKODA con el logo KODA en la espalda, contra una pared de ladrillos"
        width={1672}
        height={941}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 -z-10 size-full object-cover object-[72%_55%] md:object-[50%_78%]"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: EASE_SUAVE }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgb(0_0_0/0.45)_0%,transparent_30%,transparent_55%,rgb(0_0_0/0.65)_100%),linear-gradient(to_right,rgb(0_0_0/0.45)_0%,transparent_50%)]"
      />

      <div className="area-pagina flex h-full flex-col justify-between py-[clamp(1.5rem,4vw,3rem)]">
        <div className="flex items-start justify-between gap-10">
          <m.img
            src="/imagenes/logo-recortado.webp"
            alt=""
            width={1294}
            height={756}
            className="w-[clamp(8rem,17vw,15rem)] drop-shadow-[0_2px_12px_rgb(0_0_0/0.35)]"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_SUAVE, delay: 0.2 }}
          />

          <m.dl
            className="hidden grid-cols-2 gap-x-12 gap-y-7 text-[0.78rem] leading-tight tracking-[0.02em] uppercase md:grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: EASE_SUAVE, delay: 0.45 }}
          >
            {DATOS.map((d) => (
              <div key={d.etiqueta} className="drop-shadow-[0_1px_6px_rgb(0_0_0/0.5)]">
                <dt className="text-white/75">
                  {d.etiqueta} / <span className="font-semibold text-white">{d.dato}</span>
                </dt>
                <dd className="mt-0.5 text-white/75 normal-case">{d.detalle}</dd>
              </div>
            ))}
          </m.dl>
        </div>

        <m.div
          className="flex flex-col items-start gap-4"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE_SUAVE, delay: 0.35 }}
        >
          <h1
            id="titulo-hero"
            className="titulo-display text-[clamp(2.8rem,7vw,5.6rem)] leading-[0.9] uppercase"
          >
            <span className="sr-only">BYKODA — </span>Vestí tu actitud.
          </h1>
          <Link
            to="/catalogo"
            className="border-b border-white/70 pb-1 text-[0.75rem] font-semibold tracking-[0.2em] uppercase transition-colors hover:border-white"
          >
            Ver catálogo →
          </Link>
        </m.div>
      </div>
    </section>
  );
}

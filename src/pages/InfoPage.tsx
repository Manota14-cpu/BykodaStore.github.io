import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IconFlecha } from '@/components/icons';
import { useSEO } from '@/lib/seo';
import { BloqueContacto } from './ayuda/AyudaLayout';
import { ANCLAS_VIEJAS, GRUPOS_AYUDA } from './ayuda/secciones';

/**
 * Centro de ayuda: todas las secciones a la vista, agrupadas, y cada una en su
 * propia página. Reemplaza a la página larga con la barra de secciones fija.
 */
export function InfoPage() {
  const { hash } = useLocation();
  const navigate = useNavigate();

  useSEO({
    title: 'Ayuda | BYKODA',
    description:
      'Cómo comprar, envíos, cambios y devoluciones, guía de talles, contacto, términos y condiciones y botón de arrepentimiento.',
    canonical: '/info',
  });

  // Links viejos como /info#faq llevan a la página nueva de esa sección.
  useEffect(() => {
    const destino = ANCLAS_VIEJAS[hash.slice(1)];
    if (destino) navigate(destino, { replace: true });
  }, [hash, navigate]);

  return (
    <div className="area-pagina pt-[clamp(2rem,5vw,3.5rem)] pb-[clamp(4rem,9vw,6rem)]">
      <header className="border-b border-line pb-8">
        <p className="eyebrow">Ayuda</p>
        <h1 className="mt-2 titulo-display text-[clamp(2.8rem,7vw,4.8rem)] leading-[0.92] text-ink uppercase">
          ¿En qué te ayudamos?
        </h1>
        <p className="mt-4 max-w-[56ch] text-[0.95rem] leading-relaxed text-ink-2">
          Todo sobre comprar en BYKODA: pagos, envíos, cambios y talles. Si no encontrás lo que
          buscás, escribinos.
        </p>
      </header>

      <div className="grid gap-12 pt-10">
        {GRUPOS_AYUDA.map((grupo) => (
          <section key={grupo.titulo} aria-labelledby={`grupo-${grupo.titulo}`}>
            <h2 id={`grupo-${grupo.titulo}`} className="mb-4 eyebrow">
              {grupo.titulo}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {grupo.secciones.map((s) => (
                <li key={s.slug} className="border border-line bg-ground transition-colors hover:border-line-strong">
                  <Link
                    to={s.ruta}
                    className="group flex h-full items-start justify-between gap-4 p-5 transition-colors hover:bg-surface sm:p-6"
                  >
                    <span>
                      <span className="block font-semibold text-ink">{s.titulo}</span>
                      <span className="mt-1 block text-sm text-ink-2">{s.descripcion}</span>
                    </span>
                    <IconFlecha className="mt-1 shrink-0 text-ink-3 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-ink" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-14">
        <BloqueContacto />
      </div>
    </div>
  );
}

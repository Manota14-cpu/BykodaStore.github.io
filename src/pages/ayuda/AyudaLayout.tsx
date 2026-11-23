import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { IconWhatsapp } from '@/components/icons';
import { cn } from '@/lib/cn';
import { WA_NUMBER } from '@/lib/whatsapp';
import { HORARIO_ATENCION } from '@/config/legal';
import { GRUPOS_AYUDA } from './secciones';

/** Lista de todas las secciones. Marca la página actual; no sigue el scroll. */
function IndiceAyuda({ actual, className }: { actual: string; className?: string }) {
  return (
    <nav aria-label="Secciones de ayuda" className={className}>
      {GRUPOS_AYUDA.map((grupo) => (
        <div key={grupo.titulo} className="mb-7 last:mb-0">
          <p className="mb-2.5 eyebrow">{grupo.titulo}</p>
          <ul className="grid gap-0.5">
            {grupo.secciones.map((s) => (
              <li key={s.slug}>
                <Link
                  to={s.ruta}
                  aria-current={s.slug === actual ? 'page' : undefined}
                  className={cn(
                    'block border-l-2 py-1.5 pl-3 text-sm transition-colors',
                    s.slug === actual
                      ? 'border-ink font-semibold text-ink'
                      : 'border-transparent text-ink-2 hover:border-line-strong hover:text-ink',
                  )}
                >
                  {s.titulo}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Franja final de cada página: si no encontraste la respuesta, escribinos. */
export function BloqueContacto() {
  return (
    <div className="flex flex-col items-start justify-between gap-5 border border-line bg-surface p-6 sm:flex-row sm:items-center">
      <div>
        <p className="font-semibold text-ink">¿Te quedó alguna duda?</p>
        <p className="mt-1 text-sm text-ink-2">Te responde una persona, {HORARIO_ATENCION}.</p>
      </div>
      <a
        href={`https://wa.me/${WA_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-invert px-5 text-[0.78rem] font-semibold tracking-[0.12em] text-on-invert uppercase transition-opacity hover:opacity-85"
      >
        <IconWhatsapp size={17} />
        Escribinos
      </a>
    </div>
  );
}

/**
 * Página de ayuda: título arriba, índice a la izquierda (en escritorio) y el
 * contenido a la derecha. En celular el índice va al final, como "Otras secciones".
 */
export function AyudaLayout({
  actual,
  titulo,
  bajada,
  children,
  ancho = 'texto',
}: {
  actual: string;
  titulo: string;
  bajada?: ReactNode;
  children: ReactNode;
  /** `texto` limita el ancho para leer cómodo; `amplio` lo deja libre (tablas, formularios). */
  ancho?: 'texto' | 'amplio';
}) {
  return (
    <div className="area-pagina pt-[clamp(1.5rem,4vw,2.5rem)] pb-[clamp(4rem,9vw,6rem)]">
      <p className="text-xs text-ink-3">
        <Link to="/info" className="transition-colors hover:text-ink">
          Ayuda
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-ink-2">{titulo}</span>
      </p>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
        <IndiceAyuda actual={actual} className="hidden lg:block" />

        <div>
          <header className="border-b border-line pb-7">
            <h1 className="titulo-display text-[clamp(2.4rem,5vw,3.6rem)] leading-[0.95] text-ink uppercase">
              {titulo}
            </h1>
            {bajada && (
              <p className="mt-3 max-w-[60ch] text-[0.95rem] leading-relaxed text-ink-2">
                {bajada}
              </p>
            )}
          </header>

          <div className={cn('pt-8', ancho === 'texto' && 'max-w-[68ch]')}>{children}</div>

          <div className="mt-14">
            <BloqueContacto />
          </div>

          <div className="mt-14 border-t border-line pt-8 lg:hidden">
            <p className="mb-5 text-sm font-semibold text-ink">Otras secciones</p>
            <IndiceAyuda actual={actual} />
          </div>
        </div>
      </div>
    </div>
  );
}

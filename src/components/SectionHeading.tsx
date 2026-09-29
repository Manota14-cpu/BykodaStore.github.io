import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { IconFlecha } from './icons';
import { Revelar } from './motion/Revelar';

/** Encabezado de sección: etiqueta chica, título display y un link opcional a la derecha. */
export function SectionHeading({
  eyebrow,
  titulo,
  bajada,
  link,
  className,
  id,
}: {
  eyebrow: string;
  titulo: ReactNode;
  bajada?: string;
  link?: { to: string; label: string };
  className?: string;
  id?: string;
}) {
  return (
    <Revelar className={cn('mb-10 flex flex-wrap items-end justify-between gap-x-10 gap-y-5', className)}>
      <div className="max-w-2xl">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className="titulo-display mt-3 text-[clamp(2.4rem,5.5vw,4.2rem)] text-ink">
          {titulo}
        </h2>
        {bajada && <p className="mt-4 max-w-[52ch] text-[0.95rem] leading-relaxed text-ink-2">{bajada}</p>}
      </div>
      {link && (
        <Link
          to={link.to}
          className="group inline-flex items-center gap-2 border-b border-line-strong pb-1 text-[0.72rem] font-semibold tracking-[0.16em] text-ink uppercase transition-colors hover:border-ink"
        >
          {link.label}
          <IconFlecha className="transition-transform duration-300 ease-(--ease-suave) group-hover:translate-x-1" />
        </Link>
      )}
    </Revelar>
  );
}

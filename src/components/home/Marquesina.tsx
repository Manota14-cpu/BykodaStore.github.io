import { Fragment } from 'react';
import { cn } from '@/lib/cn';

const FRASES = ['Ediciones limitadas', 'Streetwear argentino', 'Cuando se van, no vuelven'];

/**
 * Banda de texto gigante que corre de derecha a izquierda. Alterna letras
 * llenas y caladas. Es decorativa: el mismo mensaje está en el hero.
 */
export function Marquesina() {
  const pista = (duplicada: boolean) => (
    <div className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={duplicada || undefined}>
      {FRASES.map((frase, i) => (
        <Fragment key={frase}>
          <span
            className={cn(
              'titulo-display text-[clamp(3rem,8.5vw,7.5rem)] whitespace-nowrap uppercase',
              i % 2 === 1
                ? 'text-transparent [-webkit-text-stroke:1.5px_var(--color-ink)]'
                : 'text-ink',
            )}
          >
            {frase}
          </span>
          <span className="text-[clamp(1.2rem,3vw,2.4rem)] text-ink-3" aria-hidden="true">
            ✦
          </span>
        </Fragment>
      ))}
    </div>
  );

  return (
    <section aria-label="Ediciones limitadas" className="overflow-hidden border-y border-line py-6 md:py-8">
      <div className="flex w-max animate-[marquee_42s_linear_infinite] hover:[animation-play-state:paused]">
        {pista(false)}
        {pista(true)}
      </div>
    </section>
  );
}

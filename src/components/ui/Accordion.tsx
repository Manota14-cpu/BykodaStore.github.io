import { useId, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface ItemAcordeon {
  titulo: string;
  contenido: ReactNode;
}

export function Accordion({
  items,
  inicial = null,
  className,
}: {
  items: ItemAcordeon[];
  /** Índice abierto al montar; null deja todo cerrado. */
  inicial?: number | null;
  className?: string;
}) {
  const [abierto, setAbierto] = useState<number | null>(inicial);
  const baseId = useId();

  return (
    <div className={cn('border-t border-line', className)}>
      {items.map((item, i) => {
        const activo = abierto === i;
        const btnId = `${baseId}-btn-${i}`;
        const panelId = `${baseId}-panel-${i}`;
        return (
          <div key={item.titulo} className="border-b border-line">
            <h3>
              <button
                type="button"
                id={btnId}
                aria-expanded={activo}
                aria-controls={panelId}
                onClick={() => setAbierto(activo ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-4.5 text-left text-[0.92rem] font-medium text-ink transition-colors hover:text-ink-2"
              >
                <span>{item.titulo}</span>
                <span aria-hidden="true" className="relative size-3 shrink-0">
                  <span className="absolute inset-x-0 top-1/2 h-px bg-current" />
                  <span
                    className={cn(
                      'absolute inset-x-0 top-1/2 h-px bg-current transition-transform duration-300 ease-(--ease-suave)',
                      activo ? 'rotate-0' : 'rotate-90',
                    )}
                  />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              hidden={!activo}
              className="pb-6 text-[0.88rem] leading-7 text-ink-2 [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-4 [&_p]:mb-3 [&_p:last-child]:mb-0"
            >
              {item.contenido}
            </div>
          </div>
        );
      })}
    </div>
  );
}

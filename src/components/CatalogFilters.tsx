import { TODAS_LAS_CATEGORIAS, type NodoMenu } from '@/lib/catalogo';
import { fmtMoneda } from '@/lib/format';
import type { FiltrosCatalogo } from '@/lib/filtros';
import { cn } from '@/lib/cn';

interface Props {
  filtros: FiltrosCatalogo;
  onChange: (parcial: Partial<FiltrosCatalogo>) => void;
  onLimpiar: () => void;
  /** Categorías presentes en el catálogo, con conteos ya filtrados por el resto. */
  menu: NodoMenu[];
  /** Total sin filtro de categoría. */
  total: number;
  talles: string[];
  precioMin: number;
  precioTope: number;
  hayFiltros: boolean;
}

const opcion =
  'flex w-full items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-left text-[0.85rem] transition-colors duration-200 hover:bg-hover hover:text-ink';

const conteo = 'text-[0.7rem] text-ink-3 tabular-nums';

export function CatalogFilters({
  filtros,
  onChange,
  onLimpiar,
  menu,
  total,
  talles,
  precioMin,
  precioTope,
  hayFiltros,
}: Props) {
  const precioValor = Number.isFinite(filtros.precioMax) ? filtros.precioMax : precioTope;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 border-b border-line pb-3.5">
        <h2 className="text-[0.78rem] font-semibold tracking-[0.18em] text-ink uppercase">Filtrar</h2>
        {hayFiltros && (
          <button
            type="button"
            onClick={onLimpiar}
            className="text-xs text-ink-3 underline underline-offset-4 transition-colors hover:text-ink"
          >
            Limpiar todo
          </button>
        )}
      </div>

      <section className="border-b border-line py-5">
        <h3 className="eyebrow mb-3">Categoría</h3>
        <ul>
          <li>
            <button
              type="button"
              aria-pressed={filtros.categoria === TODAS_LAS_CATEGORIAS}
              onClick={() => onChange({ categoria: TODAS_LAS_CATEGORIAS, subcategoria: null })}
              className={cn(
                opcion,
                filtros.categoria === TODAS_LAS_CATEGORIAS ? 'bg-hover font-semibold text-ink' : 'text-ink-2',
              )}
            >
              <span>Todo el catálogo</span>
              <span className={conteo}>{total}</span>
            </button>
          </li>

          {menu.map((nodo) => {
            const abierta = filtros.categoria === nodo.key;
            return (
              <li key={nodo.key}>
                <button
                  type="button"
                  aria-pressed={abierta}
                  aria-expanded={nodo.hijos.length > 0 ? abierta : undefined}
                  onClick={() =>
                    onChange(
                      abierta
                        ? { categoria: TODAS_LAS_CATEGORIAS, subcategoria: null }
                        : { categoria: nodo.key, subcategoria: null },
                    )
                  }
                  className={cn(opcion, abierta ? 'bg-hover font-semibold text-ink' : 'text-ink-2')}
                >
                  <span>{nodo.label}</span>
                  <span className={conteo}>{nodo.cantidad}</span>
                </button>

                {abierta && nodo.hijos.length > 0 && (
                  <ul className="my-1 ml-2.5 border-l border-line pl-2.5">
                    {nodo.hijos.map((hijo) => {
                      const activa = filtros.subcategoria === hijo.key;
                      return (
                        <li key={hijo.key}>
                          <button
                            type="button"
                            aria-pressed={activa}
                            onClick={() => onChange({ subcategoria: activa ? null : hijo.key })}
                            className={cn(
                              opcion,
                              'py-1.5 text-[0.8rem]',
                              activa ? 'font-semibold text-ink' : 'text-ink-2',
                            )}
                          >
                            <span>{hijo.label}</span>
                            <span className={conteo}>{hijo.cantidad}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="border-b border-line py-5">
        <h3 className="eyebrow mb-3">Talle</h3>
        <div className="flex flex-wrap gap-1.5">
          {talles.map((t) => {
            const activo = filtros.talles.includes(t);
            return (
              <button
                key={t}
                type="button"
                aria-pressed={activo}
                onClick={() =>
                  onChange({
                    talles: activo ? filtros.talles.filter((x) => x !== t) : [...filtros.talles, t],
                  })
                }
                className={cn(
                  'min-w-11 rounded-lg border px-2.5 py-2 text-[0.76rem] font-semibold tracking-wider transition-colors duration-200',
                  activo
                    ? 'border-invert bg-invert text-on-invert'
                    : 'border-line text-ink-2 hover:border-line-strong hover:text-ink',
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
      </section>

      {precioTope > precioMin && (
        <section className="border-b border-line py-5">
          <h3 id="filtro-precio" className="eyebrow mb-3">
            Precio máximo
          </h3>
          <input
            type="range"
            min={precioMin}
            max={precioTope}
            step={500}
            value={precioValor}
            aria-labelledby="filtro-precio"
            aria-valuetext={fmtMoneda(precioValor)}
            onChange={(e) => {
              const v = Number(e.target.value);
              onChange({ precioMax: v >= precioTope ? Infinity : v });
            }}
            className="w-full accent-(--color-ink)"
          />
          <div className="mt-2 flex justify-between text-xs text-ink-3 tabular-nums">
            <span>{fmtMoneda(precioMin)}</span>
            <span className="font-semibold text-ink">
              {precioValor >= precioTope ? 'Sin límite' : fmtMoneda(precioValor)}
            </span>
          </div>
        </section>
      )}

      <section className="py-5">
        <label className="flex cursor-pointer items-center gap-2.5 text-[0.85rem] text-ink-2">
          <input
            type="checkbox"
            checked={filtros.soloOfertas}
            onChange={(e) => onChange({ soloOfertas: e.target.checked })}
            className="size-4 cursor-pointer accent-(--color-ink)"
          />
          <span>Solo ofertas</span>
        </label>
      </section>
    </div>
  );
}

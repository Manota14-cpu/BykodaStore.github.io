import { useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import type { Producto } from '@/types';
import { fmtMoneda, pctOff } from '@/lib/format';
import { etiquetaProducto } from '@/lib/catalogo';
import { UMBRAL_ULTIMAS } from '@/api/catalogo';
import { useFavoritesStore } from '@/store/favorites';
import { useToastStore } from '@/store/toast';
import { cn } from '@/lib/cn';
import { IconCorazon } from './icons';
import { ImagenProducto } from './ImagenProducto';
import { Badge } from './ui';

export function ProductoSkeleton() {
  return (
    <div aria-hidden="true" className="grid gap-3">
      <div className="aspect-3/4 animate-pulse rounded-xl bg-hover" />
      <div className="h-3 w-1/3 animate-pulse rounded bg-hover" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-hover" />
    </div>
  );
}

/**
 * Card minimalista: imagen, nombre y precio. Toda la card es un enlace a la
 * ficha — la elección de talle y cantidad vive allá, donde el cliente ve la
 * guía de talles y el detalle de la tela antes de decidir.
 */
export function ProductCard({ producto: p, prioridad = false }: { producto: Producto; prioridad?: boolean }) {
  const favs = useFavoritesStore((s) => s.favs);
  const toggleFav = useFavoritesStore((s) => s.toggle);
  const showToast = useToastStore((s) => s.showToast);

  const variantes = p.variantes && p.variantes.length > 0 ? p.variantes : null;
  const [varIdx, setVarIdx] = useState(0);

  const variante = variantes ? variantes[Math.min(varIdx, variantes.length - 1)] : null;
  const imgs = variante && variante.imgs.length > 0 ? variante.imgs : p.imagenes;
  const frente = imgs[0];
  const dorso = imgs[1];

  const precio = variante && variante.precio > 0 ? variante.precio : p.precio;
  const nombre = variante ? variante.nombre : p.nombre;
  const descuento =
    p.precio_original && p.precio_original > p.precio ? pctOff(p.precio_original, p.precio) : 0;
  const esFavorito = favs.includes(p.id);
  const sinStock = p.stock === 'sin-stock';
  const quedan =
    !sinStock && typeof p.unidades === 'number' && p.unidades <= UMBRAL_ULTIMAS ? p.unidades : null;

  function handleFav(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const accion = toggleFav(p.id);
    showToast(accion === 'added' ? 'Agregado a favoritos' : 'Quitado de favoritos');
  }

  return (
    <article className="group/card relative flex flex-col">
      <Link
        to={`/producto/${encodeURIComponent(p.slug)}`}
        className="flex flex-col gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-line-strong"
      >
        <div
          className={cn(
            'relative aspect-3/4 overflow-hidden rounded-xl bg-hover',
            sinStock && 'opacity-60 grayscale',
          )}
        >
          <ImagenProducto
            src={frente}
            alt={nombre}
            width={600}
            height={800}
            loading={prioridad ? 'eager' : 'lazy'}
            decoding="async"
            className={cn(
              'absolute inset-0 size-full object-cover transition-[opacity,transform] duration-700 ease-(--ease-suave)',
              'group-hover/card:scale-[1.04]',
              dorso && 'group-hover/card:opacity-0',
            )}
          />
          {dorso && (
            <img
              src={dorso}
              alt=""
              aria-hidden="true"
              width={600}
              height={800}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover opacity-0 transition-[opacity,transform] duration-700 ease-(--ease-suave) group-hover/card:scale-[1.04] group-hover/card:opacity-100"
            />
          )}

          <div className="absolute top-2.5 left-2.5 z-[2] flex flex-col items-start gap-1.5">
            {sinStock && <Badge tono="agotado">Sin stock</Badge>}
            {!sinStock && (quedan !== null || p.stock === 'ultimas') && (
              <Badge tono="ultimas">{quedan !== null ? `Quedan ${quedan}` : 'Últimas'}</Badge>
            )}
            {!sinStock && descuento > 0 && <Badge tono="oferta">−{descuento}%</Badge>}
          </div>

          <span className="absolute inset-x-0 bottom-0 z-[2] hidden translate-y-full bg-invert py-2.5 text-center text-[0.66rem] font-semibold tracking-[0.18em] text-on-invert uppercase transition-transform duration-300 ease-(--ease-suave) group-hover/card:translate-y-0 sm:block">
            Ver prenda
          </span>
        </div>

        <div className="grid gap-1">
          <span className="eyebrow">{etiquetaProducto(p)}</span>
          <h3 className="line-clamp-2 text-[0.88rem] leading-snug font-medium text-ink">{nombre}</h3>
          <p className="flex items-baseline gap-2">
            {precio > 0 ? (
              <>
                <span className="text-[0.95rem] font-bold text-ink tabular-nums">{fmtMoneda(precio)}</span>
                {descuento > 0 && !variante && (
                  <span className="text-[0.78rem] text-ink-3 tabular-nums line-through">
                    {fmtMoneda(p.precio_original as number)}
                  </span>
                )}
              </>
            ) : (
              <span className="text-[0.95rem] font-bold text-ink">Consultar</span>
            )}
          </p>
        </div>
      </Link>

      <button
        type="button"
        aria-label={esFavorito ? `Quitar ${nombre} de favoritos` : `Agregar ${nombre} a favoritos`}
        aria-pressed={esFavorito}
        onClick={handleFav}
        className={cn(
          'absolute top-2.5 right-2.5 z-[3] grid size-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-[opacity,color] duration-300',
          'opacity-0 group-hover/card:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100',
          esFavorito && 'text-fav opacity-100',
        )}
      >
        <IconCorazon lleno={esFavorito} />
      </button>

      {variantes && variantes.length > 1 && (
        <div role="group" aria-label={`Colores de ${p.nombre}`} className="mt-2.5 flex gap-1.5">
          {variantes.map((v, i) => (
            <button
              key={v.color + i}
              type="button"
              title={v.label}
              aria-label={`Ver color ${v.label}`}
              aria-pressed={i === varIdx}
              onClick={(e) => {
                e.preventDefault();
                setVarIdx(i);
              }}
              style={{ background: v.color }}
              className={cn(
                'size-4 rounded-full border border-line-strong transition-transform duration-200 hover:scale-115',
                i === varIdx && 'ring-2 ring-ink ring-offset-2 ring-offset-ground',
              )}
            />
          ))}
        </div>
      )}
    </article>
  );
}

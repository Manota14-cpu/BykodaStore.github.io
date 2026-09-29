import type { EstadoStock, Producto } from '@/types';
import { TIENDA } from '@/config/tienda';
import { categoriaSinTalle, resolverCategoria, slugify } from '@/lib/catalogo';
import type { ProductoPlataforma } from './plataforma';

/** Con esta cantidad o menos, la card avisa "Últimas unidades". */
export const UMBRAL_ULTIMAS = 3;

function estadoSegunUnidades(disponible: boolean, unidades: number | null | undefined): EstadoStock {
  if (!disponible || unidades === 0) return 'sin-stock';
  if (typeof unidades === 'number' && unidades <= UMBRAL_ULTIMAS) return 'ultimas';
  return 'disponible';
}

/** Las fotos de la plataforma pueden venir relativas a su propio dominio. */
function urlAbsoluta(src: string): string | null {
  try {
    return new URL(src, TIENDA.origen).href;
  } catch {
    return null;
  }
}

export function desdePlataforma(p: ProductoPlataforma): Producto {
  const { key, label } = resolverCategoria(p.categoria);
  const fotos = [...(p.imagenes ?? []), ...(p.imagen ? [p.imagen] : [])]
    .map(urlAbsoluta)
    .filter((u): u is string => Boolean(u));

  return {
    id: p.id,
    // Nombre legible + un pedazo del id: única y linda para compartir.
    slug: `${slugify(p.nombre) || 'producto'}-${p.id.slice(0, 6).toLowerCase()}`,
    fuente: 'plataforma',
    nombre: p.nombre,
    precio: p.precio,
    categoria: key,
    categoriaLabel: label,
    imagenes: [...new Set(fotos)],
    stock: estadoSegunUnidades(p.disponible, p.stock),
    unidades: p.stock ?? null,
    // La plataforma no maneja talles: se elige en la ficha y viaja en las notas
    // del pedido. Los accesorios no llevan selector.
    talles: categoriaSinTalle(key) ? [] : undefined,
  };
}

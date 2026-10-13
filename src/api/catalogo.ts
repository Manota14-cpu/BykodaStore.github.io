import type { EstadoStock, OpcionPlataforma, Producto } from '@/types';
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

function fotosDe(p: ProductoPlataforma): string[] {
  const fotos = [...(p.imagenes ?? []), ...(p.imagen ? [p.imagen] : [])]
    .map(urlAbsoluta)
    .filter((u): u is string => Boolean(u));
  return [...new Set(fotos)];
}

const unicos = (valores: (string | null | undefined)[]): string[] =>
  [...new Set(valores.filter((v): v is string => Boolean(v)))];

/** Un producto suelto de la plataforma (o una combinación de talle y color, vista sola). */
export function desdePlataforma(p: ProductoPlataforma): Producto {
  const { key, label } = resolverCategoria(p.categoria);
  const fotos = fotosDe(p);

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
    // Sin talles cargados en la plataforma: se elige uno estándar en la ficha y
    // viaja en las notas del pedido. Los accesorios no llevan selector.
    talles: categoriaSinTalle(key) ? [] : undefined,
  };
}

/**
 * Una prenda con talles y colores en la plataforma llega como un producto por
 * combinación, todos con el mismo `prenda.id`. Acá se juntan en una sola ficha
 * que conoce el stock de cada combinación.
 */
function desdePrenda(prenda: { id: string; nombre: string }, variantes: ProductoPlataforma[]): Producto {
  const opciones: OpcionPlataforma[] = variantes.map((v) => ({
    id: v.id,
    talle: v.talle ?? null,
    color: v.color ?? null,
    precio: v.precio,
    stock: estadoSegunUnidades(v.disponible, v.stock),
    unidades: v.stock ?? null,
    imagenes: fotosDe(v),
  }));
  const conStock = opciones.filter((o) => o.stock !== 'sin-stock');
  const { key, label } = resolverCategoria(variantes.find((v) => v.categoria)?.categoria);
  const conocidas = opciones.every((o) => typeof o.unidades === 'number');
  const unidades = conocidas ? conStock.reduce((s, o) => s + (o.unidades ?? 0), 0) : null;
  const precios = (conStock.length ? conStock : opciones).map((o) => o.precio);
  // Primero las fotos de lo que hay en stock, para que la card no muestre algo agotado.
  const fotos = [...conStock, ...opciones].flatMap((o) => o.imagenes);

  return {
    id: prenda.id,
    slug: `${slugify(prenda.nombre) || 'producto'}-${prenda.id.slice(0, 6).toLowerCase()}`,
    fuente: 'plataforma',
    nombre: prenda.nombre,
    precio: Math.min(...precios),
    categoria: key,
    categoriaLabel: label,
    imagenes: [...new Set(fotos)],
    stock: conStock.length === 0 ? 'sin-stock' : estadoSegunUnidades(true, unidades),
    unidades,
    talles: unicos(opciones.map((o) => o.talle)),
    colores: unicos(opciones.map((o) => o.color)),
    opciones,
  };
}

/** Catálogo de la plataforma listo para la UI: una ficha por prenda, con sus talles y colores. */
export function catalogoDesdePlataforma(productos: ProductoPlataforma[]): Producto[] {
  const prendas = new Map<string, { prenda: { id: string; nombre: string }; variantes: ProductoPlataforma[] }>();
  const orden: (ProductoPlataforma | string)[] = [];
  for (const p of productos) {
    if (!p.prenda) {
      orden.push(p);
      continue;
    }
    const grupo = prendas.get(p.prenda.id);
    if (grupo) grupo.variantes.push(p);
    else {
      prendas.set(p.prenda.id, { prenda: p.prenda, variantes: [p] });
      orden.push(p.prenda.id);
    }
  }
  return orden.map((item) => {
    if (typeof item !== 'string') return desdePlataforma(item);
    const { prenda, variantes } = prendas.get(item)!;
    return desdePrenda(prenda, variantes);
  });
}

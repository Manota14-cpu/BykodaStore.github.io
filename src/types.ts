export interface ProductoVariante {
  color: string;
  label: string;
  imgs: string[];
  nombre: string;
  precio: number;
}

export type Subcategoria =
  | 'jean'
  | 'jean-baggy'
  | 'jean-cargo'
  | 'jogger'
  | 'remera'
  | 'remera-oversize'
  | 'hoodie'
  | 'sweater'
  | 'campera'
  | 'track-jacket';

/** De dónde sale cada producto. */
export type FuenteCatalogo = 'plataforma' | 'local';

export type EstadoStock = 'disponible' | 'ultimas' | 'sin-stock';

/**
 * Producto tal como lo usa la UI, sin importar la fuente. Los adaptadores de
 * `src/api/catalogo.ts` convierten cada fuente a esta forma.
 */
export interface Producto {
  /** Id en su fuente. En la plataforma es el que se manda al registrar un pedido. */
  id: string;
  /** Segmento de la URL: /producto/<slug>. */
  slug: string;
  fuente: FuenteCatalogo;
  nombre: string;
  cartNombre?: string;
  precio: number;
  precio_original?: number | null;
  /** Clave normalizada ("remera", "bermuda"…), ver `lib/catalogo.ts`. */
  categoria: string;
  /** Nombre visible de la categoría ("Remeras", "Bermudas"…). */
  categoriaLabel: string;
  subcategoria?: Subcategoria;
  imagenes: string[];
  stock: EstadoStock;
  /** Unidades disponibles cuando la fuente las informa (la plataforma sí). */
  unidades?: number | null;
  descripcion?: string;
  /** undefined = talles estándar; [] = no lleva talle. */
  talles?: string[];
  variantes?: ProductoVariante[] | null;
  calce?: string;
  tela?: string;
  composicion?: string;
  cuidados?: string;
}

export interface Cupon {
  codigo: string;
  descuento: number;
  tipo?: string;
  activo: boolean;
  usos_max: number;
  usos: number;
  vence: string | null;
  descripcion?: string;
}

export interface CartItem {
  /** Clave única en el carrito: incluye variante y talle. */
  nombre: string;
  precio: number;
  cantidad: number;
  imgSrc?: string;
  /** Id del producto en su fuente. */
  productoId?: string;
  /** Para volver a la ficha desde el carrito. */
  slug?: string;
  /** Carritos guardados antes de la plataforma no lo tienen: se toman como locales. */
  fuente?: FuenteCatalogo;
  talle?: string;
  /** Tope de unidades según el stock que informó la plataforma al agregarlo. */
  maximo?: number | null;
}

export type Orden = 'default' | 'precio-asc' | 'precio-desc' | 'az' | 'za';

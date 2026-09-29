import type { Subcategoria } from '@/types';
import { TODAS_LAS_CATEGORIAS } from './catalogo';

export interface FiltrosCatalogo {
  categoria: string;
  subcategoria: Subcategoria | null;
  talles: string[];
  /** Infinity = sin tope. */
  precioMax: number;
  soloOfertas: boolean;
  busqueda: string;
}

export const FILTROS_INICIALES: FiltrosCatalogo = {
  categoria: TODAS_LAS_CATEGORIAS,
  subcategoria: null,
  talles: [],
  precioMax: Infinity,
  soloOfertas: false,
  busqueda: '',
};

/**
 * Claves del mapa de conteos del catálogo. Van con prefijo porque hay nombres
 * que existen a la vez como categoría y como subcategoría (p. ej. "remera").
 */
export const claveConteo = {
  todos: 'todos',
  cat: (key: string) => `cat:${key}`,
  sub: (key: string) => `sub:${key}`,
};

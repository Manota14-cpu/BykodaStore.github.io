import { describe, expect, it } from 'vitest';
import type { Producto } from '../types';
import {
  ARBOL_CATALOGO,
  etiquetaSubcategoria,
  leerHashCategoria,
  normalizarTexto,
  perteneceACategoria,
  TODAS_LAS_CATEGORIAS,
} from './catalogo';

function producto(parcial: Partial<Producto>): Producto {
  return {
    id: 'x',
    slug: 'x',
    fuente: 'local',
    nombre: 'X',
    precio: 1000,
    categoria: 'buzo',
    categoriaLabel: 'Buzos & Camperas',
    imagenes: [],
    stock: 'disponible',
    ...parcial,
  };
}

describe('leerHashCategoria', () => {
  it('devuelve null si no hay hash de categoría', () => {
    expect(leerHashCategoria('')).toBeNull();
    expect(leerHashCategoria('#otra-cosa')).toBeNull();
  });

  it('resuelve una categoría', () => {
    expect(leerHashCategoria('#cat=remera')).toEqual({
      categoria: 'remera',
      subcategoria: null,
    });
  });

  it('acepta los alias viejos en plural y con barra', () => {
    expect(leerHashCategoria('#cat=buzos')?.categoria).toBe('buzo');
    expect(leerHashCategoria('#cat=buzos%2Fcamperas')?.categoria).toBe('buzo');
    expect(leerHashCategoria('#cat=Pantalones')?.categoria).toBe('pantalon');
  });

  it('resuelve una subcategoría junto con su categoría padre', () => {
    expect(leerHashCategoria('#cat=hoodie')).toEqual({
      categoria: 'buzo',
      subcategoria: 'hoodie',
    });
    expect(leerHashCategoria('#cat=jean-baggy')).toEqual({
      categoria: 'pantalon',
      subcategoria: 'jean-baggy',
    });
  });

  it('cae en "todos" ante un valor desconocido', () => {
    const disponibles = new Set(['remera', 'buzo', 'pantalon']);
    expect(leerHashCategoria('#cat=zapatillas', disponibles)).toEqual({
      categoria: TODAS_LAS_CATEGORIAS,
      subcategoria: null,
    });
  });
});

describe('perteneceACategoria', () => {
  it('acepta todo cuando la categoría es "todos"', () => {
    expect(perteneceACategoria(producto({}), TODAS_LAS_CATEGORIAS)).toBe(true);
  });

  it('filtra por la categoría del stock', () => {
    expect(perteneceACategoria(producto({ categoria: 'buzo' }), 'buzo')).toBe(true);
    expect(perteneceACategoria(producto({ categoria: 'remera' }), 'buzo')).toBe(false);
  });
});

describe('etiquetaSubcategoria', () => {
  it('traduce la clave a la etiqueta visible', () => {
    expect(etiquetaSubcategoria('jean-baggy')).toBe('Jeans baggy');
    expect(etiquetaSubcategoria('track-jacket')).toBe('Track jackets');
  });

  it('devuelve vacío si no existe', () => {
    expect(etiquetaSubcategoria('inexistente')).toBe('');
    expect(etiquetaSubcategoria(undefined)).toBe('');
  });
});

describe('normalizarTexto', () => {
  it('saca tildes y mayúsculas para poder buscar', () => {
    expect(normalizarTexto('Campera Gabardina Bordáda')).toBe(
      'campera gabardina bordada',
    );
  });
});

describe('ARBOL_CATALOGO', () => {
  it('tiene claves de categoría que colisionan con las de subcategoría', () => {
    // "remera" es a la vez categoría y subcategoría. Por eso los conteos del
    // catálogo se guardan con prefijo (ver claveConteo en lib/filtros.ts):
    // sin él, el conteo de la subcategoría pisaba el de la categoría.
    const categorias = ARBOL_CATALOGO.map((n) => n.key);
    const subcategorias = ARBOL_CATALOGO.flatMap((n) => n.hijos.map((h) => h.key));
    const colisiones = categorias.filter((c) => subcategorias.includes(c as never));
    expect(colisiones).toContain('remera');
  });
});

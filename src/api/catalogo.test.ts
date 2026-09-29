import { describe, expect, it } from 'vitest';
import { desdePlataforma } from './catalogo';
import type { ProductoPlataforma } from './plataforma';

const REMERA_BOXY: ProductoPlataforma = {
  id: '896fd3b4b05842368e808340726cf8a8',
  nombre: 'REMERA BOXY FIT',
  categoria: 'BERMUDAS',
  precio: 34000,
  porPeso: false,
  unidad: 'unidad',
  disponible: true,
  stock: 4,
  imagen: null,
  imagenes: [],
};

describe('desdePlataforma', () => {
  it('convierte el producto real de la plataforma', () => {
    const p = desdePlataforma(REMERA_BOXY);
    expect(p).toMatchObject({
      id: '896fd3b4b05842368e808340726cf8a8',
      slug: 'remera-boxy-fit-896fd3',
      fuente: 'plataforma',
      nombre: 'REMERA BOXY FIT',
      precio: 34000,
      // Se respeta la categoría cargada en la plataforma, aunque sea un error.
      categoria: 'bermuda',
      categoriaLabel: 'Bermudas',
      imagenes: [],
      stock: 'disponible',
      unidades: 4,
    });
    // Sin talles informados: la ficha ofrece los estándar.
    expect(p.talles).toBeUndefined();
  });

  it('marca "últimas" con poco stock y "sin stock" cuando no está disponible', () => {
    expect(desdePlataforma({ ...REMERA_BOXY, stock: 2 }).stock).toBe('ultimas');
    expect(desdePlataforma({ ...REMERA_BOXY, stock: 0 }).stock).toBe('sin-stock');
    expect(desdePlataforma({ ...REMERA_BOXY, disponible: false }).stock).toBe('sin-stock');
    // stock null = la tienda no lo controla: se muestra disponible.
    expect(desdePlataforma({ ...REMERA_BOXY, stock: null }).stock).toBe('disponible');
  });

  it('vuelve absolutas las fotos relativas y no las repite', () => {
    const p = desdePlataforma({
      ...REMERA_BOXY,
      imagen: '/fotos/a.webp',
      imagenes: ['/fotos/a.webp', 'https://cdn.ejemplo.com/b.webp'],
    });
    expect(p.imagenes).toEqual([
      'https://visual-app-licencias.visual-app-licencias.workers.dev/fotos/a.webp',
      'https://cdn.ejemplo.com/b.webp',
    ]);
  });

  it('crea categorías nuevas con el nombre tal como se cargó', () => {
    expect(desdePlataforma({ ...REMERA_BOXY, categoria: 'GORROS DE LANA' })).toMatchObject({
      categoria: 'gorros-de-lana',
      categoriaLabel: 'Gorros de lana',
    });
  });

  it('los accesorios no llevan selector de talle', () => {
    expect(desdePlataforma({ ...REMERA_BOXY, categoria: 'Accesorios' }).talles).toEqual([]);
  });
});

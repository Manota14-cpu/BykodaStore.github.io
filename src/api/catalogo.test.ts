import { describe, expect, it } from 'vitest';
import { catalogoDesdePlataforma, desdePlataforma } from './catalogo';
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

describe('catalogoDesdePlataforma', () => {
  const PRENDA = { id: 'a1b2c3d4e5f6', nombre: 'HOODIE KODA' };
  const variante = (
    id: string,
    color: string,
    talle: string,
    stock: number,
    extra: Partial<ProductoPlataforma> = {},
  ): ProductoPlataforma => ({
    ...REMERA_BOXY,
    id,
    nombre: `HOODIE KODA ${color} ${talle}`,
    categoria: 'Buzos',
    precio: 52000,
    prenda: PRENDA,
    talle,
    color,
    stock,
    disponible: stock > 0,
    ...extra,
  });
  const VARIANTES = [
    variante('v-negro-m', 'Negro', 'M', 0, { imagenes: ['https://cdn.ejemplo.com/negro.webp'] }),
    variante('v-negro-l', 'Negro', 'L', 5, { imagenes: ['https://cdn.ejemplo.com/negro.webp'] }),
    variante('v-gris-m', 'Gris', 'M', 2, { precio: 50000, imagenes: ['https://cdn.ejemplo.com/gris.webp'] }),
  ];

  it('junta las combinaciones de una prenda en una sola ficha, en el orden en que llegan', () => {
    const lista = catalogoDesdePlataforma([REMERA_BOXY, ...VARIANTES, { ...REMERA_BOXY, id: 'otro', nombre: 'GORRA' }]);
    expect(lista.map((p) => p.nombre)).toEqual(['REMERA BOXY FIT', 'HOODIE KODA', 'GORRA']);
    const hoodie = lista[1]!;
    expect(hoodie).toMatchObject({
      id: PRENDA.id,
      slug: 'hoodie-koda-a1b2c3',
      categoria: 'buzo',
      talles: ['M', 'L'],
      colores: ['Negro', 'Gris'],
      precio: 50000,
      unidades: 7,
      stock: 'disponible',
    });
    expect(hoodie.opciones).toHaveLength(3);
  });

  it('guarda el stock y el id de cada combinación para el pedido', () => {
    const [hoodie] = catalogoDesdePlataforma(VARIANTES);
    expect(hoodie!.opciones).toEqual([
      expect.objectContaining({ id: 'v-negro-m', color: 'Negro', talle: 'M', stock: 'sin-stock', unidades: 0 }),
      expect.objectContaining({ id: 'v-negro-l', color: 'Negro', talle: 'L', stock: 'disponible', unidades: 5 }),
      expect.objectContaining({ id: 'v-gris-m', color: 'Gris', talle: 'M', stock: 'ultimas', unidades: 2 }),
    ]);
  });

  it('muestra primero las fotos de lo que tiene stock', () => {
    const [hoodie] = catalogoDesdePlataforma([
      variante('v1', 'Negro', 'M', 0, { imagenes: ['https://cdn.ejemplo.com/negro.webp'] }),
      variante('v2', 'Gris', 'M', 3, { imagenes: ['https://cdn.ejemplo.com/gris.webp'] }),
    ]);
    expect(hoodie!.imagenes).toEqual(['https://cdn.ejemplo.com/gris.webp', 'https://cdn.ejemplo.com/negro.webp']);
  });

  it('marca la prenda sin stock cuando se agotan todas las combinaciones', () => {
    const [hoodie] = catalogoDesdePlataforma(VARIANTES.map((v) => ({ ...v, stock: 0, disponible: false })));
    expect(hoodie).toMatchObject({ stock: 'sin-stock', unidades: 0, precio: 50000 });
  });

  it('con alguna combinación sin control de stock, no informa unidades', () => {
    const [hoodie] = catalogoDesdePlataforma([...VARIANTES, variante('v-gris-l', 'Gris', 'L', 1, { stock: null, disponible: true })]);
    expect(hoodie).toMatchObject({ stock: 'disponible', unidades: null });
  });
});

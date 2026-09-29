import { beforeEach, describe, expect, it, vi } from 'vitest';
import { margenDeStock, useCartStore, type StockVivo } from './cart';

vi.mock('../api/local', () => ({
  obtenerCupones: vi.fn(async () => [
    { codigo: 'KODA10', descuento: 10, activo: true, usos_max: -1, usos: 0, vence: null },
    { codigo: 'VENCIDO', descuento: 5, activo: true, usos_max: -1, usos: 0, vence: '2020-01-01' },
  ]),
}));

beforeEach(() => {
  localStorage.clear();
  useCartStore.setState({ items: [], cupon: null, cuponMsg: null });
});

describe('addItem', () => {
  it('agrega un item y persiste en localStorage', () => {
    useCartStore
      .getState()
      .addItem({ nombre: 'Hoodie (M)', precio: 30000, cantidad: 1, imgSrc: '/x.webp' });
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      nombre: 'Hoodie (M)',
      precio: 30000,
      cantidad: 1,
    });
    expect(JSON.parse(localStorage.getItem('carrito') || '[]')).toHaveLength(1);
  });

  it('acumula cantidades del mismo nombre', () => {
    const s = useCartStore.getState();
    s.addItem({ nombre: 'Hoodie (M)', precio: 30000, cantidad: 1 });
    s.addItem({ nombre: 'Hoodie (M)', precio: 30000, cantidad: 2 });
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].cantidad).toBe(3);
  });
});

describe('cambiarCantidad', () => {
  it('incrementa y decrementa sin bajar de 1', () => {
    const s = useCartStore.getState();
    s.addItem({ nombre: 'X', precio: 100, cantidad: 1 });
    s.cambiarCantidad(0, 1);
    expect(useCartStore.getState().items[0].cantidad).toBe(2);
    s.cambiarCantidad(0, -5);
    expect(useCartStore.getState().items[0].cantidad).toBe(1);
  });
});

describe('stock informado por la plataforma', () => {
  const remera = (talle: string, cantidad: number) => ({
    nombre: `REMERA BOXY FIT (${talle})`,
    precio: 34000,
    cantidad,
    productoId: '896fd3b4b05842368e808340726cf8a8',
    fuente: 'plataforma' as const,
    talle,
    maximo: 4,
  });

  it('los talles del mismo producto comparten el stock', () => {
    const s = useCartStore.getState();
    expect(s.addItem(remera('M', 2))).toBe(2);
    expect(s.addItem(remera('L', 3))).toBe(2);
    expect(s.addItem(remera('S', 1))).toBe(0);
    const items = useCartStore.getState().items;
    expect(items.map((i) => i.cantidad)).toEqual([2, 2]);
    expect(margenDeStock(items, 0)).toBe(0);
    expect(margenDeStock(items, 1)).toBe(0);
  });

  it('el + del carrito frena en el stock del producto', () => {
    const s = useCartStore.getState();
    s.addItem(remera('M', 2));
    s.addItem(remera('L', 1));
    expect(margenDeStock(useCartStore.getState().items, 0)).toBe(1);
    s.cambiarCantidad(0, 1);
    s.cambiarCantidad(0, 1);
    expect(useCartStore.getState().items.map((i) => i.cantidad)).toEqual([3, 1]);
  });

  it('sin stock informado no hay tope', () => {
    useCartStore.getState().addItem({ nombre: 'Jean Ancla (XL)', precio: 62999, cantidad: 1 });
    expect(margenDeStock(useCartStore.getState().items, 0)).toBe(Infinity);
  });
});

describe('sincronizarStock', () => {
  const remera = (talle: string, cantidad: number) => ({
    nombre: `REMERA BOXY FIT (${talle})`,
    precio: 34000,
    cantidad,
    productoId: 'p1',
    fuente: 'plataforma' as const,
    talle,
    maximo: 4,
  });
  const jean = { nombre: 'Jean Ancla (XL)', precio: 62999, cantidad: 1, fuente: 'local' as const };
  const vivo = (cambios: Partial<StockVivo> = {}): StockVivo => ({
    precio: 34000,
    unidades: 4,
    disponible: true,
    ...cambios,
  });
  const resumen = () => useCartStore.getState().items.map((i) => `${i.nombre} x${i.cantidad}`);

  it('si otra compra descontó stock, achica los últimos renglones', () => {
    const s = useCartStore.getState();
    s.addItem(remera('M', 2));
    s.addItem(remera('L', 2));
    const cambios = s.sincronizarStock(new Map([['p1', vivo({ unidades: 3 })]]), true);
    expect(resumen()).toEqual(['REMERA BOXY FIT (M) x2', 'REMERA BOXY FIT (L) x1']);
    expect(useCartStore.getState().items.every((i) => i.maximo === 3)).toBe(true);
    expect(cambios).toEqual({ quitados: [], achicados: ['REMERA BOXY FIT (L)'], precios: [] });
    // Queda guardado para la próxima visita.
    expect(JSON.parse(localStorage.getItem('carrito') || '[]')[1].cantidad).toBe(1);
  });

  it('saca lo agotado, lo despublicado y lo que no está en la app', () => {
    const s = useCartStore.getState();
    s.addItem(remera('M', 1));
    s.addItem({ ...remera('S', 1), nombre: 'Buzo (S)', productoId: 'p2' });
    s.addItem(jean);
    s.addItem({ ...remera('L', 1), nombre: 'REMERA BOXY FIT (L)' });
    const cambios = s.sincronizarStock(new Map([['p1', vivo({ unidades: 0 })]]), true);
    expect(resumen()).toEqual([]);
    expect(cambios.quitados).toEqual([
      'REMERA BOXY FIT (M)',
      'Buzo (S)',
      'Jean Ancla (XL)',
      'REMERA BOXY FIT (L)',
    ]);
  });

  it('conserva lo que sigue en la app y saca el carrito viejo', () => {
    const s = useCartStore.getState();
    s.addItem(jean);
    s.addItem(remera('M', 1));
    s.sincronizarStock(new Map([['p1', vivo()]]), true);
    expect(resumen()).toEqual(['REMERA BOXY FIT (M) x1']);
  });

  it('no saca lo que falta si la lista vino incompleta', () => {
    const s = useCartStore.getState();
    s.addItem(remera('M', 1));
    s.addItem(jean);
    s.sincronizarStock(new Map(), false);
    expect(resumen()).toEqual(['REMERA BOXY FIT (M) x1', 'Jean Ancla (XL) x1']);
  });

  it('actualiza el precio y el tope, y avisa solo si cambió algo visible', () => {
    const s = useCartStore.getState();
    s.addItem(remera('M', 1));
    const conPrecioNuevo = s.sincronizarStock(new Map([['p1', vivo({ precio: 36000, unidades: 9 })]]), true);
    expect(conPrecioNuevo.precios).toEqual(['REMERA BOXY FIT (M)']);
    expect(useCartStore.getState().items[0]).toMatchObject({ precio: 36000, maximo: 9 });
    const igual = s.sincronizarStock(new Map([['p1', vivo({ precio: 36000, unidades: 9 })]]), true);
    expect(igual).toEqual({ quitados: [], achicados: [], precios: [] });
  });
});

describe('eliminarProducto y vaciarCarrito', () => {
  it('elimina por índice', () => {
    const s = useCartStore.getState();
    s.addItem({ nombre: 'A', precio: 100, cantidad: 1 });
    s.addItem({ nombre: 'B', precio: 200, cantidad: 1 });
    s.eliminarProducto(0);
    expect(useCartStore.getState().items.map((i) => i.nombre)).toEqual(['B']);
  });

  it('vacía el carrito y limpia el cupón', async () => {
    const s = useCartStore.getState();
    s.addItem({ nombre: 'A', precio: 100, cantidad: 1 });
    await s.aplicarCupon('KODA10');
    useCartStore.getState().vaciarCarrito();
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.cupon).toBeNull();
  });
});

describe('aplicarCupon', () => {
  it('aplica un cupón válido (case-insensitive)', async () => {
    await useCartStore.getState().aplicarCupon('koda10');
    const s = useCartStore.getState();
    expect(s.cupon?.codigo).toBe('KODA10');
    expect(s.cuponMsg?.type).toBe('ok');
  });

  it('rechaza un código inválido', async () => {
    await useCartStore.getState().aplicarCupon('NOEXISTE');
    const s = useCartStore.getState();
    expect(s.cupon).toBeNull();
    expect(s.cuponMsg?.type).toBe('error');
  });

  it('rechaza un cupón vencido', async () => {
    await useCartStore.getState().aplicarCupon('VENCIDO');
    expect(useCartStore.getState().cuponMsg?.text).toContain('vencido');
  });
});

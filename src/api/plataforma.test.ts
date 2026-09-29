import { afterEach, describe, expect, it, vi } from 'vitest';
import { ErrorPlataforma, obtenerCatalogoPlataforma, registrarPedido } from './plataforma';

/** Respuesta real de /tienda/bykoda/productos.json (28/09/2026). */
const RESPUESTA_REAL = {
  negocio: 'BYKODA',
  whatsapp: '5493492301333',
  productos: [
    {
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
    },
  ],
};

function respuesta(cuerpo: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => cuerpo } as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('obtenerCatalogoPlataforma', () => {
  it('lee el catálogo real de BYKODA', async () => {
    const fetchMock = vi.fn(async () => respuesta(RESPUESTA_REAL));
    vi.stubGlobal('fetch', fetchMock);

    const catalogo = await obtenerCatalogoPlataforma('bykoda');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://visual-app-licencias.visual-app-licencias.workers.dev/tienda/bykoda/productos.json',
      expect.objectContaining({ cache: 'no-cache' }),
    );
    expect(catalogo.negocio).toBe('BYKODA');
    expect(catalogo.productos).toHaveLength(1);
    expect(catalogo.productos[0]).toMatchObject({ nombre: 'REMERA BOXY FIT', precio: 34000, stock: 4 });
    expect(catalogo.descartados).toBe(0);
  });

  it('descarta solo el producto mal cargado, no el catálogo entero', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        respuesta({
          ...RESPUESTA_REAL,
          productos: [...RESPUESTA_REAL.productos, { id: 'roto', nombre: '', precio: 'gratis' }],
        }),
      ),
    );

    const catalogo = await obtenerCatalogoPlataforma('bykoda');
    expect(catalogo.productos).toHaveLength(1);
    expect(catalogo.descartados).toBe(1);
    warn.mockRestore();
  });

  it('falla con un error claro si la tienda no responde bien', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => respuesta({}, 503)));
    await expect(obtenerCatalogoPlataforma('bykoda')).rejects.toThrow(ErrorPlataforma);
  });
});

describe('registrarPedido', () => {
  const pedido = {
    cliente: 'Lucas Pérez',
    telefono: '3492 123456',
    entrega: 'envio' as const,
    direccion: 'Belgrano 1234, Rafaela, Santa Fe (CP 2300), Argentina',
    notas: 'Email: lucas@mail.com',
    items: [{ id: '896fd3b4b05842368e808340726cf8a8', cantidad: 1 }],
  };

  it('manda el pedido con el campo trampa vacío y devuelve el número', async () => {
    const fetchMock = vi.fn(async () => respuesta({ numero: 57, total: 34000 }));
    vi.stubGlobal('fetch', fetchMock);

    const resultado = await registrarPedido(pedido, 'bykoda');

    expect(resultado).toEqual({ numero: '57', total: 34000 });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://visual-app-licencias.visual-app-licencias.workers.dev/tienda/bykoda/pedido');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ ...pedido, sitio: '' });
  });

  it('muestra el mensaje de la tienda cuando rechaza el pedido', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => respuesta({ error: 'No hay stock suficiente de REMERA BOXY FIT.' }, 409)));
    await expect(registrarPedido(pedido, 'bykoda')).rejects.toThrow('No hay stock suficiente de REMERA BOXY FIT.');
  });

  it('avisa si no hay conexión', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      }),
    );
    await expect(registrarPedido(pedido, 'bykoda')).rejects.toThrow(/No pudimos conectarnos/);
  });
});

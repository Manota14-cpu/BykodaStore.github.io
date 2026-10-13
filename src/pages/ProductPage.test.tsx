import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductPage } from './ProductPage';
import { useCartStore } from '../store/cart';

const PRENDA = { id: 'a1b2c3d4e5f6', nombre: 'HOODIE KODA' };
const variante = (id: string, color: string, talle: string, stock: number) => ({
  id,
  nombre: `HOODIE KODA ${color} ${talle}`,
  categoria: 'Buzos',
  precio: 52000,
  porPeso: false,
  unidad: 'unidad',
  disponible: stock > 0,
  stock,
  imagen: null,
  imagenes: [],
  prenda: PRENDA,
  talle,
  color,
});

/** Como publica Visual App una prenda con talles y colores: una combinación por producto. */
const CATALOGO = {
  negocio: 'BYKODA',
  whatsapp: '5493492301333',
  productos: [
    variante('v-negro-m', 'Negro', 'M', 0),
    variante('v-negro-l', 'Negro', 'L', 5),
    variante('v-gris-m', 'Gris', 'M', 2),
  ],
};

function renderFicha() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/producto/hoodie-koda-a1b2c3']}>
        <Routes>
          <Route path="/producto/:id" element={<ProductPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  useCartStore.setState({ items: [], cupon: null, cuponMsg: null });
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, status: 200, json: async () => CATALOGO }) as Response),
  );
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ProductPage con talles y colores de la plataforma', () => {
  it('ofrece solo las combinaciones cargadas y tacha las que no tienen stock', async () => {
    const user = userEvent.setup();
    renderFicha();

    const talles = await screen.findByRole('group', { name: 'Elegí tu talle' });
    expect([...talles.querySelectorAll('button')].map((b) => b.textContent)).toEqual(['M', 'L']);
    // Sin color elegido, M está disponible porque queda en gris.
    expect(screen.getByRole('button', { name: 'M' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Negro' }));
    expect(screen.getByRole('button', { name: 'M' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'L' })).toBeEnabled();
  });

  it('agrega la combinación elegida con su id y su stock', async () => {
    const user = userEvent.setup();
    renderFicha();

    await user.click(await screen.findByRole('button', { name: 'Agregar al carrito' }));
    expect(screen.getByText('Elegí un color para continuar.')).toBeInTheDocument();
    expect(useCartStore.getState().items).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: 'Negro' }));
    await user.click(screen.getByRole('button', { name: 'L' }));
    await user.click(screen.getByRole('button', { name: 'Agregar al carrito' }));

    expect(useCartStore.getState().items).toEqual([
      expect.objectContaining({
        nombre: 'HOODIE KODA (Negro · L)',
        productoId: 'v-negro-l',
        variante: 'Negro · L',
        talle: 'L',
        maximo: 5,
        precio: 52000,
        fuente: 'plataforma',
      }),
    ]);
  });

  it('si cambia a un color sin ese talle, pide elegir el talle de nuevo', async () => {
    const user = userEvent.setup();
    renderFicha();

    await user.click(await screen.findByRole('button', { name: 'Gris' }));
    await user.click(screen.getByRole('button', { name: 'M' }));
    expect(screen.getByRole('button', { name: 'M' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'Negro' }));
    expect(screen.getByRole('button', { name: 'M' })).toHaveAttribute('aria-pressed', 'false');
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartPage } from './CartPage';
import { useCartStore } from '../store/cart';
import { __resetCupones } from '../api/local';

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  __resetCupones();
  useCartStore.setState({ items: [], cupon: null, cuponMsg: null });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('CartPage', () => {
  it('muestra el estado vacío', () => {
    renderPage();
    expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument();
  });

  it('renderiza items, ajusta cantidad y elimina', async () => {
    const user = userEvent.setup();
    useCartStore
      .getState()
      .addItem({
        nombre: 'Hoodie KODA (M)',
        precio: 30000,
        cantidad: 2,
        imgSrc: '/x.webp',
      });
    renderPage();

    expect(screen.getByText('Hoodie KODA (M)')).toBeInTheDocument();
    expect(screen.getAllByText('$60.000').length).toBeGreaterThan(0);

    await user.click(screen.getAllByRole('button', { name: 'Agregar una unidad' })[0]);
    expect(screen.getAllByText('$90.000').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: /eliminar/i }));
    expect(await screen.findByText('Tu carrito está vacío')).toBeInTheDocument();
  });

  it('aplica un cupón válido y muestra el descuento', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          cupones: [
            {
              codigo: 'KODA10',
              descuento: 10,
              activo: true,
              usos_max: -1,
              usos: 0,
              vence: null,
            },
          ],
        }),
      })),
    );
    const user = userEvent.setup();
    useCartStore
      .getState()
      .addItem({ nombre: 'Hoodie (M)', precio: 30000, cantidad: 1 });
    renderPage();

    await user.type(screen.getByLabelText('¿Tenés un cupón?'), 'koda10');
    await user.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(await screen.findByText(/Cupón "KODA10" aplicado/)).toBeInTheDocument();
    expect(screen.getByText('$27.000')).toBeInTheDocument();
    expect(screen.getByText(/−\$3\.000/)).toBeInTheDocument();
  });

  it('muestra error para un cupón inválido', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ cupones: [] }),
      })),
    );
    const user = userEvent.setup();
    useCartStore
      .getState()
      .addItem({ nombre: 'Hoodie (M)', precio: 30000, cantidad: 1 });
    renderPage();

    await user.type(screen.getByLabelText('¿Tenés un cupón?'), 'XYZ');
    await user.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(await screen.findByText('Código inválido o inactivo.')).toBeInTheDocument();
  });
});

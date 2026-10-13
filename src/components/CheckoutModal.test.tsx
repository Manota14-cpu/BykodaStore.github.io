import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CheckoutModal } from './CheckoutModal';
import { AvisoPago } from './AvisoPago';
import { useCartStore } from '../store/cart';
import { irA } from '../lib/navegar';
import type { Cupon } from '../types';

vi.mock('../lib/navegar', () => ({ irA: vi.fn() }));

const LINK_MP = 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=123-abc';
const HOODIE = {
  nombre: 'HOODIE KODA (Negro · L)',
  precio: 52000,
  cantidad: 1,
  productoId: 'v-negro-l',
  fuente: 'plataforma' as const,
  talle: 'L',
  variante: 'Negro · L',
  maximo: 5,
};

function stubPlataforma({ mercadopago }: { mercadopago: boolean }) {
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    const cuerpo =
      init?.method === 'POST'
        ? { numero: 58, total: 52000, pagar: LINK_MP }
        : { negocio: 'BYKODA', whatsapp: null, mercadopago, productos: [] };
    void url;
    return { ok: true, status: 200, json: async () => cuerpo } as Response;
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function renderCheckout() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <CheckoutModal open onClose={() => {}} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function completarDatos(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^Nombre/), 'Lucas');
  await user.type(screen.getByLabelText(/^Apellido/), 'Pérez');
  await user.type(screen.getByLabelText(/^Correo electrónico/), 'lucas@mail.com');
  await user.type(screen.getByLabelText(/^Número de teléfono/), '3492 123456');
  await user.type(screen.getByLabelText(/^Dirección/), 'Belgrano 1234');
  await user.type(screen.getByLabelText(/^Ciudad/), 'Rafaela');
  await user.selectOptions(screen.getByLabelText(/^Provincia/), 'Santa Fe');
}

beforeEach(() => {
  localStorage.clear();
  vi.mocked(irA).mockClear();
  useCartStore.setState({ items: [HOODIE], cupon: null, cuponMsg: null });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('CheckoutModal con Mercado Pago', () => {
  it('registra el pedido con Mercado Pago y lleva a pagar', async () => {
    const user = userEvent.setup();
    const fetchMock = stubPlataforma({ mercadopago: true });
    const abrir = vi.spyOn(window, 'open');
    renderCheckout();

    expect(await screen.findByRole('radio', { name: /Mercado Pago/ })).toBeChecked();
    await completarDatos(user);
    await user.click(screen.getByRole('button', { name: 'Pagar con Mercado Pago' }));

    expect(await screen.findByText(/Te llevamos a Mercado Pago/)).toBeInTheDocument();
    const post = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST')!;
    expect(JSON.parse(post[1]!.body as string)).toMatchObject({
      pago: 'mercadopago',
      vuelta: `${window.location.origin}/`,
      items: [{ id: 'v-negro-l', cantidad: 1 }],
    });
    expect(irA).toHaveBeenCalledWith(LINK_MP);
    // No se abre la pestaña de WhatsApp.
    expect(abrir).not.toHaveBeenCalled();
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(JSON.parse(localStorage.getItem('koda_pago_mp')!)).toMatchObject({ numero: '58', total: 52000 });
    abrir.mockRestore();
  });

  it('con cupón, Mercado Pago no se puede elegir y sigue por WhatsApp', async () => {
    stubPlataforma({ mercadopago: true });
    const cupon: Cupon = { codigo: 'KODA10', descuento: 10, activo: true, usos_max: -1, usos: 0, vence: null };
    useCartStore.setState({ cupon });
    renderCheckout();

    expect(await screen.findByRole('radio', { name: /Mercado Pago/ })).toBeDisabled();
    expect(screen.getByText(/Con cupón, el pago se coordina por WhatsApp/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar pedido por WhatsApp' })).toBeInTheDocument();
  });

  it('sin Mercado Pago conectado, todo sigue como antes', async () => {
    stubPlataforma({ mercadopago: false });
    renderCheckout();

    expect(await screen.findByRole('button', { name: 'Enviar pedido por WhatsApp' })).toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });
});

describe('AvisoPago', () => {
  function renderVuelta(search: string) {
    return render(
      <MemoryRouter initialEntries={[`/${search}`]}>
        <AvisoPago />
      </MemoryRouter>,
    );
  }

  it('al volver con el pago aprobado, avisa con el número de pedido', () => {
    localStorage.setItem('koda_pago_mp', JSON.stringify({ numero: '58', total: 52000, guardado: Date.now() }));
    renderVuelta('?collection_status=approved&status=approved&preference_id=1-2&external_reference=abc');

    expect(screen.getByRole('heading', { name: '¡Pago aprobado!' })).toBeInTheDocument();
    expect(screen.getByText(/pedido #58/)).toBeInTheDocument();
    expect(localStorage.getItem('koda_pago_mp')).toBeNull();
  });

  it('si no pagó, ofrece seguir por WhatsApp', () => {
    renderVuelta('?collection_status=null&status=null&preference_id=1-2');

    expect(screen.getByRole('heading', { name: 'El pago no se completó' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Escribir por WhatsApp/ })).toHaveAttribute(
      'href',
      expect.stringContaining('https://wa.me/'),
    );
  });

  it('no aparece en una visita normal', () => {
    renderVuelta('');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

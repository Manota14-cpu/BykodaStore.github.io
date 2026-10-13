import { beforeEach, describe, expect, it } from 'vitest';
import {
  guardarPagoEnCurso,
  leerPagoEnCurso,
  leerVueltaDePago,
  olvidarPagoEnCurso,
  sinParametrosDeVuelta,
} from './pagoMercadoPago';

/** Lo que agrega Mercado Pago a la página de vuelta. */
const vuelta = (estado: string) =>
  `?collection_id=123&collection_status=${estado}&payment_id=123&status=${estado}&external_reference=abc&payment_type=credit_card&merchant_order_id=9&preference_id=1-2&site_id=MLA&processing_mode=aggregator&merchant_account_id=null`;

beforeEach(() => localStorage.clear());

describe('leerVueltaDePago', () => {
  it('reconoce el estado del pago', () => {
    expect(leerVueltaDePago(vuelta('approved'))).toBe('aprobado');
    expect(leerVueltaDePago(vuelta('in_process'))).toBe('pendiente');
    expect(leerVueltaDePago(vuelta('pending'))).toBe('pendiente');
    expect(leerVueltaDePago(vuelta('rejected'))).toBe('fallido');
    // El cliente volvió sin pagar.
    expect(leerVueltaDePago(vuelta('null'))).toBe('fallido');
  });

  it('no hace nada fuera de una vuelta de Mercado Pago', () => {
    expect(leerVueltaDePago('')).toBeNull();
    expect(leerVueltaDePago('?checkout=1')).toBeNull();
  });
});

describe('sinParametrosDeVuelta', () => {
  it('saca lo de Mercado Pago y deja el resto', () => {
    expect(sinParametrosDeVuelta(vuelta('approved'))).toBe('');
    expect(sinParametrosDeVuelta(`${vuelta('approved')}&checkout=1`)).toBe('?checkout=1');
  });
});

describe('pago en curso', () => {
  it('recuerda el pedido que se está pagando hasta que se avisa', () => {
    guardarPagoEnCurso({ numero: '58', total: 52000 });
    expect(leerPagoEnCurso()).toEqual({ numero: '58', total: 52000 });
    olvidarPagoEnCurso();
    expect(leerPagoEnCurso()).toEqual({});
  });

  it('ignora uno viejo', () => {
    localStorage.setItem('koda_pago_mp', JSON.stringify({ numero: '1', guardado: Date.now() - 3 * 86_400_000 }));
    expect(leerPagoEnCurso()).toEqual({});
  });
});

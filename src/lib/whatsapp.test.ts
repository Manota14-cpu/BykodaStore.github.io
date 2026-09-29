import { describe, expect, it } from 'vitest';
import type { CartItem, Cupon } from '../types';
import {
  calcularTotales,
  construirMensajeConsulta,
  construirMensajePedido,
  construirURLConsultaProducto,
  construirURLPedidoWhatsApp,
  generarReferencia,
} from './whatsapp';
import { PEDIDO_FORM_VACIO, type PedidoForm } from './pedido';

const cupon: Cupon = {
  codigo: 'KODA10',
  descuento: 10,
  activo: true,
  usos_max: -1,
  usos: 0,
  vence: null,
};

const form: PedidoForm = {
  ...PEDIDO_FORM_VACIO,
  nombre: 'Lucas',
  apellido: 'Pérez',
  email: 'lucas@mail.com',
  telefono: '3492 123456',
  direccion: 'Belgrano 1234',
  ciudad: 'Rafaela',
  provincia: 'Santa Fe',
  pais: 'Argentina',
  codigoPostal: '2300',
};

const REF = 'KD-0101-TEST';

describe('construirMensajePedido', () => {
  it('incluye todos los datos del cliente y del envío', () => {
    const items: CartItem[] = [
      { nombre: 'Hoodie KODA (M)', precio: 30000, cantidad: 2 },
    ];
    const msg = construirMensajePedido(items, null, { ...form, nota: 'Timbre 2' }, REF);

    expect(msg).toContain('Ref. KD-0101-TEST');
    expect(msg).toContain('Nombre: Lucas Pérez');
    expect(msg).toContain('Email: lucas@mail.com');
    expect(msg).toContain('Teléfono: 3492 123456');
    expect(msg).toContain('Dirección: Belgrano 1234');
    expect(msg).toContain('Ciudad / Provincia: Rafaela, Santa Fe');
    expect(msg).toContain('Código postal: 2300');
    expect(msg).toContain('País: Argentina');
    expect(msg).toContain('• Hoodie KODA (M) × 2 — $30.000 c/u · $60.000');
    expect(msg).toContain('💰 *TOTAL: $60.000*');
    expect(msg).toContain('📝 *Nota:* Timbre 2');
  });

  it('omite el código postal cuando está vacío', () => {
    const items: CartItem[] = [{ nombre: 'Remera (S)', precio: 1000, cantidad: 1 }];
    const msg = construirMensajePedido(items, null, { ...form, codigoPostal: '' }, REF);
    expect(msg).not.toContain('Código postal');
  });

  it('aplica el descuento del cupón sobre el subtotal', () => {
    const items: CartItem[] = [
      { nombre: 'Hoodie KODA (M)', precio: 30000, cantidad: 2 },
    ];
    const msg = construirMensajePedido(items, cupon, form, REF);
    expect(msg).toContain('Subtotal: $60.000');
    expect(msg).toContain('🏷️ Cupón KODA10: −$6.000 (10% off)');
    expect(msg).toContain('💰 *TOTAL: $54.000*');
  });

  it('marca como "A consultar" los items sin precio', () => {
    const items: CartItem[] = [{ nombre: 'Pieza única', precio: 0, cantidad: 1 }];
    const msg = construirMensajePedido(items, null, form, REF);
    expect(msg).toContain('• Pieza única × 1 — A consultar');
    expect(msg).toContain('💰 *TOTAL: A consultar*');
  });

  it('avisa cuando hay items a consultar mezclados con items con precio', () => {
    const items: CartItem[] = [
      { nombre: 'Hoodie KODA (M)', precio: 30000, cantidad: 1 },
      { nombre: 'Pieza única', precio: 0, cantidad: 1 },
    ];
    const msg = construirMensajePedido(items, null, form, REF);
    expect(msg).toContain('💰 *TOTAL: $30.000*');
    expect(msg).toContain('artículos a consultar no incluidos en el total');
  });
});

describe('número de pedido de la plataforma', () => {
  it('encabeza el mensaje cuando la plataforma registró el pedido', () => {
    const items: CartItem[] = [{ nombre: 'REMERA BOXY FIT (M)', precio: 34000, cantidad: 1 }];
    const msg = construirMensajePedido(items, null, form, REF, '57');
    expect(msg).toContain('Pedido web #57 · Ref. KD-0101-TEST');
  });
});

describe('calcularTotales', () => {
  it('descuenta el cupón y nunca devuelve un total negativo', () => {
    const items: CartItem[] = [{ nombre: 'X', precio: 100, cantidad: 1 }];
    expect(calcularTotales(items, cupon)).toEqual({
      subtotal: 100,
      descuento: 10,
      total: 90,
      hayConsulta: false,
    });
  });
});

describe('generarReferencia', () => {
  it('usa el formato KD-DDMM-XXXX', () => {
    expect(generarReferencia(new Date(2026, 0, 5))).toMatch(/^KD-0501-[A-Z0-9]{4}$/);
  });
});

describe('construirURLPedidoWhatsApp', () => {
  it('arma una URL de wa.me encodeada', () => {
    const items: CartItem[] = [
      { nombre: 'Hoodie KODA (M)', precio: 30000, cantidad: 1 },
    ];
    const url = construirURLPedidoWhatsApp(items, null, form, REF);
    expect(url).toMatch(/^https:\/\/wa\.me\/5493492301333\?text=/);
    expect(decodeURIComponent(url)).toContain('NUEVO PEDIDO — BYKODA');
  });
});

describe('construirURLConsultaProducto', () => {
  it('incluye producto, talle y link', () => {
    const url = construirURLConsultaProducto({
      nombre: 'Jean Ancla',
      precio: 62999,
      talle: 'L',
      cantidad: 2,
      url: 'https://www.bykoda.store/producto/jean-ancla',
    });
    const texto = decodeURIComponent(url.split('text=')[1]);
    expect(texto).toContain('Producto: *Jean Ancla*');
    expect(texto).toContain('Talle: L');
    expect(texto).toContain('Cantidad: 2');
    expect(texto).toContain('Precio: $62.999');
    expect(texto).toContain('https://www.bykoda.store/producto/jean-ancla');
  });
});

describe('construirMensajeConsulta', () => {
  it('incluye nombre, teléfono y tema', () => {
    const msg = construirMensajeConsulta(
      'Lucas',
      '3492 123456',
      'Guía de talles',
      '¿Hay XL?',
    );
    expect(msg).toContain('👤 *Nombre:* Lucas');
    expect(msg).toContain('📌 *Tema:* Guía de talles');
    expect(msg).toContain('¿Hay XL?');
  });
});

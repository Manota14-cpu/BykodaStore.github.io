import { describe, expect, it } from 'vitest';
import type { CartItem, Cupon } from '../types';
import { fmtMoneda } from './format';
import {
  armarPedidoPlataforma,
  direccionCompleta,
  PEDIDO_FORM_VACIO,
  validarPedido,
  type PedidoForm,
} from './pedido';

const completo: PedidoForm = {
  nombre: 'Lucas',
  apellido: 'Pérez',
  email: 'lucas@mail.com',
  telefono: '3492 123456',
  direccion: 'Belgrano 1234',
  ciudad: 'Rafaela',
  provincia: 'Santa Fe',
  pais: 'Argentina',
  codigoPostal: '',
  nota: '',
};

describe('validarPedido', () => {
  it('no devuelve errores con todos los datos cargados', () => {
    expect(validarPedido(completo)).toEqual({});
  });

  it('marca todos los campos obligatorios vacíos', () => {
    const errores = validarPedido(PEDIDO_FORM_VACIO);
    expect(Object.keys(errores).sort()).toEqual([
      'apellido',
      'ciudad',
      'direccion',
      'email',
      'nombre',
      'provincia',
      'telefono',
    ]);
  });

  it('no exige código postal ni nota', () => {
    const errores = validarPedido({ ...completo, codigoPostal: '', nota: '' });
    expect(errores.codigoPostal).toBeUndefined();
    expect(errores.nota).toBeUndefined();
  });

  it('rechaza correos mal formados', () => {
    expect(validarPedido({ ...completo, email: 'lucas@mail' }).email).toBeDefined();
    expect(validarPedido({ ...completo, email: 'lucas.mail.com' }).email).toBeDefined();
    expect(validarPedido({ ...completo, email: 'l@m.ar' }).email).toBeUndefined();
  });

  it('rechaza teléfonos con menos de 8 dígitos', () => {
    expect(validarPedido({ ...completo, telefono: '1234' }).telefono).toBeDefined();
    // Los separadores no cuentan como dígitos.
    expect(
      validarPedido({ ...completo, telefono: '(3492) 15-123456' }).telefono,
    ).toBeUndefined();
  });

  it('ignora los valores que son solo espacios', () => {
    expect(validarPedido({ ...completo, ciudad: '   ' }).ciudad).toBeDefined();
  });
});

describe('armarPedidoPlataforma', () => {
  const remera = (talle: string, cantidad: number): CartItem => ({
    nombre: `REMERA BOXY FIT (${talle})`,
    precio: 34000,
    cantidad,
    productoId: '896fd3b4b05842368e808340726cf8a8',
    fuente: 'plataforma',
    talle,
  });
  const jeanLocal: CartItem = { nombre: 'Jean Ancla (M)', precio: 62999, cantidad: 1, productoId: 'jean-ancla', fuente: 'local', talle: 'M' };
  const cupon: Cupon = { codigo: 'KODA10', descuento: 10, activo: true, usos_max: -1, usos: 0, vence: null };

  it('devuelve null si no hay nada de la plataforma', () => {
    expect(armarPedidoPlataforma(completo, [jeanLocal], null)).toBeNull();
  });

  it('suma los talles de un mismo producto en un solo renglón y los anota', () => {
    const pedido = armarPedidoPlataforma({ ...completo, nota: 'Timbre 2' }, [remera('M', 1), remera('L', 2), jeanLocal], cupon);
    expect(pedido).not.toBeNull();
    expect(pedido!.items).toEqual([{ id: '896fd3b4b05842368e808340726cf8a8', cantidad: 3 }]);
    expect(pedido!.cliente).toBe('Lucas Pérez');
    expect(pedido!.entrega).toBe('envio');
    expect(pedido!.notas).toContain('Email: lucas@mail.com');
    expect(pedido!.notas).toContain('Talles: REMERA BOXY FIT → M × 1 · REMERA BOXY FIT → L × 2');
    expect(pedido!.notas).toContain('Cupón KODA10 (−10%)');
    expect(pedido!.notas).toContain('Nota: Timbre 2');
  });

  it('anota las prendas que no están en la app y el total a cobrar', () => {
    const pedido = armarPedidoPlataforma(completo, [remera('M', 1), jeanLocal], null, 96999);
    // Solo lo de la plataforma descuenta stock allá.
    expect(pedido!.items).toEqual([{ id: '896fd3b4b05842368e808340726cf8a8', cantidad: 1 }]);
    expect(pedido!.notas).toContain(
      `También pidió (catálogo anterior, no está en la app): Jean Ancla (M) × 1 (${fmtMoneda(62999)})`,
    );
    expect(pedido!.notas).toContain(`Total a cobrar: ${fmtMoneda(96999)}`);
  });

  it('con cupón anota el total aunque todo sea de la plataforma', () => {
    const pedido = armarPedidoPlataforma(completo, [remera('M', 1)], cupon, 30600);
    expect(pedido!.notas).toContain(`Total a cobrar: ${fmtMoneda(30600)}`);
    expect(pedido!.notas).not.toContain('También pidió');
  });

  it('sin prendas de afuera ni cupón, el total es el de la plataforma', () => {
    const pedido = armarPedidoPlataforma(completo, [remera('M', 1)], null, 34000);
    expect(pedido!.notas).not.toContain('Total a cobrar');
  });

  it('resume en WhatsApp si hay muchas prendas de afuera', () => {
    const muchos = Array.from({ length: 8 }, (_, i) => ({ ...jeanLocal, nombre: `Jean ${i} (M)` }));
    const pedido = armarPedidoPlataforma(completo, [remera('M', 1), ...muchos], null, 1);
    expect(pedido!.notas).toContain('Jean 5 (M)');
    expect(pedido!.notas).not.toContain('Jean 6 (M)');
    expect(pedido!.notas).toContain('y 2 más (detalle en WhatsApp)');
  });
});

describe('direccionCompleta', () => {
  it('arma una sola línea con código postal', () => {
    expect(direccionCompleta({ ...completo, codigoPostal: '2300' })).toBe(
      'Belgrano 1234, Rafaela, Santa Fe (CP 2300), Argentina',
    );
  });
});

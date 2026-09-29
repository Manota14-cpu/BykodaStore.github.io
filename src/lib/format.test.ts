import { describe, expect, it } from 'vitest';
import { fmtMoneda, fmtPrecio, normalizeImg, pctOff } from './format';

describe('fmtPrecio', () => {
  it('formatea con separador de miles es-AR', () => {
    expect(fmtPrecio(12345)).toBe('12.345');
  });

  it('formatea cero', () => {
    expect(fmtPrecio(0)).toBe('0');
  });
});

describe('pctOff', () => {
  it('calcula el porcentaje de descuento redondeado', () => {
    expect(pctOff(1000, 750)).toBe(25);
  });
});

describe('normalizeImg', () => {
  it('deja intactas las rutas absolutas', () => {
    expect(normalizeImg('https://x.com/a.webp')).toBe('https://x.com/a.webp');
  });

  it('deja intactas las rutas que ya empiezan con /', () => {
    expect(normalizeImg('/imagenes/a.webp')).toBe('/imagenes/a.webp');
  });

  it('prefija rutas relativas con /imagenes/', () => {
    expect(normalizeImg('a.webp')).toBe('/imagenes/a.webp');
    expect(normalizeImg('imagenes/a.webp')).toBe('/imagenes/a.webp');
  });

  it('maneja valores vacíos', () => {
    expect(normalizeImg('')).toBe('');
    expect(normalizeImg(undefined)).toBe('');
  });
});

describe('fmtMoneda', () => {
  it('agrega el símbolo y separadores es-AR', () => {
    expect(fmtMoneda(62999)).toBe('$62.999');
  });
});

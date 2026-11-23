import { describe, expect, it } from 'vitest';
import {
  construirMensajeArrepentimiento,
  generarCodigoArrepentimiento,
  urlArrepentimientoMail,
  urlArrepentimientoWhatsApp,
  type SolicitudArrepentimiento,
} from './arrepentimiento';

const SOLICITUD: SolicitudArrepentimiento = {
  nombre: 'Ana Gómez',
  email: 'ana@mail.com',
  telefono: '3492 123456',
  pedido: '58',
  fechaRecepcion: '2026-11-20',
  detalle: 'Remera básica talle L',
};

describe('botón de arrepentimiento', () => {
  it('genera un código con la fecha', () => {
    expect(generarCodigoArrepentimiento(new Date(2026, 10, 23))).toMatch(/^ARR-2311-[0-9A-Z]{5}$/);
  });

  it('el mensaje incluye el código, los datos y la fecha legible', () => {
    const texto = construirMensajeArrepentimiento(SOLICITUD, 'ARR-2311-ABCDE');
    expect(texto).toContain('Solicitud ARR-2311-ABCDE');
    expect(texto).toContain('Pedido: 58');
    expect(texto).toContain('Recibido el: 20/11/2026');
    expect(texto).toContain('Prendas / comentario: Remera básica talle L');
  });

  it('omite los campos opcionales vacíos', () => {
    const texto = construirMensajeArrepentimiento(
      { ...SOLICITUD, fechaRecepcion: '', detalle: '' },
      'ARR-1',
    );
    expect(texto).not.toContain('Recibido el');
    expect(texto).not.toContain('Prendas');
  });

  it('arma los links de WhatsApp y de mail', () => {
    expect(urlArrepentimientoWhatsApp(SOLICITUD, 'ARR-1')).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
    const mail = urlArrepentimientoMail(SOLICITUD, 'ARR-1', 'admin@bykoda.store');
    expect(mail).toMatch(/^mailto:admin@bykoda\.store\?subject=/);
    expect(decodeURIComponent(mail)).not.toContain('*');
  });
});

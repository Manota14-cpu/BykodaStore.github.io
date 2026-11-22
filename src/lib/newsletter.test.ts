import { afterEach, describe, expect, it, vi } from 'vitest';
import { newsletterConectado, suscribirEmail, urlSuscripcionWhatsApp } from './newsletter';

const CONFIG = {
  formulario: 'https://docs.google.com/forms/d/e/abc/formResponse',
  campoEmail: 'entry.123456789',
};

afterEach(() => vi.unstubAllGlobals());

describe('newsletter', () => {
  it('solo se considera conectado con un Google Form y su campo', () => {
    expect(newsletterConectado({ formulario: '', campoEmail: '' })).toBe(false);
    expect(newsletterConectado({ ...CONFIG, campoEmail: '' })).toBe(false);
    expect(newsletterConectado(CONFIG)).toBe(true);
  });

  it('manda el mail al formulario en el campo configurado', async () => {
    const fetchMock = vi.fn(async () => new Response(null));
    vi.stubGlobal('fetch', fetchMock);
    await suscribirEmail('ana@mail.com', CONFIG);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, opciones] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(CONFIG.formulario);
    expect(opciones.mode).toBe('no-cors');
    expect(String(opciones.body)).toBe('entry.123456789=ana%40mail.com');
  });

  it('sin formulario, arma el mensaje de WhatsApp con el mail', () => {
    const url = urlSuscripcionWhatsApp('ana@mail.com');
    expect(url).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
    expect(decodeURIComponent(url)).toContain('Mi mail: ana@mail.com');
  });
});

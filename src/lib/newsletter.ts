import { NEWSLETTER } from '@/config/newsletter';
import { WA_NUMBER } from './whatsapp';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export function newsletterConectado(config = NEWSLETTER): boolean {
  return config.formulario.startsWith('https://docs.google.com/forms/') && config.campoEmail.startsWith('entry.');
}

/** Mensaje para la tienda cuando todavía no hay formulario conectado. */
export function urlSuscripcionWhatsApp(email: string): string {
  const texto = `¡Hola! Quiero sumarme a la lista para enterarme primero del próximo drop de BYKODA 🙌\nMi mail: ${email}`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(texto)}`;
}

/**
 * Manda el mail al Google Form. Google no deja leer la respuesta desde otro
 * dominio (`no-cors`), así que solo se puede detectar un error de red.
 */
export async function suscribirEmail(email: string, config = NEWSLETTER): Promise<void> {
  const datos = new URLSearchParams({ [config.campoEmail]: email });
  await fetch(config.formulario, { method: 'POST', mode: 'no-cors', body: datos });
}

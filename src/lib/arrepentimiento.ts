import { WA_NUMBER } from './whatsapp';

/**
 * Solicitud del Botón de arrepentimiento (Disposición 954/2025): revocación de
 * la compra dentro de los 10 días corridos, sin registración previa. El código
 * identifica la solicitud; la tienda tiene que confirmarlo dentro de las 24 h
 * por el mismo medio.
 */
export interface SolicitudArrepentimiento {
  nombre: string;
  email: string;
  telefono: string;
  pedido: string;
  fechaRecepcion: string;
  detalle: string;
}

export function generarCodigoArrepentimiento(fecha = new Date()): string {
  const dd = String(fecha.getDate()).padStart(2, '0');
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const rnd = Math.random().toString(36).slice(2, 7).toUpperCase().padEnd(5, '0');
  return `ARR-${dd}${mm}-${rnd}`;
}

/** "2026-11-20" → "20/11/2026"; cualquier otra cosa se devuelve tal cual. */
function fechaLegible(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}

export function construirMensajeArrepentimiento(
  s: SolicitudArrepentimiento,
  codigo: string,
): string {
  const lineas = [
    '↩️ *BOTÓN DE ARREPENTIMIENTO — BYKODA*',
    `Solicitud ${codigo}`,
    '━━━━━━━━━━━━━━━━━━━',
    '',
    'Quiero revocar la aceptación de mi compra (art. 34, Ley 24.240).',
    '',
    `Nombre: ${s.nombre}`,
    `Email: ${s.email}`,
    `Teléfono: ${s.telefono}`,
    `Pedido: ${s.pedido}`,
  ];
  if (s.fechaRecepcion) lineas.push(`Recibido el: ${fechaLegible(s.fechaRecepcion)}`);
  if (s.detalle) lineas.push(`Prendas / comentario: ${s.detalle}`);
  lineas.push('', 'Quedo a la espera de la confirmación y de cómo hacer la devolución.');
  return lineas.join('\n');
}

export function urlArrepentimientoWhatsApp(s: SolicitudArrepentimiento, codigo: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(construirMensajeArrepentimiento(s, codigo))}`;
}

export function urlArrepentimientoMail(
  s: SolicitudArrepentimiento,
  codigo: string,
  email: string,
): string {
  const asunto = `Botón de arrepentimiento — ${codigo}`;
  const cuerpo = construirMensajeArrepentimiento(s, codigo).replace(/\*/g, '');
  return `mailto:${email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
}

import type { CartItem, Cupon } from '@/types';
import type { PedidoForm } from './pedido';

export const WA_NUMBER = '5493492301333';
export const WA_TEL_VISIBLE = '+54 3492 301-333';

const SEPARADOR = '━━━━━━━━━━━━━━━━━━━';

function fmt(n: number): string {
  return n.toLocaleString('es-AR');
}

/** Referencia corta y legible para que la tienda pueda citar el pedido. */
export function generarReferencia(fecha = new Date()): string {
  const dd = String(fecha.getDate()).padStart(2, '0');
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `KD-${dd}${mm}-${rnd}`;
}

export interface TotalesPedido {
  subtotal: number;
  descuento: number;
  total: number;
  hayConsulta: boolean;
}

export function calcularTotales(items: CartItem[], cupon: Cupon | null): TotalesPedido {
  const subtotal = items.reduce(
    (sum, i) => (i.precio > 0 ? sum + i.precio * i.cantidad : sum),
    0,
  );
  const descuento =
    cupon && subtotal > 0 ? Math.round((subtotal * cupon.descuento) / 100) : 0;
  return {
    subtotal,
    descuento,
    total: Math.max(0, subtotal - descuento),
    hayConsulta: items.some((i) => i.precio === 0),
  };
}

/**
 * Mensaje completo del pedido: datos del cliente, domicilio de envío, detalle
 * línea por línea, cupón y total. Es el único comprobante que recibe la tienda,
 * así que incluye todo lo necesario para despachar sin repreguntar.
 */
export function construirMensajePedido(
  items: CartItem[],
  cupon: Cupon | null,
  form: PedidoForm,
  referencia = generarReferencia(),
  /** Número que devolvió la plataforma al registrar el pedido, si lo hubo. */
  numeroPedido?: string,
): string {
  const { subtotal, descuento, total, hayConsulta } = calcularTotales(items, cupon);
  const nombreCompleto = [form.nombre, form.apellido].filter(Boolean).join(' ').trim();

  const lineas: string[] = [];
  lineas.push('🛍️ *NUEVO PEDIDO — BYKODA*');
  lineas.push(numeroPedido ? `Pedido web #${numeroPedido} · Ref. ${referencia}` : `Ref. ${referencia}`);
  lineas.push(SEPARADOR, '');

  lineas.push('👤 *DATOS DEL CLIENTE*');
  lineas.push(`Nombre: ${nombreCompleto}`);
  lineas.push(`Email: ${form.email}`);
  lineas.push(`Teléfono: ${form.telefono}`);
  lineas.push('');

  lineas.push('📦 *ENVÍO*');
  lineas.push(`Dirección: ${form.direccion}`);
  const localidad = [form.ciudad, form.provincia].filter(Boolean).join(', ');
  lineas.push(`Ciudad / Provincia: ${localidad}`);
  if (form.codigoPostal) lineas.push(`Código postal: ${form.codigoPostal}`);
  lineas.push(`País: ${form.pais}`);
  lineas.push('');

  lineas.push('🧾 *DETALLE DEL PEDIDO*');
  for (const item of items) {
    const detalle =
      item.precio > 0
        ? `$${fmt(item.precio)} c/u · $${fmt(item.precio * item.cantidad)}`
        : 'A consultar';
    lineas.push(`• ${item.nombre} × ${item.cantidad} — ${detalle}`);
  }
  lineas.push('');

  if (subtotal > 0) lineas.push(`Subtotal: $${fmt(subtotal)}`);
  if (cupon && descuento > 0) {
    lineas.push(
      `🏷️ Cupón ${cupon.codigo}: −$${fmt(descuento)} (${cupon.descuento}% off)`,
    );
  }
  lineas.push(
    `💰 *TOTAL: ${hayConsulta && subtotal === 0 ? 'A consultar' : '$' + fmt(total)}*`,
  );
  if (hayConsulta && subtotal > 0)
    lineas.push('_(hay artículos a consultar no incluidos en el total)_');
  lineas.push('');

  if (form.nota) {
    lineas.push(`📝 *Nota:* ${form.nota}`);
    lineas.push('');
  }

  lineas.push(SEPARADOR);
  lineas.push('¡Hola! Quiero confirmar este pedido y coordinar el pago y el envío 🙌');

  return lineas.join('\n');
}

export function construirURLPedidoWhatsApp(
  items: CartItem[],
  cupon: Cupon | null,
  form: PedidoForm,
  referencia?: string,
  numeroPedido?: string,
): string {
  const texto = construirMensajePedido(items, cupon, form, referencia, numeroPedido);
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(texto)}`;
}

/** Consulta rápida desde la ficha de producto ("Comprar ahora"). */
export function construirURLConsultaProducto(opciones: {
  nombre: string;
  precio: number;
  talle?: string | null;
  cantidad?: number;
  url: string;
}): string {
  const { nombre, precio, talle, cantidad = 1, url } = opciones;
  const lineas = [
    '🛍️ *Consulta de producto — BYKODA*',
    SEPARADOR,
    '',
    `Producto: *${nombre}*`,
  ];
  if (talle) lineas.push(`Talle: ${talle}`);
  if (cantidad > 1) lineas.push(`Cantidad: ${cantidad}`);
  lineas.push(`Precio: ${precio > 0 ? '$' + fmt(precio) : 'A consultar'}`);
  lineas.push(url, '', '¡Hola! Quiero comprar esta prenda 🙌');
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lineas.join('\n'))}`;
}

export function construirMensajeConsulta(
  nombre: string,
  telefono: string,
  tema: string,
  mensaje?: string,
): string {
  const lineas = [
    '💬 *Consulta BYKODA*',
    SEPARADOR,
    '',
    `👤 *Nombre:* ${nombre}`,
    `📱 *Teléfono:* ${telefono}`,
    `📌 *Tema:* ${tema}`,
  ];
  if (mensaje) lineas.push('', '📝 *Mensaje:*', mensaje);
  lineas.push('', '¡Hola! Quiero hacer una consulta 🙌');
  return lineas.join('\n');
}

export function construirURLConsultaWhatsApp(
  nombre: string,
  telefono: string,
  tema: string,
  mensaje?: string,
): string {
  const texto = construirMensajeConsulta(nombre, telefono, tema, mensaje);
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(texto)}`;
}

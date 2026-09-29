import { z } from 'zod';
import type { CartItem, Cupon } from '@/types';
import type { PedidoPlataforma } from '@/api/plataforma';
import { fmtMoneda } from '@/lib/format';

const REQUERIDO = 'Este dato es obligatorio.';
/** Prendas de fuera de la app que se detallan en las notas; el resto, en WhatsApp. */
const MAX_EXTRAS_EN_NOTAS = 6;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

const requerido = () => z.string().trim().min(1, REQUERIDO);

/**
 * Datos del cliente para cerrar el pedido. Es la única fuente de verdad: de acá
 * salen el tipo del formulario, la validación de React Hook Form y los mensajes.
 */
export const esquemaPedido = z.object({
  nombre: requerido(),
  apellido: requerido(),
  email: requerido().regex(EMAIL_RE, 'Revisá el correo: falta el @ o el dominio.'),
  telefono: requerido().refine(
    (v) => v.replace(/\D/g, '').length >= 8,
    'Ingresá el número completo con característica.',
  ),
  direccion: requerido(),
  ciudad: requerido(),
  provincia: requerido(),
  pais: requerido(),
  codigoPostal: z.string().trim(),
  nota: z.string().trim().max(500, 'La nota puede tener hasta 500 caracteres.'),
});

export type PedidoForm = z.infer<typeof esquemaPedido>;
export type CampoPedido = keyof PedidoForm;

export const PEDIDO_FORM_VACIO: PedidoForm = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  direccion: '',
  ciudad: '',
  provincia: '',
  pais: 'Argentina',
  codigoPostal: '',
  nota: '',
};

/** Campos obligatorios en el orden del formulario (para enfocar el primer error). */
export const CAMPOS_REQUERIDOS: CampoPedido[] = [
  'nombre',
  'apellido',
  'email',
  'telefono',
  'direccion',
  'ciudad',
  'provincia',
  'pais',
];

/** Un mensaje por campo inválido; objeto vacío si el pedido está completo. */
export function validarPedido(form: PedidoForm): Partial<Record<CampoPedido, string>> {
  const resultado = esquemaPedido.safeParse(form);
  if (resultado.success) return {};
  const errores: Partial<Record<CampoPedido, string>> = {};
  for (const issue of resultado.error.issues) {
    const campo = issue.path[0] as CampoPedido;
    errores[campo] ??= issue.message;
  }
  return errores;
}

export function direccionCompleta(form: PedidoForm): string {
  const cp = form.codigoPostal ? ` (CP ${form.codigoPostal})` : '';
  return [form.direccion, form.ciudad, `${form.provincia}${cp}`, form.pais]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(', ');
}

/**
 * Arma el pedido que se registra en la plataforma con los productos que vienen
 * de ella: son los únicos que descuentan stock allá. La plataforma no maneja
 * talles ni cupones, así que viajan en las notas, junto con las prendas del
 * catálogo anterior y el total a cobrar, para que el pedido completo quede en
 * la app. Devuelve null si no hay nada de la plataforma.
 */
export function armarPedidoPlataforma(
  form: PedidoForm,
  items: CartItem[],
  cupon: Cupon | null,
  /** Total de todo el carrito, con cupón (el de la plataforma no lo incluye). */
  totalCarrito?: number,
): PedidoPlataforma | null {
  const deLaPlataforma = items.filter((i) => i.fuente === 'plataforma' && i.productoId);
  if (deLaPlataforma.length === 0) return null;
  const fueraDeLaApp = items.filter((i) => !deLaPlataforma.includes(i));

  // Mismo producto en dos talles = dos renglones del carrito, un solo id.
  const porId = new Map<string, number>();
  for (const item of deLaPlataforma) {
    porId.set(item.productoId!, (porId.get(item.productoId!) ?? 0) + item.cantidad);
  }

  const talles = deLaPlataforma
    .filter((i) => i.talle)
    .map((i) => `${i.nombre.replace(/\s*\([^)]*\)\s*$/, '')} → ${i.talle} × ${i.cantidad}`);

  const extras = fueraDeLaApp
    .slice(0, MAX_EXTRAS_EN_NOTAS)
    .map(
      (i) =>
        `${i.nombre} × ${i.cantidad} (${i.precio > 0 ? fmtMoneda(i.precio * i.cantidad) : 'a consultar'})`,
    );
  if (fueraDeLaApp.length > MAX_EXTRAS_EN_NOTAS) {
    extras.push(`y ${fueraDeLaApp.length - MAX_EXTRAS_EN_NOTAS} más (detalle en WhatsApp)`);
  }
  // El total de la plataforma solo suma sus productos y sin cupón.
  const anotarTotal = totalCarrito !== undefined && (extras.length > 0 || cupon !== null);
  const aConsultar = items.some((i) => !(i.precio > 0)) ? ' + a consultar' : '';

  const notas = [
    `Email: ${form.email}`,
    talles.length ? `Talles: ${talles.join(' · ')}` : '',
    extras.length ? `También pidió (catálogo anterior, no está en la app): ${extras.join(' · ')}` : '',
    cupon ? `Cupón ${cupon.codigo} (−${cupon.descuento}%)` : '',
    anotarTotal ? `Total a cobrar: ${fmtMoneda(totalCarrito)}${aConsultar}` : '',
    form.nota ? `Nota: ${form.nota}` : '',
    'Pedido desde bykoda.store',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    cliente: `${form.nombre} ${form.apellido}`.trim(),
    telefono: form.telefono,
    entrega: 'envio',
    direccion: direccionCompleta(form),
    notas,
    items: [...porId.entries()].map(([id, cantidad]) => ({ id, cantidad })),
  };
}

/**
 * Vuelta de Mercado Pago. La plataforma arma el cobro con el sitio como página
 * de vuelta, y Mercado Pago agrega a la URL el estado del pago. Acá se lee ese
 * estado y se recuerda qué pedido se estaba pagando, para avisarle al cliente.
 */

export type EstadoPago = 'aprobado' | 'pendiente' | 'fallido';

export interface PagoEnCurso {
  numero?: string;
  total?: number;
}

const CLAVE = 'koda_pago_mp';
/** Pasado un día, el aviso ya no corresponde a esta vuelta. */
const VIGENCIA_MS = 24 * 60 * 60 * 1000;

/** Parámetros que Mercado Pago agrega a la URL de vuelta. */
export const PARAMETROS_DE_VUELTA = [
  'collection_id',
  'collection_status',
  'payment_id',
  'status',
  'external_reference',
  'payment_type',
  'merchant_order_id',
  'preference_id',
  'site_id',
  'processing_mode',
  'merchant_account_id',
];

/** Estado del pago según la URL, o null si no se está volviendo de Mercado Pago. */
export function leerVueltaDePago(search: string): EstadoPago | null {
  const q = new URLSearchParams(search);
  if (!q.has('collection_status') && !q.has('preference_id')) return null;
  const estado = q.get('collection_status') || q.get('status');
  if (estado === 'approved') return 'aprobado';
  if (estado === 'pending' || estado === 'in_process') return 'pendiente';
  // Rechazado, o el cliente volvió sin pagar ("null").
  return 'fallido';
}

/** La misma búsqueda sin lo que agregó Mercado Pago. */
export function sinParametrosDeVuelta(search: string): string {
  const q = new URLSearchParams(search);
  for (const p of PARAMETROS_DE_VUELTA) q.delete(p);
  const resto = q.toString();
  return resto ? `?${resto}` : '';
}

export function guardarPagoEnCurso(pago: PagoEnCurso) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ ...pago, guardado: Date.now() }));
  } catch {
    /* storage bloqueado: el aviso sale sin número de pedido */
  }
}

export function leerPagoEnCurso(): PagoEnCurso {
  try {
    const { numero, total, guardado } = JSON.parse(localStorage.getItem(CLAVE) || '{}') as PagoEnCurso & {
      guardado?: number;
    };
    if (!guardado || Date.now() - guardado > VIGENCIA_MS) return {};
    return {
      numero: typeof numero === 'string' ? numero : undefined,
      total: typeof total === 'number' ? total : undefined,
    };
  } catch {
    return {};
  }
}

export function olvidarPagoEnCurso() {
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    /* storage bloqueado */
  }
}

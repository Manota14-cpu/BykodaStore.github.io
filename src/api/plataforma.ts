import { z } from 'zod';
import { TIENDA } from '@/config/tienda';

/**
 * Cliente de la API de catálogo de la plataforma Visual App: la misma que usa
 * el widget `tienda.js`, consumida acá directamente para mostrar el catálogo
 * con el diseño de BYKODA en lugar del widget genérico.
 */

export class ErrorPlataforma extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorPlataforma';
  }
}

const ProductoPlataformaSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().trim().min(1),
  categoria: z.string().nullish(),
  precio: z.number().nonnegative(),
  porPeso: z.boolean().nullish(),
  unidad: z.string().nullish(),
  disponible: z.boolean(),
  /** null = la tienda no controla stock de este producto. */
  stock: z.number().nullish(),
  imagen: z.string().nullish(),
  imagenes: z.array(z.string()).nullish(),
  /** Prenda con talles y colores en Visual App: cada combinación llega como un producto con su stock. */
  prenda: z.object({ id: z.string().min(1), nombre: z.string().trim().min(1) }).nullish(),
  talle: z.string().trim().min(1).nullish(),
  color: z.string().trim().min(1).nullish(),
});

export type ProductoPlataforma = z.infer<typeof ProductoPlataformaSchema>;

const CatalogoSchema = z.object({
  negocio: z.string().nullish(),
  whatsapp: z.string().nullish(),
  /** La tienda conectó Mercado Pago en Visual App (Configuración → Tienda web). */
  mercadopago: z.boolean().nullish(),
  productos: z.array(z.unknown()),
});

export interface CatalogoPlataforma {
  negocio: string | null;
  whatsapp: string | null;
  /** Los pedidos se pueden pagar con Mercado Pago: la plataforma arma el cobro. */
  mercadopago: boolean;
  productos: ProductoPlataforma[];
  /** Productos que llegaron con un formato inválido y no se muestran. */
  descartados: number;
}

/** Corta la espera a los `ms` y también si React Query cancela la consulta. */
function conTimeout(signal: AbortSignal | undefined, ms: number): AbortSignal {
  const timeout = AbortSignal.timeout(ms);
  if (!signal) return timeout;
  if (typeof AbortSignal.any === 'function') return AbortSignal.any([signal, timeout]);
  const control = new AbortController();
  const abortar = () => control.abort();
  signal.addEventListener('abort', abortar, { once: true });
  timeout.addEventListener('abort', abortar, { once: true });
  return control.signal;
}

function url(slug: string, recurso: string): string {
  return `${TIENDA.origen}/tienda/${encodeURIComponent(slug)}/${recurso}`;
}

export async function obtenerCatalogoPlataforma(
  slug: string = TIENDA.slug,
  signal?: AbortSignal,
): Promise<CatalogoPlataforma> {
  const respuesta = await fetch(url(slug, 'productos.json'), {
    cache: 'no-cache',
    signal: conTimeout(signal, TIENDA.timeoutMs),
  });
  if (!respuesta.ok) {
    throw new ErrorPlataforma(`El catálogo no respondió (HTTP ${respuesta.status}).`);
  }

  const catalogo = CatalogoSchema.parse(await respuesta.json());
  const productos: ProductoPlataforma[] = [];
  let descartados = 0;

  // Un producto mal cargado no puede tirar abajo todo el catálogo.
  for (const crudo of catalogo.productos) {
    const resultado = ProductoPlataformaSchema.safeParse(crudo);
    if (resultado.success) productos.push(resultado.data);
    else descartados++;
  }
  if (descartados > 0) {
    console.warn(`[catálogo] ${descartados} producto(s) de la plataforma con formato inválido.`);
  }

  return {
    negocio: catalogo.negocio ?? null,
    whatsapp: catalogo.whatsapp ?? null,
    mercadopago: catalogo.mercadopago === true,
    productos,
    descartados,
  };
}

// ── Pedidos ────────────────────────────────────────────────────────────────

export interface PedidoPlataforma {
  cliente: string;
  telefono: string;
  entrega: 'retiro' | 'envio';
  direccion: string;
  notas: string;
  items: { id: string; cantidad: number }[];
  /** Pagar con Mercado Pago: la plataforma arma el cobro con sus precios y devuelve el link. */
  pago?: 'mercadopago';
  /** Página a la que vuelve el cliente después de pagar. */
  vuelta?: string;
}

const RespuestaPedidoSchema = z.object({
  numero: z.union([z.number(), z.string()]),
  total: z.number().optional(),
  /** Link de pago de Mercado Pago, si se pidió y se pudo armar. */
  pagar: z.string().optional(),
  /** Por qué no se pudo armar el cobro (el pedido igual quedó registrado). */
  errorPago: z.string().optional(),
});

export interface RespuestaPedido {
  numero: string;
  total?: number;
  pagar?: string;
  errorPago?: string;
}

/** Solo se sigue un link de pago que sea de Mercado Pago, por https. */
function esLinkDeMercadoPago(link: string): boolean {
  try {
    const u = new URL(link);
    return u.protocol === 'https:' && /(^|\.)mercadopago\.com(\.[a-z]{2})?$/.test(u.hostname);
  } catch {
    return false;
  }
}

const RespuestaErrorSchema = z.object({ error: z.string().min(1) });

/**
 * Registra el pedido en la plataforma: el servidor vuelve a validar el stock y
 * devuelve el número de pedido, que después viaja en el mensaje de WhatsApp.
 * Con `pago: 'mercadopago'` también devuelve el link para pagarlo.
 */
export async function registrarPedido(
  pedido: PedidoPlataforma,
  slug: string = TIENDA.slug,
): Promise<RespuestaPedido> {
  let respuesta: Response;
  try {
    respuesta = await fetch(url(slug, 'pedido'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // `sitio` es el campo trampa anti-bots de la plataforma: tiene que ir vacío.
      body: JSON.stringify({ ...pedido, sitio: '' }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new ErrorPlataforma('No pudimos conectarnos con la tienda. Revisá tu conexión y probá de nuevo.');
  }

  let cuerpo: unknown = null;
  try {
    cuerpo = await respuesta.json();
  } catch {
    /* cuerpo vacío o no-JSON: se resuelve abajo */
  }

  if (!respuesta.ok) {
    const error = RespuestaErrorSchema.safeParse(cuerpo);
    throw new ErrorPlataforma(
      error.success ? error.data.error : 'No se pudo registrar el pedido. Probá de nuevo en un momento.',
    );
  }

  const ok = RespuestaPedidoSchema.safeParse(cuerpo);
  if (!ok.success) throw new ErrorPlataforma('La tienda respondió algo inesperado al registrar el pedido.');
  const { numero, total, pagar, errorPago } = ok.data;
  if (!pedido.pago) return { numero: String(numero), total };
  if (pagar && esLinkDeMercadoPago(pagar)) return { numero: String(numero), total, pagar };
  return { numero: String(numero), total, errorPago: errorPago || 'No se pudo abrir Mercado Pago.' };
}

import { create } from 'zustand';
import type { CartItem, Cupon } from '@/types';
import { obtenerCupones } from '@/api/local';

const STORAGE_KEY = 'carrito';
const USOS_LOCALES_KEY = 'koda_cupon_usos';

export function getCarrito(): CartItem[] {
  try {
    const guardado = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as CartItem[];
    // Carritos de antes de la plataforma: sus productos salen del catálogo local.
    return guardado.map((i) => ({ ...i, fuente: i.fuente ?? 'local' }));
  } catch {
    return [];
  }
}

function persistCarrito(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage lleno o bloqueado */
  }
}

function getUsosLocales(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(USOS_LOCALES_KEY) || '{}') as Record<string, number>;
  } catch {
    return {};
  }
}

function sumarUsoLocal(codigo: string) {
  try {
    const usos = getUsosLocales();
    usos[codigo] = (usos[codigo] || 0) + 1;
    localStorage.setItem(USOS_LOCALES_KEY, JSON.stringify(usos));
  } catch {
    /* storage bloqueado */
  }
}

/** Unidades que todavía se pueden sumar sin pasar el stock informado. */
function tope(item: Pick<CartItem, 'maximo'>): number {
  return typeof item.maximo === 'number' ? Math.max(0, item.maximo) : Infinity;
}

/**
 * Cuántas unidades más admite la línea `index` sin pasar el stock del
 * producto: cuenta también sus otros talles, que salen del mismo stock.
 */
export function margenDeStock(items: CartItem[], index: number): number {
  const item = items[index];
  if (!item) return 0;
  const enCarrito = items.reduce(
    (suma, i, k) =>
      k === index || (item.productoId && i.productoId === item.productoId) ? suma + i.cantidad : suma,
    0,
  );
  return tope(item) - enCarrito;
}

export interface CuponMsg {
  type: 'ok' | 'error';
  text: string;
}

/** Precio y stock actuales de un producto de la plataforma. */
export interface StockVivo {
  precio: number;
  /** null = la tienda no controla el stock de este producto. */
  unidades: number | null;
  disponible: boolean;
  imagen?: string;
}

/** Renglones que cambiaron al seguir al catálogo en vivo. */
export interface CambiosStock {
  quitados: string[];
  achicados: string[];
  precios: string[];
}

interface CartState {
  items: CartItem[];
  cupon: Cupon | null;
  cuponMsg: CuponMsg | null;
  /** Devuelve cuántas unidades se agregaron realmente (puede ser menos por stock). */
  addItem: (item: CartItem) => number;
  cambiarCantidad: (index: number, delta: number) => void;
  /**
   * Lleva el carrito al precio y stock actuales de la plataforma. Con
   * `quitarFaltantes`, también saca lo que no está publicado en ella.
   */
  sincronizarStock: (vivos: ReadonlyMap<string, StockVivo>, quitarFaltantes: boolean) => CambiosStock;
  eliminarProducto: (index: number) => void;
  vaciarCarrito: () => void;
  aplicarCupon: (codigo: string) => Promise<void>;
  removerCupon: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: getCarrito(),
  cupon: null,
  cuponMsg: null,

  addItem: (nuevo) => {
    const items = [...get().items];
    const idx = items.findIndex((i) => i.nombre === nuevo.nombre);
    const previo = idx >= 0 ? items[idx]!.cantidad : 0;
    // Con stock informado por la plataforma, el total de ese producto no lo supera.
    const mismoProducto = items
      .filter((i, k) => k !== idx && nuevo.productoId && i.productoId === nuevo.productoId)
      .reduce((s, i) => s + i.cantidad, 0);
    const permitido = Math.max(0, Math.min(nuevo.cantidad, tope(nuevo) - mismoProducto - previo));
    if (permitido === 0) return 0;

    if (idx >= 0) {
      items[idx] = {
        ...items[idx]!,
        ...nuevo,
        cantidad: previo + permitido,
        imgSrc: items[idx]!.imgSrc || nuevo.imgSrc,
      };
    } else {
      items.push({ ...nuevo, cantidad: permitido });
    }
    persistCarrito(items);
    set({ items });
    return permitido;
  },

  cambiarCantidad: (index, delta) => {
    const items = [...get().items];
    const item = items[index];
    if (!item) return;
    const maximo = item.cantidad + margenDeStock(items, index);
    const cantidad = Math.min(Math.max(1, item.cantidad + delta), Math.max(1, maximo));
    items[index] = { ...item, cantidad };
    persistCarrito(items);
    set({ items });
  },

  sincronizarStock: (vivos, quitarFaltantes) => {
    const cambios: CambiosStock = { quitados: [], achicados: [], precios: [] };
    const actuales = get().items;
    // Unidades que quedan por repartir entre los talles de cada producto: los
    // primeros renglones conservan lo suyo y el ajuste cae en los últimos.
    const libres = new Map<string, number>();
    const items: CartItem[] = [];

    for (const item of actuales) {
      const id = item.fuente === 'plataforma' ? item.productoId : undefined;
      const vivo = id ? vivos.get(id) : undefined;
      if (!id || !vivo) {
        // No está en la app: despublicado, o del catálogo anterior que ya no se vende.
        if (quitarFaltantes) cambios.quitados.push(item.nombre);
        else items.push(item);
        continue;
      }

      const disponibles = libres.get(id) ?? (vivo.disponible ? (vivo.unidades ?? Infinity) : 0);
      const cantidad = Math.min(item.cantidad, disponibles);
      if (cantidad <= 0) {
        cambios.quitados.push(item.nombre);
        continue;
      }
      libres.set(id, disponibles - cantidad);
      if (cantidad < item.cantidad) cambios.achicados.push(item.nombre);
      if (vivo.precio !== item.precio) cambios.precios.push(item.nombre);
      items.push({
        ...item,
        cantidad,
        precio: vivo.precio,
        maximo: vivo.unidades,
        imgSrc: item.imgSrc || vivo.imagen,
      });
    }

    if (JSON.stringify(items) !== JSON.stringify(actuales)) {
      persistCarrito(items);
      set({ items });
    }
    return cambios;
  },

  eliminarProducto: (index) => {
    const items = get().items.filter((_, i) => i !== index);
    persistCarrito(items);
    set({ items });
  },

  vaciarCarrito: () => {
    persistCarrito([]);
    set({ items: [], cupon: null, cuponMsg: null });
  },

  aplicarCupon: async (codigo) => {
    const codigoLimpio = codigo.trim().toUpperCase();
    if (!codigoLimpio) {
      set({ cuponMsg: { type: 'error', text: 'Ingresá un código de cupón.' } });
      return;
    }
    const cupones = await obtenerCupones();
    const cupon = cupones.find((c) => c.codigo.toUpperCase() === codigoLimpio);
    if (!cupon || !cupon.activo) {
      set({ cuponMsg: { type: 'error', text: 'Código inválido o inactivo.' } });
      return;
    }
    const usadosLocales = getUsosLocales()[cupon.codigo] || 0;
    if (cupon.usos_max !== -1 && (cupon.usos >= cupon.usos_max || usadosLocales >= cupon.usos_max)) {
      set({ cuponMsg: { type: 'error', text: 'Este cupón ya alcanzó su límite de usos.' } });
      return;
    }
    if (cupon.vence) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (hoy > new Date(cupon.vence + 'T00:00:00')) {
        set({ cuponMsg: { type: 'error', text: 'Este cupón está vencido.' } });
        return;
      }
    }
    sumarUsoLocal(cupon.codigo);
    set({
      cupon,
      cuponMsg: {
        type: 'ok',
        text: `Cupón "${cupon.codigo}" aplicado — ${cupon.descuento}% de descuento`,
      },
    });
  },

  removerCupon: () => set({ cupon: null, cuponMsg: null }),
}));

export function useCartTotals() {
  const items = useCartStore((s) => s.items);
  const cupon = useCartStore((s) => s.cupon);
  const total = items.reduce((sum, i) => (i.precio > 0 ? sum + i.precio * i.cantidad : sum), 0);
  const cantidadTotal = items.reduce((sum, i) => sum + i.cantidad, 0);
  const hayConsulta = items.some((i) => i.precio === 0);
  const descuento = cupon && total > 0 ? Math.round((total * cupon.descuento) / 100) : 0;
  const totalFinal = Math.max(0, total - descuento);
  return { total, cantidadTotal, hayConsulta, descuento, totalFinal };
}

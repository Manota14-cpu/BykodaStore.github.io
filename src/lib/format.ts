export function fmtPrecio(n: number): string {
  return n.toLocaleString('es-AR');
}

/** Precio con símbolo, para mostrar en UI. */
export function fmtMoneda(n: number): string {
  return `$${n.toLocaleString('es-AR')}`;
}

export function pctOff(original: number, sale: number): number {
  return Math.round((1 - sale / original) * 100);
}

export function precioEfectivo(p: {
  precio: number;
  variantes?: Array<{ precio: number }> | null;
}): number {
  const v = p.variantes && p.variantes[0];
  return v && v.precio > 0 ? v.precio : p.precio;
}

export function normalizeImg(src?: string | null): string {
  if (!src) return '';
  if (src.startsWith('http') || src.startsWith('/')) return src;
  if (src.startsWith('imagenes/')) return '/' + src;
  return '/imagenes/' + src;
}

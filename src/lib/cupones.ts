/**
 * Los cupones se publican en `public/cupones.json` sin el código: solo su hash.
 * Así nadie puede abrir el archivo y ver la lista de descuentos; el sitio
 * calcula el hash de lo que escribe el cliente y lo compara.
 *
 * El mismo cálculo está en `scripts/cupon.mjs`, que genera las entradas.
 */
const SAL = 'bykoda:';

export function normalizarCodigo(codigo: string): string {
  return codigo.trim().toUpperCase();
}

export async function hashCupon(codigo: string): Promise<string> {
  const datos = new TextEncoder().encode(SAL + normalizarCodigo(codigo));
  const digest = await crypto.subtle.digest('SHA-256', datos);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

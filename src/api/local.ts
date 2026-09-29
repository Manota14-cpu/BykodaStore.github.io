import type { Cupon } from '@/types';

/**
 * Datos que siguen en archivos del propio sitio: los cupones
 * (`public/cupones.json`). El catálogo sale entero de la plataforma.
 */

/** Cambiá este valor al publicar cambios en los JSON locales para invalidar la caché. */
const VERSION = '4';

let cuponesPromesa: Promise<Cupon[]> | null = null;

export function obtenerCupones(): Promise<Cupon[]> {
  if (!cuponesPromesa) {
    cuponesPromesa = fetch(`/cupones.json?v=${VERSION}`)
      .then((r) => r.json() as Promise<{ cupones?: Cupon[] }>)
      .then((d) => d.cupones ?? [])
      .catch(() => {
        cuponesPromesa = null; // permite reintentar tras un fallo de red
        return [];
      });
  }
  return cuponesPromesa;
}

/** Solo para tests: descarta la caché de cupones. */
export function __resetCupones() {
  cuponesPromesa = null;
}

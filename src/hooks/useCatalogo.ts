import { useMemo } from 'react';
import { queryOptions, useQuery } from '@tanstack/react-query';
import type { Producto } from '@/types';
import { TIENDA } from '@/config/tienda';
import { obtenerCatalogoPlataforma } from '@/api/plataforma';
import { desdePlataforma } from '@/api/catalogo';

export const opcionesCatalogoPlataforma = () =>
  queryOptions({
    queryKey: ['catalogo', 'plataforma', TIENDA.slug] as const,
    queryFn: ({ signal }) => obtenerCatalogoPlataforma(TIENDA.slug, signal),
    // Precio y stock en vivo: se refresca solo con la pestaña visible.
    staleTime: 10_000,
    refetchInterval: TIENDA.refrescoMs,
    refetchIntervalInBackground: false,
    // Un corte de red momentáneo no deja la tienda vacía: se reintenta un par
    // de veces antes de mostrar el error, y el refresco periódico sigue probando.
    retry: 2,
  });

export interface EstadoCatalogo {
  productos: Producto[];
  cargando: boolean;
  /** No hay nada para mostrar: la plataforma no respondió. */
  error: boolean;
  /** La plataforma no respondió y todavía no hay un catálogo cargado. */
  plataformaCaida: boolean;
  /** Última actualización exitosa desde la plataforma (ms epoch). */
  actualizado: number | null;
  reintentar: () => void;
}

/** Catálogo completo de la plataforma, listo para la UI. */
export function useCatalogo(): EstadoCatalogo {
  const plataforma = useQuery(opcionesCatalogoPlataforma());

  const productos = useMemo(
    () => plataforma.data?.productos.map(desdePlataforma) ?? [],
    [plataforma.data],
  );

  const cargando = plataforma.isPending;
  const plataformaCaida = plataforma.isError && !plataforma.data;

  return {
    productos,
    cargando,
    error: !cargando && productos.length === 0 && plataformaCaida,
    plataformaCaida,
    actualizado: plataforma.dataUpdatedAt || null,
    reintentar: () => void plataforma.refetch(),
  };
}

export function useProducto(slug: string | undefined) {
  const catalogo = useCatalogo();
  const producto = useMemo(
    () => catalogo.productos.find((p) => p.slug === slug) ?? null,
    [catalogo.productos, slug],
  );
  return { ...catalogo, producto };
}

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { desdePlataforma } from '@/api/catalogo';
import { useCartStore, type CambiosStock, type StockVivo } from '@/store/cart';
import { useToastStore } from '@/store/toast';
import { opcionesCatalogoPlataforma } from './useCatalogo';

function avisoDeCambios({ quitados, achicados, precios }: CambiosStock): string | null {
  const partes = [
    quitados.length
      ? quitados.length > 1
        ? `${quitados.join(', ')} ya no están disponibles: los sacamos del carrito.`
        : `${quitados[0]} ya no está disponible: lo sacamos del carrito.`
      : '',
    achicados.length ? `Quedan menos unidades de ${achicados.join(', ')}: ajustamos la cantidad.` : '',
    precios.length ? `Cambió el precio de ${precios.join(', ')}.` : '',
  ].filter(Boolean);
  return partes.length ? partes.join(' ') : null;
}

/**
 * Mantiene el carrito al día con la plataforma: cuando otra compra descuenta
 * stock, lo agotado sale y lo que bajó se achica antes de enviar el pedido, en
 * lugar de que la plataforma lo rechace al final. También sigue los precios y
 * saca lo que no está en la app (como prendas del catálogo anterior que
 * quedaron guardadas en carritos viejos).
 */
export function useSincronizarCarrito() {
  const hayItems = useCartStore((s) => s.items.length > 0);
  const sincronizarStock = useCartStore((s) => s.sincronizarStock);
  const showToast = useToastStore((s) => s.showToast);
  // La misma consulta que el resto del sitio (y su refresco cada 30 s): solo
  // se activa acá si hay algo en el carrito.
  const { data } = useQuery({ ...opcionesCatalogoPlataforma(), enabled: hayItems });

  useEffect(() => {
    if (!data) return;
    const vivos = new Map<string, StockVivo>(
      data.productos.map((crudo) => {
        const p = desdePlataforma(crudo);
        return [
          p.id,
          {
            precio: p.precio,
            unidades: p.unidades ?? null,
            disponible: p.stock !== 'sin-stock',
            imagen: p.imagenes[0],
          },
        ];
      }),
    );
    // Si algún producto vino con formato inválido no está en la lista, pero no
    // por eso se lo da por despublicado.
    const aviso = avisoDeCambios(sincronizarStock(vivos, data.descartados === 0));
    if (aviso) showToast(aviso);
  }, [data, sincronizarStock, showToast]);
}

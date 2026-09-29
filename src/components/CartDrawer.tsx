import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useCarritoUI } from '@/store/carritoUI';
import { useCartTotals } from '@/store/cart';
import { useModal } from '@/lib/useModal';
import { fmtMoneda } from '@/lib/format';
import { EASE_SUAVE } from './motion/curvas';
import { ImagenProducto } from './ImagenProducto';
import { Button, ButtonLink } from './ui';

/**
 * Panel lateral que confirma lo que se acaba de agregar, sin sacar al cliente
 * de la ficha. Desde acá sigue comprando o va al carrito a cerrar el pedido.
 */
export function CartDrawer() {
  const { abierto, ultimo, cerrar } = useCarritoUI();
  const { cantidadTotal, totalFinal, hayConsulta } = useCartTotals();
  const panelRef = useModal(abierto, cerrar);
  const { pathname } = useLocation();

  // Navegar (por ejemplo, a "Ver carrito") cierra el panel.
  useEffect(() => {
    cerrar();
  }, [pathname, cerrar]);

  return (
    <AnimatePresence>
      {abierto && ultimo && (
        <div className="fixed inset-0 z-[2500]">
          <m.div
            aria-hidden="true"
            onClick={cerrar}
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
          <m.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-titulo"
            className="absolute inset-y-0 right-0 flex w-[min(26rem,100vw)] flex-col border-l border-line bg-surface shadow-[0_0_60px_var(--k-shadow)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.45, ease: EASE_SUAVE }}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 id="drawer-titulo" className="flex items-center gap-2 text-sm font-semibold text-ink">
                <span className="grid size-5 place-items-center rounded-full bg-exito/15 text-exito">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                Agregado al carrito
              </h2>
              <button
                type="button"
                onClick={cerrar}
                aria-label="Cerrar"
                className="grid size-9 place-items-center rounded-full text-ink-2 transition-colors hover:bg-hover hover:text-ink"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div className="flex gap-4 px-6 py-6">
              <div className="relative aspect-3/4 w-24 shrink-0 overflow-hidden rounded-lg bg-hover">
                <ImagenProducto src={ultimo.imgSrc} alt={ultimo.nombre} className="absolute inset-0 size-full object-cover" />
              </div>
              <div className="grid content-start gap-1.5">
                <p className="text-sm leading-snug font-medium text-ink">{ultimo.nombre}</p>
                <p className="text-xs text-ink-3">Cantidad: {ultimo.cantidad}</p>
                <p className="text-sm font-bold text-ink tabular-nums">
                  {ultimo.precio > 0 ? fmtMoneda(ultimo.precio * ultimo.cantidad) : 'A consultar'}
                </p>
              </div>
            </div>

            <div className="mt-auto grid gap-3 border-t border-line px-6 py-6">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-ink-2">
                  {cantidadTotal} {cantidadTotal === 1 ? 'artículo' : 'artículos'} en el carrito
                </span>
                <span className="font-bold text-ink tabular-nums">
                  {hayConsulta && totalFinal === 0 ? 'A consultar' : fmtMoneda(totalFinal)}
                </span>
              </div>
              <ButtonLink to="/carrito" ancho="completo">
                Ver carrito y finalizar
              </ButtonLink>
              <Button variante="secundario" ancho="completo" onClick={cerrar}>
                Seguir comprando
              </Button>
              <p className="text-center text-xs text-ink-3">
                El pedido se confirma por WhatsApp: no se cobra nada en el sitio.
              </p>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}

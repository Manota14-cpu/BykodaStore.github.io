import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { margenDeStock, useCartStore, useCartTotals } from '@/store/cart';
import { useToastStore } from '@/store/toast';
import { useSincronizarCarrito } from '@/hooks/useSincronizarCarrito';
import { fmtMoneda } from '@/lib/format';
import { useSEO } from '@/lib/seo';
import { cn } from '@/lib/cn';
import { CheckoutModal } from '@/components/CheckoutModal';
import { ImagenProducto } from '@/components/ImagenProducto';
import { EASE_SUAVE } from '@/components/motion/curvas';
import { Button, ButtonLink, Input } from '@/components/ui';

const GARANTIAS = [
  'Envíos a todo el país · 4 a 8 días hábiles',
  'Cambio de talle sin cargo dentro de los 7 días',
  'Coordinás pago y envío por WhatsApp, sin datos de tarjeta',
];

const MEDIOS = ['Transferencia', 'Mercado Pago', 'Efectivo (retiro)'];

export function CartPage() {
  const {
    items,
    cupon,
    cuponMsg,
    cambiarCantidad,
    eliminarProducto,
    vaciarCarrito,
    aplicarCupon,
    removerCupon,
  } = useCartStore();
  const { total, cantidadTotal, hayConsulta, descuento, totalFinal } = useCartTotals();
  const showToast = useToastStore((s) => s.showToast);
  const [cuponInput, setCuponInput] = useState('');
  const [checkout, setCheckout] = useState(false);
  const cerrarCheckout = useCallback(() => setCheckout(false), []);
  const [params, setParams] = useSearchParams();

  useSEO({
    title: 'Carrito | BYKODA',
    description: 'Revisá tu pedido y finalizalo por WhatsApp. Ropa urbana y streetwear premium.',
    canonical: '/carrito',
  });

  // Mientras se revisa el pedido, el carrito sigue al stock y los precios de la app.
  useSincronizarCarrito();

  // "Comprar ahora" en la ficha llega con ?checkout=1.
  useEffect(() => {
    if (params.get('checkout') === '1' && items.length > 0) {
      setCheckout(true);
      params.delete('checkout');
      setParams(params, { replace: true });
    }
  }, [params, setParams, items.length]);

  function handleVaciar() {
    if (window.confirm('¿Vaciar el carrito?')) {
      vaciarCarrito();
      showToast('Carrito vaciado.');
    }
  }

  const vacio = (
    <m.div
      className="area-pagina grid min-h-[62vh] place-items-center py-20 text-center"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_SUAVE }}
    >
      <div className="grid justify-items-center gap-4">
        <span className="grid size-16 place-items-center rounded-full border border-line text-ink-3">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            aria-hidden="true"
          >
            <path d="M6 7h12l-1 13H7L6 7z" />
            <path d="M9 7a3 3 0 0 1 6 0" />
          </svg>
        </span>
        <h1 className="titulo-display text-5xl text-ink uppercase">Tu carrito está vacío</h1>
        <p className="max-w-[36ch] text-ink-2">Explorá el catálogo y encontrá tu próxima prenda.</p>
        <ButtonLink to="/catalogo" tamano="lg" className="mt-2">
          Ver catálogo
        </ButtonLink>
      </div>
    </m.div>
  );

  return (
    <>
      {items.length === 0 ? (
        vacio
      ) : (
        <div className="area-pagina pt-[clamp(2rem,5vw,3.5rem)] pb-[clamp(4rem,9vw,7rem)]">
          <header className="mb-[clamp(2rem,4vw,3rem)]">
            <p className="eyebrow">Carrito</p>
            <h1 className="mt-2 titulo-display text-[clamp(3rem,8vw,5.5rem)] text-ink uppercase">
              Tu pedido
            </h1>
            <p className="mt-3 text-[0.95rem] text-ink-2">
              {cantidadTotal} {cantidadTotal === 1 ? 'artículo' : 'artículos'} · revisá cantidades y
              finalizá por WhatsApp.
            </p>
          </header>

          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-14">
            <ul className="border-t border-line">
              <AnimatePresence initial={false}>
                {items.map((item, index) => {
                  const subtotal =
                    item.precio > 0 ? fmtMoneda(item.precio * item.cantidad) : 'Consultar';
                  // El stock es del producto: los otros talles en el carrito también cuentan.
                  const alTope = margenDeStock(items, index) <= 0;
                  return (
                    <m.li
                      key={item.nombre}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{
                        opacity: 0,
                        height: 0,
                        transition: { duration: 0.35, ease: EASE_SUAVE },
                      }}
                      className="overflow-hidden border-b border-line"
                    >
                      <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-5 py-6 sm:grid-cols-[6.5rem_minmax(0,1fr)_auto]">
                        <div className="relative aspect-4/5 overflow-hidden rounded-lg bg-hover">
                          <ImagenProducto
                            src={item.imgSrc}
                            alt={item.nombre}
                            loading="lazy"
                            className="size-full object-cover"
                          />
                        </div>

                        <div className="grid content-start gap-2">
                          <h2 className="text-[0.95rem] leading-snug font-medium text-ink">
                            {item.slug || item.productoId ? (
                              <Link
                                to={`/producto/${encodeURIComponent(item.slug ?? item.productoId ?? '')}`}
                                className="hover:underline hover:underline-offset-4"
                              >
                                {item.nombre}
                              </Link>
                            ) : (
                              item.nombre
                            )}
                          </h2>
                          <p className="text-xs text-ink-3">
                            {item.precio > 0
                              ? `${fmtMoneda(item.precio)} c/u`
                              : 'Precio a consultar'}
                          </p>
                          <div className="mt-1 flex items-center gap-4">
                            <div
                              role="group"
                              aria-label={`Cantidad de ${item.nombre}`}
                              className="flex items-center overflow-hidden rounded-lg border border-line"
                            >
                              <button
                                type="button"
                                aria-label="Quitar una unidad"
                                onClick={() => cambiarCantidad(index, -1)}
                                disabled={item.cantidad <= 1}
                                className="h-9 w-9 text-ink transition-colors hover:bg-hover disabled:opacity-35"
                              >
                                −
                              </button>
                              <span
                                aria-live="polite"
                                className="min-w-7 text-center text-sm font-semibold text-ink tabular-nums"
                              >
                                {item.cantidad}
                              </span>
                              <button
                                type="button"
                                aria-label="Agregar una unidad"
                                onClick={() => cambiarCantidad(index, 1)}
                                disabled={alTope}
                                className="h-9 w-9 text-ink transition-colors hover:bg-hover disabled:opacity-35"
                              >
                                +
                              </button>
                            </div>
                            {alTope && (
                              <span className="text-xs text-ultimas">Máximo disponible</span>
                            )}
                          </div>
                        </div>

                        {/* Un solo bloque de precio + eliminar: en celular va debajo
                            (columna 2), en escritorio a la derecha (columna 3). */}
                        <div className="col-start-2 flex items-center justify-between sm:col-start-3 sm:row-start-1 sm:grid sm:content-between sm:justify-items-end">
                          <span className="font-bold text-ink tabular-nums">{subtotal}</span>
                          <BotonEliminar nombre={item.nombre} onClick={() => eliminarProducto(index)} />
                        </div>
                      </div>
                    </m.li>
                  );
                })}
              </AnimatePresence>
            </ul>

            <aside
              aria-label="Resumen del pedido"
              className="grid gap-6 rounded-2xl border border-line bg-surface p-7 lg:sticky lg:top-24"
            >
              <h2 className="eyebrow">Resumen</h2>

              <div className="grid gap-2">
                <label htmlFor="cupon-input" className="text-sm text-ink-2">
                  ¿Tenés un cupón?
                </label>
                <div className="flex gap-2">
                  <Input
                    id="cupon-input"
                    placeholder="Ej: KODA10"
                    autoComplete="off"
                    spellCheck={false}
                    value={cuponInput}
                    onChange={(e) => setCuponInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void aplicarCupon(cuponInput);
                    }}
                    className="py-2.5 uppercase"
                  />
                  <Button
                    variante="secundario"
                    className="shrink-0"
                    onClick={() => void aplicarCupon(cuponInput)}
                  >
                    Aplicar
                  </Button>
                </div>
                {cuponMsg && (
                  <p
                    role="status"
                    className={cn('text-xs', cuponMsg.type === 'ok' ? 'text-exito' : 'text-alerta')}
                  >
                    {cuponMsg.text}
                  </p>
                )}
                {cupon && (
                  <button
                    type="button"
                    onClick={removerCupon}
                    className="justify-self-start text-xs text-ink-3 underline underline-offset-4 hover:text-ink"
                  >
                    Quitar cupón
                  </button>
                )}
              </div>

              <dl className="grid gap-2.5 border-t border-line pt-5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-2">Subtotal</dt>
                  <dd className="text-ink tabular-nums">
                    {total > 0 ? fmtMoneda(total) : 'A consultar'}
                  </dd>
                </div>
                {descuento > 0 && (
                  <div className="flex justify-between text-exito">
                    <dt>Descuento ({cupon?.descuento}%)</dt>
                    <dd className="tabular-nums">−{fmtMoneda(descuento)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-ink-2">Envío</dt>
                  <dd className="text-ink">A coordinar</dd>
                </div>
                <div className="mt-2 flex items-baseline justify-between border-t border-line pt-4">
                  <dt className="eyebrow">Total</dt>
                  <dd className="text-2xl font-bold text-ink tabular-nums">
                    {hayConsulta && total === 0
                      ? 'A consultar'
                      : fmtMoneda(totalFinal) + (hayConsulta ? ' + a consultar' : '')}
                  </dd>
                </div>
              </dl>

              <div className="grid gap-2.5">
                <Button tamano="lg" ancho="completo" onClick={() => setCheckout(true)}>
                  Finalizar por WhatsApp
                </Button>
                <Button variante="secundario" ancho="completo" onClick={handleVaciar}>
                  Vaciar carrito
                </Button>
                <Link
                  to="/catalogo"
                  className="mt-1 justify-self-center text-[0.72rem] tracking-[0.14em] text-ink-3 uppercase transition-colors hover:text-ink"
                >
                  ← Seguir comprando
                </Link>
              </div>

              <div className="border-t border-line pt-5">
                <p className="mb-2.5 eyebrow">Medios de pago</p>
                <ul className="flex flex-wrap gap-1.5">
                  {MEDIOS.map((medio) => (
                    <li
                      key={medio}
                      className="rounded-full border border-line px-2.5 py-1 text-xs text-ink-2"
                    >
                      {medio}
                    </li>
                  ))}
                </ul>
              </div>

              <ul className="grid gap-2 border-t border-line pt-5">
                {GARANTIAS.map((g) => (
                  <li
                    key={g}
                    className="flex items-start gap-2.5 text-xs leading-relaxed text-ink-3"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="mt-0.5 shrink-0 text-exito"
                      aria-hidden="true"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {g}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      )}

      {/* Fuera de las ramas: al confirmar se vacía el carrito y la página pasa a
          "vacío", pero el modal sigue montado para mostrar "Pedido enviado". */}
      <CheckoutModal open={checkout} onClose={cerrarCheckout} />
    </>
  );
}

function BotonEliminar({ nombre, onClick }: { nombre: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Eliminar ${nombre}`}
      className="text-xs text-ink-3 underline underline-offset-4 transition-colors hover:text-alerta"
    >
      Eliminar
    </button>
  );
}

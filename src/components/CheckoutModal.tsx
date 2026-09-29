import { useRef, useState, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useCartStore, useCartTotals } from '@/store/cart';
import { useToastStore } from '@/store/toast';
import { useModal } from '@/lib/useModal';
import { fmtMoneda } from '@/lib/format';
import { PAISES, PROVINCIAS_AR } from '@/lib/argentina';
import { construirURLPedidoWhatsApp, generarReferencia } from '@/lib/whatsapp';
import {
  armarPedidoPlataforma,
  esquemaPedido,
  PEDIDO_FORM_VACIO,
  type CampoPedido,
  type PedidoForm,
} from '@/lib/pedido';
import { registrarPedido } from '@/api/plataforma';
import { EASE_SUAVE } from './motion/curvas';
import { IconWhatsapp } from './icons';
import { Button, Field, Input, Select, Textarea } from './ui';

const DATOS_KEY = 'koda_datos_envio';

function leerDatosGuardados(): PedidoForm {
  try {
    const raw = localStorage.getItem(DATOS_KEY);
    if (!raw) return PEDIDO_FORM_VACIO;
    return { ...PEDIDO_FORM_VACIO, ...(JSON.parse(raw) as Partial<PedidoForm>), nota: '' };
  } catch {
    return PEDIDO_FORM_VACIO;
  }
}

function guardarDatos(form: PedidoForm) {
  try {
    // La nota es de cada pedido: no se guarda para el próximo.
    localStorage.setItem(DATOS_KEY, JSON.stringify({ ...form, nota: '' }));
  } catch {
    /* storage bloqueado */
  }
}

interface Resultado {
  numero?: string;
  referencia: string;
  url: string;
}

export function CheckoutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const items = useCartStore((s) => s.items);
  const cupon = useCartStore((s) => s.cupon);
  const vaciarCarrito = useCartStore((s) => s.vaciarCarrito);
  const { cantidadTotal, totalFinal, hayConsulta } = useCartTotals();
  const showToast = useToastStore((s) => s.showToast);
  const queryClient = useQueryClient();

  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const ventanaRef = useRef<Window | null>(null);
  const boxRef = useModal(open, cerrar);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<PedidoForm>({
    resolver: zodResolver(esquemaPedido),
    defaultValues: leerDatosGuardados(),
    mode: 'onTouched',
  });

  const esArgentina = watch('pais') === 'Argentina';
  const resumen = `${cantidadTotal} artículo${cantidadTotal !== 1 ? 's' : ''} · ${
    hayConsulta && totalFinal === 0 ? 'A consultar' : fmtMoneda(totalFinal)
  }${hayConsulta && totalFinal > 0 ? ' + a consultar' : ''}`;

  function cerrar() {
    onClose();
    // Se limpia después de la animación de salida.
    window.setTimeout(() => {
      setResultado(null);
      setErrorEnvio(null);
    }, 350);
  }

  async function confirmar(datos: PedidoForm) {
    setErrorEnvio(null);
    const referencia = generarReferencia();
    const pedido = armarPedidoPlataforma(datos, items, cupon, totalFinal);

    let numero: string | undefined;
    if (pedido) {
      try {
        ({ numero } = await registrarPedido(pedido));
      } catch (error) {
        ventanaRef.current?.close();
        setErrorEnvio(error instanceof Error ? error.message : 'No se pudo registrar el pedido.');
        // El stock pudo haber cambiado: se refresca para que el carrito lo refleje.
        void queryClient.invalidateQueries({ queryKey: ['catalogo', 'plataforma'] });
        return;
      }
    }

    const url = construirURLPedidoWhatsApp(items, cupon, datos, referencia, numero);
    const ventana = ventanaRef.current;
    if (ventana && !ventana.closed) ventana.location.href = url;
    else window.location.href = url; // la pestaña se bloqueó: se abre acá

    guardarDatos(datos);
    vaciarCarrito();
    void queryClient.invalidateQueries({ queryKey: ['catalogo', 'plataforma'] });
    setResultado({ numero, referencia, url });
  }

  function alEnviar(e: FormEvent<HTMLFormElement>) {
    // La pestaña de WhatsApp se abre YA, dentro del gesto del click: después
    // de un await el navegador la bloquearía como popup. Solo si el formulario
    // es válido, así un error de tipeo no deja una pestaña en blanco.
    ventanaRef.current = null;
    if (esquemaPedido.safeParse(getValues()).success) {
      const ventana = window.open('about:blank', '_blank');
      if (ventana) ventana.opener = null; // la pestaña nueva no puede tocar esta
      ventanaRef.current = ventana;
    }
    void handleSubmit(confirmar, () => showToast('Faltan datos para completar el pedido.', 'error'))(e);
  }

  const campo = (nombre: CampoPedido) => ({
    id: `co-${nombre}`,
    'aria-invalid': Boolean(errors[nombre]),
    'aria-describedby': errors[nombre] ? `co-${nombre}-error` : undefined,
    ...register(nombre),
  });

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[3000] overflow-y-auto">
          <m.div
            aria-hidden="true"
            onClick={cerrar}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          {/* min-h-full en vez de place-items-center sobre el contenedor con
              scroll: si el formulario es más alto que la pantalla, se puede
              scrollear desde el principio en lugar de quedar cortado arriba. */}
          <div className="pointer-events-none relative flex min-h-full items-center justify-center p-4 sm:p-6">
          <m.div
            ref={boxRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-titulo"
            className="pointer-events-auto relative w-full max-w-2xl rounded-2xl border border-line bg-surface p-6 shadow-[0_40px_120px_var(--k-shadow)] sm:p-9"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.4, ease: EASE_SUAVE }}
          >
            <button
              type="button"
              onClick={cerrar}
              aria-label="Cerrar"
              className="absolute top-4 right-4 grid size-9 place-items-center rounded-full text-ink-2 transition-colors hover:bg-hover hover:text-ink"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>

            {resultado ? (
              <div className="grid justify-items-center gap-4 py-6 text-center">
                <span className="grid size-14 place-items-center rounded-full bg-whatsapp/15 text-whatsapp-ink dark:text-whatsapp">
                  <IconWhatsapp size={26} />
                </span>
                <h2 id="checkout-titulo" className="titulo-display text-4xl text-ink">
                  {resultado.numero ? `Pedido #${resultado.numero} enviado` : 'Pedido enviado'}
                </h2>
                <p className="max-w-[42ch] text-sm leading-relaxed text-ink-2">
                  Te abrimos WhatsApp con el detalle completo. Mandá el mensaje y te respondemos para
                  confirmar el pago y el envío.
                </p>
                <p className="eyebrow">Referencia {resultado.referencia}</p>
                <div className="mt-2 flex flex-wrap justify-center gap-3">
                  <a
                    href={resultado.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center gap-2 rounded-lg bg-whatsapp px-5 text-[0.8rem] font-semibold tracking-[0.12em] text-black uppercase transition hover:brightness-95"
                  >
                    <IconWhatsapp size={18} />
                    Abrir WhatsApp de nuevo
                  </a>
                  <Button variante="secundario" onClick={cerrar}>
                    Listo
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-7 pr-10">
                  <h2 id="checkout-titulo" className="titulo-display text-4xl text-ink">
                    Completar pedido
                  </h2>
                  <p className="mt-2 text-sm font-semibold text-ink tabular-nums">{resumen}</p>
                  <p className="mt-2 max-w-[56ch] text-xs leading-relaxed text-ink-3">
                    No se cobra nada acá. Al enviar, registramos el pedido y se abre WhatsApp con el
                    detalle completo para confirmar el pago y coordinar el envío.
                  </p>
                </div>

                <form onSubmit={alEnviar} noValidate className="grid gap-7">
                  <fieldset className="grid gap-4">
                    <legend className="eyebrow mb-3">Tus datos</legend>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field id="co-nombre" label="Nombre" requerido error={errors.nombre?.message}>
                        <Input {...campo('nombre')} autoComplete="given-name" placeholder="Lucas" />
                      </Field>
                      <Field id="co-apellido" label="Apellido" requerido error={errors.apellido?.message}>
                        <Input {...campo('apellido')} autoComplete="family-name" placeholder="Pérez" />
                      </Field>
                      <Field id="co-email" label="Correo electrónico" requerido error={errors.email?.message}>
                        <Input
                          {...campo('email')}
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          placeholder="lucas@mail.com"
                        />
                      </Field>
                      <Field id="co-telefono" label="Número de teléfono" requerido error={errors.telefono?.message}>
                        <Input
                          {...campo('telefono')}
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder="3492 123456"
                        />
                      </Field>
                    </div>
                  </fieldset>

                  <fieldset className="grid gap-4">
                    <legend className="eyebrow mb-3">Dirección de envío</legend>
                    <Field id="co-direccion" label="Dirección" requerido error={errors.direccion?.message}>
                      <Input
                        {...campo('direccion')}
                        autoComplete="street-address"
                        placeholder="Belgrano 1234, piso 2 depto B"
                      />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field id="co-ciudad" label="Ciudad" requerido error={errors.ciudad?.message}>
                        <Input {...campo('ciudad')} autoComplete="address-level2" placeholder="Rafaela" />
                      </Field>
                      <Field id="co-provincia" label="Provincia" requerido error={errors.provincia?.message}>
                        {esArgentina ? (
                          <Select {...campo('provincia')} autoComplete="address-level1">
                            <option value="">Elegí tu provincia</option>
                            {PROVINCIAS_AR.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </Select>
                        ) : (
                          <Input
                            {...campo('provincia')}
                            autoComplete="address-level1"
                            placeholder="Provincia / Estado"
                          />
                        )}
                      </Field>
                      <Field id="co-codigoPostal" label="Código postal" error={errors.codigoPostal?.message}>
                        <Input
                          {...campo('codigoPostal')}
                          inputMode="numeric"
                          autoComplete="postal-code"
                          placeholder="2300"
                        />
                      </Field>
                      <Field id="co-pais" label="País" requerido error={errors.pais?.message}>
                        <Select
                          {...campo('pais')}
                          autoComplete="country-name"
                          onChange={(e) => {
                            // Las provincias del selector solo aplican a Argentina.
                            setValue('pais', e.target.value, { shouldValidate: true });
                            setValue('provincia', '');
                          }}
                        >
                          {PAISES.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </Select>
                      </Field>
                    </div>
                  </fieldset>

                  <Field id="co-nota" label="Nota para el pedido" error={errors.nota?.message}>
                    <Textarea
                      {...campo('nota')}
                      rows={2}
                      placeholder="Entre calles, horario de entrega, alguna aclaración… (opcional)"
                    />
                  </Field>

                  {errorEnvio && (
                    <p role="alert" className="rounded-lg border border-alerta/40 bg-alerta/10 px-4 py-3 text-sm text-ink">
                      {errorEnvio} Revisá el carrito y probá de nuevo.
                    </p>
                  )}

                  <div className="flex flex-col-reverse gap-3 sm:flex-row">
                    <Button variante="secundario" className="sm:flex-1" onClick={cerrar}>
                      Volver al carrito
                    </Button>
                    <Button type="submit" variante="whatsapp" className="sm:flex-[1.6]" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <span className="size-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                      ) : (
                        <IconWhatsapp size={18} />
                      )}
                      {isSubmitting ? 'Registrando pedido…' : 'Enviar pedido por WhatsApp'}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </m.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

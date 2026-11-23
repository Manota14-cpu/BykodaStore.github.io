import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IconWhatsapp } from '@/components/icons';
import { Button, Field, Input, Textarea } from '@/components/ui';
import { useSEO } from '@/lib/seo';
import { LEGAL } from '@/config/legal';
import { EMAIL_RE } from '@/lib/newsletter';
import { abrirEnPestanaNueva } from '@/lib/whatsapp';
import {
  generarCodigoArrepentimiento,
  urlArrepentimientoMail,
  urlArrepentimientoWhatsApp,
  type SolicitudArrepentimiento,
} from '@/lib/arrepentimiento';
import { AyudaLayout } from './ayuda/AyudaLayout';

const esquema = z.object({
  nombre: z.string().trim().min(1, 'Decinos tu nombre y apellido.'),
  email: z.string().trim().regex(EMAIL_RE, 'Revisá el mail: falta el @ o el dominio.'),
  telefono: z
    .string()
    .trim()
    .refine(
      (v) => v.replace(/\D/g, '').length >= 8,
      'Ingresá tu número completo, con característica.',
    ),
  pedido: z.string().trim().min(1, 'Poné el número o la referencia del pedido.'),
  fechaRecepcion: z.string(),
  detalle: z.string().trim().max(500, 'Hasta 500 caracteres.'),
});

/**
 * Botón de arrepentimiento (Disposición 954/2025): revocar la compra dentro de
 * los 10 días corridos, sin registrarse. Se arma la solicitud con un código y
 * se manda a la tienda por WhatsApp o por mail.
 */
export function ArrepentimientoPage() {
  useSEO({
    title: 'Botón de arrepentimiento | BYKODA',
    description:
      'Cancelá tu compra en BYKODA dentro de los 10 días corridos desde que la recibiste, sin registrarte. El envío de la devolución lo pagamos nosotros.',
    canonical: '/arrepentimiento',
  });

  const [enviada, setEnviada] = useState<{
    codigo: string;
    datos: SolicitudArrepentimiento;
  } | null>(null);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<SolicitudArrepentimiento>({
    resolver: zodResolver(esquema),
    defaultValues: {
      nombre: '',
      email: '',
      telefono: '',
      pedido: '',
      fechaRecepcion: '',
      detalle: '',
    },
    mode: 'onTouched',
  });

  function alEnviar(e: FormEvent<HTMLFormElement>) {
    // WhatsApp se abre dentro del mismo click; si no, el navegador lo bloquea.
    const datos = esquema.safeParse(getValues());
    if (datos.success) {
      const codigo = generarCodigoArrepentimiento();
      const url = urlArrepentimientoWhatsApp(datos.data, codigo);
      abrirEnPestanaNueva(url);
      setEnviada({ codigo, datos: datos.data });
      window.scrollTo({ top: 0 });
    }
    void handleSubmit(() => undefined)(e);
  }

  const campo = (nombre: keyof SolicitudArrepentimiento) => ({
    id: `arr-${nombre}`,
    'aria-invalid': Boolean(errors[nombre]),
    'aria-describedby': errors[nombre] ? `arr-${nombre}-error` : undefined,
    ...register(nombre),
  });

  return (
    <AyudaLayout
      actual="arrepentimiento"
      titulo="Botón de arrepentimiento"
      bajada="Si te arrepentiste de una compra, podés cancelarla dentro de los 10 días corridos desde que la recibiste. No hace falta registrarte ni explicar el motivo."
      ancho="amplio"
    >
      {enviada ? (
        <div role="status" className="max-w-[60ch] border border-line p-6 sm:p-8">
          <p className="eyebrow">Solicitud enviada</p>
          <p className="mt-3 text-2xl font-semibold text-ink tabular-nums">{enviada.codigo}</p>
          <div className="prosa mt-4">
            <p>
              Ese es el código de tu solicitud. Se abrió WhatsApp con el mensaje listo:{' '}
              <strong>enviálo</strong> para que nos llegue. Dentro de las 24 horas te confirmamos la
              recepción por el mismo medio y te explicamos cómo hacer la devolución, que corre por
              nuestra cuenta.
            </p>
            <p>
              ¿No se abrió WhatsApp o preferís el mail?{' '}
              <a href={urlArrepentimientoMail(enviada.datos, enviada.codigo, LEGAL.email)}>
                Mandá la solicitud por mail
              </a>
              .
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-10 xl:grid-cols-[minmax(0,1fr)_18rem]">
          <form onSubmit={alEnviar} noValidate className="grid gap-5 border border-line p-5 sm:p-7">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                id="arr-nombre"
                label="Nombre y apellido"
                requerido
                error={errors.nombre?.message}
              >
                <Input {...campo('nombre')} autoComplete="name" />
              </Field>
              <Field
                id="arr-pedido"
                label="Número de pedido"
                requerido
                error={errors.pedido?.message}
                ayuda="O la referencia KD-… del mensaje."
              >
                <Input {...campo('pedido')} autoComplete="off" />
              </Field>
              <Field id="arr-email" label="Mail" requerido error={errors.email?.message}>
                <Input {...campo('email')} type="email" inputMode="email" autoComplete="email" />
              </Field>
              <Field id="arr-telefono" label="Teléfono" requerido error={errors.telefono?.message}>
                <Input
                  {...campo('telefono')}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="Con característica"
                />
              </Field>
              <Field
                id="arr-fechaRecepcion"
                label="¿Cuándo lo recibiste?"
                error={errors.fechaRecepcion?.message}
              >
                <Input {...campo('fechaRecepcion')} type="date" />
              </Field>
            </div>
            <Field
              id="arr-detalle"
              label="Prendas a devolver o comentario"
              error={errors.detalle?.message}
            >
              <Textarea {...campo('detalle')} rows={3} placeholder="Opcional" />
            </Field>
            <Button
              type="submit"
              tamano="lg"
              className="h-auto min-h-13 py-3 text-center whitespace-normal"
            >
              <IconWhatsapp size={18} />
              Enviar solicitud
            </Button>
            <p className="text-xs leading-relaxed text-ink-3">
              Se abre WhatsApp con la solicitud escrita y un código para identificarla. Si no usás
              WhatsApp, después vas a poder mandarla por mail.
            </p>
          </form>

          <div className="prosa text-sm">
            <h2>Cómo funciona</h2>
            <ol>
              <li>Completás el formulario y enviás la solicitud.</li>
              <li>Dentro de las 24 horas te confirmamos el código por el mismo medio.</li>
              <li>Coordinamos el retiro o el envío de la prenda: el costo es nuestro.</li>
              <li>Cuando la recibimos, te devolvemos todo lo que pagaste.</li>
            </ol>
            <p>
              La prenda tiene que estar sin uso. Más información en{' '}
              <Link to="/info/cambios-y-devoluciones">Cambios y devoluciones</Link>.
            </p>
          </div>
        </div>
      )}
    </AyudaLayout>
  );
}

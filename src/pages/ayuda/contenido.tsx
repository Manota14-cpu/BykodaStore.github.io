import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TallesTable } from '@/components/TallesTable';
import { IconInstagram, IconWhatsapp } from '@/components/icons';
import { Accordion, Button, ButtonLink, Field, Input, Select, Textarea } from '@/components/ui';
import { TABLAS_TALLES, TIP_TALLES } from '@/lib/talles';
import {
  abrirEnPestanaNueva,
  construirURLConsultaWhatsApp,
  WA_NUMBER,
  WA_TEL_VISIBLE,
} from '@/lib/whatsapp';
import { useToastStore } from '@/store/toast';
import { PREGUNTAS } from './preguntas';
import { HORARIO_ATENCION, LEGAL } from '@/config/legal';

const INSTAGRAM = 'https://www.instagram.com/__bykoda/';

/* ---- Cómo comprar ---------------------------------------------------- */

export function ComoComprar({ mercadoPago }: { mercadoPago: boolean }) {
  return (
    <div className="prosa">
      <h2>Paso a paso</h2>
      <ol>
        <li>Elegís la prenda, el talle y la cantidad, y la agregás al carrito.</li>
        <li>
          En el carrito tocás <strong>Finalizar compra</strong> y completás tus datos de contacto y
          envío.
        </li>
        {mercadoPago ? (
          <li>
            Elegís cómo pagar. Con <strong>Mercado Pago</strong> pagás las prendas en el momento.{' '}
            <strong>Por WhatsApp</strong> se abre el chat con el pedido ya escrito y te pasamos los
            datos para pagar.
          </li>
        ) : (
          <li>
            Registramos el pedido con un número y se abre WhatsApp con todo ya escrito: prendas,
            talles, cantidades, cupón y total. Te pasamos los datos para pagar.
          </li>
        )}
        <li>Te confirmamos el costo del envío por WhatsApp antes de que lo pagues.</li>
        <li>
          Con el pago acreditado, preparamos el pedido en 1 a 3 días hábiles y te pasamos el
          seguimiento.
        </li>
      </ol>

      <h2>Medios de pago</h2>
      <ul>
        {mercadoPago && (
          <li>
            <strong>Mercado Pago</strong>, al finalizar la compra: tarjeta de crédito, débito o
            dinero en cuenta.
          </li>
        )}
        <li>
          <strong>Transferencia bancaria</strong>: te pasamos el CBU o alias al confirmar el pedido.
        </li>
        {!mercadoPago && (
          <li>
            <strong>Mercado Pago</strong>: te mandamos un link de pago (tarjeta de crédito o
            débito).
          </li>
        )}
        <li>
          <strong>Efectivo</strong>: solo si retirás en Rafaela, Santa Fe, en un punto que
          coordinamos con vos.
        </li>
      </ul>
      <p>
        Los datos de tu tarjeta los carga Mercado Pago: nunca pasan por este sitio y nunca te los
        vamos a pedir por WhatsApp.
      </p>

      <h2>Precios</h2>
      <p>
        Están en pesos argentinos e incluyen IVA. No incluyen el envío, que depende del destino y te
        informamos antes de que pagues.
      </p>

      <h2>Cupones de descuento</h2>
      <p>
        Se carga uno solo por pedido, en el carrito. El descuento se aplica sobre las prendas, no
        sobre el envío. Los pedidos con cupón se pagan coordinando por WhatsApp.
      </p>
    </div>
  );
}

/* ---- Envíos ------------------------------------------------------------ */

export function Envios({ mercadoPago }: { mercadoPago: boolean }) {
  return (
    <div className="prosa">
      <h2>A todo el país</h2>
      <p>
        Enviamos por correo a cualquier localidad de Argentina, siempre con número de seguimiento.
      </p>

      <h2>Plazos</h2>
      <ul>
        <li>
          <strong>Preparación:</strong> 1 a 3 días hábiles desde que se acredita el pago.
        </li>
        <li>
          <strong>Entrega:</strong> 4 a 8 días hábiles según la localidad, contados desde el
          despacho.
        </li>
      </ul>
      <p>Son los plazos estimados del correo: en fechas de mucha demanda pueden extenderse.</p>

      <h2>Costo</h2>
      <p>
        Depende del destino y del tamaño del paquete. Te lo confirmamos por WhatsApp antes de que lo
        pagues: nunca se cobra un envío que no hayas aceptado.
        {mercadoPago &&
          ' Si pagás con Mercado Pago, el pago cubre las prendas y el envío se abona aparte.'}
      </p>

      <h2>Retiro en Rafaela</h2>
      <p>
        Si estás en Rafaela, Santa Fe, podés retirar sin costo de envío. Coordinamos el lugar y el
        horario por WhatsApp, y ahí también podés pagar en efectivo.
      </p>

      <h2>Si algo sale mal con la entrega</h2>
      <p>
        Si el paquete se demora más de lo previsto, llega dañado o no llega, escribinos con el
        número de pedido y lo resolvemos con el correo.
      </p>
    </div>
  );
}

/* ---- Cambios y devoluciones ------------------------------------------- */

export function CambiosYDevoluciones() {
  return (
    <div className="prosa">
      <p>
        Hay tres situaciones distintas. Para cualquiera, escribinos por WhatsApp o a{' '}
        <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> con el número de pedido.
      </p>

      <h2>1. Cambio de talle o color</h2>
      <p>
        Tenés <strong>7 días corridos</strong> desde que recibís el pedido. La prenda tiene que
        estar sin uso, sin lavar y con las etiquetas. El envío de vuelta lo coordinamos nosotros,
        sin costo para vos, y el cambio está sujeto al stock que haya en ese momento.
      </p>

      <h2>2. Arrepentimiento de la compra</h2>
      <p>
        Por ley podés cancelar la compra dentro de los <strong>10 días corridos</strong> desde que
        recibís el pedido, sin dar explicaciones (artículo 34 de la Ley 24.240 y artículo 1110 del
        Código Civil y Comercial).
      </p>
      <ul>
        <li>
          Lo pedís desde el <Link to="/arrepentimiento">Botón de arrepentimiento</Link>, sin
          registrarte.
        </li>
        <li>Te respondemos dentro de las 24 horas con el código de tu solicitud.</li>
        <li>
          La prenda tiene que volver sin uso.{' '}
          <strong>El envío de la devolución lo pagamos nosotros.</strong>
        </li>
        <li>Cuando la recibimos, te devolvemos todo lo que pagaste, por el mismo medio de pago.</li>
      </ul>

      <h2>3. Falla o defecto</h2>
      <p>
        Las prendas tienen <strong>garantía legal de 6 meses</strong> desde la entrega por cualquier
        defecto (artículo 11 de la Ley 24.240). Si una prenda llega fallada o se daña por un defecto
        de fabricación, te la cambiamos o te devolvemos el dinero, a tu elección. Los envíos corren
        por nuestra cuenta.
      </p>
    </div>
  );
}

/* ---- Guía de talles ----------------------------------------------------- */

export function GuiaDeTalles() {
  return (
    <div>
      <div className="grid gap-12 xl:grid-cols-2 xl:gap-10">
        {TABLAS_TALLES.map((tabla) => (
          <div key={tabla.key}>
            <h2 className="mb-3 text-[0.8rem] font-bold tracking-[0.14em] text-ink uppercase">
              {tabla.label}
            </h2>
            <TallesTable tabla={tabla} />
          </div>
        ))}
      </div>
      <div className="prosa mt-10 max-w-[68ch]">
        <h2>Cómo elegir</h2>
        <p>{TIP_TALLES}</p>
        <p>
          Cada ficha de producto dice el calce de la prenda (regular, baggy u oversize). Si dudás,
          escribinos con tu altura y el talle que usás y te decimos cuál conviene.
        </p>
      </div>
    </div>
  );
}

/* ---- Preguntas frecuentes ---------------------------------------------- */

export function PreguntasFrecuentes() {
  return (
    <Accordion
      items={PREGUNTAS.map((p) => ({
        titulo: p.titulo,
        contenido: p.contenido ?? <p>{p.texto}</p>,
      }))}
      inicial={0}
    />
  );
}

/* ---- Nosotros ------------------------------------------------------------ */

const VALORES = [
  {
    titulo: 'Drops chicos',
    texto:
      'Cada drop trae pocas unidades por talle y no se repone: lo que ves hoy puede no estar mañana.',
  },
  {
    titulo: 'Materiales elegidos',
    texto: 'Cada ficha detalla la tela, la composición y cómo cuidar la prenda.',
  },
  {
    titulo: 'Trato directo',
    texto: 'Del otro lado hay una persona. Coordinás todo por WhatsApp y sabés con quién hablás.',
  },
];

export function Nosotros() {
  return (
    <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_16rem] md:gap-12">
      <div className="prosa">
        <p>
          BYKODA nació en Rafaela, Santa Fe, con una idea simple: que se pueda comprar ropa urbana
          buena sin pasar por una cadena impersonal. Elegimos cada prenda una por una, traemos pocas
          unidades por talle y vendemos hablando con cada cliente.
        </p>
        <p>
          Lo que ves en el sitio es lo que tenemos en stock, con el talle y la tela que dice la
          ficha. ¿Dudás con un talle o un color? Escribinos y te mandamos medidas o más fotos antes
          de comprar.
        </p>
        {VALORES.map((v) => (
          <div key={v.titulo}>
            <h2>{v.titulo}</h2>
            <p>{v.texto}</p>
          </div>
        ))}
        <div className="pt-4">
          <ButtonLink to="/catalogo">Ver el catálogo</ButtonLink>
        </div>
      </div>
      <img
        src="/imagenes/chat4.webp"
        alt="Modelo con campera de BYKODA bajo un foco sobre fondo negro"
        loading="lazy"
        decoding="async"
        className="aspect-4/5 w-full bg-black object-cover md:sticky md:top-24"
      />
    </div>
  );
}

/* ---- Contacto ------------------------------------------------------------ */

const TEMAS = [
  { value: 'pedido', label: 'Estado de mi pedido' },
  { value: 'talles', label: 'Dudas con el talle' },
  { value: 'stock', label: 'Disponibilidad y stock' },
  { value: 'envio', label: 'Envíos y demoras' },
  { value: 'cambio', label: 'Cambios y devoluciones' },
  { value: 'reclamo', label: 'Reclamo' },
  { value: 'mayorista', label: 'Venta mayorista' },
  { value: 'otro', label: 'Otra consulta' },
];

const esquemaConsulta = z.object({
  nombre: z.string().trim().min(1, 'Decinos tu nombre.'),
  telefono: z
    .string()
    .trim()
    .refine(
      (v) => v.replace(/\D/g, '').length >= 8,
      'Ingresá tu número completo, con característica.',
    ),
  tema: z.string(),
  mensaje: z.string().trim().max(800, 'El mensaje puede tener hasta 800 caracteres.'),
});
type Consulta = z.infer<typeof esquemaConsulta>;

const CANALES = [
  {
    href: `https://wa.me/${WA_NUMBER}`,
    externo: true,
    icono: <IconWhatsapp size={18} />,
    titulo: 'WhatsApp',
    detalle: WA_TEL_VISIBLE,
  },
  {
    href: INSTAGRAM,
    externo: true,
    icono: <IconInstagram size={18} />,
    titulo: 'Instagram',
    detalle: '@__bykoda',
  },
  {
    href: `mailto:${LEGAL.email}`,
    externo: false,
    icono: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    ),
    titulo: 'Email',
    detalle: LEGAL.email,
  },
];

export function Contacto() {
  const showToast = useToastStore((s) => s.showToast);
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<Consulta>({
    resolver: zodResolver(esquemaConsulta),
    defaultValues: { nombre: '', telefono: '', tema: 'pedido', mensaje: '' },
    mode: 'onTouched',
  });

  function alEnviar(e: FormEvent<HTMLFormElement>) {
    // WhatsApp se abre dentro del mismo click (antes de cualquier await), si no
    // el navegador lo bloquea como popup. Los errores los pinta handleSubmit.
    const datos = esquemaConsulta.safeParse(getValues());
    if (datos.success) {
      const tema = TEMAS.find((t) => t.value === datos.data.tema)?.label ?? 'Consulta';
      const url = construirURLConsultaWhatsApp(
        datos.data.nombre,
        datos.data.telefono,
        tema,
        datos.data.mensaje,
      );
      abrirEnPestanaNueva(url);
      showToast('Abrimos WhatsApp con tu consulta', 'success');
      setValue('mensaje', '');
    }
    void handleSubmit(() => undefined)(e);
  }

  const campo = (nombre: keyof Consulta) => ({
    id: `ct-${nombre}`,
    'aria-invalid': Boolean(errors[nombre]),
    'aria-describedby': errors[nombre] ? `ct-${nombre}-error` : undefined,
    ...register(nombre),
  });

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-10 xl:grid-cols-[minmax(0,1fr)_18rem]">
      <form onSubmit={alEnviar} noValidate className="grid gap-5 border border-line p-5 sm:p-7">
        <p className="text-sm leading-relaxed text-ink-2">
          Completá el formulario y se abre WhatsApp con tu consulta ya redactada.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="ct-nombre" label="Nombre" requerido error={errors.nombre?.message}>
            <Input {...campo('nombre')} autoComplete="name" />
          </Field>
          <Field id="ct-telefono" label="Teléfono" requerido error={errors.telefono?.message}>
            <Input
              {...campo('telefono')}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="Con característica"
            />
          </Field>
        </div>
        <Field id="ct-tema" label="Tema">
          <Select {...campo('tema')}>
            {TEMAS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="ct-mensaje" label="Mensaje" error={errors.mensaje?.message}>
          <Textarea
            {...campo('mensaje')}
            rows={4}
            placeholder="Contanos en qué te podemos ayudar (opcional)"
          />
        </Field>
        <Button
          type="submit"
          variante="whatsapp"
          tamano="lg"
          className="h-auto min-h-13 py-3 text-center whitespace-normal"
        >
          <IconWhatsapp size={18} />
          Enviar consulta por WhatsApp
        </Button>
      </form>

      <div>
        <h2 className="eyebrow">Atención al cliente</h2>
        <ul className="mt-3 grid gap-px border border-line bg-line">
          {CANALES.map((c) => (
            <li key={c.titulo}>
              <a
                href={c.href}
                {...(c.externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="flex items-center gap-4 bg-ground px-5 py-4 text-ink transition-colors hover:bg-hover"
              >
                <span className="text-ink-2">{c.icono}</span>
                <span className="grid gap-0.5">
                  <span className="text-sm font-semibold">{c.titulo}</span>
                  <span className="text-xs break-all text-ink-3">{c.detalle}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-ink-2">
          Respondemos {HORARIO_ATENCION}. Fuera de ese horario, te contestamos al día siguiente.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-ink-2">
          ¿Querés cancelar una compra? Usá el{' '}
          <Link to="/arrepentimiento" className="text-ink underline underline-offset-4">
            Botón de arrepentimiento
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

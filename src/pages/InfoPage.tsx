import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TallesTable } from '@/components/TallesTable';
import { IconInstagram, IconWhatsapp } from '@/components/icons';
import { Revelar, RevelarGrupo, RevelarItem } from '@/components/motion/Revelar';
import { Accordion, Button, ButtonLink, Field, Input, Select, Textarea } from '@/components/ui';
import { TABLAS_TALLES, TIP_TALLES } from '@/lib/talles';
import { construirURLConsultaWhatsApp, WA_NUMBER, WA_TEL_VISIBLE } from '@/lib/whatsapp';
import { useToastStore } from '@/store/toast';
import { useSEO } from '@/lib/seo';
import { cn } from '@/lib/cn';

const EMAIL = 'admin@bykoda.store';
const INSTAGRAM = 'https://www.instagram.com/__bykoda/';

const SECCIONES = [
  { id: 'nosotros', label: 'Nosotros' },
  { id: 'faq', label: 'Preguntas frecuentes' },
  { id: 'talles', label: 'Guía de talles' },
  { id: 'contacto', label: 'Contacto' },
];

const TEMAS = [
  { value: 'pedido', label: 'Estado de mi pedido' },
  { value: 'talles', label: 'Dudas con el talle' },
  { value: 'stock', label: 'Disponibilidad y stock' },
  { value: 'envio', label: 'Envíos y demoras' },
  { value: 'cambio', label: 'Cambios y devoluciones' },
  { value: 'mayorista', label: 'Venta mayorista' },
  { value: 'otro', label: 'Otra consulta' },
];

const VALORES = [
  {
    titulo: 'Producción corta',
    texto:
      'Trabajamos con tiradas limitadas. Cada drop tiene pocas unidades por talle y no se repone: por eso lo que ves hoy puede no estar mañana.',
  },
  {
    titulo: 'Materiales elegidos',
    texto:
      'Denim rígido de gramaje pesado, frisa perchada y algodón peinado. Cada ficha de producto detalla la tela, la composición y cómo cuidarla.',
  },
  {
    titulo: 'Trato directo',
    texto:
      'No hay intermediarios ni checkout automático. Coordinás el pedido con nosotros por WhatsApp y sabés siempre con quién estás hablando.',
  },
];

const lista = 'grid list-disc gap-1.5 pl-5';

const FAQS = [
  {
    titulo: '¿Cómo compro? ¿Por qué el pago es por WhatsApp?',
    contenido: (
      <>
        <p>
          No cobramos con tarjeta dentro del sitio: preferimos coordinar cada pedido de forma directa. El
          circuito es simple y no tiene costos ocultos.
        </p>
        <ol className="grid list-decimal gap-2 pl-5">
          <li>Elegís la prenda, el talle y la cantidad, y la agregás al carrito.</li>
          <li>
            En el carrito tocás <strong className="text-ink">Finalizar por WhatsApp</strong> y completás tus
            datos de contacto y envío.
          </li>
          <li>
            Registramos el pedido con un número y se abre WhatsApp con todo ya escrito: prendas, talles,
            cantidades, cupón y total.
          </li>
          <li>Te confirmamos stock, el costo de envío y te pasamos los datos para pagar.</li>
          <li>Con el pago acreditado despachamos en 1 a 3 días hábiles y te pasamos el seguimiento.</li>
        </ol>
        <p className="mt-3 text-xs text-ink-3">Nunca te vamos a pedir datos de tarjeta ni claves por WhatsApp.</p>
      </>
    ),
  },
  {
    titulo: '¿Qué medios de pago aceptan?',
    contenido: (
      <ul className={lista}>
        <li>
          <strong className="text-ink">Transferencia bancaria</strong>: te pasamos el CBU o alias al confirmar
          el pedido.
        </li>
        <li>
          <strong className="text-ink">Mercado Pago</strong>: link de pago, admite tarjeta de crédito y débito.
        </li>
        <li>
          <strong className="text-ink">Efectivo</strong>: solo para retiro coordinado en Rafaela, Santa Fe.
        </li>
      </ul>
    ),
  },
  {
    titulo: '¿Cuánto tarda el envío y cuánto cuesta?',
    contenido: (
      <>
        <ul className={lista}>
          <li>Enviamos a todo el país por correo, con seguimiento.</li>
          <li>Preparación: 1 a 3 días hábiles desde que se acredita el pago.</li>
          <li>Entrega: 4 a 8 días hábiles según la localidad.</li>
          <li>El costo depende del destino y del peso: te lo confirmamos por WhatsApp antes de que pagues.</li>
        </ul>
        <p className="mt-3 text-xs text-ink-3">Los tiempos son estimados del correo y pueden extenderse en fechas pico.</p>
      </>
    ),
  },
  {
    titulo: '¿Puedo cambiar el talle si no me queda?',
    contenido: (
      <>
        <p>
          Sí. Tenés <strong className="text-ink">7 días corridos</strong> desde que recibís el pedido para pedir
          un cambio, siempre que la prenda esté sin uso, sin lavar y con las etiquetas originales.
        </p>
        <ul className={lista}>
          <li>
            <strong className="text-ink">Cambio de talle o color:</strong> coordinamos el envío de vuelta sin
            costo adicional para vos, sujeto a stock.
          </li>
          <li>
            <strong className="text-ink">Falla de fábrica:</strong> reposición o reintegro total, a tu elección.
          </li>
          <li>
            <strong className="text-ink">Arrepentimiento:</strong> aceptamos la devolución dentro del plazo; el
            envío de retorno corre por tu cuenta.
          </li>
        </ul>
        <p className="mt-3">
          Para arrancar el trámite escribinos por WhatsApp o a <a href={`mailto:${EMAIL}`}>{EMAIL}</a> citando el
          número o la referencia del pedido.
        </p>
      </>
    ),
  },
  {
    titulo: '¿Cómo sé qué talle pedir?',
    contenido: (
      <p>
        Cada ficha de producto incluye el calce (regular, baggy u oversize) y la tabla de medidas que
        corresponde. También podés consultar la <a href="#talles">guía de talles completa</a> más abajo. Si dudás
        entre dos talles, escribinos y te decimos cuál conviene según la prenda.
      </p>
    ),
  },
  {
    titulo: '¿Los cupones se pueden combinar?',
    contenido: (
      <p>
        No: se aplica un solo cupón por pedido, sobre el subtotal de las prendas y antes del costo de envío. El
        descuento queda reflejado en el mensaje de WhatsApp que enviás.
      </p>
    ),
  },
  {
    titulo: '¿Hacen venta mayorista?',
    contenido: (
      <p>
        Sí, desde 10 unidades. Escribinos por WhatsApp eligiendo el tema <em>Venta mayorista</em> y te pasamos
        la lista de precios vigente.
      </p>
    ),
  },
  {
    titulo: '¿Las fotos son reales?',
    contenido: (
      <p>
        Todas las fotos son de las prendas que vendemos. Pueden existir mínimas diferencias de color según la
        calibración de tu pantalla. Los precios están en pesos argentinos e incluyen IVA.
      </p>
    ),
  },
];

const esquemaConsulta = z.object({
  nombre: z.string().trim().min(1, 'Decinos tu nombre.'),
  telefono: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, '').length >= 8, 'Ingresá tu número completo, con característica.'),
  tema: z.string(),
  mensaje: z.string().trim().max(800, 'El mensaje puede tener hasta 800 caracteres.'),
});
type Consulta = z.infer<typeof esquemaConsulta>;

export function InfoPage() {
  useSEO({
    title: 'Nosotros, FAQ y contacto | BYKODA',
    description:
      'Quiénes somos, cómo comprar por WhatsApp, envíos, cambios, guía de talles y contacto directo con BYKODA.',
    canonical: '/info',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '¿Cómo compro en BYKODA?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Elegís la prenda y el talle, la agregás al carrito y finalizás por WhatsApp. Registramos el pedido y coordinamos pago y envío.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Cuánto tarda el envío?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Preparamos el pedido en 1 a 3 días hábiles y el correo entrega en 4 a 8 días hábiles a todo el país.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Puedo cambiar el talle?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sí, dentro de los 7 días corridos de recibido el pedido, con la prenda sin uso y con etiquetas.',
          },
        },
      ],
    },
  });

  const showToast = useToastStore((s) => s.showToast);
  const [activa, setActiva] = useState('nosotros');

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

  // Marca en la sub-navegación la sección que se está leyendo.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entradas) => {
        const visible = entradas
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiva(visible.target.id);
      },
      { rootMargin: '-30% 0px -60% 0px' },
    );
    for (const s of SECCIONES) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  function alEnviar(e: FormEvent<HTMLFormElement>) {
    // WhatsApp se abre dentro del mismo click (antes de cualquier await), si no
    // el navegador lo bloquea como popup. Los errores los pinta handleSubmit.
    const datos = esquemaConsulta.safeParse(getValues());
    if (datos.success) {
      const tema = TEMAS.find((t) => t.value === datos.data.tema)?.label ?? 'Consulta';
      const url = construirURLConsultaWhatsApp(datos.data.nombre, datos.data.telefono, tema, datos.data.mensaje);
      if (!window.open(url, '_blank', 'noopener,noreferrer')) window.location.href = url;
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
    <div className="pb-[clamp(4rem,9vw,7rem)]">
      <header className="area-pagina pt-[clamp(2rem,5vw,3.5rem)] pb-8">
        <p className="eyebrow">BYKODA</p>
        <h1 className="titulo-display mt-2 max-w-[16ch] text-[clamp(3rem,8vw,5.5rem)] text-ink uppercase">
          Todo lo que necesitás saber
        </h1>
        <p className="mt-4 max-w-[58ch] text-[0.95rem] leading-relaxed text-ink-2">
          Quiénes somos, cómo funciona la compra por WhatsApp, envíos y cambios, guía de talles y cómo
          escribirnos. Todo en una sola página.
        </p>
      </header>

      <nav
        aria-label="Secciones de esta página"
        className="sticky top-16 z-40 border-y border-line bg-ground/90 backdrop-blur-xl"
      >
        <div className="area-pagina flex gap-1 overflow-x-auto py-2 [scrollbar-width:none]">
          {SECCIONES.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              aria-current={activa === s.id ? 'true' : undefined}
              className={cn(
                'shrink-0 rounded-lg px-3.5 py-2 text-[0.78rem] whitespace-nowrap transition-colors',
                activa === s.id ? 'bg-invert font-semibold text-on-invert' : 'text-ink-3 hover:bg-hover hover:text-ink',
              )}
            >
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      <section id="nosotros" aria-labelledby="titulo-nosotros" className="area-pagina scroll-mt-32 pt-[clamp(3rem,7vw,5rem)]">
        <div className="grid items-center gap-10 md:grid-cols-12 md:gap-14">
          <Revelar className="md:col-span-7">
            <p className="eyebrow">Nosotros</p>
            <h2 id="titulo-nosotros" className="titulo-display mt-3 text-[clamp(2.4rem,5.5vw,4rem)] text-ink uppercase">
              Streetwear argentino, en tiradas cortas
            </h2>
            <div className="mt-5 grid max-w-[62ch] gap-4 text-[0.95rem] leading-relaxed text-ink-2">
              <p>
                BYKODA nació en Rafaela, Santa Fe, con una idea simple: que se pueda comprar ropa urbana buena sin
                pasar por una cadena impersonal. Diseñamos y seleccionamos cada prenda, producimos poco y vendemos
                hablando con cada cliente.
              </p>
              <p>
                No somos un marketplace ni revendemos catálogos de terceros. Lo que ves en el sitio es lo que
                tenemos, con el talle y la tela que dice la ficha.
              </p>
            </div>
            <ButtonLink to="/catalogo" className="mt-8">
              Ver el catálogo
            </ButtonLink>
          </Revelar>
          <Revelar delay={0.1} className="md:col-span-5">
            <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-black">
              <img
                src="/imagenes/chat4.webp"
                alt="Modelo con campera de BYKODA bajo un foco sobre fondo negro"
                loading="lazy"
                decoding="async"
                className="size-full object-cover object-center"
              />
            </div>
          </Revelar>
        </div>

        <RevelarGrupo className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
          {VALORES.map((v) => (
            <RevelarItem key={v.titulo} className="bg-ground p-7">
              <h3 className="text-sm font-semibold tracking-[0.12em] text-ink uppercase">{v.titulo}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-2">{v.texto}</p>
            </RevelarItem>
          ))}
        </RevelarGrupo>
      </section>

      <section
        id="faq"
        aria-labelledby="titulo-faq"
        className="area-pagina mt-[clamp(4rem,8vw,6rem)] scroll-mt-32 border-t border-line pt-[clamp(3rem,7vw,5rem)]"
      >
        <div className="grid gap-10 lg:grid-cols-12">
          <Revelar className="lg:col-span-4">
            <p className="eyebrow">Preguntas frecuentes</p>
            <h2 id="titulo-faq" className="titulo-display mt-3 text-[clamp(2.4rem,5.5vw,4rem)] text-ink uppercase">
              Dudas que aparecen siempre
            </h2>
            <p className="mt-4 max-w-[36ch] text-sm leading-relaxed text-ink-2">
              ¿No está tu pregunta? <a href="#contacto" className="text-ink underline underline-offset-4">Escribinos</a> y
              te respondemos por WhatsApp.
            </p>
          </Revelar>
          <Revelar delay={0.05} className="lg:col-span-8">
            <Accordion items={FAQS} inicial={0} />
          </Revelar>
        </div>
      </section>

      <section
        id="talles"
        aria-labelledby="titulo-talles"
        className="area-pagina mt-[clamp(4rem,8vw,6rem)] scroll-mt-32 border-t border-line pt-[clamp(3rem,7vw,5rem)]"
      >
        <Revelar>
          <p className="eyebrow">Guía de talles</p>
          <h2 id="titulo-talles" className="titulo-display mt-3 text-[clamp(2.4rem,5.5vw,4rem)] text-ink uppercase">
            Encontrá tu talle
          </h2>
          <p className="mt-4 max-w-[60ch] text-sm leading-relaxed text-ink-2">
            Todas las medidas están en centímetros y tomadas sobre la prenda apoyada en plano.
          </p>
        </Revelar>
        <RevelarGrupo className="mt-8 grid gap-10 lg:grid-cols-2">
          {TABLAS_TALLES.map((tabla) => (
            <RevelarItem key={tabla.key}>
              <h3 className="eyebrow mb-3">{tabla.label}</h3>
              <TallesTable tabla={tabla} />
            </RevelarItem>
          ))}
        </RevelarGrupo>
        <p className="mt-6 max-w-[70ch] text-sm leading-relaxed text-ink-3">{TIP_TALLES}</p>
      </section>

      <section
        id="contacto"
        aria-labelledby="titulo-contacto"
        className="area-pagina mt-[clamp(4rem,8vw,6rem)] scroll-mt-32 border-t border-line pt-[clamp(3rem,7vw,5rem)]"
      >
        <Revelar>
          <p className="eyebrow">Contacto</p>
          <h2 id="titulo-contacto" className="titulo-display mt-3 text-[clamp(2.4rem,5.5vw,4rem)] text-ink uppercase">
            Escribinos
          </h2>
        </Revelar>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-12 lg:gap-12">
          <Revelar className="lg:col-span-7">
            <form onSubmit={alEnviar} noValidate className="grid gap-5 rounded-2xl border border-line bg-surface p-7">
              <p className="text-sm leading-relaxed text-ink-2">
                Completá el formulario y se abre WhatsApp con tu consulta ya redactada.
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="ct-nombre" label="Nombre" requerido error={errors.nombre?.message}>
                  <Input {...campo('nombre')} autoComplete="name" placeholder="Lucas Pérez" />
                </Field>
                <Field id="ct-telefono" label="Teléfono" requerido error={errors.telefono?.message}>
                  <Input {...campo('telefono')} type="tel" inputMode="tel" autoComplete="tel" placeholder="3492 123456" />
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
                <Textarea {...campo('mensaje')} rows={4} placeholder="Contanos en qué te podemos ayudar… (opcional)" />
              </Field>
              <Button type="submit" variante="whatsapp" tamano="lg">
                <IconWhatsapp size={18} />
                Enviar consulta por WhatsApp
              </Button>
            </form>
          </Revelar>

          <Revelar delay={0.08} className="lg:col-span-5">
            <h3 className="eyebrow">Canales directos</h3>
            <ul className="mt-3 grid gap-px overflow-hidden rounded-2xl border border-line bg-line">
              {[
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
                  href: `mailto:${EMAIL}`,
                  externo: false,
                  icono: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                  ),
                  titulo: 'Email',
                  detalle: EMAIL,
                },
              ].map((c) => (
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
            <p className="mt-4 text-sm leading-relaxed text-ink-3">
              Respondemos de lunes a sábado, de 9 a 20 h (hora de Argentina). Fuera de ese horario te contestamos
              al día siguiente.
            </p>
            <p className="mt-6 text-sm text-ink-2">
              ¿Querés ver prendas? <Link to="/catalogo" className="text-ink underline underline-offset-4">Ir al catálogo</Link>.
            </p>
          </Revelar>
        </div>
      </section>
    </div>
  );
}

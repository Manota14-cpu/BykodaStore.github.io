import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useSEO } from '@/lib/seo';
import { useMercadoPago } from '@/hooks/useCatalogo';
import { AyudaLayout } from './ayuda/AyudaLayout';
import { buscarSeccion } from './ayuda/secciones';
import {
  CambiosYDevoluciones,
  ComoComprar,
  Contacto,
  Envios,
  GuiaDeTalles,
  Nosotros,
  PreguntasFrecuentes,
} from './ayuda/contenido';
import { Privacidad, TerminosYCondiciones } from './ayuda/legales';
import { PREGUNTAS } from './ayuda/preguntas';
import { NotFoundPage } from './NotFoundPage';

interface Pagina {
  bajada?: string;
  descripcionSeo: string;
  ancho?: 'texto' | 'amplio';
  render: (opciones: { mercadoPago: boolean }) => ReactNode;
}

const PAGINAS: Record<string, Pagina> = {
  'como-comprar': {
    bajada:
      'Comprás en el sitio y terminás con Mercado Pago o por WhatsApp, hablando con una persona.',
    descripcionSeo: 'Cómo comprar en BYKODA paso a paso, medios de pago, precios y cupones.',
    render: ({ mercadoPago }) => <ComoComprar mercadoPago={mercadoPago} />,
  },
  envios: {
    bajada: 'Enviamos a todo el país, con seguimiento.',
    descripcionSeo:
      'Envíos de BYKODA a todo el país: plazos, costos, seguimiento y retiro en Rafaela.',
    render: ({ mercadoPago }) => <Envios mercadoPago={mercadoPago} />,
  },
  'cambios-y-devoluciones': {
    bajada: 'Cambio de talle, arrepentimiento de la compra y garantía por fallas.',
    descripcionSeo:
      'Cambios de talle en 7 días, arrepentimiento en 10 días con devolución a nuestro cargo y garantía de 6 meses.',
    render: () => <CambiosYDevoluciones />,
  },
  'guia-de-talles': {
    bajada: 'Medidas en centímetros, tomadas sobre la prenda apoyada en plano.',
    descripcionSeo:
      'Guía de talles de BYKODA: medidas de remeras, buzos, camperas, jeans y pantalones.',
    ancho: 'amplio',
    render: () => <GuiaDeTalles />,
  },
  'preguntas-frecuentes': {
    descripcionSeo:
      'Preguntas frecuentes sobre talles, cambios, cupones, stock y venta mayorista en BYKODA.',
    render: () => <PreguntasFrecuentes />,
  },
  nosotros: {
    bajada: 'Streetwear argentino, en drops chicos.',
    descripcionSeo:
      'BYKODA es una tienda de streetwear de Rafaela, Santa Fe, con drops chicos y trato directo.',
    ancho: 'amplio',
    render: () => <Nosotros />,
  },
  contacto: {
    bajada: 'Te responde una persona. Elegí el canal que te quede más cómodo.',
    descripcionSeo: 'Contacto de BYKODA: WhatsApp, Instagram, mail y horarios de atención.',
    ancho: 'amplio',
    render: () => <Contacto />,
  },
  'terminos-y-condiciones': {
    descripcionSeo: 'Términos y condiciones de compra en la tienda online de BYKODA.',
    render: () => <TerminosYCondiciones />,
  },
  privacidad: {
    descripcionSeo:
      'Política de privacidad de BYKODA: qué datos pedimos, para qué y cuáles son tus derechos.',
    render: () => <Privacidad />,
  },
};

/** Una sección del centro de ayuda: /info/<slug>. */
export function SeccionAyudaPage() {
  const { seccion: slug } = useParams();
  const seccion = buscarSeccion(slug);
  const pagina = seccion ? PAGINAS[seccion.slug] : undefined;
  const mercadoPago = useMercadoPago();

  useSEO({
    title: seccion ? `${seccion.titulo} | BYKODA` : 'Página no encontrada | BYKODA',
    description: pagina?.descripcionSeo,
    canonical: seccion ? seccion.ruta : '/404',
    jsonLd:
      seccion?.slug === 'preguntas-frecuentes'
        ? {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: PREGUNTAS.map((p) => ({
              '@type': 'Question',
              name: p.titulo,
              acceptedAnswer: { '@type': 'Answer', text: p.texto },
            })),
          }
        : undefined,
  });

  if (!seccion || !pagina) return <NotFoundPage />;

  return (
    <AyudaLayout
      actual={seccion.slug}
      titulo={seccion.titulo}
      bajada={pagina.bajada}
      ancho={pagina.ancho}
    >
      {pagina.render({ mercadoPago })}
    </AyudaLayout>
  );
}

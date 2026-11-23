/**
 * Secciones del centro de ayuda (/info). Cada una es una página propia en
 * /info/<slug>; el botón de arrepentimiento vive en /arrepentimiento porque
 * tiene que poder enlazarse directo desde cualquier lado.
 */
export interface SeccionAyuda {
  slug: string;
  titulo: string;
  descripcion: string;
  /** Ruta completa, por si la sección no cuelga de /info. */
  ruta: string;
}

const seccion = (slug: string, titulo: string, descripcion: string): SeccionAyuda => ({
  slug,
  titulo,
  descripcion,
  ruta: `/info/${slug}`,
});

export const GRUPOS_AYUDA: { titulo: string; secciones: SeccionAyuda[] }[] = [
  {
    titulo: 'Tu compra',
    secciones: [
      seccion('como-comprar', 'Cómo comprar', 'Paso a paso del pedido y medios de pago.'),
      seccion('envios', 'Envíos', 'Plazos, costos y seguimiento a todo el país.'),
      seccion(
        'cambios-y-devoluciones',
        'Cambios y devoluciones',
        'Cambio de talle, arrepentimiento y garantía.',
      ),
      seccion('guia-de-talles', 'Guía de talles', 'Medidas en centímetros de cada tipo de prenda.'),
      seccion(
        'preguntas-frecuentes',
        'Preguntas frecuentes',
        'Cupones, stock, fotos y venta mayorista.',
      ),
    ],
  },
  {
    titulo: 'BYKODA',
    secciones: [
      seccion('nosotros', 'Nosotros', 'Quiénes somos y cómo trabajamos.'),
      seccion('contacto', 'Contacto', 'WhatsApp, Instagram, mail y horarios.'),
    ],
  },
  {
    titulo: 'Legales',
    secciones: [
      seccion(
        'terminos-y-condiciones',
        'Términos y condiciones',
        'Las reglas de compra en este sitio.',
      ),
      seccion('privacidad', 'Política de privacidad', 'Qué datos pedimos y para qué.'),
      {
        slug: 'arrepentimiento',
        titulo: 'Botón de arrepentimiento',
        descripcion: 'Cancelá tu compra dentro de los 10 días.',
        ruta: '/arrepentimiento',
      },
    ],
  },
];

export const SECCIONES_AYUDA = GRUPOS_AYUDA.flatMap((g) => g.secciones);

export function buscarSeccion(slug: string | undefined): SeccionAyuda | undefined {
  return SECCIONES_AYUDA.find((s) => s.slug === slug && s.ruta === `/info/${slug}`);
}

/** Anclas de la página vieja (/info#faq) → página nueva. */
export const ANCLAS_VIEJAS: Record<string, string> = {
  nosotros: '/info/nosotros',
  faq: '/info/preguntas-frecuentes',
  talles: '/info/guia-de-talles',
  contacto: '/info/contacto',
};

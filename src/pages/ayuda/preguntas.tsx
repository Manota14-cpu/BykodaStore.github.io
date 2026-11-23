import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export interface Pregunta {
  titulo: string;
  /** Respuesta en texto plano: se usa también para los datos estructurados de Google. */
  texto: string;
  contenido?: ReactNode;
}

export const PREGUNTAS: Pregunta[] = [
  {
    titulo: '¿Cómo sé qué talle pedir?',
    texto:
      'Cada ficha incluye el calce y la tabla de medidas. Si dudás entre dos talles, escribinos y te decimos cuál conviene.',
    contenido: (
      <p>
        Cada ficha incluye el calce (regular, baggy u oversize) y la tabla de medidas. También está
        la <Link to="/info/guia-de-talles">guía de talles completa</Link>. Si dudás entre dos
        talles, escribinos y te decimos cuál conviene.
      </p>
    ),
  },
  {
    titulo: '¿Puedo cambiar el talle si no me queda?',
    texto:
      'Sí, dentro de los 7 días corridos de recibido el pedido, con la prenda sin uso y con etiquetas.',
    contenido: (
      <p>
        Sí, dentro de los 7 días corridos de recibido el pedido, con la prenda sin uso y con
        etiquetas. Más detalles en{' '}
        <Link to="/info/cambios-y-devoluciones">Cambios y devoluciones</Link>.
      </p>
    ),
  },
  {
    titulo: '¿Puedo cancelar la compra?',
    texto:
      'Sí. Tenés 10 días corridos desde que recibís el pedido para arrepentirte, desde el Botón de arrepentimiento. El envío de la devolución lo pagamos nosotros.',
    contenido: (
      <p>
        Sí. Tenés 10 días corridos desde que recibís el pedido para arrepentirte, desde el{' '}
        <Link to="/arrepentimiento">Botón de arrepentimiento</Link>. El envío de la devolución lo
        pagamos nosotros y te devolvemos todo lo que pagaste.
      </p>
    ),
  },
  {
    titulo: '¿Qué significa "Quedan 2"?',
    texto: 'Que quedan pocas unidades de esa prenda. El stock se actualiza solo, en vivo.',
    contenido: (
      <p>
        Que quedan pocas unidades de esa prenda. El stock del sitio se actualiza solo: si algo se
        agota mientras lo tenés en el carrito, te avisamos.
      </p>
    ),
  },
  {
    titulo: '¿Van a reponer una prenda agotada?',
    texto: 'No. Cada drop trae pocas unidades y lo que se agota no vuelve.',
  },
  {
    titulo: '¿Los cupones se pueden combinar?',
    texto: 'No: se aplica un solo cupón por pedido, sobre las prendas y antes del costo de envío.',
  },
  {
    titulo: '¿Hacen venta mayorista?',
    texto:
      'Sí, desde 10 unidades. Escribinos por WhatsApp y te pasamos la lista de precios vigente.',
  },
  {
    titulo: '¿Las fotos son reales?',
    texto:
      'Todas las fotos son de las prendas que vendemos. Puede haber mínimas diferencias de color según la pantalla.',
  },
];

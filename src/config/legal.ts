/**
 * Datos legales del titular de la tienda. Los usan los Términos y condiciones,
 * la Política de privacidad y el pie de página.
 *
 * Completar con los datos reales antes de publicar (los pide la Ley de
 * Defensa del Consumidor: quién vende tiene que poder identificarse). Mientras
 * un campo esté vacío, esa línea no se muestra.
 */
export const LEGAL = {
  /** Nombre y apellido o razón social de quien vende (titular del CUIT). */
  titular: '',
  /** CUIT del titular, con guiones: 20-12345678-9. */
  cuit: '',
  /** Domicilio legal o comercial: calle, número, localidad y provincia. */
  domicilio: '',
  /** Link del formulario "Data Fiscal" (QR) de ARCA, si corresponde. */
  dataFiscalUrl: '',

  email: 'admin@bykoda.store',
  /** Fecha de la última actualización de los textos legales (se muestra arriba de cada uno). */
  actualizacion: '23 de noviembre de 2026',
} as const;

/** Formulario oficial de reclamos de la Ventanilla Federal Única (Disposición 890/2025). */
export const URL_RECLAMOS_CONSUMIDOR =
  'https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario';

/** Horario de atención al cliente. Se muestra en Contacto y en los Términos. */
export const HORARIO_ATENCION = 'de lunes a sábado, de 9 a 20 h (hora de Argentina)';

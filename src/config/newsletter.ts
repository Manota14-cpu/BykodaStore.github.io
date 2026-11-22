/**
 * Lista de espera / newsletter ("Enterate primero de cada drop").
 *
 * Los mails se guardan en un Google Form, cuyas respuestas van a una planilla.
 * Para conectarlo:
 *   1. Crear un Google Form con una sola pregunta de respuesta corta ("Email").
 *   2. En el formulario: ⋮ → "Obtener vínculo previamente completado", escribir
 *      algo en el campo y copiar el vínculo. Tiene esta forma:
 *      https://docs.google.com/forms/d/e/<ID>/viewform?usp=pp_url&entry.123456789=algo
 *   3. Pegar acá `https://docs.google.com/forms/d/e/<ID>/formResponse` en
 *      `formulario` y `entry.123456789` en `campoEmail`.
 *
 * Mientras esté vacío, el mail se manda a la tienda por WhatsApp para no perderlo.
 */
export const NEWSLETTER = {
  formulario: '',
  campoEmail: '',
};

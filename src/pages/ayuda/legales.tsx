import { Link } from 'react-router-dom';
import { HORARIO_ATENCION, LEGAL, URL_RECLAMOS_CONSUMIDOR } from '@/config/legal';
import { WA_TEL_VISIBLE } from '@/lib/whatsapp';

/** "BYKODA" o "BYKODA, de <titular> (CUIT …), con domicilio en …", según qué datos estén cargados. */
function Titular() {
  const partes = [
    LEGAL.titular && `de ${LEGAL.titular}`,
    LEGAL.cuit && `CUIT ${LEGAL.cuit}`,
    LEGAL.domicilio && `con domicilio en ${LEGAL.domicilio}`,
  ].filter(Boolean);
  return (
    <>
      <strong>BYKODA</strong>
      {partes.length > 0 && `, ${partes.join(', ')}`}
    </>
  );
}

function Actualizacion() {
  return <p className="text-xs text-ink-3">Última actualización: {LEGAL.actualizacion}.</p>;
}

/* ---- Términos y condiciones -------------------------------------------- */

export function TerminosYCondiciones() {
  return (
    <div className="prosa">
      <Actualizacion />

      <h2>1. Quiénes somos</h2>
      <p>
        Este sitio, www.bykoda.store, es la tienda online de <Titular />. En estos términos,
        "nosotros" es BYKODA y "vos" es quien navega o compra en el sitio.
      </p>

      <h2>2. Aceptación</h2>
      <p>
        Al hacer un pedido aceptás estos términos. Nada de lo que dicen limita los derechos que te
        dan la Ley 24.240 de Defensa del Consumidor y el Código Civil y Comercial de la Nación: si
        algo de este texto los contradijera, valen esas normas.
      </p>

      <h2>3. Productos, fotos y stock</h2>
      <p>
        Mostramos solo prendas que tenemos en stock. Las fotos son de las prendas que vendemos;
        puede haber mínimas diferencias de color según tu pantalla. Cada ficha informa talles, calce
        y tela. El stock se actualiza en vivo, pero dos personas pueden comprar la última unidad al
        mismo tiempo: si pasa, te avisamos y te devolvemos todo lo que hayas pagado.
      </p>

      <h2>4. Precios</h2>
      <p>
        Los precios están en pesos argentinos, incluyen IVA y no incluyen el envío. Pueden cambiar
        sin aviso, pero el precio que vale para tu compra es el que figuraba cuando hiciste el
        pedido.
      </p>

      <h2>5. Cómo se hace un pedido</h2>
      <ol>
        <li>Armás el carrito y completás tus datos de contacto y envío.</li>
        <li>El pedido se registra con un número y te confirmamos stock y costo de envío.</li>
        <li>
          Pagás con Mercado Pago, transferencia o, si retirás en Rafaela, en efectivo. El pedido
          queda confirmado cuando se acredita el pago.
        </li>
      </ol>
      <p>
        Los pagos con tarjeta los procesa Mercado Pago: los datos de tu tarjeta nunca pasan por este
        sitio. Nunca te vamos a pedir datos de tarjeta ni claves por WhatsApp.
      </p>

      <h2>6. Envíos</h2>
      <p>
        Enviamos a todo el país por correo, con seguimiento. Preparamos el pedido en 1 a 3 días
        hábiles desde que se acredita el pago; el correo entrega en 4 a 8 días hábiles según la
        localidad. Son plazos estimados. El costo del envío te lo informamos antes de que lo pagues.
        Detalles en <Link to="/info/envios">Envíos</Link>.
      </p>

      <h2>7. Cupones</h2>
      <p>
        Se aplica un cupón por pedido, sobre las prendas y no sobre el envío. Cada cupón tiene las
        condiciones que se informan al publicarlo (descuento, vencimiento y cantidad de usos) y no
        se puede canjear por dinero.
      </p>

      <h2>8. Cambio de talle o color</h2>
      <p>
        Además de lo que exige la ley, aceptamos cambios de talle o color dentro de los 7 días
        corridos desde que recibís el pedido, con la prenda sin uso, sin lavar y con etiquetas,
        sujetos a stock. El envío del cambio corre por nuestra cuenta.
      </p>

      <h2>9. Derecho de arrepentimiento</h2>
      <p>
        Tenés derecho a revocar la compra dentro de los <strong>10 días corridos</strong> desde que
        recibís el pedido o desde que se celebró la compra, lo último que ocurra, sin dar motivos ni
        pagar nada por eso (artículo 34 de la Ley 24.240 y artículos 1110 y siguientes del Código
        Civil y Comercial). Este derecho no se puede renunciar.
      </p>
      <ul>
        <li>
          Lo ejercés desde el <Link to="/arrepentimiento">Botón de arrepentimiento</Link>, sin
          registrarte, o escribiéndonos por cualquiera de nuestros canales.
        </li>
        <li>
          Dentro de las 24 horas te informamos, por el mismo medio, el código de tu solicitud.
        </li>
        <li>
          Tenés que poner la prenda a nuestra disposición sin uso.{' '}
          <strong>Los gastos de la devolución son a nuestro cargo.</strong>
        </li>
        <li>Al recibirla, te reintegramos todo lo que pagaste, por el mismo medio de pago.</li>
      </ul>
      <p>
        No corresponde cuando la prenda ya fue usada, ni cuando la compra se hizo para revender
        (Disposición 954/2025).
      </p>

      <h2>10. Garantía</h2>
      <p>
        Las prendas tienen garantía legal de <strong>6 meses</strong> desde la entrega por defectos
        o vicios (artículo 11 de la Ley 24.240). Si una prenda tiene una falla, te la cambiamos o te
        devolvemos el dinero, a tu elección, y los envíos corren por nuestra cuenta. La garantía no
        cubre el desgaste normal ni los daños por uso o lavado contrarios a las indicaciones de
        cuidado de la ficha.
      </p>

      <h2>11. Atención al cliente y reclamos</h2>
      <p>
        Atendemos consultas y reclamos {HORARIO_ATENCION}, por WhatsApp al {WA_TEL_VISIBLE}, por
        Instagram (@__bykoda) o por mail a <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>.
        Todos los canales están en <Link to="/info/contacto">Contacto</Link>.
      </p>
      <p>
        También podés hacer un reclamo ante la autoridad de aplicación, en la{' '}
        <a href={URL_RECLAMOS_CONSUMIDOR} target="_blank" rel="noopener noreferrer">
          Ventanilla Federal Única de Reclamos de Defensa del Consumidor
        </a>
        .
      </p>

      <h2>12. Propiedad intelectual</h2>
      <p>
        La marca BYKODA, el logo, las fotos, los videos y los textos de este sitio son de BYKODA o
        se usan con permiso. No se pueden copiar ni usar con fines comerciales sin autorización.
      </p>

      <h2>13. Datos personales</h2>
      <p>
        Usamos tus datos solo para gestionar tu pedido y, si te anotás, para avisarte de los nuevos
        drops. Todo está explicado en la <Link to="/info/privacidad">Política de privacidad</Link>.
      </p>

      <h2>14. Cambios en estos términos</h2>
      <p>
        Podemos actualizar estos términos; la fecha de arriba indica la última versión. Cada compra
        se rige por los términos vigentes el día en que se hizo.
      </p>

      <h2>15. Ley aplicable</h2>
      <p>Estos términos se rigen por las leyes de la República Argentina.</p>
    </div>
  );
}

/* ---- Política de privacidad -------------------------------------------- */

export function Privacidad() {
  return (
    <div className="prosa">
      <Actualizacion />

      <h2>Quién es responsable de tus datos</h2>
      <p>
        <Titular />. Para cualquier tema de datos personales escribinos a{' '}
        <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>.
      </p>

      <h2>Qué datos pedimos</h2>
      <ul>
        <li>
          <strong>Al hacer un pedido:</strong> nombre y apellido, mail, teléfono y dirección de
          envío.
        </li>
        <li>
          <strong>Si te anotás para enterarte de los drops:</strong> tu mail.
        </li>
        <li>
          <strong>Si nos escribís:</strong> los datos que nos mandes en el formulario de contacto,
          el Botón de arrepentimiento o los mensajes.
        </li>
      </ul>
      <p>
        No pedimos ni guardamos datos de tarjetas: los pagos con tarjeta los procesa Mercado Pago,
        con su propia política de privacidad.
      </p>

      <h2>Para qué los usamos</h2>
      <ul>
        <li>Preparar, enviar y hacer el seguimiento de tu pedido.</li>
        <li>Responder tus consultas, cambios, devoluciones y reclamos.</li>
        <li>Avisarte de nuevos drops, solo si te anotaste. Te podés dar de baja cuando quieras.</li>
        <li>Cumplir con obligaciones legales, por ejemplo las de facturación.</li>
      </ul>
      <p>No vendemos ni cedemos tus datos a terceros para publicidad.</p>

      <h2>Con quién se comparten</h2>
      <p>Solo con los servicios que necesitamos para operar la tienda:</p>
      <ul>
        <li>
          <strong>Visual App</strong>, la plataforma donde se registran los pedidos y el stock.
        </li>
        <li>
          <strong>Mercado Pago</strong>, si pagás por ese medio.
        </li>
        <li>
          <strong>WhatsApp</strong>, cuando nos escribís o confirmás un pedido por ahí.
        </li>
        <li>
          <strong>Google Forms</strong>, donde se guarda la lista de mails de los drops.
        </li>
        <li>
          <strong>El correo</strong> que lleva tu pedido, que recibe tu nombre, teléfono y
          dirección.
        </li>
      </ul>

      <h2>Qué se guarda en tu navegador</h2>
      <p>
        El sitio no usa cookies de publicidad ni herramientas de seguimiento. Guarda en tu propio
        navegador tu carrito, tus favoritos y los datos de envío de tu última compra, para que no
        tengas que cargarlos de nuevo. Esos datos no se nos envían hasta que hacés un pedido, y los
        podés borrar limpiando los datos del sitio en tu navegador.
      </p>

      <h2>Cuánto tiempo los guardamos</h2>
      <p>
        Los datos de los pedidos, el tiempo que exigen las normas contables y fiscales. El mail de
        la lista de drops, hasta que te des de baja.
      </p>

      <h2>Tus derechos</h2>
      <p>
        Podés pedirnos en cualquier momento acceder a tus datos, corregirlos, actualizarlos o
        eliminarlos, y darte de baja de la lista de drops, escribiendo a{' '}
        <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>. Son derechos que te da la Ley 25.326 de
        Protección de los Datos Personales. El acceso es gratuito a intervalos no menores a seis
        meses, salvo que acredites un interés legítimo.
      </p>
      <p>
        La Agencia de Acceso a la Información Pública, en su carácter de órgano de control de la Ley
        25.326, tiene la atribución de atender las denuncias y reclamos que se presenten por
        incumplimientos a las normas de protección de datos personales.
      </p>

      <h2>Cambios en esta política</h2>
      <p>Si la cambiamos, actualizamos la fecha de arriba.</p>
    </div>
  );
}

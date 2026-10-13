import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useModal } from '@/lib/useModal';
import { fmtMoneda } from '@/lib/format';
import { WA_NUMBER } from '@/lib/whatsapp';
import {
  leerPagoEnCurso,
  leerVueltaDePago,
  olvidarPagoEnCurso,
  sinParametrosDeVuelta,
  type EstadoPago,
  type PagoEnCurso,
} from '@/lib/pagoMercadoPago';
import { EASE_SUAVE } from './motion/curvas';
import { IconWhatsapp } from './icons';
import { Button } from './ui';

/** Aviso al volver de Mercado Pago: si el pago se aprobó, quedó pendiente o no se hizo. */
export function AvisoPago() {
  const location = useLocation();
  const navigate = useNavigate();
  const [aviso, setAviso] = useState<(PagoEnCurso & { estado: EstadoPago }) | null>(() => {
    const estado = leerVueltaDePago(location.search);
    return estado ? { estado, ...leerPagoEnCurso() } : null;
  });
  const cerrar = () => setAviso(null);
  const boxRef = useModal(aviso !== null, cerrar);

  // Se limpia la URL para que recargar o compartir el link no repita el aviso.
  useEffect(() => {
    if (!leerVueltaDePago(location.search)) return;
    olvidarPagoEnCurso();
    navigate(
      { pathname: location.pathname, search: sinParametrosDeVuelta(location.search), hash: location.hash },
      { replace: true },
    );
  }, [location.pathname, location.search, location.hash, navigate]);

  const pedido = aviso?.numero ? ` #${aviso.numero}` : '';
  const textos: Record<EstadoPago, { titulo: string; texto: string }> = {
    aprobado: {
      titulo: '¡Pago aprobado!',
      texto: `Recibimos el pago de tu pedido${pedido}${
        aviso?.total ? ` (${fmtMoneda(aviso.total)})` : ''
      }. Te escribimos por WhatsApp para coordinar el envío.`,
    },
    pendiente: {
      titulo: 'Pago pendiente',
      texto: `Mercado Pago todavía está procesando el pago de tu pedido${pedido}. Cuando se apruebe, lo preparamos y te escribimos por WhatsApp.`,
    },
    fallido: {
      titulo: 'El pago no se completó',
      texto: `Tu pedido${pedido} quedó anotado, pero no se cobró. Escribinos por WhatsApp y te pasamos otra forma de pago.`,
    },
  };
  const contenido = aviso ? textos[aviso.estado] : null;
  const urlWhatsApp = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    `¡Hola! No pude pagar con Mercado Pago el pedido${pedido} de bykoda.store. ¿Me pasan otra forma de pago?`,
  )}`;

  return (
    <AnimatePresence>
      {aviso && contenido && (
        <div className="fixed inset-0 z-[3000] grid place-items-center p-4">
          <m.div
            aria-hidden="true"
            onClick={cerrar}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <m.div
            ref={boxRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="aviso-pago-titulo"
            className="relative grid w-full max-w-md justify-items-center gap-4 rounded-2xl border border-line bg-surface p-7 text-center shadow-[0_40px_120px_var(--k-shadow)] sm:p-9"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.4, ease: EASE_SUAVE }}
          >
            <h2 id="aviso-pago-titulo" className="titulo-display text-4xl text-ink">
              {contenido.titulo}
            </h2>
            <p className="max-w-[40ch] text-sm leading-relaxed text-ink-2">{contenido.texto}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {aviso.estado === 'fallido' && (
                <a
                  href={urlWhatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-whatsapp px-5 text-[0.8rem] font-semibold tracking-[0.12em] text-black uppercase transition hover:brightness-95"
                >
                  <IconWhatsapp size={18} />
                  Escribir por WhatsApp
                </a>
              )}
              <Button variante={aviso.estado === 'fallido' ? 'secundario' : 'primario'} onClick={cerrar}>
                {aviso.estado === 'fallido' ? 'Cerrar' : 'Listo'}
              </Button>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}

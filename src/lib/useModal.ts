import { useEffect, useRef } from 'react';

const FOCUSABLES =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Comportamiento común de los modales: cierre con Escape, bloqueo del scroll
 * de fondo, foco atrapado dentro del diálogo y devolución del foco al elemento
 * que lo abrió. Devuelve la ref que hay que poner en el contenedor del diálogo.
 */
export function useModal(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  // El callback vive en una ref: si el padre se re-renderiza y pasa una función
  // nueva, el efecto de abajo NO se vuelve a correr. Si se corriera, el foco
  // volvería al primer campo en medio de lo que el cliente está escribiendo.
  const cerrarRef = useRef(onClose);
  cerrarRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previo = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cerrarRef.current();
        return;
      }
      if (e.key !== 'Tab' || !ref.current) return;
      const focusables = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLES)).filter(
        (el) => el.offsetParent !== null,
      );
      if (focusables.length === 0) return;
      const primero = focusables[0]!;
      const ultimo = focusables[focusables.length - 1]!;
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const overflowPrevio = document.body.style.overflow;
    const paddingPrevio = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    const t = window.setTimeout(() => {
      ref.current?.querySelector<HTMLElement>(FOCUSABLES)?.focus();
    }, 0);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflowPrevio;
      document.body.style.paddingRight = paddingPrevio;
      window.clearTimeout(t);
      previo?.focus?.();
    };
  }, [open]);

  return ref;
}

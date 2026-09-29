import { WA_NUMBER } from '@/lib/whatsapp';
import { IconWhatsapp } from './icons';

/**
 * Botón flotante. Se levanta sobre la barra inferior en mobile para no taparla.
 */
export function WhatsappButton() {
  return (
    <a
      href={`https://wa.me/${WA_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consultar por WhatsApp"
      className="group fixed right-4 bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] z-[900] grid size-13 place-items-center rounded-full bg-whatsapp text-black shadow-[0_8px_28px_rgb(37_211_102_/_0.35)] transition-transform duration-300 ease-(--ease-suave) hover:scale-105 md:right-7 md:bottom-7 md:size-15"
    >
      <IconWhatsapp size={26} />
      <span className="pointer-events-none absolute right-[calc(100%+0.75rem)] hidden rounded-full border border-line bg-surface px-3.5 py-2 text-xs font-semibold whitespace-nowrap text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block">
        Consultar por WhatsApp
      </span>
    </a>
  );
}

import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useToastStore } from '@/store/toast';
import { WA_NUMBER, WA_TEL_VISIBLE } from '@/lib/whatsapp';
import { ESTUDIO, MARCA, rangoCopyright } from '@/lib/creditos';
import {
  EMAIL_RE,
  newsletterConectado,
  suscribirEmail,
  urlSuscripcionWhatsApp,
} from '@/lib/newsletter';
import { LEGAL, URL_RECLAMOS_CONSUMIDOR } from '@/config/legal';
import { Button, Input } from './ui';

const EMAIL = LEGAL.email;

const LEGALES = [
  { to: '/info/terminos-y-condiciones', label: 'Términos y condiciones' },
  { to: '/info/privacidad', label: 'Política de privacidad' },
  { to: '/arrepentimiento', label: 'Botón de arrepentimiento' },
];

const COLUMNAS = [
  {
    titulo: 'Tienda',
    links: [
      { to: '/catalogo', label: 'Catálogo completo' },
      { to: '/catalogo#cat=jean-baggy', label: 'Jeans baggy' },
      { to: '/catalogo#cat=remera', label: 'Remeras' },
      { to: '/catalogo#cat=hoodie', label: 'Hoodies' },
      { to: '/carrito', label: 'Mi carrito' },
    ],
  },
  {
    titulo: 'Ayuda',
    links: [
      { to: '/info/como-comprar', label: 'Cómo comprar' },
      { to: '/info/envios', label: 'Envíos' },
      { to: '/info/cambios-y-devoluciones', label: 'Cambios y devoluciones' },
      { to: '/info/guia-de-talles', label: 'Guía de talles' },
      { to: '/info/preguntas-frecuentes', label: 'Preguntas frecuentes' },
      { to: '/info/contacto', label: 'Contacto' },
    ],
  },
];

export function Footer() {
  const showToast = useToastStore((s) => s.showToast);
  const [email, setEmail] = useState('');

  const [enviando, setEnviando] = useState(false);

  async function handleNewsletter(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const valor = email.trim();
    if (!EMAIL_RE.test(valor)) {
      showToast('Revisá el correo que ingresaste.', 'error');
      return;
    }
    if (!newsletterConectado()) {
      // Todavía no hay formulario: el mail le llega a la tienda por WhatsApp.
      window.open(urlSuscripcionWhatsApp(valor), '_blank', 'noopener');
      setEmail('');
      return;
    }
    setEnviando(true);
    try {
      await suscribirEmail(valor);
      showToast('¡Listo! Te avisamos antes de cada drop.', 'success');
      setEmail('');
    } catch {
      showToast('No pudimos anotarte. Revisá tu conexión y probá de nuevo.', 'error');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <footer className="border-t border-line bg-surface">
      <div className="area-pagina grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-10">
        <div>
          <img
            src="/imagenes/logo.webp"
            alt="BYKODA"
            width="132"
            height="36"
            loading="lazy"
            className="h-8 w-auto invert"
          />
          <p className="mt-4 max-w-[22ch] text-sm leading-relaxed text-ink-2">
            Más que ropa, una forma de expresarte.
          </p>

          <h3 className="mt-8 eyebrow">Unite a BYKODA</h3>
          <p className="mt-2 text-sm text-ink-2">Enterate primero de cada drop.</p>
          <form onSubmit={handleNewsletter} noValidate className="mt-3 flex max-w-sm gap-2">
            <label htmlFor="footer-email" className="sr-only">
              Tu correo electrónico
            </label>
            <Input
              id="footer-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="py-2.5"
            />
            <Button type="submit" tamano="sm" className="shrink-0 px-4" disabled={enviando}>
              {enviando ? 'Enviando…' : 'Enviar'}
            </Button>
          </form>
        </div>

        {COLUMNAS.map((col) => (
          <nav key={col.titulo} aria-label={col.titulo}>
            <h4 className="eyebrow">{col.titulo}</h4>
            <ul className="mt-4 grid gap-2.5">
              {col.links.map((link) => (
                <li key={link.label + link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-ink-2 transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h4 className="eyebrow">Contactanos</h4>
          <ul className="mt-4 grid gap-2.5 text-sm text-ink-2">
            <li>
              <a
                href={`https://wa.me/${WA_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-ink"
              >
                {WA_TEL_VISIBLE}
              </a>
            </li>
            <li>
              <a href={`mailto:${EMAIL}`} className="break-all transition-colors hover:text-ink">
                {EMAIL}
              </a>
            </li>
          </ul>
          <div className="mt-5 flex gap-2.5">
            <a
              href="https://www.instagram.com/__bykoda/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de BYKODA"
              className="grid size-10 place-items-center rounded-full border border-line transition-colors hover:border-line-strong hover:bg-hover"
            >
              <img
                src="/imagenes/icon-instagram.webp"
                alt=""
                width="20"
                height="20"
                loading="lazy"
                className="size-5 invert"
              />
            </a>
            <a
              href="https://www.tiktok.com/@bykoda.store?lang=es"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok de BYKODA"
              className="grid size-10 place-items-center rounded-full border border-line transition-colors hover:border-line-strong hover:bg-hover"
            >
              <img
                src="/imagenes/logotiktok.webp"
                alt=""
                width="20"
                height="20"
                loading="lazy"
                className="size-5 invert"
              />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="area-pagina flex flex-col gap-4 py-6 text-xs text-ink-2 md:flex-row md:items-center md:justify-between">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {LEGALES.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition-colors hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          {/* Disposición 890/2025: enlace al formulario de la Ventanilla Federal Única de Reclamos. */}
          <a
            href={URL_RECLAMOS_CONSUMIDOR}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-ink underline underline-offset-4"
          >
            Defensa de las y los Consumidores. Para reclamos ingrese aquí
          </a>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="area-pagina flex flex-col items-center justify-between gap-2 py-5 text-center text-xs text-ink-3 sm:flex-row sm:text-left">
          <p>
            © {rangoCopyright()} {MARCA} — Todos los derechos reservados
            {LEGAL.titular && ` · ${LEGAL.titular}`}
            {LEGAL.cuit && ` · CUIT ${LEGAL.cuit}`}
            {LEGAL.dataFiscalUrl && (
              <>
                {' · '}
                <a
                  href={LEGAL.dataFiscalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4"
                >
                  Data fiscal
                </a>
              </>
            )}
          </p>
          <p>
            Diseño y desarrollo por{' '}
            <a
              href={ESTUDIO.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-ink-2 underline underline-offset-4 transition-colors hover:text-ink"
            >
              {ESTUDIO.nombre}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

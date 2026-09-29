import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useToastStore } from '@/store/toast';
import { WA_NUMBER, WA_TEL_VISIBLE } from '@/lib/whatsapp';
import { ESTUDIO, MARCA, rangoCopyright } from '@/lib/creditos';
import { Button, Input } from './ui';

const EMAIL = 'admin@bykoda.store';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

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
      { to: '/info#nosotros', label: 'Nosotros' },
      { to: '/info#faq', label: 'Cómo comprar' },
      { to: '/info#talles', label: 'Guía de talles' },
      { to: '/info#faq', label: 'Envíos y cambios' },
      { to: '/info#contacto', label: 'Contacto' },
    ],
  },
];

export function Footer() {
  const showToast = useToastStore((s) => s.showToast);
  const [email, setEmail] = useState('');

  function handleNewsletter(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const valor = email.trim();
    if (!EMAIL_RE.test(valor)) {
      showToast('Revisá el correo que ingresaste.', 'error');
      return;
    }
    try {
      const subs = JSON.parse(localStorage.getItem('koda_subs') || '[]') as string[];
      if (!subs.includes(valor)) {
        subs.push(valor);
        localStorage.setItem('koda_subs', JSON.stringify(subs));
      }
    } catch {
      /* storage bloqueado */
    }
    showToast('¡Gracias por suscribirte!', 'success');
    setEmail('');
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
            className="h-8 w-auto invert dark:invert-0"
          />
          <p className="mt-4 max-w-[22ch] text-sm leading-relaxed text-ink-2">
            Más que ropa, una forma de expresarte.
          </p>

          <h3 className="eyebrow mt-8">Unite a BYKODA</h3>
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
            <Button type="submit" tamano="sm" className="shrink-0 px-4">
              Enviar
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
              <img src="/imagenes/icon-instagram.webp" alt="" width="20" height="20" loading="lazy" className="size-5 invert dark:invert-0" />
            </a>
            <a
              href="https://www.tiktok.com/@bykoda.store?lang=es"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok de BYKODA"
              className="grid size-10 place-items-center rounded-full border border-line transition-colors hover:border-line-strong hover:bg-hover"
            >
              <img src="/imagenes/logotiktok.webp" alt="" width="20" height="20" loading="lazy" className="size-5 invert dark:invert-0" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="area-pagina flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink-3 sm:flex-row">
          <p>
            © {rangoCopyright()} {MARCA} — Todos los derechos reservados
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

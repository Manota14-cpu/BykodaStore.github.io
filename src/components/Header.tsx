import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCartStore } from '@/store/cart';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/cn';

const NAV = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/info', label: 'Info' },
];

const ANUNCIOS = [
  'Envíos a todo el país en 4–8 días hábiles',
  'Ediciones limitadas — una vez que se van, no vuelven',
  'Atención directa por WhatsApp e Instagram',
];

export function AnnouncementBar() {
  return (
    <div
      aria-label="Anuncios"
      className="overflow-hidden border-b border-line bg-invert py-2 text-on-invert"
    >
      <div className="flex w-max animate-[marquee_38s_linear_infinite] gap-16 pr-16">
        {[...ANUNCIOS, ...ANUNCIOS].map((texto, i) => (
          <span
            key={i}
            aria-hidden={i >= ANUNCIOS.length}
            className="text-[0.63rem] font-semibold tracking-[0.2em] whitespace-nowrap uppercase"
          >
            {texto}
          </span>
        ))}
      </div>
    </div>
  );
}

function IconCarrito() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 7h12l-1 13H7L6 7z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </svg>
  );
}

const enlaceNav = ({ isActive }: { isActive: boolean }) =>
  cn(
    'relative py-1 text-[0.72rem] font-semibold tracking-[0.16em] uppercase transition-colors duration-300',
    'after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-(--ease-suave)',
    'hover:after:scale-x-100',
    isActive ? 'text-ink after:scale-x-100' : 'text-ink-3 hover:text-ink',
  );

const botonIcono =
  'grid size-10 place-items-center rounded-full border border-line text-ink transition-colors duration-300 hover:border-line-strong hover:bg-hover';

export function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [scrolleado, setScrolleado] = useState(false);
  const [latir, setLatir] = useState(false);
  const cantidad = useCartStore((s) => s.items.reduce((suma, i) => suma + i.cantidad, 0));
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolleado(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuAbierto(false), [location.pathname, location.hash]);

  // El menú móvil ocupa toda la pantalla: bloqueamos el scroll de fondo.
  useEffect(() => {
    if (!menuAbierto) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuAbierto(false);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previo;
      document.removeEventListener('keydown', onKey);
    };
  }, [menuAbierto]);

  useEffect(() => {
    if (cantidad === 0) return;
    setLatir(true);
    const t = setTimeout(() => setLatir(false), 600);
    return () => clearTimeout(t);
  }, [cantidad]);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-[100] border-b border-line bg-ground/80 backdrop-blur-xl transition-shadow duration-500',
          scrolleado && 'shadow-[0_4px_30px_var(--k-shadow)]',
        )}
      >
        <div className="area-pagina flex h-16 items-center justify-between gap-6">
          <Link to="/" aria-label="BYKODA — inicio" className="shrink-0">
            <img
              src="/imagenes/logo.webp"
              alt="BYKODA"
              width="112"
              height="30"
              /* El logo es blanco sobre transparente: en tema claro se invierte. */
              className="h-7 w-auto invert dark:invert-0"
            />
          </Link>

          <nav aria-label="Navegación principal" className="hidden items-center gap-8 md:flex">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={enlaceNav}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
              aria-pressed={theme === 'light'}
              onClick={toggleTheme}
              className={botonIcono}
            >
              {theme === 'dark' ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
                </svg>
              ) : (
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="4.5" />
                  <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
                </svg>
              )}
            </button>

            <Link
              to="/carrito"
              aria-label={`Carrito, ${cantidad} ${cantidad === 1 ? 'artículo' : 'artículos'}`}
              className={cn(botonIcono, 'relative')}
            >
              <IconCarrito />
              {cantidad > 0 && (
                <span
                  className={cn(
                    'absolute -top-1 -right-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-invert px-1.5 text-[0.62rem] font-bold text-on-invert tabular-nums',
                    latir && 'animate-[latido_0.6s_var(--ease-suave)]',
                  )}
                >
                  {cantidad}
                </span>
              )}
            </Link>

            <button
              type="button"
              aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuAbierto}
              aria-controls="nav-movil"
              onClick={() => setMenuAbierto((v) => !v)}
              className={cn(botonIcono, 'md:hidden')}
            >
              <span className="grid w-4 gap-[3px]">
                <span
                  className={cn(
                    'h-px w-full bg-current transition-transform duration-300 ease-(--ease-suave)',
                    menuAbierto && 'translate-y-[4px] rotate-45',
                  )}
                />
                <span
                  className={cn(
                    'h-px w-full bg-current transition-opacity duration-300',
                    menuAbierto && 'opacity-0',
                  )}
                />
                <span
                  className={cn(
                    'h-px w-full bg-current transition-transform duration-300 ease-(--ease-suave)',
                    menuAbierto && '-translate-y-[4px] -rotate-45',
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <nav
        id="nav-movil"
        aria-label="Navegación móvil"
        aria-hidden={!menuAbierto}
        className={cn(
          'fixed inset-0 z-[99] flex flex-col items-center justify-center gap-8 bg-ground/95 backdrop-blur-xl transition-all duration-300 ease-(--ease-suave) md:hidden',
          menuAbierto ? 'visible opacity-100' : 'invisible opacity-0',
        )}
      >
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            tabIndex={menuAbierto ? undefined : -1}
            className={({ isActive }) =>
              cn(
                'titulo-display text-4xl transition-colors',
                isActive ? 'text-ink' : 'text-ink-3 hover:text-ink',
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
        <Link
          to="/carrito"
          tabIndex={menuAbierto ? undefined : -1}
          className="titulo-display text-4xl text-ink-3 transition-colors hover:text-ink"
        >
          Carrito ({cantidad})
        </Link>
      </nav>
    </>
  );
}

import { NavLink } from 'react-router-dom';
import { useCartStore } from '@/store/cart';
import { cn } from '@/lib/cn';

const trazo = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const ITEMS = [
  {
    to: '/',
    label: 'Inicio',
    end: true,
    icono: (
      <svg viewBox="0 0 24 24" {...trazo} className="size-5">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    to: '/catalogo',
    label: 'Catálogo',
    icono: (
      <svg viewBox="0 0 24 24" {...trazo} className="size-5">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    to: '/carrito',
    label: 'Carrito',
    badge: true,
    icono: (
      <svg viewBox="0 0 24 24" {...trazo} className="size-5">
        <path d="M6 7h12l-1 13H7L6 7z" />
        <path d="M9 7a3 3 0 0 1 6 0" />
      </svg>
    ),
  },
  {
    to: '/info',
    label: 'Info',
    icono: (
      <svg viewBox="0 0 24 24" {...trazo} className="size-5">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const cantidad = useCartStore((s) => s.items.reduce((suma, i) => suma + i.cantidad, 0));

  return (
    <nav
      aria-label="Navegación rápida"
      className="fixed inset-x-0 bottom-0 z-[950] grid grid-cols-4 border-t border-line bg-ground/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-xl md:hidden"
    >
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              'relative flex flex-col items-center gap-1 py-2.5 text-[0.62rem] font-semibold tracking-[0.08em] uppercase transition-colors',
              isActive ? 'text-ink' : 'text-ink-3',
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 h-0.5 w-8 rounded-full bg-ink"
                />
              )}
              {item.icono}
              <span>{item.label}</span>
              {item.badge && cantidad > 0 && (
                <span className="absolute top-1.5 right-[calc(50%-1.35rem)] grid h-4 min-w-4 place-items-center rounded-full bg-invert px-1 text-[0.58rem] font-bold text-on-invert tabular-nums">
                  {cantidad}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

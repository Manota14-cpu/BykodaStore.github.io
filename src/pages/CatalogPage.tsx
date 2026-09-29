import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import type { Orden, Producto } from '@/types';
import { useCatalogo } from '@/hooks/useCatalogo';
import { precioEfectivo } from '@/lib/format';
import {
  construirMenu,
  etiquetaSubcategoria,
  leerHashCategoria,
  normalizarTexto,
  perteneceACategoria,
  TODAS_LAS_CATEGORIAS,
} from '@/lib/catalogo';
import { FILTROS_INICIALES, type FiltrosCatalogo } from '@/lib/filtros';
import { useModal } from '@/lib/useModal';
import { useSEO } from '@/lib/seo';
import { ProductCard, ProductoSkeleton } from '@/components/ProductCard';
import { CatalogFilters } from '@/components/CatalogFilters';
import { EstadoConexion } from '@/components/EstadoConexion';
import { EASE_SUAVE } from '@/components/motion/curvas';
import { Button, Select } from '@/components/ui';

const TALLES_ESTANDAR = ['S', 'M', 'L', 'XL', 'XXL'];

const OPCIONES_ORDEN: { value: Orden; label: string }[] = [
  { value: 'default', label: 'Relevancia' },
  { value: 'precio-asc', label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
  { value: 'az', label: 'Nombre: A → Z' },
  { value: 'za', label: 'Nombre: Z → A' },
];

/** Aplica todos los filtros salvo el que se pasa en `excepto` (para los conteos). */
function aplicarFiltros(
  productos: Producto[],
  f: FiltrosCatalogo,
  excepto?: 'categoria' | 'subcategoria',
): Producto[] {
  const q = normalizarTexto(f.busqueda.trim());
  return productos.filter((p) => {
    if (excepto !== 'categoria' && !perteneceACategoria(p, f.categoria)) return false;
    if (excepto !== 'subcategoria' && f.subcategoria && p.subcategoria !== f.subcategoria) return false;
    if (f.talles.length > 0) {
      const talles = p.talles ?? TALLES_ESTANDAR;
      if (talles.length > 0 && !f.talles.some((t) => talles.includes(t))) return false;
    }
    if (Number.isFinite(f.precioMax) && precioEfectivo(p) > f.precioMax) return false;
    if (f.soloOfertas && !(p.precio_original && p.precio_original > p.precio)) return false;
    if (q) {
      const texto = normalizarTexto(`${p.nombre} ${p.categoriaLabel} ${p.subcategoria ?? ''} ${p.tela ?? ''}`);
      if (!texto.includes(q)) return false;
    }
    return true;
  });
}

function ordenar(lista: Producto[], orden: Orden): Producto[] {
  switch (orden) {
    case 'precio-asc':
      return [...lista].sort((a, b) => precioEfectivo(a) - precioEfectivo(b));
    case 'precio-desc':
      return [...lista].sort((a, b) => precioEfectivo(b) - precioEfectivo(a));
    case 'az':
      return [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    case 'za':
      return [...lista].sort((a, b) => b.nombre.localeCompare(a.nombre, 'es'));
    default:
      return lista;
  }
}

export function CatalogPage() {
  useSEO({
    title: 'Catálogo | BYKODA',
    description:
      'Jeans baggy, cargo, joggers, remeras oversize, hoodies, sweaters y camperas. Streetwear argentino con stock en vivo y envíos a todo el país.',
    canonical: '/catalogo',
  });

  const location = useLocation();
  const { productos, cargando, error, plataformaCaida, actualizado, reintentar } = useCatalogo();
  const [filtros, setFiltros] = useState<FiltrosCatalogo>(FILTROS_INICIALES);
  const [orden, setOrden] = useState<Orden>('default');
  const [drawer, setDrawer] = useState(false);
  const cerrarDrawer = useCallback(() => setDrawer(false), []);
  // El panel de filtros en celular se comporta como un modal (foco, Escape, scroll).
  const drawerRef = useModal(drawer, cerrarDrawer);

  const actualizar = useCallback((parcial: Partial<FiltrosCatalogo>) => {
    setFiltros((prev) => ({ ...prev, ...parcial }));
  }, []);
  const limpiar = useCallback(() => setFiltros(FILTROS_INICIALES), []);

  // `/catalogo#cat=hoodie` preselecciona. Se resuelve contra las categorías que
  // existen hoy: un link a una que no está muestra todo en vez de una grilla vacía.
  // Se aplica una sola vez por hash: si no, cada refresco del catálogo (cada
  // 30 s) volvería a pisar la categoría que el cliente eligió a mano.
  const disponibles = useMemo(() => new Set(productos.map((p) => p.categoria)), [productos]);
  const hashAplicado = useRef<string | null>(null);
  useEffect(() => {
    if (cargando || hashAplicado.current === location.hash) return;
    hashAplicado.current = location.hash;
    const seleccion = leerHashCategoria(location.hash, disponibles);
    if (seleccion) setFiltros((prev) => ({ ...prev, ...seleccion }));
  }, [location.hash, disponibles, cargando]);

  const { precioMin, precioTope, talles } = useMemo(() => {
    const precios = productos.map(precioEfectivo).filter((p) => p > 0);
    const presentes = new Set(productos.flatMap((p) => p.talles ?? TALLES_ESTANDAR));
    return {
      precioMin: precios.length ? Math.floor(Math.min(...precios) / 500) * 500 : 0,
      precioTope: precios.length ? Math.ceil(Math.max(...precios) / 500) * 500 : 0,
      talles: TALLES_ESTANDAR.filter((t) => presentes.has(t)),
    };
  }, [productos]);

  // Los conteos de cada opción respetan el resto de los filtros: nunca se ofrece
  // algo que devuelva cero resultados.
  const { menu, total } = useMemo(() => {
    const sinCategoria = aplicarFiltros(productos, filtros, 'categoria');
    const sinSub = aplicarFiltros(productos, filtros, 'subcategoria');
    return {
      total: sinCategoria.length,
      menu: construirMenu(
        productos,
        (key) => sinCategoria.filter((p) => p.categoria === key).length,
        (key) => sinSub.filter((p) => p.subcategoria === key).length,
      ),
    };
  }, [productos, filtros]);

  const visibles = useMemo(() => ordenar(aplicarFiltros(productos, filtros), orden), [productos, filtros, orden]);

  const chips = useMemo(() => {
    const lista: { label: string; limpiar: Partial<FiltrosCatalogo> }[] = [];
    const nodo = menu.find((n) => n.key === filtros.categoria);
    if (filtros.categoria !== TODAS_LAS_CATEGORIAS && nodo) {
      lista.push({ label: nodo.label, limpiar: { categoria: TODAS_LAS_CATEGORIAS, subcategoria: null } });
    }
    if (filtros.subcategoria) {
      lista.push({ label: etiquetaSubcategoria(filtros.subcategoria), limpiar: { subcategoria: null } });
    }
    for (const t of filtros.talles) {
      lista.push({ label: `Talle ${t}`, limpiar: { talles: filtros.talles.filter((x) => x !== t) } });
    }
    if (Number.isFinite(filtros.precioMax)) {
      lista.push({ label: `Hasta $${filtros.precioMax.toLocaleString('es-AR')}`, limpiar: { precioMax: Infinity } });
    }
    if (filtros.soloOfertas) lista.push({ label: 'Solo ofertas', limpiar: { soloOfertas: false } });
    if (filtros.busqueda.trim()) lista.push({ label: `"${filtros.busqueda.trim()}"`, limpiar: { busqueda: '' } });
    return lista;
  }, [filtros, menu]);

  const panelFiltros = (
    <CatalogFilters
      filtros={filtros}
      onChange={actualizar}
      onLimpiar={limpiar}
      menu={menu}
      total={total}
      talles={talles}
      precioMin={precioMin}
      precioTope={precioTope}
      hayFiltros={chips.length > 0}
    />
  );

  return (
    <div className="area-pagina pt-[clamp(2rem,5vw,3.5rem)] pb-[clamp(4rem,9vw,7rem)]">
      <header className="mb-[clamp(2rem,4vw,3rem)] flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Tienda</p>
          <h1 className="titulo-display mt-2 text-[clamp(3rem,8vw,5.5rem)] text-ink uppercase">Catálogo</h1>
          <p className="mt-3 max-w-[56ch] text-[0.95rem] leading-relaxed text-ink-2">
            Todas las prendas, filtrables por categoría, talle y precio. Elegí una para ver la ficha
            completa con tela y guía de talles.
          </p>
        </div>
        <EstadoConexion caida={plataformaCaida} actualizado={actualizado} cargando={cargando} />
      </header>

      <div className="grid items-start gap-10 lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-12">
        <aside aria-label="Filtros del catálogo" className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 [scrollbar-width:thin] lg:block">
          {panelFiltros}
        </aside>

        <section aria-label="Resultados">
          <div className="mb-4 flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[13rem] flex-1 basis-full sm:basis-auto">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-3"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="search"
                placeholder="Buscar prendas…"
                aria-label="Buscar productos"
                autoComplete="off"
                value={filtros.busqueda}
                onChange={(e) => actualizar({ busqueda: e.target.value })}
                className="w-full rounded-lg border border-line bg-hover/40 py-3 pr-3.5 pl-10 text-sm text-ink placeholder:text-ink-3 focus:border-line-strong focus:outline-none"
              />
            </div>

            <Button variante="secundario" className="lg:hidden" onClick={() => setDrawer(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 6h16M7 12h10M10 18h4" />
              </svg>
              Filtros
              {chips.length > 0 && (
                <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-invert px-1 text-[0.62rem] text-on-invert">
                  {chips.length}
                </span>
              )}
            </Button>

            <label className="flex-1 sm:flex-none">
              <span className="sr-only">Ordenar productos</span>
              <Select value={orden} onChange={(e) => setOrden(e.target.value as Orden)} className="py-2.5 text-[0.82rem]">
                {OPCIONES_ORDEN.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          <AnimatePresence initial={false}>
            {chips.length > 0 && (
              <m.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 pb-4">
                  {chips.map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => actualizar(chip.limpiar)}
                      className="inline-flex items-center gap-2 rounded-full border border-line bg-hover/40 px-3 py-1.5 text-xs text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
                    >
                      {chip.label}
                      <span aria-hidden="true">✕</span>
                      <span className="sr-only">Quitar filtro</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={limpiar}
                    className="rounded-full border border-dashed border-line-strong px-3 py-1.5 text-xs text-ink-2 transition-colors hover:text-ink"
                  >
                    Limpiar todo
                  </button>
                </div>
              </m.div>
            )}
          </AnimatePresence>

          <p aria-live="polite" className="eyebrow mb-5">
            {cargando ? 'Cargando catálogo…' : `${visibles.length} ${visibles.length === 1 ? 'prenda' : 'prendas'}`}
          </p>

          {error ? (
            <div className="grid justify-items-center gap-4 rounded-2xl border border-line py-16 text-center">
              <p className="text-ink-2">No pudimos cargar el catálogo.</p>
              <Button onClick={reintentar}>Reintentar</Button>
            </div>
          ) : cargando ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4 xl:gap-x-5">
              {Array.from({ length: 8 }, (_, i) => (
                <ProductoSkeleton key={i} />
              ))}
            </div>
          ) : visibles.length === 0 ? (
            <div className="grid justify-items-center gap-4 rounded-2xl border border-line py-16 text-center">
              <p className="text-ink-2">No encontramos prendas con esos filtros.</p>
              <Button variante="secundario" onClick={limpiar}>
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <m.ul layout className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4 xl:gap-x-5">
              <AnimatePresence mode="popLayout" initial={false}>
                {visibles.map((p, i) => (
                  <m.li
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.45, ease: EASE_SUAVE, delay: Math.min(i, 8) * 0.03 }}
                  >
                    <ProductCard producto={p} prioridad={i < 4} />
                  </m.li>
                ))}
              </AnimatePresence>
            </m.ul>
          )}
        </section>
      </div>

      {/* Filtros en celular: panel lateral. */}
      <AnimatePresence>
        {drawer && (
          <div className="fixed inset-0 z-[1200] lg:hidden">
            <m.div
              aria-hidden="true"
              onClick={cerrarDrawer}
              className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <m.div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Filtros del catálogo"
              className="absolute inset-y-0 left-0 flex w-[min(21rem,88vw)] flex-col border-r border-line bg-surface"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.4, ease: EASE_SUAVE }}
            >
              <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">{panelFiltros}</div>
              <div className="border-t border-line p-5">
                <Button ancho="completo" onClick={cerrarDrawer}>
                  Ver {visibles.length} {visibles.length === 1 ? 'prenda' : 'prendas'}
                </Button>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

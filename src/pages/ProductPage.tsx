import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useProducto } from '@/hooks/useCatalogo';
import { fmtMoneda, pctOff } from '@/lib/format';
import { etiquetaProducto } from '@/lib/catalogo';
import { tablaParaCategoria, TIP_TALLES } from '@/lib/talles';
import { construirURLConsultaProducto } from '@/lib/whatsapp';
import { absoluteImage, SITE_URL, useSEO } from '@/lib/seo';
import { UMBRAL_ULTIMAS } from '@/api/catalogo';
import { useCartStore } from '@/store/cart';
import { useCarritoUI } from '@/store/carritoUI';
import { useToastStore } from '@/store/toast';
import { useFavoritesStore } from '@/store/favorites';
import { cn } from '@/lib/cn';
import { ProductCard } from '@/components/ProductCard';
import { ImagenProducto, PlaceholderProducto } from '@/components/ImagenProducto';
import { TallesTable } from '@/components/TallesTable';
import { IconCorazon, IconWhatsapp } from '@/components/icons';
import { Revelar, RevelarGrupo, RevelarItem } from '@/components/motion/Revelar';
import { EASE_SUAVE } from '@/components/motion/curvas';
import { Accordion, Badge, Button, ButtonExterno, ButtonLink, Spinner } from '@/components/ui';

const TALLES_ESTANDAR = ['S', 'M', 'L', 'XL', 'XXL'];
const MAXIMO_POR_PEDIDO = 10;

export function ProductPage() {
  const { id: slug } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { producto, productos, cargando } = useProducto(slug);

  const [varIdx, setVarIdx] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [color, setColor] = useState<string | null>(null);
  const [talle, setTalle] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [faltaColor, setFaltaColor] = useState(false);
  const [faltaTalle, setFaltaTalle] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const abrirCarrito = useCarritoUI((s) => s.abrir);
  const showToast = useToastStore((s) => s.showToast);
  const favs = useFavoritesStore((s) => s.favs);
  const toggleFav = useFavoritesStore((s) => s.toggle);

  // Al pasar de una ficha a otra (relacionados), se arranca de cero.
  useEffect(() => {
    setVarIdx(0);
    setImgIdx(0);
    setColor(null);
    setTalle(null);
    setCantidad(1);
    setFaltaColor(false);
    setFaltaTalle(false);
  }, [slug]);

  const relacionados = useMemo(() => {
    if (!producto) return [];
    const otros = productos.filter((p) => p.slug !== producto.slug && p.imagenes.length > 0);
    const misma = otros.filter((p) => producto.subcategoria && p.subcategoria === producto.subcategoria);
    const resto = otros.filter((p) => p.categoria === producto.categoria && !misma.includes(p));
    return [...misma, ...resto].slice(0, 4);
  }, [productos, producto]);

  const variantes = producto?.variantes?.length ? producto.variantes : null;
  const variante = variantes ? variantes[Math.min(varIdx, variantes.length - 1)] : null;

  // Prenda con talles y colores en la plataforma: solo se ofrecen las
  // combinaciones cargadas y cada una tiene su stock.
  const opciones = producto?.opciones?.length ? producto.opciones : null;
  const colores = producto?.colores ?? [];
  const talles = opciones ? (producto?.talles ?? []) : (producto?.talles ?? TALLES_ESTANDAR);
  const colorElegido = colores.length === 1 ? colores[0]! : color;
  const talleElegido = opciones && talles.length === 1 ? talles[0]! : talle;
  const opcion =
    opciones?.find(
      (o) =>
        (colores.length === 0 || o.color === colorElegido) && (talles.length === 0 || o.talle === talleElegido),
    ) ?? null;
  /** Si hay stock de ese talle y ese color (null = cualquiera). */
  const hayStock = (t: string | null, c: string | null) =>
    !opciones ||
    opciones.some((o) => o.stock !== 'sin-stock' && (t === null || o.talle === t) && (c === null || o.color === c));
  const fotosColor =
    opciones && colorElegido
      ? [...new Set(opciones.filter((o) => o.color === colorElegido).flatMap((o) => o.imagenes))]
      : [];

  const imgs = (variante?.imgs.length ? variante.imgs : fotosColor.length ? fotosColor : producto?.imagenes) ?? [];
  const imgActual = imgs[Math.min(imgIdx, Math.max(0, imgs.length - 1))];
  const precio = opcion
    ? opcion.precio
    : variante && variante.precio > 0
      ? variante.precio
      : (producto?.precio ?? 0);
  const nombre = variante ? variante.nombre : producto?.cartNombre || producto?.nombre || '';
  const descuento =
    producto?.precio_original && producto.precio_original > producto.precio
      ? pctOff(producto.precio_original, producto.precio)
      : 0;

  useSEO({
    title: producto ? `${producto.nombre} | BYKODA` : 'Producto | BYKODA',
    description: producto?.descripcion || `Comprá ${producto?.nombre ?? 'este producto'} en BYKODA.`,
    canonical: `/producto/${producto?.slug ?? slug ?? ''}`,
    image: producto?.imagenes[0] ? absoluteImage(producto.imagenes[0]) : undefined,
    type: 'product',
    jsonLd: producto
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: producto.nombre,
          image: producto.imagenes.map(absoluteImage),
          description: producto.descripcion,
          sku: producto.id,
          material: producto.composicion,
          brand: { '@type': 'Brand', name: 'BYKODA' },
          category: producto.categoriaLabel,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'ARS',
            price: String(precio),
            availability:
              producto.stock === 'sin-stock'
                ? 'https://schema.org/OutOfStock'
                : producto.stock === 'ultimas'
                  ? 'https://schema.org/LimitedAvailability'
                  : 'https://schema.org/InStock',
            url: `${SITE_URL}/producto/${producto.slug}`,
          },
        }
      : undefined,
  });

  if (!producto) {
    return (
      <div className="area-pagina grid min-h-[60vh] place-items-center py-20 text-center">
        {cargando ? (
          <div className="grid justify-items-center gap-4 text-ink-2">
            <Spinner />
            <p>Cargando producto…</p>
          </div>
        ) : (
          <div className="grid justify-items-center gap-4">
            <p className="eyebrow">404</p>
            <h1 className="titulo-display text-5xl text-ink">Producto no encontrado</h1>
            <p className="max-w-[40ch] text-ink-2">Puede que se haya agotado o que el link esté desactualizado.</p>
            <ButtonLink to="/catalogo" className="mt-2">
              Ver catálogo
            </ButtonLink>
          </div>
        )}
      </div>
    );
  }

  const p = producto;
  const llevaTalle = talles.length > 0;
  // Con la combinación elegida manda su stock; antes, el de la prenda entera.
  const stock = opcion?.stock ?? p.stock;
  const unidades = opcion ? opcion.unidades : (p.unidades ?? null);
  const sinStock = stock === 'sin-stock';
  const esFavorito = favs.includes(p.id);
  const tope = Math.max(1, Math.min(MAXIMO_POR_PEDIDO, unidades ?? MAXIMO_POR_PEDIDO));
  // Al cambiar a una combinación con menos stock, la cantidad no la pasa.
  const cant = Math.min(cantidad, tope);
  const quedan = !sinStock && typeof unidades === 'number' && unidades <= UMBRAL_ULTIMAS ? unidades : null;
  const urlProducto = `${SITE_URL}/producto/${p.slug}`;
  const detalle = [colores.length > 0 ? colorElegido : null, talleElegido].filter(Boolean).join(' · ');
  const nombreConsulta = colores.length > 0 && colorElegido ? `${nombre} (${colorElegido})` : nombre;

  function agregar(): boolean {
    if (sinStock) return false;
    if (colores.length > 0 && !colorElegido) {
      setFaltaColor(true);
      document.getElementById('ficha-colores')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return false;
    }
    if (llevaTalle && !talleElegido) {
      setFaltaTalle(true);
      document.getElementById('ficha-talles')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return false;
    }
    if (opciones && !opcion) {
      showToast('Esa combinación no está disponible.', 'error');
      return false;
    }
    const item = {
      nombre: detalle ? `${nombre} (${detalle})` : nombre,
      precio,
      cantidad: cant,
      imgSrc: imgActual,
      // En una prenda con variantes, el pedido descuenta el stock de la combinación.
      productoId: opcion?.id ?? p.id,
      slug: p.slug,
      fuente: p.fuente,
      talle: talleElegido ?? undefined,
      variante: opcion ? detalle : undefined,
      maximo: unidades,
    };
    const agregadas = addItem(item);
    if (agregadas === 0) {
      showToast('Ya tenés en el carrito todas las unidades disponibles.', 'error');
      return false;
    }
    if (agregadas < cant) showToast(`Solo quedaban ${agregadas} disponibles: agregamos esas.`);
    abrirCarrito({ ...item, cantidad: agregadas });
    return true;
  }

  function comprarAhora() {
    if (agregar()) navigate('/carrito?checkout=1');
  }

  const tieneFicha = Boolean(p.tela || p.composicion || p.cuidados);
  const secciones = [
    ...(p.descripcion || p.calce
      ? [
          {
            titulo: 'Descripción',
            contenido: (
              <>
                {p.descripcion && <p>{p.descripcion}</p>}
                <dl className="mt-3 grid">
                  <Especificacion nombre="Categoría" valor={etiquetaProducto(p)} />
                  {p.calce && <Especificacion nombre="Calce" valor={p.calce} />}
                  {llevaTalle && <Especificacion nombre="Talles" valor={talles.join(' · ')} />}
                </dl>
              </>
            ),
          },
        ]
      : []),
    ...(tieneFicha
      ? [
          {
            titulo: 'Tipo de tela y composición',
            contenido: (
              <dl className="grid">
                {p.tela && <Especificacion nombre="Tela" valor={p.tela} />}
                {p.composicion && <Especificacion nombre="Composición" valor={p.composicion} />}
                {p.cuidados && <Especificacion nombre="Cuidados" valor={p.cuidados} />}
              </dl>
            ),
          },
        ]
      : []),
    ...(llevaTalle
      ? [
          {
            titulo: 'Guía de talles',
            contenido: (
              <>
                <p className="text-xs text-ink-3">Medidas en centímetros, tomadas sobre la prenda.</p>
                <div className="my-3">
                  <TallesTable tabla={tablaParaCategoria(p.categoria)} />
                </div>
                <p className="text-xs leading-relaxed text-ink-3">{TIP_TALLES}</p>
              </>
            ),
          },
        ]
      : []),
    {
      titulo: 'Envíos y cambios',
      contenido: (
        <ul className="grid list-disc gap-1.5 pl-5">
          <li>Envíos a todo el país en 4 a 8 días hábiles.</li>
          <li>Preparación del pedido: 1 a 3 días hábiles desde la confirmación.</li>
          <li>Cambio de talle sin cargo dentro de los 7 días de recibido.</li>
          <li>
            Más detalles en <Link to="/info#faq">preguntas frecuentes</Link>.
          </li>
        </ul>
      ),
    },
  ];

  return (
    <div className="area-pagina pt-[clamp(1.5rem,4vw,2.5rem)] pb-[clamp(4rem,9vw,7rem)]">
      <nav aria-label="Ruta de navegación" className="mb-7 flex flex-wrap items-center gap-2 text-xs text-ink-3">
        <Link to="/" className="transition-colors hover:text-ink">
          Inicio
        </Link>
        <span aria-hidden="true">/</span>
        <Link to="/catalogo" className="transition-colors hover:text-ink">
          Catálogo
        </Link>
        <span aria-hidden="true">/</span>
        <Link to={`/catalogo#cat=${p.subcategoria ?? p.categoria}`} className="transition-colors hover:text-ink">
          {etiquetaProducto(p)}
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-ink">
          {p.nombre}
        </span>
      </nav>

      <div className="grid items-start gap-10 md:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-16">
        {/* Galería */}
        <div className="grid gap-3 md:sticky md:top-24">
          <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-hover">
            {imgActual ? (
              <AnimatePresence mode="popLayout" initial={false}>
                <m.div
                  key={imgActual}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE_SUAVE }}
                >
                  <ImagenProducto
                    src={imgActual}
                    alt={nombre}
                    width={900}
                    height={1125}
                    {...{ fetchpriority: 'high' }}
                    className="size-full object-cover"
                  />
                </m.div>
              </AnimatePresence>
            ) : (
              <PlaceholderProducto nombre={nombre} />
            )}
            <div className="absolute top-4 left-4 flex flex-col items-start gap-1.5">
              {sinStock && <Badge tono="agotado">Sin stock</Badge>}
              {!sinStock && (quedan !== null || stock === 'ultimas') && (
                <Badge tono="ultimas">{quedan !== null ? `Quedan ${quedan}` : 'Últimas unidades'}</Badge>
              )}
            </div>
          </div>

          {imgs.length > 1 && (
            <div role="group" aria-label="Más fotos" className="flex gap-2.5 overflow-x-auto pb-1">
              {imgs.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  aria-label={`Ver foto ${i + 1} de ${imgs.length}`}
                  aria-pressed={i === imgIdx}
                  onClick={() => setImgIdx(i)}
                  className={cn(
                    'relative aspect-4/5 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-hover transition-colors',
                    i === imgIdx ? 'border-ink' : 'border-transparent hover:border-line-strong',
                  )}
                >
                  <img src={img} alt="" loading="lazy" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Compra */}
        <m.div
          className="grid content-start gap-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_SUAVE, delay: 0.1 }}
        >
          <div>
            <p className="eyebrow">{etiquetaProducto(p)}</p>
            <h1 className="titulo-display mt-2 text-[clamp(2.4rem,4.6vw,3.6rem)] text-ink uppercase">{nombre}</h1>
            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <span className="text-2xl font-bold text-ink tabular-nums">
                {precio > 0 ? fmtMoneda(precio) : 'Consultar precio'}
              </span>
              {descuento > 0 && !variante && (
                <>
                  <span className="text-ink-3 tabular-nums line-through">{fmtMoneda(p.precio_original as number)}</span>
                  <Badge tono="oferta">−{descuento}%</Badge>
                </>
              )}
            </div>
            {p.descripcion && <p className="mt-4 max-w-[52ch] text-[0.95rem] leading-relaxed text-ink-2">{p.descripcion}</p>}
          </div>

          {variantes && variantes.length > 1 && (
            <div className="grid gap-3 border-t border-line pt-6">
              <div className="flex items-baseline justify-between">
                <span className="eyebrow">Color</span>
                <span className="text-sm font-semibold text-ink">{variante?.label}</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {variantes.map((v, i) => (
                  <button
                    key={v.color + i}
                    type="button"
                    title={v.label}
                    aria-label={`Color ${v.label}`}
                    aria-pressed={i === varIdx}
                    onClick={() => {
                      setVarIdx(i);
                      setImgIdx(0);
                    }}
                    style={{ background: v.color }}
                    className={cn(
                      'size-8 rounded-full border border-line-strong transition-shadow',
                      i === varIdx && 'ring-2 ring-ink ring-offset-2 ring-offset-ground',
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {colores.length > 1 && (
            <div id="ficha-colores" className="grid gap-3 border-t border-line pt-6">
              <div className="flex items-baseline justify-between">
                <span className="eyebrow">Color</span>
                {colorElegido && <span className="text-sm font-semibold text-ink">{colorElegido}</span>}
              </div>
              <div role="group" aria-label="Elegí el color" className="flex flex-wrap gap-2">
                {colores.map((c) => {
                  const agotado = !hayStock(null, c);
                  return (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={colorElegido === c}
                      disabled={agotado}
                      title={agotado ? 'Sin stock' : undefined}
                      onClick={() => {
                        const nuevo = colorElegido === c ? null : c;
                        setColor(nuevo);
                        setImgIdx(0);
                        setFaltaColor(false);
                        // Si el talle elegido no está en el nuevo color, se vuelve a elegir.
                        if (nuevo && talle && !hayStock(talle, nuevo)) setTalle(null);
                      }}
                      className={cn(
                        'rounded-lg border px-4 py-3 text-sm font-semibold tracking-wider transition-colors',
                        colorElegido === c
                          ? 'border-invert bg-invert text-on-invert'
                          : 'border-line text-ink-2 hover:border-line-strong hover:text-ink',
                        agotado && 'cursor-not-allowed text-ink-3 line-through opacity-50 hover:border-line hover:text-ink-3',
                        faltaColor && 'border-alerta/60',
                      )}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
              <AnimatePresence>
                {faltaColor && (
                  <m.p
                    role="alert"
                    className="text-sm text-alerta"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    Elegí un color para continuar.
                  </m.p>
                )}
              </AnimatePresence>
            </div>
          )}

          {llevaTalle && (
            <div id="ficha-talles" className="grid gap-3 border-t border-line pt-6">
              <div className="flex items-baseline justify-between">
                <span className="eyebrow">Talle</span>
                <a href="#ficha-info" className="text-xs text-ink-2 underline underline-offset-4 hover:text-ink">
                  Ver guía de talles
                </a>
              </div>
              <div role="group" aria-label="Elegí tu talle" className="flex flex-wrap gap-2">
                {talles.map((t) => {
                  // Tachado si no queda en el color elegido (o en ninguno, si todavía no hay color).
                  const agotado = !hayStock(t, colores.length > 0 ? colorElegido : null);
                  return (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={talleElegido === t}
                      disabled={agotado}
                      title={agotado ? 'Sin stock' : undefined}
                      onClick={() => {
                        setTalle(talleElegido === t ? null : t);
                        setFaltaTalle(false);
                      }}
                      className={cn(
                        'min-w-14 rounded-lg border px-4 py-3 text-sm font-semibold tracking-wider transition-colors',
                        talleElegido === t
                          ? 'border-invert bg-invert text-on-invert'
                          : 'border-line text-ink-2 hover:border-line-strong hover:text-ink',
                        agotado && 'cursor-not-allowed text-ink-3 line-through opacity-50 hover:border-line hover:text-ink-3',
                        faltaTalle && 'border-alerta/60',
                      )}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
              <AnimatePresence>
                {faltaTalle && (
                  <m.p
                    role="alert"
                    className="text-sm text-alerta"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    Elegí un talle para continuar.
                  </m.p>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="grid gap-3 border-t border-line pt-6">
            <div className="flex gap-3">
              <div role="group" aria-label="Cantidad" className="flex shrink-0 items-center overflow-hidden rounded-lg border border-line">
                <button
                  type="button"
                  aria-label="Quitar una unidad"
                  disabled={cant <= 1}
                  onClick={() => setCantidad(Math.max(1, cant - 1))}
                  className="h-12 w-11 text-ink transition-colors hover:bg-hover disabled:opacity-35"
                >
                  −
                </button>
                <span aria-live="polite" className="min-w-8 text-center text-sm font-semibold text-ink tabular-nums">
                  {cant}
                </span>
                <button
                  type="button"
                  aria-label="Agregar una unidad"
                  disabled={cant >= tope}
                  onClick={() => setCantidad(Math.min(tope, cant + 1))}
                  className="h-12 w-11 text-ink transition-colors hover:bg-hover disabled:opacity-35"
                >
                  +
                </button>
              </div>
              <Button variante="secundario" tamano="lg" className="h-12 flex-1" onClick={agregar} disabled={sinStock}>
                {sinStock ? 'Sin stock' : 'Agregar al carrito'}
              </Button>
            </div>
            <Button tamano="lg" ancho="completo" className="h-12" onClick={comprarAhora} disabled={sinStock}>
              Comprar ahora
            </Button>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <a
              href={construirURLConsultaProducto({ nombre: nombreConsulta, precio, talle: talleElegido, cantidad: cant, url: urlProducto })}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-ink-2 transition-colors hover:text-ink"
            >
              <IconWhatsapp size={16} />
              Consultar por WhatsApp
            </a>
            <button
              type="button"
              aria-pressed={esFavorito}
              onClick={() => {
                const accion = toggleFav(p.id);
                showToast(accion === 'added' ? 'Agregado a favoritos' : 'Quitado de favoritos');
              }}
              className={cn('inline-flex items-center gap-2 text-sm transition-colors', esFavorito ? 'text-fav' : 'text-ink-2 hover:text-ink')}
            >
              <IconCorazon lleno={esFavorito} size={16} />
              {esFavorito ? 'En favoritos' : 'Guardar'}
            </button>
          </div>

          <ul className="grid gap-2 border-t border-line pt-6 text-sm text-ink-2">
            {[
              'Envío a todo el país · 4 a 8 días hábiles',
              'Cambio de talle sin cargo dentro de los 7 días',
              'Coordinás pago y envío por WhatsApp, sin datos de tarjeta',
            ].map((g) => (
              <li key={g} className="flex items-start gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-exito" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {g}
              </li>
            ))}
          </ul>

          <div id="ficha-info" className="scroll-mt-28">
            <Accordion items={secciones} inicial={0} />
            {!tieneFicha && (
              <p className="mt-4 text-sm text-ink-2">
                ¿Dudas con la tela o el calce?{' '}
                <ButtonExterno
                  href={construirURLConsultaProducto({ nombre: nombreConsulta, precio, talle: talleElegido, cantidad: cant, url: urlProducto })}
                  variante="fantasma"
                  tamano="sm"
                  className="inline-flex h-auto px-0 align-baseline text-ink underline underline-offset-4"
                >
                  Escribinos y te respondemos
                </ButtonExterno>
                .
              </p>
            )}
          </div>
        </m.div>
      </div>

      {relacionados.length > 0 && (
        <section aria-labelledby="titulo-relacionados" className="mt-[clamp(4rem,9vw,7rem)] border-t border-line pt-[clamp(2.5rem,5vw,4rem)]">
          <Revelar>
            <h2 id="titulo-relacionados" className="titulo-display mb-8 text-[clamp(2rem,4vw,3rem)] text-ink uppercase">
              También te puede gustar
            </h2>
          </Revelar>
          <RevelarGrupo className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-5">
            {relacionados.map((rel) => (
              <RevelarItem key={rel.id}>
                <ProductCard producto={rel} />
              </RevelarItem>
            ))}
          </RevelarGrupo>
        </section>
      )}
    </div>
  );
}

function Especificacion({ nombre, valor }: { nombre: string; valor: string }) {
  return (
    <div className="grid gap-1 border-b border-line py-2.5 last:border-b-0 sm:grid-cols-[8.5rem_1fr] sm:gap-4">
      <dt className="text-[0.68rem] tracking-[0.12em] text-ink-3 uppercase">{nombre}</dt>
      <dd className="text-sm text-ink">{valor}</dd>
    </div>
  );
}

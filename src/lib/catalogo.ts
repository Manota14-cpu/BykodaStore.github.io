import type { Producto, Subcategoria } from '@/types';

export const TODAS_LAS_CATEGORIAS = 'todos';

export interface DefCategoria {
  key: string;
  label: string;
  /** Palabras con las que puede venir escrita desde la plataforma. */
  sinonimos: string[];
  hijos: { key: Subcategoria; label: string }[];
  /** Accesorios y similares no llevan selector de talle. */
  sinTalle?: boolean;
}

/**
 * Categorías conocidas, en el orden en que aparecen en el menú.
 *
 * En la plataforma la categoría es texto libre ("BERMUDAS", "Buzos / Camperas"),
 * así que cada una se reconoce por sus sinónimos. Una categoría que no está en
 * esta lista igual aparece en el menú, con el nombre tal como se cargó.
 */
export const ARBOL_CATALOGO: DefCategoria[] = [
  {
    key: 'remera',
    label: 'Remeras',
    sinonimos: ['remera', 'remeras', 'tee', 'tees', 'camiseta', 'camisetas', 'musculosa'],
    hijos: [
      { key: 'remera', label: 'Clásicas' },
      { key: 'remera-oversize', label: 'Oversize / Boxy' },
    ],
  },
  {
    key: 'buzo',
    label: 'Buzos & Camperas',
    sinonimos: [
      'buzo',
      'buzos',
      'hoodie',
      'hoodies',
      'canguro',
      'campera',
      'camperas',
      'sweater',
      'sweaters',
      'abrigo',
      'abrigos',
    ],
    hijos: [
      { key: 'hoodie', label: 'Hoodies' },
      { key: 'sweater', label: 'Sweaters' },
      { key: 'campera', label: 'Camperas' },
      { key: 'track-jacket', label: 'Track jackets' },
    ],
  },
  {
    key: 'pantalon',
    label: 'Pantalones',
    sinonimos: ['pantalon', 'pantalones', 'jean', 'jeans', 'jogger', 'joggers', 'cargo', 'baggy'],
    hijos: [
      { key: 'jean-baggy', label: 'Jeans baggy' },
      { key: 'jean', label: 'Jeans clásicos' },
      { key: 'jean-cargo', label: 'Cargo' },
      { key: 'jogger', label: 'Joggers' },
    ],
  },
  {
    key: 'bermuda',
    label: 'Bermudas',
    sinonimos: ['bermuda', 'bermudas', 'short', 'shorts'],
    hijos: [],
  },
  {
    key: 'accesorio',
    label: 'Accesorios',
    sinonimos: ['accesorio', 'accesorios', 'gorra', 'gorras', 'medias', 'bolso', 'rinonera'],
    hijos: [],
    sinTalle: true,
  },
];

const SUBCATEGORIAS = new Map(
  ARBOL_CATALOGO.flatMap((c) => c.hijos.map((h) => [h.key, { ...h, padre: c.key }] as const)),
);

/** Minúsculas y sin tildes, para comparar y buscar. */
export function normalizarTexto(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function slugify(s: string): string {
  return normalizarTexto(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function tituloDe(s: string): string {
  const limpio = s.trim().toLowerCase();
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

/**
 * Convierte el texto de categoría de cualquier fuente a { key, label }.
 * "BERMUDAS" → bermuda/Bermudas · "Buzos / Camperas" → buzo · "Gorros" → gorros/Gorros.
 */
export function resolverCategoria(texto: string | null | undefined): { key: string; label: string } {
  const crudo = (texto ?? '').trim();
  if (!crudo) return { key: 'otros', label: 'Otros' };

  const normal = normalizarTexto(crudo);
  const palabras = [normal, ...normal.split(/[^a-z0-9]+/).filter(Boolean)];
  for (const def of ARBOL_CATALOGO) {
    if (def.key === normal || palabras.some((p) => def.sinonimos.includes(p))) {
      return { key: def.key, label: def.label };
    }
  }
  return { key: slugify(crudo) || 'otros', label: tituloDe(crudo) };
}

export function etiquetaCategoria(key?: string): string {
  if (!key) return '';
  return ARBOL_CATALOGO.find((c) => c.key === key)?.label ?? tituloDe(key.replace(/-/g, ' '));
}

export function etiquetaSubcategoria(sub?: string): string {
  return (sub && SUBCATEGORIAS.get(sub as Subcategoria)?.label) || '';
}

/** Etiqueta más específica disponible: subcategoría si la hay, si no la categoría. */
export function etiquetaProducto(p: Pick<Producto, 'subcategoria' | 'categoriaLabel'>): string {
  return etiquetaSubcategoria(p.subcategoria) || p.categoriaLabel;
}

export function categoriaSinTalle(key: string): boolean {
  return ARBOL_CATALOGO.some((c) => c.key === key && c.sinTalle);
}

export function perteneceACategoria(p: Pick<Producto, 'categoria'>, categoria: string): boolean {
  return categoria === TODAS_LAS_CATEGORIAS || p.categoria === categoria;
}

export interface SeleccionHash {
  categoria: string;
  subcategoria: Subcategoria | null;
}

/**
 * Interpreta `#cat=remera`, `#cat=hoodie` o `#cat=Bermudas`.
 *
 * Si se pasan las categorías que existen hoy en el catálogo, una categoría que
 * no está (un link viejo, un typo) cae en "todo el catálogo" en vez de mostrar
 * una grilla vacía.
 */
export function leerHashCategoria(hash: string, disponibles?: Set<string>): SeleccionHash | null {
  const match = hash.match(/#cat=([^#&]+)/);
  if (!match?.[1]) return null;
  const crudo = decodeURIComponent(match[1]).trim();
  const slug = slugify(crudo);
  const todo: SeleccionHash = { categoria: TODAS_LAS_CATEGORIAS, subcategoria: null };
  const siExiste = (sel: SeleccionHash) =>
    disponibles && !disponibles.has(sel.categoria) ? todo : sel;

  // 1. Clave exacta de categoría. Va antes que las subcategorías porque
  //    "remera" es las dos cosas, y `#cat=remera` significa la categoría entera.
  if (ARBOL_CATALOGO.some((c) => c.key === slug)) {
    return siExiste({ categoria: slug, subcategoria: null });
  }

  // 2. Clave exacta de subcategoría: `#cat=hoodie` abre Buzos › Hoodies.
  const sub = SUBCATEGORIAS.get(slug as Subcategoria);
  if (sub) return siExiste({ categoria: sub.padre, subcategoria: sub.key });

  // 3. Sinónimos y categorías creadas en la plataforma ("Bermudas", "buzos/camperas").
  const { key } = resolverCategoria(crudo);
  if (disponibles) return disponibles.has(key) ? { categoria: key, subcategoria: null } : todo;
  return { categoria: key, subcategoria: null };
}

export interface NodoMenu {
  key: string;
  label: string;
  cantidad: number;
  hijos: { key: Subcategoria; label: string; cantidad: number }[];
}

/**
 * Arma el menú de categorías a partir de lo que realmente hay en el catálogo:
 * primero las conocidas en su orden, después las nuevas por nombre. Así una
 * categoría creada en la plataforma aparece sola, sin tocar código.
 */
export function construirMenu(
  productos: Producto[],
  contarCategoria: (key: string) => number,
  contarSub: (key: Subcategoria) => number,
): NodoMenu[] {
  const presentes = new Map<string, string>();
  for (const p of productos) if (!presentes.has(p.categoria)) presentes.set(p.categoria, p.categoriaLabel);

  const conocidas = ARBOL_CATALOGO.filter((c) => presentes.has(c.key));
  const nuevas = [...presentes.entries()]
    .filter(([key]) => !ARBOL_CATALOGO.some((c) => c.key === key))
    .sort((a, b) => a[1].localeCompare(b[1], 'es'));

  return [
    ...conocidas.map((c) => ({
      key: c.key,
      label: c.label,
      cantidad: contarCategoria(c.key),
      hijos: c.hijos
        .map((h) => ({ ...h, cantidad: contarSub(h.key) }))
        .filter((h) => h.cantidad > 0),
    })),
    ...nuevas.map(([key, label]) => ({ key, label, cantidad: contarCategoria(key), hijos: [] })),
  ];
}

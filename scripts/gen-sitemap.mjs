/**
 * Genera public/sitemap.xml con las páginas fijas y los productos publicados en
 * la plataforma Visual App. Correr después de cargar, renombrar o sacar productos.
 * Uso: node scripts/gen-sitemap.mjs
 */
import { writeFileSync } from 'node:fs';

const SITIO = 'https://www.bykoda.store';
const PLATAFORMA = 'https://visual-app-licencias.visual-app-licencias.workers.dev';
const TIENDA = process.env.VITE_VISUAL_APP_SLUG || 'bykoda';
const hoy = new Date().toISOString().slice(0, 10);

// Las mismas URLs que arma el sitio (slugify en src/lib/catalogo.ts y
// desdePlataforma en src/api/catalogo.ts).
const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
const slugProducto = (p) => `${slugify(p.nombre) || 'producto'}-${p.id.slice(0, 6).toLowerCase()}`;

const respuesta = await fetch(`${PLATAFORMA}/tienda/${encodeURIComponent(TIENDA)}/productos.json`);
if (!respuesta.ok) {
  console.error(`✗ La plataforma respondió HTTP ${respuesta.status}: el sitemap no se tocó.`);
  process.exit(1);
}
const { productos = [] } = await respuesta.json();

const rutas = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/catalogo', changefreq: 'weekly', priority: '0.9' },
  { loc: '/info', changefreq: 'monthly', priority: '0.7' },
  ...productos
    .filter((p) => typeof p?.id === 'string' && typeof p?.nombre === 'string' && p.nombre.trim())
    .map((p) => ({
      loc: `/producto/${encodeURIComponent(slugProducto(p))}`,
      changefreq: 'weekly',
      priority: '0.8',
    })),
];

// /carrito queda fuera a propósito: es una página transaccional sin valor SEO.
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...rutas.map((r) =>
    [
      '  <url>',
      `    <loc>${SITIO}${r.loc}</loc>`,
      `    <lastmod>${hoy}</lastmod>`,
      `    <changefreq>${r.changefreq}</changefreq>`,
      `    <priority>${r.priority}</priority>`,
      '  </url>',
    ].join('\n'),
  ),
  '</urlset>',
  '',
].join('\n');

writeFileSync('public/sitemap.xml', xml, 'utf8');
console.log(`✓ sitemap.xml con ${rutas.length} URLs (${rutas.length - 3} productos de la plataforma).`);

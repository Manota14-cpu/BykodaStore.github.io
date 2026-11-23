# BYKODA — memoria del proyecto

Leer esto antes de tocar nada. Los detalles técnicos están en [`README.md`](README.md).

**Este repo es público** (lo necesita GitHub Pages): acá va solo código y textos que ya
se publican en el sitio. Estrategia, proveedores, costos, planes y borradores van en el
repo privado `Manota14-cpu/bykoda-interno`.

## Qué es

BYKODA (también "Koda") es una marca de streetwear argentino de Rafaela, Santa Fe.
Vende ediciones limitadas en drops chicos que no se reponen. El trato es directo
por WhatsApp. Se está **reabriendo** con un grupo de amigos (noviembre 2026).

- Sitio: https://www.bykoda.store (dominio en `public/CNAME`). Imagen para compartir:
  `public/imagenes/og-bykoda.jpg` (si se cambia, usar un nombre nuevo: las redes la cachean).
- Instagram: [@__bykoda](https://www.instagram.com/__bykoda/) · TikTok: @bykoda.store
- WhatsApp de la tienda: +54 3492 301-333 (`src/lib/whatsapp.ts`)
- Mail público: admin@bykoda.store

## Voz de marca

- Español rioplatense, con voseo: "vestí", "comprá", "escribinos". Nunca "tú".
- Frases cortas y seguras. Lema: **"Vestí tu actitud."** Frase que lo resume: "Cuando una
  prenda se agota, no vuelve."
- Estética: sitio blanco, estilo tienda (fotos sobre gris claro, esquinas rectas, nombres en
  mayúsculas chicas). El hero es editorial, estilo Tussy: una foto a pantalla
  completa (hoy `hero-koda.webp`, se cambia en `FOTO` de `HeroHome.tsx`), el logo en blanco
  arriba a la izquierda, datos chicos arriba a la derecha y el lema abajo. Las fotos de la calle mojada siguen. Tipografías Bebas Neue (títulos, en mayúsculas) y Montserrat (texto).
- **No hay modo oscuro**: un solo tema claro, con los colores en `src/styles/tailwind.css`.
- Ideas que se repiten: ediciones limitadas, materiales pesados (denim rígido, frisa
  perchada), trato con una persona real, envíos a todo el país.
- No prometer nada que la tienda no cumpla: plazos, cambios y medios de pago tienen que
  coincidir con la sección Preguntas frecuentes de `/info`.

## Stack y comandos

React 18 + TypeScript + Vite + Tailwind v4 + Motion + TanStack Query + zustand + Zod.

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
npm run sitemap
```

`npm run sitemap` necesita acceso a Visual App. Correrlo después de cargar o sacar
productos.

Antes de dar algo por terminado: `npm test && npm run lint && npm run build`.

## Cómo funciona

- **Catálogo**: se administra en **Visual App** (tienda `bykoda`). El sitio lee
  `…workers.dev/tienda/bykoda/productos.json` cada 30 s. Precios, stock, talles, colores
  y fotos se cambian en el panel, sin tocar código. Si la app está vacía, el sitio
  también. Las categorías de la home y del pie salen del catálogo: solo aparecen las
  que tienen prendas (`categoriasConProductos` en `src/lib/catalogo.ts`).
- **Compra**: carrito → formulario → el pedido se registra en Visual App → se abre
  WhatsApp con el detalle. Opcional: Mercado Pago, si está conectado en Visual App.
- **Cupones**: `public/cupones.json` guarda solo el hash de cada código (`npm run cupon`).
  Al cambiarlos, subí `VERSION` en `src/api/local.ts`. Los códigos reales van en el repo privado.
- **Newsletter**: Google Form en `src/config/newsletter.ts`. Hoy está desconectado (el formulario pedía
  iniciar sesión y perdía los mails), así que el mail llega a la tienda por WhatsApp.
- **Reseñas**: solo reales, en `TESTIMONIOS` (`src/components/home/Secciones.tsx`). Vacía = sección oculta.
- **Textos**: no decir que BYKODA diseña, fabrica o produce mientras no sea así.
- **Ayuda y legales**: `/info` es el centro de ayuda; cada sección es `/info/<slug>`
  (`src/pages/ayuda/`). Términos y privacidad en `src/pages/ayuda/legales.tsx`; datos del
  titular (razón social, CUIT, domicilio) en `src/config/legal.ts`.
- **Obligatorio por ley (no sacar)**: link "Botón de arrepentimiento" visible en la barra de
  arriba (Disp. 954/2025) → `/arrepentimiento`; link "Defensa de las y los Consumidores" al
  formulario de la Ventanilla Federal Única en el pie (Disp. 890/2025). Arrepentimiento: 10 días
  corridos y la devolución la paga la tienda (art. 34, Ley 24.240). Garantía legal: 6 meses.
- **Video de la banda "calle"**: proyecto HyperFrames en `videos/`. Está apagado
  (`videosListos: false` en `src/config/media.ts`), así que se muestra el póster. El hero
  ya no usa video.
- **Catálogo anterior**: 71 prendas archivadas en `catalogo-anterior/`. No se publica.
- **Deploy**: push a `main` → GitHub Actions (lint, tests, build) → GitHub Pages, que sirve
  bykoda.store (confirmado: responde `server: GitHub.com`). No hay Vercel.

## Imágenes y tipografías (rendimiento)

- Logos: `logo.webp` es el original en alta (no se carga en la web; sirve para generar
  versiones). `logo-mini.webp` (240 px, encabezado, pie y "foto próximamente") y
  `logo-recortado.webp` (560 px, hero). Íconos: `favicon-32.png`, `icono-180.png`
  (iPhone), `icono-512.png` (datos de Google).
- Fotos grandes con versión chica al lado: `hero-koda-900.webp` (celular) y
  `chatN-640.webp` (grillas). Si se agrega una foto, generar también su versión chica.
- Tipografías servidas desde `public/fonts` (Bebas Neue y Montserrat variable 300–700),
  declaradas en `src/styles/tailwind.css`. No se piden a Google Fonts.
- Gris secundario (`ink-3`) al 62%: contraste ≥ 4,5:1. No bajarlo.
- Lighthouse celular (23/11/2026): home 91, ficha 76, catálogo 75 de rendimiento;
  accesibilidad, buenas prácticas y SEO en 100.

## Reglas de trabajo

- Las ramas de trabajo se mergean a `main` con un PR. Push a `main` = publicar.
- Fotos de producto verticales 3:4 (1080×1440), en `.webp`.
- Contenido, planes y decisiones se guardan en `bykoda-interno`, nunca acá.

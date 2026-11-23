# BYKODA — memoria del proyecto

Leer esto antes de tocar nada. Los detalles técnicos están en [`README.md`](README.md).

**Este repo es público** (lo necesita GitHub Pages): acá va solo código y textos que ya
se publican en el sitio. Estrategia, proveedores, costos, planes y borradores van en el
repo privado `Manota14-cpu/bykoda-interno`.

## Qué es

BYKODA (también "Koda") es una marca de streetwear argentino de Rafaela, Santa Fe.
Vende ediciones limitadas en drops chicos que no se reponen. El trato es directo
por WhatsApp. Se está **reabriendo** con un grupo de amigos (noviembre 2026).

- Sitio: https://www.bykoda.store (dominio en `public/CNAME`)
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
  también.
- **Compra**: carrito → formulario → el pedido se registra en Visual App → se abre
  WhatsApp con el detalle. Opcional: Mercado Pago, si está conectado en Visual App.
- **Cupones**: `public/cupones.json` guarda solo el hash de cada código (`npm run cupon`).
  Al cambiarlos, subí `VERSION` en `src/api/local.ts`. Los códigos reales van en el repo privado.
- **Newsletter**: Google Form configurado en `src/config/newsletter.ts`. Sin configurar, va por WhatsApp.
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
- **Deploy**: push a `main` → GitHub Actions (lint, tests, build) → GitHub Pages. También
  hay un `vercel.json`. Falta confirmar cuál de los dos sirve hoy el dominio.

## Reglas de trabajo

- Las ramas de trabajo se mergean a `main` con un PR. Push a `main` = publicar.
- Fotos de producto verticales 3:4 (1080×1440), en `.webp`.
- Contenido, planes y decisiones se guardan en `bykoda-interno`, nunca acá.

# BYKODA — memoria del proyecto

Leer esto antes de tocar nada. Los detalles técnicos están en [`README.md`](README.md).

**Este repo es público** (lo necesita GitHub Pages): acá va solo código y textos que ya
se publican en el sitio. Estrategia, proveedores, costos, planes y borradores van en el
repo privado `Manota14-cpu/bykoda-interno`.

## Qué es

BYKODA (también "Koda") es una marca de streetwear argentino de Rafaela, Santa Fe.
Vende ediciones limitadas en tiradas cortas que no se reponen. El trato es directo
por WhatsApp. Se está **reabriendo** con un grupo de amigos (noviembre 2026).

- Sitio: https://www.bykoda.store (dominio en `public/CNAME`)
- Instagram: [@__bykoda](https://www.instagram.com/__bykoda/) · TikTok: @bykoda.store
- WhatsApp de la tienda: +54 3492 301-333 (`src/lib/whatsapp.ts`)
- Mail público: admin@bykoda.store

## Voz de marca

- Español rioplatense, con voseo: "vestí", "comprá", "escribinos". Nunca "tú".
- Frases cortas y seguras. Lema: **"Vestí tu actitud."** Frase que lo resume: "Cuando una
  prenda se agota, no vuelve."
- Estética: negro puro, una figura bajo un foco, la calle mojada. Tipografías Bebas
  Neue (títulos, en mayúsculas) y Montserrat (texto).
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
- **Cupones**: `public/cupones.json`. Al cambiarlos, subí `VERSION` en `src/api/local.ts`.
- **Videos de la home**: proyectos HyperFrames en `videos/`. Están apagados
  (`videosListos: false` en `src/config/media.ts`), así que se muestran los pósters.
- **Catálogo anterior**: 71 prendas archivadas en `catalogo-anterior/`. No se publica.
- **Deploy**: push a `main` → GitHub Actions (lint, tests, build) → GitHub Pages. También
  hay un `vercel.json`. Falta confirmar cuál de los dos sirve hoy el dominio.

## Reglas de trabajo

- Las ramas de trabajo se mergean a `main` con un PR. Push a `main` = publicar.
- Fotos de producto verticales 3:4 (1080×1440), en `.webp`.
- Contenido, planes y decisiones se guardan en `bykoda-interno`, nunca acá.

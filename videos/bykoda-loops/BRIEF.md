---
workflow: general-video
flow: automation
storyboard: no
message: "BYKODA sale de la oscuridad: ediciones limitadas, bajo un solo foco"
destination: website-background
aspect: 1600x900
language: es
length: 16s
angle: brand-loop
---

## Intent

Dos loops de fondo, sin texto ni audio, para el sitio web de BYKODA (streetwear
argentino, ediciones limitadas). El texto lo pone la página por encima; el video
solo aporta atmósfera y movimiento.

1. **Hero** — cuatro figuras bajo un foco sobre negro puro aparecen una tras otra
   desde la oscuridad, con un push-in lento, y vuelven a apagarse. Se entrega en
   16:9 (1600×900, escritorio) y 4:5 (720×900, celular). Loop perfecto: arranca y
   termina en negro, así el corte del `loop` es un fundido más.
2. **La calle** — las tres prendas sobre la calle mojada al atardecer, con fundido
   cruzado continuo entre ellas y push-in lento. 4:5 (720×900). Loop perfecto por
   continuidad de pose entre el último y el primer cuadro.

## Assets

- assets/chat1.webp … chat4.webp — figuras de estudio sobre negro (hero).
- assets/chat6.webp … chat8.webp — prendas en la calle, verticales 2:3 (la calle).

## Notes

- Modo autónomo: el pedido llegó dentro de una mejora integral del sitio, con la
  instrucción de resolver todo ("mejorá la estética… para que sea muy profesional").
  `flow`, `storyboard`, `destination` y `aspect` son decisiones inferidas, no
  respuestas del usuario: no se graban como preferencias.
- Destino: `<video autoplay muted loop playsinline>` en `public/videos/` del sitio.
  Peso objetivo 1–2 MB por archivo (MP4 H.264). Sin grano en el video: el ruido no
  comprime y el sitio puede aplicar su propia textura por CSS.
- Fondo en negro puro (#000) a propósito: es el negro de las fotos y del tema oscuro
  del sitio; un negro teñido dejaría bordes visibles contra la imagen.
- Render sujeto a aprobación del usuario (regla del contrato).

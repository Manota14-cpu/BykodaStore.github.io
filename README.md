# BYKODA Store

Tienda de ropa urbana. SPA en React + TypeScript + Vite + Tailwind CSS, publicada en
GitHub Pages. El pedido se arma en el sitio y se confirma por WhatsApp, o se paga con
Mercado Pago si está conectado. El catálogo, el stock y los pedidos se manejan desde la
plataforma **Visual App**.

## Cómo correrlo

```bash
npm install
npm run dev
```

| Script                 | Qué hace                                                          |
| ---------------------- | ----------------------------------------------------------------- |
| `npm run dev`          | Servidor de desarrollo                                            |
| `npm run build`        | Typecheck + build de producción a `dist/`                          |
| `npm test`             | Tests (vitest)                                                    |
| `npm run lint`         | ESLint                                                            |
| `npm run format`       | Prettier                                                          |
| `npm run sitemap`      | Regenera `public/sitemap.xml` con los productos de Visual App     |
| `npm run cupon`        | Genera la entrada de un cupón nuevo para `public/cupones.json`    |

## Catálogo en Visual App

Los productos se cargan en el panel de Visual App (tienda `bykoda`). El sitio lee
`/tienda/bykoda/productos.json` con el diseño propio de BYKODA (no usa el widget
genérico) y se actualiza solo cada 30 segundos: precio, stock y fotos cambian sin
volver a publicar el sitio. El sitio muestra **solo** lo que está en la app. Después
de cargar o sacar productos, corré `npm run sitemap` para que Google los encuentre.

- **Categoría**: se muestra tal como está cargada en el panel. Remeras, Buzos,
  Pantalones, Bermudas y Accesorios tienen menú propio (se aceptan sinónimos como
  "hoodie" o "jogger"); una categoría nueva aparece sola en el menú.
- **Stock**: el carrito no deja pasar las unidades informadas (por combinación de
  talle y color, o sumando todos los talles si la prenda no los tiene cargados) y
  sigue al stock en vivo: si otra compra lo descuenta, lo agotado sale del carrito y
  lo que bajó se achica, con un aviso. Lo que no está en la app (por ejemplo,
  prendas del catálogo anterior en carritos viejos) también sale. Con 3 o menos se
  muestra "Quedan N".
- **Talles y colores**: si la prenda tiene talles y colores cargados en Visual App,
  la ficha muestra exactamente esos, tacha los que no tienen stock y el pedido
  descuenta el stock de la combinación elegida. Si no los tiene, ofrece S a XXL (los
  accesorios no llevan talle) y el talle elegido viaja en las notas del pedido.
- **Fotos**: conviene subirlas verticales 3:4 (por ejemplo 1080×1440): las tarjetas
  son verticales y a una foto cuadrada se le recortan los costados. Sin foto, la
  prenda muestra "Foto próximamente".
- **Pedidos**: al enviar, el pedido se registra en la plataforma (vuelve a validar el
  stock y devuelve el número) y después se abre WhatsApp con el detalle completo y
  ese número. Con cupón, el total a cobrar queda anotado en las notas del pedido
  (el total de la app no aplica descuentos).
- **Mercado Pago**: si la tienda tiene Mercado Pago conectado en Visual App
  (Configuración → Tienda web → Conectar Mercado Pago), al finalizar se puede elegir
  pagar ahí. La plataforma registra el pedido, arma el cobro con sus precios y
  Mercado Pago vuelve al inicio del sitio, que avisa si el pago se aprobó. Cobra
  solo las prendas: el envío se cotiza por WhatsApp. Con cupón, prendas del
  catálogo anterior o precios a consultar, el pago sigue por WhatsApp. Sin Mercado
  Pago conectado, la opción no aparece.

La conexión se configura en [`src/config/tienda.ts`](src/config/tienda.ts) y con
variables de entorno:

| Variable               | Para qué                                            |
| ---------------------- | --------------------------------------------------- |
| `VITE_VISUAL_APP_SLUG` | Otra tienda de la plataforma (por defecto `bykoda`) |

## Catálogo anterior (archivado)

Las 71 prendas de antes de Visual App (datos y fotos) están en
[`catalogo-anterior/`](catalogo-anterior/LEEME.md), como referencia para cargar en la
app las que se sigan vendiendo. El sitio ya no las muestra y la carpeta no entra en
el build.

## Cupones

Se gestionan en [`public/cupones.json`](public/cupones.json). El archivo es público,
así que no guarda los códigos sino su hash: el sitio calcula el hash de lo que escribe
el cliente y lo compara. Para crear un cupón:

```bash
npm run cupon -- VERANO20 20 --vence 2027-01-31 --usos 1
```

Pegá el resultado dentro de `"cupones"` y subí el `VERSION` en
[`src/api/local.ts`](src/api/local.ts) para invalidar la caché del navegador. El límite
de usos se cuenta por navegador; el código usado viaja en el mensaje del pedido para
poder controlarlo.

## Lista de espera (newsletter)

El "Enterate primero de cada drop" del pie de página guarda los mails en un Google Form
(sus respuestas van a una planilla). Se conecta en
[`src/config/newsletter.ts`](src/config/newsletter.ts), con los pasos explicados ahí.
Mientras no esté conectado, el mail se manda a la tienda por WhatsApp.

## Reseñas

La sección de reseñas de la home solo aparece si hay reseñas cargadas en `TESTIMONIOS`
([`src/components/home/Secciones.tsx`](src/components/home/Secciones.tsx)). Tienen que
ser de clientes reales y con su permiso.

## Estructura

```
src/
  api/          Clientes de datos: plataforma Visual App (validados con Zod) y cupones
  components/   Piezas de UI reutilizables (home/, motion/)
  config/       Conexión con la tienda y videos
  hooks/        Catálogo combinado con TanStack Query
  lib/          Lógica sin UI: pedido, WhatsApp, taxonomía, SEO
  pages/        Una por ruta (se cargan bajo demanda)
  store/        Estado global (zustand): carrito, favoritos, toasts
  styles/       tailwind.css: tokens del tema, utilidades y animaciones
videos/         Proyectos HyperFrames de los videos de la home
catalogo-anterior/  Prendas y fotos de antes de Visual App (archivo, no se publica)
```

### Rutas

| Ruta             | Página                                          |
| ---------------- | ----------------------------------------------- |
| `/`              | Home                                            |
| `/catalogo`      | Catálogo con filtros (`#cat=<categoría>` opcional) |
| `/producto/:id`  | Ficha: precio, talles, tela y guía de talles     |
| `/carrito`       | Carrito y checkout por WhatsApp                  |
| `/info`          | Nosotros + FAQ + guía de talles + contacto       |

`/faqs`, `/nosotros` y `/contacto` redirigen a la sección correspondiente de `/info`.

## Estilos y animación

Tailwind CSS v4, sin hojas por pantalla. Los colores son tokens de
[`src/styles/tailwind.css`](src/styles/tailwind.css). El sitio tiene un solo tema,
claro (fondo blanco); las variantes de botones y badges usan `class-variance-authority`. Las
animaciones usan Motion y respetan "reducir movimiento" del sistema.

## Videos

El hero de la home es el logo de KODA (`public/imagenes/logo-recortado.webp`, el mismo logo
sin margen transparente, invertido a negro con CSS) grande y centrado sobre fondo claro, con el lema abajo.

El video de la banda "calle" se arma como proyecto HyperFrames en `videos/` y se
renderiza a MP4 en `public/videos/`. Mientras no esté, se muestra el póster. Los
proyectos del hero viejo (sobre negro) quedan en `videos/` como referencia. Cuando el
video de la calle esté listo, activá `videosListos` en
[`src/config/media.ts`](src/config/media.ts). No se reproduce con "reducir movimiento" ni
con ahorro de datos, y tiene botón de pausa.

## Créditos y licencia

Sitio diseñado y desarrollado por **[Visual Solution](https://visual-solution.vercel.app)**.

© 2026 BYKODA — Todos los derechos reservados. Ver [LICENSE](LICENSE).

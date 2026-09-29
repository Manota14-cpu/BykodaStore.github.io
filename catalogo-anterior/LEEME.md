# Catálogo anterior (archivado)

Las 71 prendas que mostraba el sitio antes de pasar a Visual App. Ya no se publican:
la tienda muestra solo lo que está cargado en la app. Quedan acá como referencia para
cargar en Visual App las que se sigan vendiendo.

- `stock.json`: nombre, precio, categoría, talles, descripción, tela, composición y
  cuidados de cada prenda.
- `imagenes/`: sus fotos (Remeras, Pantalones, Abrigos), con las mismas rutas que
  usa `stock.json`. Otras 17 fotos están alojadas en Tiendanube (son los links
  `https://…mitiendanube.com/…` dentro de `stock.json`).
- `enrich-stock.mjs`: el script que completaba la ficha técnica de `stock.json`
  (ya no se usa).

Esta carpeta no entra en el build: el deploy publica solo `dist/`.

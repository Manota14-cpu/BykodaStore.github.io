/* ── KODA URL Cleaner — limpia .html de la barra de dirección ── */
(function () {
  var path = window.location.pathname;
  var search = window.location.search;
  var hash = window.location.hash;

  // Mapa de archivos a rutas limpias
  var urlMap = {
    '/index.html':    '/',
    '/productos.html':'/catalogo',
    '/producto.html': '/producto',
    '/carrito.html':  '/carrito',
    '/faqs.html':     '/faqs',
  };

  // Reemplazar si hay match exacto
  for (var file in urlMap) {
    if (path === file || path.endsWith(file)) {
      var clean = path.slice(0, path.length - file.length) + urlMap[file];
      window.history.replaceState(null, '', clean + search + hash);
      break;
    }
  }
})();

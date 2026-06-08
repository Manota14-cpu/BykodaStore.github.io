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

  // Guardar ruta limpia actual
  var cleanPath = window.location.pathname;
  // Si llegamos a /catalogo sin .html, seteamos un data attr para filtros de hash
  if (hash && hash.startsWith('#cat=')) {
    // No tocar el hash, es para filtro de catálogo
  }
})();

/* ── KODA Page Loader v3 ── */
(function () {
  /* ── Estilos del loader ── */
  var style = document.createElement('style');
  style.textContent = [
    /* Overlay */
    '#koda-loader{position:fixed;inset:0;z-index:99999;background:#0a0a0a;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:0;transition:opacity 0.7s cubic-bezier(0.16,1,0.3,1),visibility 0.7s cubic-bezier(0.16,1,0.3,1)}',
    '#koda-loader.oculto{opacity:0;visibility:hidden;pointer-events:none}',

    /* Logo */
    '#koda-loader .kl-logo-wrap{position:relative;display:flex;align-items:center;justify-content:center;width:100px;height:100px}',
    '#koda-loader .kl-logo-ring{position:absolute;inset:0;border-radius:50%;border:1px solid rgba(255,255,255,0.08);animation:kl-ring-pulse 2s ease-in-out infinite}',
    '@keyframes kl-ring-pulse{0%,100%{transform:scale(1);opacity:0.5}50%{transform:scale(1.06);opacity:1}}',
    '#koda-loader img{width:56px;height:56px;object-fit:contain;opacity:0;animation:kl-fade-in 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s forwards}',
    '@keyframes kl-fade-in{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}',

    /* Texto KODA */
    '#koda-loader .kl-brand{margin-top:20px;font-family:\'Bebas Neue\',\'Arial Narrow\',sans-serif;font-size:13px;letter-spacing:0.35em;color:rgba(255,255,255,0.25);text-transform:uppercase;opacity:0;animation:kl-fade-in 0.5s ease 0.25s forwards}',

    /* Barra de progreso */
    '#koda-loader .kl-bar-wrap{margin-top:28px;width:80px;height:1px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden}',
    '#koda-loader .kl-bar{height:100%;width:0%;background:linear-gradient(90deg,rgba(255,255,255,0.2),rgba(255,255,255,0.7));border-radius:2px;animation:kl-fill 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s forwards}',
    '@keyframes kl-fill{to{width:100%}}',
  ].join('');
  document.head.appendChild(style);

  /* ── Construir el DOM del loader ── */
  function getLogoPath() {
    var scripts = document.querySelectorAll('script[src*="loader.js"]');
    var base = '';
    if (scripts.length) base = scripts[0].getAttribute('src').replace('loader.js', '');
    return base + 'imagenes/logo.png';
  }

  var loader = document.createElement('div');
  loader.id = 'koda-loader';
  loader.setAttribute('role', 'status');
  loader.setAttribute('aria-label', 'Cargando BYKODA');
  loader.innerHTML =
    '<div class="kl-logo-wrap">' +
      '<div class="kl-logo-ring"></div>' +
      '<img src="' + getLogoPath() + '" alt="BYKODA">' +
    '</div>' +
    '<div class="kl-brand">BYKODA</div>' +
    '<div class="kl-bar-wrap" aria-hidden="true"><div class="kl-bar"></div></div>';

  function insertLoader() {
    if (document.body) document.body.insertBefore(loader, document.body.firstChild);
    else document.addEventListener('DOMContentLoaded', function () {
      document.body.insertBefore(loader, document.body.firstChild);
    });
  }
  insertLoader();

  /* ── Ocultar loader cuando la página está lista ── */
  function hideLoader() {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(function () { loader.classList.add('oculto'); }, reduced ? 0 : 450);
  }
  if (document.readyState === 'complete') hideLoader();
  else window.addEventListener('load', hideLoader);

  /* ── Mapa de rutas limpias → archivos reales ── */
  var ROUTE_MAP = {
    '/catalogo':  'productos.html',
    '/carrito':   'carrito.html',
    '/faqs':      'faqs.html',
    '/producto':  'producto.html',
    '/':          'index.html',
  };

  /* ── Interceptar clicks en links internos ── */
  document.addEventListener('click', function (e) {
    var anchor = e.target.closest('a');
    if (!anchor) return;
    var href = anchor.getAttribute('href');
    if (!href) return;

    // Ignorar externos, anclas, mailto, tel, js
    if (
      anchor.target === '_blank' ||
      href.startsWith('http') ||
      href.startsWith('//') ||
      href.startsWith('#') ||
      href.startsWith('mailto') ||
      href.startsWith('tel') ||
      href.startsWith('javascript')
    ) return;

    e.preventDefault();

    // Mostrar loader
    var bar = loader.querySelector('.kl-bar');
    if (bar) { bar.style.animation = 'none'; bar.offsetHeight; bar.style.animation = ''; }
    loader.classList.remove('oculto');

    // Resolver URL de destino
    var dest = href;

    // Si el href es una ruta limpia (ej: /catalogo o catalogo)
    var normalized = dest.startsWith('/') ? dest : '/' + dest;
    // Quitar query/hash para lookup
    var pathOnly = normalized.split('?')[0].split('#')[0];
    var qs = dest.indexOf('?') !== -1 ? dest.slice(dest.indexOf('?')) : '';
    var hashPart = dest.indexOf('#') !== -1 ? dest.slice(dest.indexOf('#')) : '';

    if (ROUTE_MAP[pathOnly]) {
      dest = ROUTE_MAP[pathOnly] + qs + hashPart;
    }
    // Si ya tiene .html, lo deja igual

    setTimeout(function () { window.location.href = dest; }, 420);
  });
})();

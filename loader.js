/* ── KODA Page Loader v2 ── */
(function () {
  var style = document.createElement('style');
  style.textContent = [
    '#koda-loader{position:fixed;inset:0;z-index:99999;background:#000;display:flex;align-items:center;justify-content:center;flex-direction:column;transition:opacity 0.6s cubic-bezier(0.16,1,0.3,1),visibility 0.6s cubic-bezier(0.16,1,0.3,1)}',
    '#koda-loader.oculto{opacity:0;visibility:hidden;pointer-events:none}',
    '#koda-loader img{width:120px;max-width:36vw;opacity:0;animation:kl-up 0.55s cubic-bezier(0.22,1,0.36,1) 0.05s forwards}',
    '@keyframes kl-up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}',
    '#koda-loader .kl-bar-wrap{margin-top:32px;width:72px;height:1px;background:rgba(255,255,255,0.1);border-radius:1px;overflow:hidden}',
    '#koda-loader .kl-bar{height:100%;width:0%;background:rgba(255,255,255,0.5);animation:kl-fill 0.65s cubic-bezier(0.22,1,0.36,1) 0.1s forwards}',
    '@keyframes kl-fill{to{width:100%}}'
  ].join('');
  document.head.appendChild(style);

  function getLogoPath() {
    var scripts = document.querySelectorAll('script[src*="loader.js"]');
    var base = '';
    if (scripts.length) base = scripts[0].getAttribute('src').replace('loader.js','');
    return base + 'imagenes/logo.png';
  }

  var loader = document.createElement('div');
  loader.id = 'koda-loader';
  loader.setAttribute('role','status');
  loader.setAttribute('aria-label','Cargando KODA');
  loader.innerHTML = '<img src="'+getLogoPath()+'" alt="KODA">'
    + '<div class="kl-bar-wrap" aria-hidden="true"><div class="kl-bar"></div></div>';

  function insertLoader() {
    if (document.body) document.body.insertBefore(loader, document.body.firstChild);
    else document.addEventListener('DOMContentLoaded', function(){ document.body.insertBefore(loader, document.body.firstChild); });
  }
  insertLoader();

  function hideLoader() {
    var delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 400;
    setTimeout(function(){ loader.classList.add('oculto'); }, delay);
  }

  if (document.readyState === 'complete') hideLoader();
  else window.addEventListener('load', hideLoader);

  // Transition on internal links
  document.addEventListener('click', function(e) {
    var anchor = e.target.closest('a');
    if (!anchor) return;
    var href = anchor.getAttribute('href');
    if (!href) return;
    if (anchor.target==='_blank'||href.startsWith('http')||href.startsWith('//')||href.startsWith('#')||href.startsWith('mailto')||href.startsWith('tel')||href.startsWith('javascript')) return;
    e.preventDefault();
    var bar = loader.querySelector('.kl-bar');
    if (bar) { bar.style.animation='none'; bar.offsetHeight; bar.style.animation=''; }
    loader.classList.remove('oculto');
    setTimeout(function(){ window.location.href = href; }, 400);
  });
})();

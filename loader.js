/* ── KODA Page Loader ── */
(function () {
  // Inject styles
  var style = document.createElement('style');
  style.textContent = `
    #koda-loader {
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    #koda-loader.oculto {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }
    #koda-loader img {
      width: 140px;
      max-width: 40vw;
    }
    #koda-loader .koda-barra-wrap {
      margin-top: 32px;
      width: 120px;
      height: 2px;
      background: rgba(255,255,255,0.1);
      border-radius: 2px;
      overflow: hidden;
    }
    #koda-loader .koda-barra {
      height: 100%;
      width: 0%;
      background: #fff;
      border-radius: 2px;
      animation: koda-fill 0.6s ease forwards;
    }
    @keyframes koda-fill {
      to { width: 100%; }
    }
  `;
  document.head.appendChild(style);

  // Detect logo path (works from any subfolder depth)
  function getLogoPath() {
    var scripts = document.querySelectorAll('script[src*="loader.js"]');
    var base = '';
    if (scripts.length) {
      var src = scripts[0].getAttribute('src');
      base = src.replace('loader.js', '');
    }
    return base + 'imagenes/logo.png';
  }

  // Build loader element
  var loader = document.createElement('div');
  loader.id = 'koda-loader';
  loader.innerHTML =
    '<img src="' + getLogoPath() + '" alt="KODA">' +
    '<div class="koda-barra-wrap"><div class="koda-barra"></div></div>';

  // Insert as first child of body as soon as possible
  function insertLoader() {
    if (document.body) {
      document.body.insertBefore(loader, document.body.firstChild);
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        document.body.insertBefore(loader, document.body.firstChild);
      });
    }
  }
  insertLoader();

  // Hide loader after page is ready
  function hideLoader() {
    setTimeout(function () {
      loader.classList.add('oculto');
    }, 650);
  }

  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader);
  }

  // Show loader on every internal link click
  document.addEventListener('click', function (e) {
    var anchor = e.target.closest('a');
    if (!anchor) return;

    var href = anchor.getAttribute('href');
    if (!href) return;

    // Skip: external, hash-only, mailto, tel, javascript
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

    // Reset and show loader
    var barra = loader.querySelector('.koda-barra');
    if (barra) {
      barra.style.animation = 'none';
      barra.offsetHeight; // reflow
      barra.style.animation = '';
    }
    loader.classList.remove('oculto');

    setTimeout(function () {
      window.location.href = href;
    }, 600);
  });
})();

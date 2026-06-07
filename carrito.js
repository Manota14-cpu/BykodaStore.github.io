/* ─── Sanitize HTML (prevención XSS) ────────────────────────────── */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ================================================================
   KODA SHOP — carrito.js  (v3 — lógica mejorada + bugs corregidos)
   ================================================================ */

/* ─── Toast ────────────────────────────────────────────────────── */
function showToast(message, type = 'default') {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = 'toast show' + (type === 'error' ? ' toast-error' : type === 'success' ? ' toast-success' : '');
  clearTimeout(window.kodaToastTimer);
  window.kodaToastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

/* ─── Transiciones aparición/desaparición ────────────────────── */
function show(el, displayType = 'block') {
  if (!el) return;
  if (el.style.display !== 'none' && el.style.display !== '' && !el.classList.contains('is-hidden')) return;
  el.style.display = displayType;
  el.style.opacity = '0';
  el.style.transform = 'translateY(6px)';
  void el.offsetHeight;
  el.style.transition = 'opacity 0.5s var(--ease-smooth, cubic-bezier(0.22,1,0.36,1)), transform 0.5s var(--ease-smooth, cubic-bezier(0.22,1,0.36,1))';
  el.style.opacity = '1';
  el.style.transform = 'translateY(0)';
  const clear = () => { el.style.transition = ''; el.removeEventListener('transitionend', clear); };
  el.addEventListener('transitionend', clear, { once: true });
}

function hide(el) {
  if (!el) return;
  if (el.style.display === 'none') return;
  el.style.transition = 'opacity 0.4s var(--ease-smooth, cubic-bezier(0.22,1,0.36,1)), transform 0.4s var(--ease-smooth, cubic-bezier(0.22,1,0.36,1))';
  el.style.opacity = '0';
  el.style.transform = 'translateY(4px)';
  el.addEventListener('transitionend', () => {
    el.style.display = 'none';
    el.style.transition = '';
    el.style.transform = '';
    el.style.opacity = '';
  }, { once: true });
}

/* ─── Carrito ──────────────────────────────────────────────────── */
function getCarrito() {
  try { return JSON.parse(localStorage.getItem('carrito')) || []; }
  catch { return []; }
}

function setCarrito(carrito) {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

function actualizarContadorCarrito() {
  const carrito      = getCarrito();
  const totalCantidad = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  const el = document.getElementById('contador-carrito');
  if (el) {
    const prev = parseInt(el.textContent) || 0;
    el.textContent = totalCantidad;
    if (totalCantidad > prev) {
      el.classList.remove('badge-bump');
      void el.offsetWidth;
      el.classList.add('badge-bump');
      // Pop animation on nav cart link
      const cartLink = document.querySelector('.nav-link--cart');
      if (cartLink) {
        cartLink.classList.remove('pop');
        void cartLink.offsetWidth;
        cartLink.classList.add('pop');
        cartLink.addEventListener('animationend', () => cartLink.classList.remove('pop'), { once: true });
      }
    }
  }
}

function agregarCarrito(nombre, precio) {
  agregarConCantidad(null, nombre, precio);
}

/* BUG CORREGIDO: validación de talle ahora muestra mensaje específico */
function agregarConCantidad(btn, nombre, precio, talle) {
  let cantidad = 1;
  let talleSeleccionado = talle || '';

  if (btn) {
    const container = btn.closest('.producto');
    if (container) {
      const qty = container.querySelector('input.qty');
      if (qty) cantidad = Math.max(1, parseInt(qty.value, 10) || 1);
      // Leer talle si hay selector de botones
      const talleActivo = container.querySelector('.talle-btn.activo');
      if (talleActivo) talleSeleccionado = talleActivo.dataset.talle;

      // BUG FIX: si hay botones de talle pero ninguno seleccionado, avisar
      const hasTalleBtns = container.querySelectorAll('.talle-btn').length > 0;
      if (hasTalleBtns && !talleSeleccionado) {
        showToast('¡Seleccioná un talle antes de agregar!', 'error');
        return;
      }
    }
  }

  const key     = talleSeleccionado ? `${nombre} (${talleSeleccionado})` : nombre;
  const carrito = getCarrito();
  const existente = carrito.find(p => p.nombre === key);

  // Capture product image from DOM card
  let imgSrc = '';
  if (btn) {
    const container = btn.closest('.producto');
    if (container) {
      const imgEl = container.querySelector('.img-flip img.img-adelante, .img-flip img, .img-simple, img');
      if (imgEl) imgSrc = imgEl.getAttribute('src') || imgEl.getAttribute('data-src') || '';
    }
  }

  if (existente) {
    existente.cantidad += cantidad;
    if (!existente.imgSrc && imgSrc) existente.imgSrc = imgSrc;
  } else {
    carrito.push({ nombre: key, precio, cantidad, imgSrc });
  }

  setCarrito(carrito);
  actualizarContadorCarrito();

  showToast('✓ Agregado al carrito', 'success');
}

/* ─── Agregar con talle de calzado (select) ─────────────────────── */
function agregarConCantidadZapa(btn, nombre, precio) {
  const container = btn.closest('.producto');
  const qty       = Math.max(1, parseInt(container?.querySelector('input.qty')?.value, 10) || 1);
  const select    = container?.querySelector('.talle-select');
  const talle     = select?.value?.trim();

  if (!talle) {
    showToast('¡Seleccioná un número de calzado!', 'error');
    select && select.focus();
    return;
  }

  const key     = `${nombre} (Nro. ${talle})`;
  const carrito = getCarrito();
  const existente = carrito.find(p => p.nombre === key);
  let zapaImg = '';
  if (btn) {
    const container = btn.closest('.producto');
    const imgEl = container?.querySelector('.img-flip img.img-adelante, img');
    if (imgEl) zapaImg = imgEl.getAttribute('src') || '';
  }
  if (existente) { existente.cantidad += qty; }
  else           { carrito.push({ nombre: key, precio, cantidad: qty, imgSrc: zapaImg }); }
  setCarrito(carrito);
  actualizarContadorCarrito();
  showToast('✓ Agregado al carrito', 'success');
}

/* ─── Mostrar carrito ───────────────────────────────────────────── */
function mostrarCarrito() {
  const lista = document.getElementById('carrito-lista');
  if (!lista) return;

  const carrito = getCarrito();
  lista.innerHTML = '';
  let total      = 0;
  const consultItems = carrito.some(item => item.precio === 0);

  if (carrito.length === 0) {
    lista.innerHTML = `
      <div class="carrito-vacio" style="text-align:center;padding:64px 24px;display:flex;flex-direction:column;align-items:center;gap:16px;">
        <div style="width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.4"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        </div>
        <div>
          <h4 style="font-size:1rem;font-weight:700;letter-spacing:-0.01em;color:#fff;margin:0 0 6px;">Tu carrito está vacío</h4>
          <p style="font-size:0.85rem;color:rgba(255,255,255,0.35);max-width:240px;margin:0 auto;line-height:1.5;">Explorá el catálogo y encontrá algo que te guste.</p>
        </div>
        <a href="productos.html" class="btn btn-primary" style="margin-top:8px;font-size:0.8rem;">Ver catálogo</a>
      </div>`;
    const totalEl = document.getElementById('total');
    if (totalEl) totalEl.textContent = '$0';
    actualizarBotonesCarrito();
    return;
  }

  carrito.forEach((item, index) => {
    if (item.precio > 0) total += item.precio * item.cantidad;
    const div       = document.createElement('div');
    div.className   = 'carrito-item';
    const precioUnit = item.precio > 0 ? `$${item.precio.toLocaleString('es-AR')}` : 'Consultar';
    const precioTotal = item.precio > 0 ? `$${(item.precio * item.cantidad).toLocaleString('es-AR')}` : 'Consultar';
    const imgHTML = item.imgSrc
      ? `<div class="cart-item-img"><img src="${escapeHTML(item.imgSrc)}" alt="${escapeHTML(item.nombre)}" loading="lazy"></div>`
      : `<div class="cart-item-img cart-item-img--empty"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.25"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div>`;
    div.innerHTML = `
      ${imgHTML}
      <div class="item-meta">
        <h4>${escapeHTML(item.nombre)}</h4>
        <p>Precio unitario: ${escapeHTML(precioUnit)}</p>
        <div class="cantidad-control">
          <button type="button" aria-label="Menos" onclick="cambiarCantidad(${index}, -1)">−</button>
          <span>${item.cantidad}</span>
          <button type="button" aria-label="Más" onclick="cambiarCantidad(${index}, 1)">+</button>
        </div>
      </div>
      <div class="item-actions">
        <p class="item-subtotal">${escapeHTML(precioTotal)}</p>
        <button type="button" class="btn-eliminar" onclick="eliminarProducto(${index})" aria-label="Eliminar ${escapeHTML(item.nombre)}">✕</button>
      </div>`;
    lista.appendChild(div);
  });

  // Subtotal de items con precio conocido
  const itemsConPrecio = carrito.filter(i => i.precio > 0);
  const cantidadTotal = carrito.reduce((s, i) => s + i.cantidad, 0);

  const totalEl = document.getElementById('total');
  if (totalEl) totalEl.textContent = consultItems && total === 0 ? 'Consultar' : `$${total.toLocaleString('es-AR')}${consultItems ? ' + a consultar' : ''}`;

  // Resumen de cantidad de artículos
  const resumenEl = document.getElementById('carrito-resumen-cant');
  if (resumenEl) resumenEl.textContent = `${cantidadTotal} artículo${cantidadTotal !== 1 ? 's' : ''}`;

  actualizarBotonesCarrito();
  recalcularTotal();
}

function actualizarBotonesCarrito() {
  const carrito    = getCarrito();
  const vaciarBtn  = document.getElementById('vaciar-carrito');
  const finalizarBtn = document.getElementById('finalizar-compra');
  if (vaciarBtn)   vaciarBtn.disabled    = carrito.length === 0;
  if (finalizarBtn) finalizarBtn.disabled = carrito.length === 0;
}

function eliminarProducto(index) {
  const carrito = getCarrito();
  const nombre = carrito[index]?.nombre || 'Producto';
  carrito.splice(index, 1);
  setCarrito(carrito);
  mostrarCarrito();
  actualizarContadorCarrito();
  showToast('✕ Eliminado del carrito');
}

function cambiarCantidad(index, delta) {
  const carrito = getCarrito();
  if (!carrito[index]) return;
  carrito[index].cantidad = Math.max(1, carrito[index].cantidad + delta);
  setCarrito(carrito);
  mostrarCarrito();
  actualizarContadorCarrito();
}

function vaciarCarrito() {
  if (!confirm('¿Vaciar el carrito?')) return;
  setCarrito([]);
  mostrarCarrito();
  actualizarContadorCarrito();
  showToast('Carrito vaciado.');
}

function finalizarCompra() {
  const carrito = getCarrito();
  if (carrito.length === 0) return;
  abrirModalCheckout();
}

function abrirModalCheckout() {
  let overlay = document.getElementById('checkout-overlay');
  if (!overlay) return;
  const carrito = getCarrito();
  const total = carrito.reduce((s, i) => i.precio > 0 ? s + i.precio * i.cantidad : s, 0);
  const cant = carrito.reduce((s, i) => s + i.cantidad, 0);
  const resumen = document.getElementById('checkout-resumen');
  if (resumen) {
    resumen.textContent = `${cant} artículo${cant !== 1 ? 's' : ''} · Total: $${total.toLocaleString('es-AR')}`;
  }
  overlay.classList.add('activo');
  document.body.style.overflow = 'hidden';
  document.getElementById('checkout-nombre')?.focus();
}

function cerrarModalCheckout() {
  const overlay = document.getElementById('checkout-overlay');
  if (!overlay) return;
  overlay.classList.remove('activo');
  document.body.style.overflow = '';
}

function confirmarPedidoWhatsApp() {
  const nombre    = document.getElementById('checkout-nombre')?.value.trim();
  const telefono  = document.getElementById('checkout-telefono')?.value.trim();
  const direccion = document.getElementById('checkout-direccion')?.value.trim();
  const nota      = document.getElementById('checkout-nota')?.value.trim();

  const fieldNombre   = document.getElementById('checkout-nombre')?.closest('.checkout-field');
  const fieldTel      = document.getElementById('checkout-telefono')?.closest('.checkout-field');
  let ok = true;

  // Clear errors
  document.querySelectorAll('.checkout-field').forEach(f => f.classList.remove('error', 'shake'));

  if (!nombre) {
    if (fieldNombre) { fieldNombre.classList.add('error', 'shake'); }
    document.getElementById('checkout-nombre')?.focus();
    ok = false;
  }

  if (!telefono) {
    if (fieldTel) { fieldTel.classList.add('error', 'shake'); }
    if (ok) document.getElementById('checkout-telefono')?.focus();
    ok = false;
  }

  if (!ok) return;

  // Disable button + loading state
  const btn = document.getElementById('checkout-confirmar');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="btn-spinner"></span> Enviando...';

  const carrito = getCarrito();
  let mensaje = `🛍️ *Nuevo pedido KODA*\n`;
  mensaje += `━━━━━━━━━━━━━━━━━━━\n\n`;
  mensaje += `👤 *Cliente:* ${nombre}\n`;
  mensaje += `📱 *Teléfono:* ${telefono}\n`;
  if (direccion) mensaje += `📍 *Dirección:* ${direccion}\n`;
  mensaje += `\n🧾 *Detalle del pedido:*\n`;

  carrito.forEach(item => {
    const precio = item.precio > 0
      ? `$${(item.precio * item.cantidad).toLocaleString('es-AR')}`
      : 'A consultar';
    mensaje += `• ${item.nombre} x${item.cantidad} — ${precio}\n`;
  });

  const total = carrito.reduce((s, i) => i.precio > 0 ? s + i.precio * i.cantidad : s, 0);
  const hayConsulta = carrito.some(i => i.precio === 0);
  let totalFinal = total;
  if (cuponAplicado && total > 0) {
    const desc = Math.round(total * cuponAplicado.descuento / 100);
    totalFinal = total - desc;
    mensaje += `\n🏷️ *Cupón ${cuponAplicado.codigo}:* −$${desc.toLocaleString('es-AR')} (${cuponAplicado.descuento}% off)\n`;
  }
  mensaje += `\n💰 *Total: ${hayConsulta ? 'Consultar' : '$' + totalFinal.toLocaleString('es-AR')}*\n`;
  if (nota) mensaje += `\n📝 *Nota:* ${nota}\n`;
  mensaje += `\n¡Hola! Quiero confirmar este pedido y coordinar el pago 🙌`;

  const url = `https://wa.me/5493492301333?text=${encodeURIComponent(mensaje)}`;

  setTimeout(() => {
    cerrarModalCheckout();
    window.open(url, '_blank');
    btn.disabled = false;
    btn.innerHTML = originalText;
    // Limpiar form
    ['checkout-nombre','checkout-telefono','checkout-direccion','checkout-nota']
      .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  }, 400);
}

/* ─── Favoritos ─────────────────────────────────────────────────── */
function getFavoritos() {
  try { return JSON.parse(localStorage.getItem('koda_favoritos')) || []; }
  catch { return []; }
}

function toggleFavorito(nombre, btn) {
  const favs = getFavoritos();
  const idx  = favs.indexOf(nombre);
  if (idx === -1) {
    favs.push(nombre);
    if (btn) { btn.textContent = '♥'; btn.classList.add('fav-activo'); }
    showToast('Agregado a favoritos ♥');
  } else {
    favs.splice(idx, 1);
    if (btn) { btn.textContent = '♡'; btn.classList.remove('fav-activo'); }
    showToast('Eliminado de favoritos');
  }
  localStorage.setItem('koda_favoritos', JSON.stringify(favs));
}

function initFavoritos() {
  const favs = getFavoritos();
  document.querySelectorAll('.btn-fav').forEach(btn => {
    // Lee nombre desde el producto padre
    const producto = btn.closest('.producto');
    const nombre = btn.dataset.nombre || producto?.querySelector('h3')?.textContent?.trim() || '';
    if (!nombre) return;
    btn.dataset.nombre = nombre; // normalizar
    btn.textContent = favs.includes(nombre) ? '♥' : '♡';
    if (favs.includes(nombre)) btn.classList.add('fav-activo');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorito(nombre, btn);
    });
  });
}

/* ─── Ordenar productos ─────────────────────────────────────────── */
let ordenActual = 'default';

function ordenarProductos(orden) {
  ordenActual = orden;
  const grid = document.getElementById('grid-productos');
  if (!grid) return;

  const productos = Array.from(grid.querySelectorAll('.producto'));
  productos.sort((a, b) => {
    const getPrecio = el => {
      const saleEl = el.querySelector('.price-sale');
      const normEl = el.querySelector('.price');
      const raw = (saleEl || normEl)?.textContent || '0';
      return parseFloat(raw.replace(/[$.,]/g, '').replace(',', '.')) || 0;
    };
    const precioA = getPrecio(a);
    const precioB = getPrecio(b);
    const nombreA = (a.querySelector('h3')?.textContent || '').toLowerCase();
    const nombreB = (b.querySelector('h3')?.textContent || '').toLowerCase();

    if (orden === 'precio-asc')  return precioA - precioB;
    if (orden === 'precio-desc') return precioB - precioA;
    if (orden === 'az')          return nombreA.localeCompare(nombreB);
    if (orden === 'za')          return nombreB.localeCompare(nombreA);
    return 0; // default: orden original
  });

  // Re-insertar en el DOM
  productos.forEach(p => grid.appendChild(p));
  // Re-aplicar filtro activo
  const activeBtn = document.querySelector('.sidebar button.activo');
  if (activeBtn) activeBtn.click();
}

function initOrdenador() {
  const select = document.getElementById('orden-select');
  if (!select) return;
  select.addEventListener('change', () => ordenarProductos(select.value));
}

/* ─── Filtrado + Búsqueda + Contador ───────────────────────────── */
/* BUG CORREGIDO: catMap ahora coincide con los textos reales de los botones */
const CATEGORIA_MAP = {
  'todos':             'todos',
  'pantalones':        'pantalon',
  'remeras':           'remera',
  'buzos / camperas':  'buzo',
  'buzos/camperas':    'buzo',
  'buzo':              'buzo',
};

function filtrar(categoria, button) {
  const productos  = document.querySelectorAll('.producto');
  const busqueda   = (document.getElementById('buscador')?.value || '').toLowerCase().trim();
  const maxPrecio  = (typeof window.precioMax !== 'undefined') ? window.precioMax : Infinity;
  let visibles = 0;

  productos.forEach(producto => {
    if (producto.dataset.varianteOculta) { hide(producto); return; }
    const matchCategoria = categoria === 'todos' || producto.dataset.categoria === categoria;
    const matchBusqueda  = !busqueda || (producto.dataset.nombre || '').toLowerCase().includes(busqueda);
    let precioNum = parseInt(producto.dataset.precio || '0');
    if (!precioNum) {
      const saleEl = producto.querySelector('.price-sale');
      const normEl = producto.querySelector('.price');
      const priceEl = saleEl || normEl;
      if (priceEl) precioNum = parseInt(priceEl.textContent.replace(/[^0-9]/g, '')) || 0;
    }
    const matchPrecio = maxPrecio === Infinity || precioNum <= maxPrecio;
    const visible = matchCategoria && matchBusqueda && matchPrecio;
    if (visible) {
      show(producto, 'block');
      visibles++;
    } else {
      hide(producto);
    }
  });

  document.querySelectorAll('.sidebar button:not(.precio-reset)').forEach(btn =>
    btn.classList.toggle('activo', btn === button));

  // Mostrar contador de resultados
  actualizarContadorResultados(visibles, busqueda || categoria !== 'todos' || maxPrecio !== Infinity);
}

function actualizarContadorResultados(visibles, hayFiltro) {
  let counter = document.getElementById('resultados-counter');
  if (!counter) {
    counter = document.createElement('p');
    counter.id = 'resultados-counter';
    counter.className = 'resultados-counter';
    const h2 = document.querySelector('.productos h2');
    if (h2) h2.insertAdjacentElement('afterend', counter);
  }
  if (hayFiltro) {
    counter.textContent = `${visibles} resultado${visibles !== 1 ? 's' : ''}`;
    show(counter, 'block');
  } else {
    hide(counter);
  }
}

function initBuscador() {
  const buscador = document.getElementById('buscador');
  if (!buscador) return;

  // Limpiar búsqueda con Escape
  buscador.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      buscador.value = '';
      const activeBtn = document.querySelector('.sidebar button.activo');
      if (activeBtn) activeBtn.click();
    }
  });

  buscador.addEventListener('input', () => {
    const activeBtn = document.querySelector('.sidebar button.activo');
    /* BUG CORREGIDO: normalizamos el texto para el mapa */
    const textoBtn  = (activeBtn?.textContent || 'todos').toLowerCase().trim();
    const categoria = CATEGORIA_MAP[textoBtn] ?? 'todos';
    filtrar(categoria, activeBtn);
  });
}

/* ─── Reveal scroll ────────────────────────────────────────────── */
function initReveal() {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.reveal, .reveal-children').forEach(el => observer.observe(el));
}

/* ─── Newsletter ───────────────────────────────────────────────── */
function initNewsletterForms() {
  document.querySelectorAll('.newsletter').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input?.value.trim()) {
        // Guardar email suscripto en localStorage
        const subs = JSON.parse(localStorage.getItem('koda_subs') || '[]');
        if (!subs.includes(input.value.trim())) {
          subs.push(input.value.trim());
          localStorage.setItem('koda_subs', JSON.stringify(subs));
        }
        showToast('¡Gracias por suscribirte!', 'success');
        form.reset();
      }
    });
  });
}

/* ─── Formulario de contacto ───────────────────────────────────── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const msgEl = document.getElementById('form-message');
    if (msgEl) msgEl.textContent = 'Gracias, tu mensaje fue enviado.';
    showToast('Mensaje enviado correctamente.', 'success');
    form.reset();
  });
}

/* ─── Botones carrito en carrito.html ──────────────────────────── */
function initCarritoPage() {
  const vaciarBtn    = document.getElementById('vaciar-carrito');
  const finalizarBtn = document.getElementById('finalizar-compra');
  vaciarBtn?.addEventListener('click', vaciarCarrito);
  finalizarBtn?.addEventListener('click', finalizarCompra);

  // Modal checkout
  document.getElementById('checkout-cerrar')?.addEventListener('click', cerrarModalCheckout);
  document.getElementById('checkout-cancelar')?.addEventListener('click', cerrarModalCheckout);
  document.getElementById('checkout-confirmar')?.addEventListener('click', confirmarPedidoWhatsApp);
  document.getElementById('checkout-overlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) cerrarModalCheckout();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarModalCheckout();
  });
  document.getElementById('checkout-overlay')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') confirmarPedidoWhatsApp();
  });
}

/* ─── Talles en productos ──────────────────────────────────────── */
function initTalles() {
  document.querySelectorAll('.talle-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      if (this.classList.contains('sin-stock')) return;
      const grupo = this.closest('.talles-grupo, .modal-talles, .controls');
      grupo?.querySelectorAll('.talle-btn').forEach(b => b.classList.remove('activo'));
      this.classList.add('activo');
    });
  });
}

/* ─── Visto recientemente ───────────────────────────────────────── */
function registrarVisto(nombre, precio, imgSrc) {
  try {
    const vistos = JSON.parse(localStorage.getItem('koda_vistos') || '[]');
    // Evitar duplicados — mover al frente
    const idx = vistos.findIndex(v => v.nombre === nombre);
    if (idx !== -1) vistos.splice(idx, 1);
    vistos.unshift({ nombre, precio, imgSrc });
    // Máximo 6 items
    localStorage.setItem('koda_vistos', JSON.stringify(vistos.slice(0, 6)));
  } catch { /* silencioso */ }
}

function renderVistosRecientemente() {
  const container = document.getElementById('vistos-recientemente');
  if (!container) return;
  try {
    const vistos = JSON.parse(localStorage.getItem('koda_vistos') || '[]');
    if (vistos.length < 2) { container.closest('section')?.remove(); return; }
    container.innerHTML = vistos.map(v => `
      <div class="visto-card">
        <img src="${escapeHTML(v.imgSrc)}" alt="${escapeHTML(v.nombre)}" loading="lazy">
        <p class="visto-nombre">${escapeHTML(v.nombre)}</p>
        <p class="visto-precio">${v.precio > 0 ? '$' + v.precio.toLocaleString('es-AR') : 'Consultar'}</p>
      </div>
    `).join('');
  } catch { container.closest('section')?.remove(); }
}


/* ─── Cupones de descuento ─────────────────────────────────────── */
let cuponAplicado = null; // { codigo, descuento }

function cargarCupones() {
  return fetch('cupones.json?v=' + Date.now())
    .then(r => r.json())
    .then(data => data.cupones || [])
    .catch(() => []);
}

function aplicarCupon() {
  const input  = document.getElementById('cupon-input');
  const codigo = (input?.value || '').trim().toUpperCase();
  if (!codigo) return;

  const errEl  = document.getElementById('cupon-error');
  const okEl   = document.getElementById('cupon-ok');

  cargarCupones().then(cupones => {
    const cupon = cupones.find(c => c.codigo.toUpperCase() === codigo);

    // Validaciones
    if (!cupon || !cupon.activo) {
      mostrarCuponMsg(errEl, 'Código inválido o inactivo.', okEl);
      cuponAplicado = null;
      recalcularTotal();
      return;
    }
    if (cupon.usos_max !== -1 && cupon.usos >= cupon.usos_max) {
      mostrarCuponMsg(errEl, 'Este cupón ya alcanzó su límite de usos.', okEl);
      cuponAplicado = null;
      recalcularTotal();
      return;
    }
    if (cupon.vence) {
      const hoy   = new Date(); hoy.setHours(0,0,0,0);
      const vence = new Date(cupon.vence + 'T00:00:00');
      if (hoy > vence) {
        mostrarCuponMsg(errEl, 'Este cupón está vencido.', okEl);
        cuponAplicado = null;
        recalcularTotal();
        return;
      }
    }

    cuponAplicado = cupon;
    mostrarCuponMsg(okEl, `✓ Cupón "${cupon.codigo}" aplicado — ${cupon.descuento}% de descuento`, errEl);
    recalcularTotal();
  });
}

function removerCupon() {
  cuponAplicado = null;
  const input = document.getElementById('cupon-input');
  if (input) input.value = '';
  const errEl     = document.getElementById('cupon-error');
  const okEl      = document.getElementById('cupon-ok');
  const removerBtn = document.getElementById('cupon-remover');
  hide(errEl);
  hide(okEl);
  hide(removerBtn);
  recalcularTotal();
  showToast('Cupón removido.', 'default');
}

function mostrarCuponMsg(showEl, msg, hideEl) {
  if (showEl) { showEl.textContent = msg; show(showEl); }
  hide(hideEl);
  // Mostrar/ocultar botón "Quitar cupón" según si hay cupón aplicado
  const removerBtn = document.getElementById('cupon-remover');
  if (cuponAplicado) show(removerBtn, 'inline-block');
  else hide(removerBtn);
}

function recalcularTotal() {
  const carrito = getCarrito();
  let total = carrito.reduce((s, i) => i.precio > 0 ? s + i.precio * i.cantidad : s, 0);
  const hayConsulta = carrito.some(i => i.precio === 0);

  const descEl     = document.getElementById('descuento-row');
  const totalEl    = document.getElementById('total');
  const totalOrigEl = document.getElementById('total-original');

  if (cuponAplicado && total > 0) {
    const descuento = Math.round(total * cuponAplicado.descuento / 100);
    const totalFinal = total - descuento;
    if (descEl) {
      document.getElementById('descuento-monto').textContent = `−$${descuento.toLocaleString('es-AR')} (${cuponAplicado.descuento}%)`;
      show(descEl, 'flex');
    }
    if (totalOrigEl) { totalOrigEl.textContent = '$' + total.toLocaleString('es-AR'); show(totalOrigEl); }
    if (totalEl) totalEl.textContent = hayConsulta ? '$' + totalFinal.toLocaleString('es-AR') + ' + a consultar' : '$' + totalFinal.toLocaleString('es-AR');
  } else {
    hide(descEl);
    hide(totalOrigEl);
    if (totalEl) totalEl.textContent = hayConsulta && total === 0 ? 'Consultar' : `$${total.toLocaleString('es-AR')}${hayConsulta ? ' + a consultar' : ''}`;
  }
}

/* ─── Checkout validation en tiempo real ──────────────────────── */
function initCheckoutValidation() {
  document.querySelectorAll('.checkout-field input, .checkout-field textarea').forEach(el => {
    el.addEventListener('blur', () => {
      const field = el.closest('.checkout-field');
      if (!field) return;
      const hasError = field.querySelector('.checkout-error');
      if (hasError && !el.value.trim()) {
        field.classList.add('error');
      } else {
        field.classList.remove('error');
      }
    });
    el.addEventListener('input', () => {
      const field = el.closest('.checkout-field');
      if (!field) return;
      field.classList.remove('error', 'shake');
    });
  });
}

/* ─── Ripple effect en botones ─────────────────────────────────── */
function initRipple() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
}

/* ─── Header scroll effect + hero parallax ────────────────────── */
function initActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .nav-mobile-overlay .nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === path || (path === '' && href === 'index.html') || (path === 'index.html' && href === 'index.html')) {
      link.setAttribute('aria-current', 'page');
    }
  });
}

function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;
  const hero = document.querySelector('.hero-swiper');
  const sentinel = document.querySelector('.hero-lookbook') || hero || document.body;
  const observer = new IntersectionObserver(([entry]) => {
    header.classList.toggle('scrolled', !entry.isIntersecting);
  }, { threshold: 0, rootMargin: '-1px 0px 0px 0px' });
  observer.observe(sentinel);

  // Parallax muy sutil en hero slides (sobre .swiper-slide para no pisar scale de img)
  if (!hero) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        const offset = rect.top * 0.08;
        const clamped = Math.round(Math.min(Math.max(offset, -15), 15));
        hero.querySelectorAll('.swiper-slide').forEach(slide => {
          slide.style.setProperty('--parallax-y', `${clamped}px`);
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ─── Arranque ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initActiveNav();
  initRipple();
  actualizarContadorCarrito();
  mostrarCarrito();
  initReveal();
  initNewsletterForms();
  initCheckoutValidation();
  initContactForm();
  initBuscador();
  initCarritoPage();
  initTalles();
  initFavoritos();
  initOrdenador();
});

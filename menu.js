
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('menuToggle');
  const panel = document.getElementById('navPanel');
  const overlay = document.getElementById('navPanelOverlay');
  const closeBtn = document.getElementById('navPanelClose');

  if (!toggle || !panel || !overlay) return;

  function abrirMenu() {
    panel.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    toggle.setAttribute('aria-expanded', 'true');
  }

  function cerrarMenu() {
    panel.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    panel.classList.contains('open') ? cerrarMenu() : abrirMenu();
  });

  if (closeBtn) closeBtn.addEventListener('click', cerrarMenu);
  overlay.addEventListener('click', cerrarMenu);
});

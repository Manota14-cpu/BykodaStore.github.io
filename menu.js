<script>
  const toggle = document.getElementById('menuToggle');
  const panel  = document.getElementById('navPanel');
  const overlay = document.getElementById('navPanelOverlay');
  const closeBtn = document.getElementById('navPanelClose');

  function abrirMenu() {
    panel.classList.add('open');
    overlay.classList.add('active');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function cerrarMenu() {
    panel.classList.remove('open');
    overlay.classList.remove('active');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () =>
    panel.classList.contains('open') ? cerrarMenu() : abrirMenu()
  );
  closeBtn.addEventListener('click', cerrarMenu);
  overlay.addEventListener('click', cerrarMenu);

  // Cerrar con Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') cerrarMenu();
  });
</script>
import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import * as m from 'motion/react-m';
import { Spinner } from './ui';
import { AnnouncementBar, Header } from './Header';
import { Footer } from './Footer';
import { Toast } from './Toast';
import { WhatsappButton } from './WhatsappButton';
import { ScrollTop } from './ScrollTop';
import { BottomNav } from './BottomNav';
import { CartDrawer } from './CartDrawer';
import { EASE_SUAVE } from './motion/curvas';

function CargandoPagina() {
  return (
    <div role="status" className="grid min-h-[60vh] place-items-center">
      <Spinner />
      <span className="sr-only">Cargando…</span>
    </div>
  );
}

export function Layout() {
  const { pathname } = useLocation();

  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[5000] focus:rounded-lg focus:bg-invert focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-invert"
      >
        Saltar al contenido
      </a>
      <AnnouncementBar />
      <Header />
      <main id="contenido" className="pb-20 md:pb-0">
        {/* Suspense acá adentro: mientras carga una página diferida, header y
            footer quedan en su lugar y solo el contenido muestra el spinner. */}
        <Suspense fallback={<CargandoPagina />}>
          {/* Entrada suave al cambiar de página. Solo opacidad: un desplazamiento
              acá pelearía con el scroll al principio que hace ScrollToTop. */}
          <m.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, ease: EASE_SUAVE }}
          >
            <Outlet />
          </m.div>
        </Suspense>
      </main>
      <Footer />
      <BottomNav />
      <WhatsappButton />
      <ScrollTop />
      <CartDrawer />
      <Toast />
    </>
  );
}

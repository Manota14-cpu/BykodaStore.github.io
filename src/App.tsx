import { lazy, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { MotionProvider } from '@/components/motion/MotionProvider';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';

// Solo la home entra en el bundle inicial; el resto se carga al navegar.
const CatalogPage = lazy(() => import('@/pages/CatalogPage').then((m) => ({ default: m.CatalogPage })));
const ProductPage = lazy(() => import('@/pages/ProductPage').then((m) => ({ default: m.ProductPage })));
const CartPage = lazy(() => import('@/pages/CartPage').then((m) => ({ default: m.CartPage })));
const InfoPage = lazy(() => import('@/pages/InfoPage').then((m) => ({ default: m.InfoPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

/**
 * Al navegar: arriba de todo, o a la sección del ancla (`/info#faq`). Si la
 * página es diferida, la sección todavía no existe cuando cambia la ruta, así
 * que se espera a que aparezca (hasta 3 s).
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    // `#cat=…` del catálogo es un filtro, no un ancla.
    if (id.includes('=')) return;

    const irA = () => {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return Boolean(el);
    };
    if (irA()) return;

    const observer = new MutationObserver(() => {
      if (irA()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const limite = window.setTimeout(() => observer.disconnect(), 3000);
    return () => {
      observer.disconnect();
      window.clearTimeout(limite);
    };
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionProvider>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalogo" element={<CatalogPage />} />
            <Route path="/producto/:id" element={<ProductPage />} />
            <Route path="/carrito" element={<CartPage />} />
            <Route path="/info" element={<InfoPage />} />
            {/* Rutas viejas: FAQs, nosotros y contacto viven en /info. */}
            <Route path="/faqs" element={<Navigate to="/info#faq" replace />} />
            <Route path="/nosotros" element={<Navigate to="/info#nosotros" replace />} />
            <Route path="/contacto" element={<Navigate to="/info#contacto" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </MotionProvider>
    </QueryClientProvider>
  );
}

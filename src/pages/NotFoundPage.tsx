import { useSEO } from '@/lib/seo';
import { ButtonLink } from '@/components/ui';
import { Revelar } from '@/components/motion/Revelar';

/** Explica que el link está roto y ofrece salidas, en vez de redirigir en silencio. */
export function NotFoundPage() {
  useSEO({
    title: 'Página no encontrada | BYKODA',
    description: 'La página que buscás no existe o cambió de dirección.',
    canonical: '/404',
  });

  return (
    <div className="area-pagina grid min-h-[64vh] place-items-center py-20 text-center">
      <Revelar className="grid justify-items-center gap-3">
        <p className="titulo-display text-[clamp(6rem,20vw,11rem)] leading-none text-ink-3/60">404</p>
        <h1 className="titulo-display text-[clamp(2.2rem,5vw,3.4rem)] text-ink uppercase">No encontramos esta página</h1>
        <p className="max-w-[42ch] text-ink-2">
          Puede que el link esté desactualizado o que la prenda ya no esté disponible.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <ButtonLink to="/catalogo">Ver catálogo</ButtonLink>
          <ButtonLink to="/info#contacto" variante="secundario">
            Escribinos
          </ButtonLink>
        </div>
      </Revelar>
    </div>
  );
}

import { useSEO } from '@/lib/seo';
import { ESTUDIO } from '@/lib/creditos';
import { HeroHome } from '@/components/home/HeroHome';
import { Marquesina } from '@/components/home/Marquesina';
import { Categorias } from '@/components/home/Categorias';
import { Novedades } from '@/components/home/Novedades';
import { BandaCalle } from '@/components/home/BandaCalle';
import { CtaFinal, Garantias, Instagram, Testimonios } from '@/components/home/Secciones';

export function HomePage() {
  useSEO({
    title: 'BYKODA | Streetwear Argentino — Ediciones Limitadas',
    description:
      'Remeras, buzos y pantalones streetwear. Ediciones limitadas que cuando se van, no vuelven. Pedí por WhatsApp y recibilo en todo el país.',
    canonical: '/',
    type: 'website',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: 'BYKODA',
      url: 'https://www.bykoda.store/',
      logo: 'https://www.bykoda.store/imagenes/logo.png',
      email: 'admin@bykoda.store',
      telephone: '+54 3492 301-333',
      sameAs: ['https://www.instagram.com/__bykoda/'],
      // Quién diseñó y desarrolló el sitio (distinto de quién vende la ropa).
      creator: { '@type': 'Organization', name: ESTUDIO.nombre, url: ESTUDIO.url },
    },
  });

  return (
    <>
      <HeroHome />
      <Marquesina />
      <Categorias />
      <Novedades />
      <BandaCalle />
      <Garantias />
      <Testimonios />
      <Instagram />
      <CtaFinal />
    </>
  );
}

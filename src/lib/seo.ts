import { useEffect } from 'react';
import { normalizeImg } from './format';

export const SITE_URL = 'https://www.bykoda.store';
export const SITE_NAME = 'BYKODA';
export const DEFAULT_DESC =
  'Ropa y accesorios urbanos. Remeras, buzos y pantalones BYKODA. Pedido fácil por WhatsApp.';
export const DEFAULT_OG_IMAGE = SITE_URL + '/imagenes/og-cover.jpg';

export function absoluteImage(src?: string | null): string {
  if (!src) return DEFAULT_OG_IMAGE;
  return src.startsWith('http') ? src : SITE_URL + normalizeImg(src);
}

interface SEOOptions {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'product' | 'article' | 'store';
  jsonLd?: object;
}

function setMeta(selector: string, attr: string, value: string) {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

export function useSEO({
  title,
  description = DEFAULT_DESC,
  canonical = '/',
  image,
  type = 'website',
  jsonLd,
}: SEOOptions) {
  const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : null;
  useEffect(() => {
    const url = SITE_URL + (canonical === '/' ? '/' : canonical);
    document.title = title;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[property="og:type"]', 'content', type);
    setMeta('meta[property="og:image"]', 'content', image || DEFAULT_OG_IMAGE);
    setMeta('link[rel="canonical"]', 'href', url);

    document.getElementById('seo-jsonld')?.remove();
    if (jsonLdKey) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'seo-jsonld';
      script.textContent = jsonLdKey;
      document.head.appendChild(script);
    }
    return () => {
      document.getElementById('seo-jsonld')?.remove();
    };
  }, [title, description, canonical, image, type, jsonLdKey]);
}

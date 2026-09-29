import { useCallback, useState, type ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

/**
 * Lugar reservado para un producto sin foto (o con una que no carga): foco de
 * luz, logo en marca de agua y aviso. Un producto recién cargado en la
 * plataforma sin foto se ve intencional, no roto.
 */
export function PlaceholderProducto({ nombre, className }: { nombre: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={`${nombre}: foto próximamente`}
      className={cn(
        '@container absolute inset-0 grid place-items-center overflow-hidden bg-raised',
        'bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,var(--k-line-strong),transparent_70%)]',
        className,
      )}
    >
      <img
        src="/imagenes/logo.webp"
        alt=""
        aria-hidden="true"
        className="w-1/2 max-w-40 opacity-[0.13] invert dark:invert-0"
      />
      {/* En miniaturas (carrito, drawer) el aviso no entra: queda solo el logo. */}
      <span className="eyebrow absolute inset-x-0 bottom-4 px-2 text-center text-balance @max-[9rem]:hidden">
        Foto próximamente
      </span>
    </div>
  );
}

type PropsImagen = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'onLoad' | 'onError'> & {
  src?: string;
  alt: string;
};

/**
 * <img> de producto: aparece con un fundido cuando terminó de cargar (nunca a
 * medio pintar) y cae en el placeholder si falta la foto o no carga.
 */
export function ImagenProducto({ src, alt, className, ...props }: PropsImagen) {
  // Atados al src: si cambia la foto, se vuelve a esperar su carga.
  const [cargada, setCargada] = useState<string | null>(null);
  const [fallida, setFallida] = useState<string | null>(null);

  // Una foto que ya estaba en caché se muestra sin fundido: el ref corre antes
  // del primer pintado, el evento load recién después.
  const verSiYaCargo = useCallback(
    (img: HTMLImageElement | null) => {
      if (src && img?.complete && img.naturalWidth > 0) setCargada(src);
    },
    [src],
  );

  if (!src || fallida === src) return <PlaceholderProducto nombre={alt} />;
  return (
    <img
      ref={verSiYaCargo}
      src={src}
      alt={alt}
      onLoad={() => setCargada(src)}
      onError={() => setFallida(src)}
      className={cn(
        'transition-opacity duration-500 ease-(--ease-suave)',
        className,
        cargada !== src && 'opacity-0',
      )}
      {...props}
    />
  );
}

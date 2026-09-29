import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const boton = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap',
    'transition-[background-color,border-color,color,opacity] duration-300 ease-(--ease-suave)',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-strong',
    'disabled:pointer-events-none disabled:opacity-45',
  ],
  {
    variants: {
      variante: {
        primario: 'bg-invert text-on-invert hover:opacity-85',
        secundario: 'border border-line bg-transparent text-ink hover:border-line-strong hover:bg-hover',
        fantasma: 'bg-transparent text-ink-2 hover:bg-hover hover:text-ink',
        whatsapp: 'bg-whatsapp text-black hover:brightness-95',
      },
      tamano: {
        sm: 'h-9 px-3.5 text-xs tracking-wide',
        md: 'h-11 px-5 text-[0.8rem] tracking-[0.12em] uppercase',
        lg: 'h-13 px-7 text-[0.85rem] tracking-[0.12em] uppercase',
      },
      ancho: {
        auto: '',
        completo: 'w-full',
      },
    },
    defaultVariants: { variante: 'primario', tamano: 'md', ancho: 'auto' },
  },
);

export type BotonVariantes = VariantProps<typeof boton>;

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & BotonVariantes
>(function Button({ className, variante, tamano, ancho, type = 'button', ...props }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(boton({ variante, tamano, ancho }), className)}
      {...props}
    />
  );
});

/** Mismo look, pero navega dentro de la app. */
export function ButtonLink({
  className,
  variante,
  tamano,
  ancho,
  ...props
}: LinkProps & BotonVariantes) {
  return <Link className={cn(boton({ variante, tamano, ancho }), className)} {...props} />;
}

/** Mismo look, para enlaces externos (WhatsApp, Instagram). */
export function ButtonExterno({
  className,
  variante,
  tamano,
  ancho,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & BotonVariantes) {
  return (
    <a
      className={cn(boton({ variante, tamano, ancho }), className)}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  );
}

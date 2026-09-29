import type { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badge = cva(
  'inline-flex h-[22px] items-center rounded px-2 text-[0.62rem] font-bold tracking-[0.12em] uppercase whitespace-nowrap',
  {
    variants: {
      tono: {
        oferta: 'bg-invert text-on-invert',
        ultimas: 'bg-ultimas text-white',
        agotado: 'bg-black/70 text-white backdrop-blur-sm',
        neutro: 'border border-line bg-surface text-ink-2',
      },
    },
    defaultVariants: { tono: 'neutro' },
  },
);

export function Badge({
  children,
  tono,
  className,
}: { children: ReactNode; className?: string } & VariantProps<typeof badge>) {
  return <span className={cn(badge({ tono }), className)}>{children}</span>;
}

import type { ReactNode } from 'react';
import * as m from 'motion/react-m';
import { EASE_SUAVE, VIEWPORT, variantesGrupo, variantesItem } from './curvas';

/** Un bloque que entra al aparecer en pantalla. */
export function Revelar({
  children,
  className,
  delay = 0,
  y = 28,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.8, ease: EASE_SUAVE, delay }}
    >
      {children}
    </m.div>
  );
}

/** Contenedor cuyos `RevelarItem` entran escalonados. */
export function RevelarGrupo({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <m.div
      className={className}
      variants={variantesGrupo}
      initial="oculto"
      whileInView="visible"
      viewport={VIEWPORT}
    >
      {children}
    </m.div>
  );
}

export function RevelarItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <m.div className={className} variants={variantesItem}>
      {children}
    </m.div>
  );
}

import type { ReactNode } from 'react';
import { LazyMotion, MotionConfig } from 'motion/react';
import { EASE_SUAVE } from './curvas';

const cargarFeatures = () => import('./features').then((m) => m.default);

/**
 * Motion con features diferidas: el runtime de animación no entra en el
 * bundle inicial. `strict` obliga a usar `m.*` en lugar de `motion.*`.
 * `reducedMotion="user"` apaga transformaciones si el sistema lo pide.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.7, ease: EASE_SUAVE }}>
      <LazyMotion features={cargarFeatures} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}

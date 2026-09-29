import type { Variants } from 'motion/react';

/** Curva de la marca: arranque decidido, llegada suave. Igual que --ease-suave en CSS. */
export const EASE_SUAVE = [0.22, 1, 0.36, 1] as const;

/** Se dispara una sola vez, un poco antes de que el bloque llegue al centro. */
export const VIEWPORT = { once: true, margin: '0px 0px -12% 0px' } as const;

export const variantesGrupo: Variants = {
  oculto: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

export const variantesItem: Variants = {
  oculto: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_SUAVE } },
};

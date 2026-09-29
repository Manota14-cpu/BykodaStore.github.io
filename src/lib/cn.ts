import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Une clases condicionales y resuelve conflictos de Tailwind: la última gana.
 * `cn('px-4', props.className)` deja que quien use el componente sobreescriba
 * el padding sin pelearse con la especificidad.
 */
export function cn(...clases: ClassValue[]): string {
  return twMerge(clsx(clases));
}

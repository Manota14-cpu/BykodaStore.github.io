import { create } from 'zustand';
import type { CartItem } from '@/types';

interface CarritoUIState {
  abierto: boolean;
  /** Lo último que se agregó, para mostrarlo destacado en el panel. */
  ultimo: CartItem | null;
  abrir: (ultimo: CartItem) => void;
  cerrar: () => void;
}

export const useCarritoUI = create<CarritoUIState>((set) => ({
  abierto: false,
  ultimo: null,
  abrir: (ultimo) => set({ abierto: true, ultimo }),
  cerrar: () => set({ abierto: false }),
}));

import { create } from 'zustand';

const TOAST_MS = 2600;

interface ToastState {
  message: string;
  type: 'default' | 'error' | 'success';
  showToast: (message: string, type?: 'default' | 'error' | 'success') => void;
}

let timer: ReturnType<typeof setTimeout> | undefined;

export const useToastStore = create<ToastState>((set) => ({
  message: '',
  type: 'default',
  showToast: (message, type = 'default') => {
    if (timer) clearTimeout(timer);
    set({ message, type });
    timer = setTimeout(() => set({ message: '' }), TOAST_MS);
  },
}));

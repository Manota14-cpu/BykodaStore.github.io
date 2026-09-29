import { create } from 'zustand';

const STORAGE_KEY = 'koda_favoritos';

function getFavoritos(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as string[];
  } catch {
    return [];
  }
}

function persistFavoritos(favs: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
  } catch {
    /* storage bloqueado */
  }
}

interface FavoritesState {
  favs: string[];
  toggle: (nombre: string) => 'added' | 'removed';
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favs: getFavoritos(),
  toggle: (nombre) => {
    const favs = [...get().favs];
    const idx = favs.indexOf(nombre);
    if (idx >= 0) {
      favs.splice(idx, 1);
      persistFavoritos(favs);
      set({ favs });
      return 'removed';
    }
    favs.push(nombre);
    persistFavoritos(favs);
    set({ favs });
    return 'added';
  },
}));

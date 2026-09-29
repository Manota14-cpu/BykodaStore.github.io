/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Identificador de la tienda en la plataforma Visual App (por defecto "bykoda"). */
  readonly VITE_VISUAL_APP_SLUG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

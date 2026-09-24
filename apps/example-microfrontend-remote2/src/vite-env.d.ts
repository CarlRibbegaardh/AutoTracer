/// <reference types="vite/client" />

declare global {
  interface Window {
    __REACTTRACER_INITIALIZED__?: boolean;
  }
}

export {};

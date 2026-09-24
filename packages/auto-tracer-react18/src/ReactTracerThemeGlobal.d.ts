import type { ReactTracerOptions } from "./lib/interfaces/ReactTracerOptions.js";

/**
 * Global theme override shape injected by build tooling.
 *
 * This type exists to keep runtime access to `globalThis.__REACTTRACER_THEME__`
 * assertion-free and consistent across the codebase.
 */
export type ReactTracerThemeGlobal = Partial<
  NonNullable<ReactTracerOptions["colors"]>
>;

declare global {
  /**
   * Optional, tool-injected theme overrides for ReactTracer.
   *
   * This is populated by build tooling (e.g. Vite/Babel) and read at runtime.
   */
  // eslint-disable-next-line no-var
  var __REACTTRACER_THEME__: ReactTracerThemeGlobal | undefined;
}

import type { FlowThemeConfig } from "./lib/types/FlowThemeConfig.js";

/**
 * Global theme override shape injected by build tooling.
 *
 * This type exists to keep runtime access to `globalThis.__FLOWTRACER_THEME__`
 * assertion-free and consistent across the codebase.
 */
export type FlowTracerThemeGlobal = Partial<FlowThemeConfig>;

declare global {
  /**
   * Optional, tool-injected theme overrides for FlowTracer.
   *
   * This is populated by build tooling (e.g. Vite) and read at runtime.
   */
  // eslint-disable-next-line no-var
  var __FLOWTRACER_THEME__: FlowTracerThemeGlobal | undefined;

  /**
   * Optional, tool-injected theme overrides for FlowTracer.
   *
   * This property exists to support `globalThis.__FLOWTRACER_THEME__` access
   * without casts.
   */
  interface GlobalThis {
    /**
     * Optional, tool-injected theme overrides for FlowTracer.
     */
    __FLOWTRACER_THEME__?: FlowTracerThemeGlobal | undefined;
  }
}

/**
 * Global test setup for jsdom environment.
 *
 * @remarks
 * jsdom does not implement `window.matchMedia`. The dashboard widget reads it
 * at construction time to detect the user's color-scheme preference. This stub
 * satisfies the call without pulling in a full media-query implementation.
 */
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }) satisfies MediaQueryList,
});

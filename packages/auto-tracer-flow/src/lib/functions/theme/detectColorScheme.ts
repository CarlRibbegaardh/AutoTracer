/**
 * Detects the current color scheme preference from the browser.
 * Returns 'dark' if the user prefers dark mode, otherwise 'light'.
 *
 * In non-browser environments (Node.js), defaults to 'light'.
 *
 * @returns 'light' or 'dark' based on browser preference
 *
 * @example
 * ```typescript
 * const scheme = detectColorScheme();
 * if (scheme === "dark") {
 *   // Use dark mode theme
 * } else {
 *   // Use light mode theme
 * }
 * ```
 *
 * @remarks
 * This function:
 * - Reads browser's `prefers-color-scheme` media query
 * - Returns 'light' as safe default for non-browser environments
 * - Returns 'light' if matchMedia is unavailable or throws error
 * - Is safe to call in any environment (browser, Node.js, SSR)
 *
 * For dynamic updates, use `window.matchMedia('(prefers-color-scheme: dark)')
 * .addEventListener('change', handler)` in the caller.
 */
export function detectColorScheme(): "light" | "dark" {
  // Check if we're in a browser environment
  if (typeof window === "undefined" || !window.matchMedia) {
    return "light";
  }

  try {
    // Query the browser's color scheme preference
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");

    // Return 'dark' if the media query matches, otherwise 'light'
    return darkModeQuery.matches ? "dark" : "light";
  } catch (_error) {
    // If matchMedia throws an error, default to light mode
    return "light";
  }
}

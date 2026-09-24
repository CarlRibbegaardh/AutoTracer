/**
 * Detects the browser's current preferred color mode.
 *
 * @param environment - Optional browser media-query capability.
 * @returns Dark when the dark-mode query matches; otherwise light.
 */
export function detectNetworkColorMode(environment: {
  matchMedia?: (query: string) => Readonly<{ matches: boolean }>;
}): "light" | "dark" {
  if (environment.matchMedia === undefined) return "light";

  try {
    return environment.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

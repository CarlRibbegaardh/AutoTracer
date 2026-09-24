/**
 * @file React Element Fingerprinting
 *
 * Detects React elements (plain objects with $$typeof symbol) and returns
 * a fingerprint string to prevent deep traversal of massive prop trees.
 */

/**
 * Fingerprints React elements to prevent deep traversal.
 *
 * React elements are plain objects (Object.prototype) but contain massive
 * prop trees that should not be recursively traversed. This function detects
 * them by checking for the $$typeof symbol and returns a fingerprint.
 *
 * @param value - Value to check for React element structure
 * @returns "[ReactElement]" if the value is a React element, null otherwise
 *
 * @example
 * ```typescript
 * const element = { $$typeof: Symbol.for('react.element'), type: 'div', props: {} };
 * fingerprintReactElement(element); // → "[ReactElement]"
 *
 * const notElement = { type: 'div', props: {} };
 * fingerprintReactElement(notElement); // → null
 * ```
 */
export function fingerprintReactElement(value: unknown): string | null {
  // Not an object - can't be a React element
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const valueAsAny = value as Record<string, unknown>;

  // Check for React element signature: $$typeof symbol
  if (
    valueAsAny.$$typeof &&
    typeof valueAsAny.$$typeof === "symbol" &&
    valueAsAny.$$typeof.toString() === "Symbol(react.element)"
  ) {
    return "[ReactElement]";
  }

  return null;
}

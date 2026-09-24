/**
 * Checks if a function name follows custom hook naming convention.
 *
 * Custom hooks in React must start with "use" followed by an uppercase letter.
 * These are not components and should not be instrumented.
 *
 * @param name - The function name to check
 * @returns True if the name follows custom hook convention, false otherwise
 *
 * @example
 * ```typescript
 * isCustomHookName("useState") // → true
 * isCustomHookName("useMyData") // → true
 * isCustomHookName("useEffect") // → true
 * isCustomHookName("MyComponent") // → false
 * isCustomHookName("user") // → false
 * isCustomHookName("username") // → false
 * ```
 *
 * @internal
 */
export function isCustomHookName(name: string): boolean {
  return /^use[A-Z]/.test(name);
}

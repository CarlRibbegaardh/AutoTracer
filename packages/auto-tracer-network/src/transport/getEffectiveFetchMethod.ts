import { normalizeHttpMethod } from "./normalizeHttpMethod.js";

/**
 * Resolves the effective method for a Fetch invocation.
 *
 * @param input - Fetch Request, URL, or string input.
 * @param init - Optional Fetch initialization overrides.
 * @returns The normalized effective request method.
 */
export function getEffectiveFetchMethod(
  input: RequestInfo | URL,
  init?: RequestInit,
): string {
  const method =
    init?.method ?? (input instanceof Request ? input.method : "GET");

  return normalizeHttpMethod(method);
}

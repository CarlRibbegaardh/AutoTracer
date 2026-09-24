/**
 * Creates a detached snapshot of the effective script-visible Fetch headers.
 *
 * @param input - Fetch Request, URL, or string input.
 * @param init - Optional Fetch initialization overrides.
 * @returns Detached headers using RequestInit precedence.
 */
export function createEffectiveFetchHeadersSnapshot(
  input: RequestInfo | URL,
  init?: RequestInit,
): Headers {
  if (init?.headers !== undefined) return new Headers(init.headers);
  if (input instanceof Request) return new Headers(input.headers);
  return new Headers();
}

/**
 * Installs a Fetch wrapper around the implementation currently on a host.
 *
 * @param target - Host whose Fetch implementation is captured and replaced.
 * @param invoke - Routes calls through the tracing runtime.
 * @returns Whether a Fetch implementation was available and wrapped.
 */
export function installFetchWrapper(
  target: { fetch?: typeof fetch },
  invoke: (
    nativeFetch: typeof fetch,
    ...args:
      | [input: RequestInfo | URL]
      | [input: RequestInfo | URL, init: RequestInit | undefined]
  ) => Promise<Response>,
): boolean {
  const nativeFetch = target.fetch;
  if (nativeFetch === undefined) return false;
  const invokeNativeFetch: typeof fetch = nativeFetch.bind(target);

  /** Routes one Fetch call through the tracing runtime. */
  function wrappedFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    if (arguments.length === 1) {
      return invoke(invokeNativeFetch, input);
    }

    return invoke(invokeNativeFetch, input, init);
  }

  target.fetch = wrappedFetch;
  return true;
}

import { invokeFetchRequest } from "./invokeFetchRequest.js";

/**
 * Creates the adapter between an installed Fetch wrapper and request tracing.
 *
 * @param runtime - Live Fetch tracing operations.
 * @returns A handler compatible with the Fetch wrapper installer.
 */
export function createFetchWrapperHandler(
  runtime: Parameters<typeof invokeFetchRequest>[2],
): (
  nativeFetch: typeof fetch,
  ...args:
    | [input: RequestInfo | URL]
    | [input: RequestInfo | URL, init: RequestInit | undefined]
) => Promise<Response> {
  /** Packages one installed Fetch invocation for the request command. */
  function invokeFetchWrapper(
    nativeFetch: typeof fetch,
    ...args:
      | [input: RequestInfo | URL]
      | [input: RequestInfo | URL, init: RequestInit | undefined]
  ): Promise<Response> {
    const request =
      args.length === 1
        ? { input: args[0] }
        : { input: args[0], init: args[1], hasInit: true };
    return invokeFetchRequest(nativeFetch, request, runtime);
  }

  return invokeFetchWrapper;
}

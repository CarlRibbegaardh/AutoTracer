/**
 * Invokes Fetch with the script-provided argument count.
 *
 * @param nativeFetch - Captured Fetch implementation.
 * @param request - Fetch values and whether the optional argument was supplied.
 * @returns The exact promise returned by the native implementation.
 */
export function invokeNativeFetch(
  nativeFetch: typeof fetch,
  request: Readonly<{
    input: RequestInfo | URL;
    init?: RequestInit;
    hasInit?: boolean;
  }>,
): Promise<Response> {
  if (request.hasInit ?? request.init !== undefined) {
    return nativeFetch(request.input, request.init);
  }

  return nativeFetch(request.input);
}

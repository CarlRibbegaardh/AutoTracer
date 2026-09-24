import { invokeTracedFetchRequest } from "./invokeTracedFetchRequest.js";
import { invokeNativeFetch } from "./invokeNativeFetch.js";

/**
 * Routes a Fetch call according to its trace admission decision.
 *
 * @param nativeFetch - Native Fetch implementation to invoke.
 * @param request - Original Fetch input and initialization values.
 * @param trace - Admission decision and traced-request context.
 * @returns The exact promise returned by the native Fetch implementation.
 */
export function invokeFetchByAdmission(
  nativeFetch: Parameters<typeof invokeTracedFetchRequest>[0],
  request: Parameters<typeof invokeTracedFetchRequest>[1],
  trace: Parameters<typeof invokeTracedFetchRequest>[2] &
    Readonly<{ admitted: boolean }>,
): Promise<Response> {
  if (!trace.admitted) {
    return invokeNativeFetch(nativeFetch, request);
  }

  return invokeTracedFetchRequest(nativeFetch, request, trace);
}

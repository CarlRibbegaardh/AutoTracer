/**
 * Clones a Request for body capture without reading the original body.
 *
 * @param request - Application-owned Request supplied to fetch.
 * @returns A readable clone, or `undefined` when cloning fails.
 */
export function cloneRequestForBodyCapture(
  request: Request,
): Request | undefined {
  try {
    return request.clone();
  } catch {
    return undefined;
  }
}

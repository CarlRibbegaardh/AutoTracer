/**
 * Clones a Response for body capture without reading the original body.
 *
 * @param response - Application-owned response.
 * @returns A readable clone, or `undefined` when cloning fails.
 */
export function cloneResponseForBodyCapture(
  response: Response,
): Response | undefined {
  try {
    return response.clone();
  } catch {
    return undefined;
  }
}

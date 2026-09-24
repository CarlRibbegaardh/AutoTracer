/**
 * Applies browser-standard casing to standard HTTP methods.
 *
 * @param method - Supplied request method.
 * @returns An uppercase standard method or unchanged extension method.
 */
export function normalizeHttpMethod(method: string): string {
  const normalizedMethod = method.toUpperCase();
  const isStandardMethod = [
    "DELETE",
    "GET",
    "HEAD",
    "OPTIONS",
    "POST",
    "PUT",
  ].some((standardMethod) => {return standardMethod === normalizedMethod});

  return isStandardMethod ? normalizedMethod : method;
}

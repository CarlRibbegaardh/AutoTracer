/**
 * Extracts available native error identity without retaining its stack.
 *
 * @param failure - Native thrown or rejected value.
 * @returns Native error name and message when both are available.
 */
export function extractFailureDetail(
  failure: unknown,
): { readonly name: string; readonly message: string } | undefined {
  if (typeof failure !== "object" || failure === null) {
    return undefined;
  }

  const name = Reflect.get(failure, "name");
  const message = Reflect.get(failure, "message");
  if (typeof name !== "string" || typeof message !== "string") {
    return undefined;
  }

  return { name, message };
}

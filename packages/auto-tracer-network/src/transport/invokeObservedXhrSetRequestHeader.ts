/**
 * Invokes native XHR setRequestHeader and observes successful completion.
 *
 * @param nativeSetRequestHeader - Bound native setRequestHeader implementation.
 * @param args - Original header name and value.
 * @param observeHeader - Records the header after native success.
 */
export function invokeObservedXhrSetRequestHeader(
  nativeSetRequestHeader: (name: string, value: string) => void,
  args: readonly [name: string, value: string],
  observeHeader: () => void,
): void {
  nativeSetRequestHeader(...args);

  try {
    observeHeader();
  } catch {
  }
}

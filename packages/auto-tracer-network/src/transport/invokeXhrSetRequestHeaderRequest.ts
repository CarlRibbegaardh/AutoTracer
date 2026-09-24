import { invokeObservedXhrSetRequestHeader } from "./invokeObservedXhrSetRequestHeader.js";

/**
 * Invokes native XHR setRequestHeader and records the successful header.
 *
 * @param nativeSetRequestHeader - Bound native setRequestHeader implementation.
 * @param args - Original header name and value.
 * @param appendRequestHeader - Records one successfully applied header.
 */
export function invokeXhrSetRequestHeaderRequest(
  nativeSetRequestHeader: Parameters<
    typeof invokeObservedXhrSetRequestHeader
  >[0],
  args: Parameters<typeof invokeObservedXhrSetRequestHeader>[1],
  appendRequestHeader: (name: string, value: string) => void,
): void {
  /** Records the original header arguments after native success. */
  function observeHeader(): void {
    appendRequestHeader(args[0], args[1]);
  }

  invokeObservedXhrSetRequestHeader(
    nativeSetRequestHeader,
    args,
    observeHeader,
  );
}

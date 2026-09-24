/**
 * Starts detail capture before invoking a native transport without awaiting it.
 *
 * @param startCapture - Starts synchronous and asynchronous capture work.
 * @param invokeTransport - Invokes the native transport.
 * @returns The native transport result unchanged.
 */
export function invokeTransportAfterStartingCapture<Result>(
  startCapture: () => Promise<unknown>,
  invokeTransport: () => Result,
): Result {
  void startCapture();
  return invokeTransport();
}

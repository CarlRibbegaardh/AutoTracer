/**
 * Invokes a native transport while observing synchronous failures.
 *
 * @param invokeTransport - Invokes the native transport.
 * @param onFailure - Observes a synchronous native failure.
 * @returns The native transport result unchanged.
 */
export function invokeTransportWithFailureObserver<Result>(
  invokeTransport: () => Result,
  onFailure: (failure: unknown) => void,
): Result {
  try {
    return invokeTransport();
  } catch (failure: unknown) {
    try {
      onFailure(failure);
    } catch {
      // Tracing failures must not replace native transport failures.
    }

    throw failure;
  }
}

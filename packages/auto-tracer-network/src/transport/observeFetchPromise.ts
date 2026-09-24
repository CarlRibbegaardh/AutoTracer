/**
 * Observes Fetch settlement without replacing or altering the native promise.
 *
 * @param nativePromise - Promise returned by the native Fetch implementation.
 * @param onResolved - Observer invoked with the native response.
 * @param onRejected - Observer invoked with the native rejection reason.
 * @returns The exact native promise.
 */
export function observeFetchPromise(
  nativePromise: Promise<Response>,
  onResolved: (response: Response) => void,
  onRejected: (reason: unknown) => void,
): Promise<Response> {
  void nativePromise.then(onResolved, onRejected).catch(() => {
    return undefined;
  });
  return nativePromise;
}

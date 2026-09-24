/**
 * Determines whether a body fits within the configured capture limit.
 *
 * @param bodySize - Body size in bytes.
 * @param captureLimit - Maximum captured body size in bytes.
 * @returns `true` when the complete body fits within the limit.
 */
export function isBodyWithinCaptureLimit(
  bodySize: number,
  captureLimit: number,
): boolean {
  return bodySize <= captureLimit;
}

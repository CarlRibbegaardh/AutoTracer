/**
 * Creates a metadata-only snapshot for JSON exceeding the capture limit.
 *
 * @param contentType - Declared JSON media type.
 * @param byteSize - Original UTF-8 body size.
 * @returns JSON metadata with the fixed capture-limit reason.
 */
export function createOversizedJsonBodySnapshot(
  contentType: string,
  byteSize: number,
): {
  readonly status: "exceeds-limit";
  readonly contentType: string;
  readonly byteSize: number;
  readonly reason: "JSON body exceeds capture limit";
} {
  return {
    status: "exceeds-limit",
    contentType,
    byteSize,
    reason: "JSON body exceeds capture limit",
  };
}

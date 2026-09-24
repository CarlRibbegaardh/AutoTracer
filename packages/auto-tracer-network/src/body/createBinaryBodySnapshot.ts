/**
 * Creates a metadata-only snapshot of a binary body.
 *
 * @param contentType - Browser-exposed media type, when known.
 * @param knownByteSize - Browser-exposed body size, when known.
 * @returns Binary metadata with unavailable values represented by null.
 */
export function createBinaryBodySnapshot(
  contentType: string | null,
  knownByteSize: number | null,
): {
  readonly status: "metadata-only";
  readonly contentType: string | null;
  readonly knownByteSize: number | null;
} {
  return { status: "metadata-only", contentType, knownByteSize };
}

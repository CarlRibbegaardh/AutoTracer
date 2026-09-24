/**
 * Captures text up to an inclusive UTF-8 byte limit without splitting a code point.
 *
 * @param text - Text to capture.
 * @param limitBytes - Maximum encoded byte count to capture.
 * @returns The captured text and its UTF-8 size metadata.
 */
export function truncateTextBodyAtLimit(
  text: string,
  limitBytes: number,
): {
  readonly status: "captured";
  readonly text: string;
  readonly originalByteSize: number;
  readonly capturedByteSize: number;
  readonly truncated: boolean;
} {
  const encoder = new TextEncoder();
  const originalByteSize = encoder.encode(text).byteLength;
  let capturedByteSize = 0;
  let capturedText = "";

  for (const codePoint of text) {
    const codePointByteSize = encoder.encode(codePoint).byteLength;

    if (capturedByteSize + codePointByteSize > limitBytes) {
      break;
    }

    capturedText += codePoint;
    capturedByteSize += codePointByteSize;
  }

  return {
    status: "captured",
    text: capturedText,
    originalByteSize,
    capturedByteSize,
    truncated: capturedByteSize < originalByteSize,
  };
}

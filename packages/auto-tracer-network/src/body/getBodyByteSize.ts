/**
 * Reads the byte size exposed by a binary body value.
 *
 * @param body - Script-visible body value.
 * @returns The known byte size, or `null` when the body exposes no size.
 */
export function getBodyByteSize(body: BodyInit): number | null {
  if (body instanceof Blob) return body.size;
  if (body instanceof ArrayBuffer) return body.byteLength;
  if (ArrayBuffer.isView(body)) return body.byteLength;
  return null;
}

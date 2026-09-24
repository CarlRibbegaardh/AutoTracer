/**
 * Classifies a script-visible body by its platform type and declared media type.
 *
 * @param body - Script-visible request or response body value.
 * @param contentType - Declared media type when available.
 * @returns The body handling category.
 */
export function classifyBodyContentType(
  body: BodyInit,
  contentType?: string,
): "json" | "text" | "url-encoded" | "form-data" | "binary" | "stream" {
  if (body instanceof ReadableStream) {
    return "stream";
  }

  if (body instanceof URLSearchParams) {
    return "url-encoded";
  }

  if (body instanceof FormData) {
    return "form-data";
  }

  if (typeof body === "string") {
    return contentType?.toLowerCase().includes("json") === true
      ? "json"
      : "text";
  }

  return "binary";
}

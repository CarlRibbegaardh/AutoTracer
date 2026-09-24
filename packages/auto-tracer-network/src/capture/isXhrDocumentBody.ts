/**
 * Identifies a native XHR Document body when the DOM constructor is available.
 *
 * @param body - Non-null script-provided XHR request body.
 * @returns Whether the body is a Document.
 */
export function isXhrDocumentBody(
  body: unknown,
): body is Document {
  return typeof Document !== "undefined" && body instanceof Document;
}

/**
 * Determines whether a request body is an application-owned readable stream.
 *
 * @param body - Script-provided request body.
 * @returns `true` when inspecting the body would consume a readable stream.
 */
export function isApplicationOwnedRequestStream(body: unknown): boolean {
  return body instanceof ReadableStream;
}

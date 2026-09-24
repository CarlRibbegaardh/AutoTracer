import { createApplicationOwnedStreamBodySnapshot } from "./createApplicationOwnedStreamBodySnapshot.js";
import { createBinaryBodySnapshot } from "./createBinaryBodySnapshot.js";
import { createFormDataBodySnapshot } from "./createFormDataBodySnapshot.js";
import { createUrlEncodedBodySnapshot } from "./createUrlEncodedBodySnapshot.js";
import { getBodyByteSize } from "./getBodyByteSize.js";

/**
 * Creates a snapshot of a non-string script-visible body.
 *
 * @param input - Body value, media type, and capture limit.
 * @returns The body snapshot selected by the platform body type.
 */
export function createNonTextBodySnapshot(
  input: Readonly<{
    body: Exclude<BodyInit, string>;
    contentType: string | null;
    captureLimit: number;
  }>,
):
  | ReturnType<typeof createUrlEncodedBodySnapshot>
  | ReturnType<typeof createFormDataBodySnapshot>
  | ReturnType<typeof createBinaryBodySnapshot>
  | ReturnType<typeof createApplicationOwnedStreamBodySnapshot> {
  if (input.body instanceof URLSearchParams) {
    return createUrlEncodedBodySnapshot(input.body, input.captureLimit);
  }

  if (input.body instanceof FormData) {
    return createFormDataBodySnapshot(input.body);
  }

  if (input.body instanceof ReadableStream) {
    return createApplicationOwnedStreamBodySnapshot();
  }

  return createBinaryBodySnapshot(
    input.contentType,
    getBodyByteSize(input.body),
  );
}

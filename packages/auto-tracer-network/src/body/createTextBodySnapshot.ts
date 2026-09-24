import { classifyBodyContentType } from "./classifyBodyContentType.js";
import { createJsonBodySnapshot } from "./createJsonBodySnapshot.js";
import { createOversizedJsonBodySnapshot } from "./createOversizedJsonBodySnapshot.js";
import { isBodyWithinCaptureLimit } from "./isBodyWithinCaptureLimit.js";
import { truncateTextBodyAtLimit } from "./truncateTextBodyAtLimit.js";

/**
 * Creates a snapshot of a script-visible text or declared JSON body.
 *
 * @param input - Text, media type, capture limit, and redaction policy.
 * @returns A captured text, parsed JSON, invalid JSON, or oversized JSON snapshot.
 */
export function createTextBodySnapshot(
  input: Readonly<{
    text: string;
    contentType: string | null;
    captureLimit: number;
    redactionPatterns: readonly string[];
  }>,
):
  | ReturnType<typeof truncateTextBodyAtLimit>
  | ReturnType<typeof createJsonBodySnapshot>
  | ReturnType<typeof createOversizedJsonBodySnapshot> {
  const contentType = input.contentType ?? "";
  const isJson = classifyBodyContentType(input.text, contentType) === "json";

  if (!isJson) {
    return truncateTextBodyAtLimit(input.text, input.captureLimit);
  }

  const byteSize = new TextEncoder().encode(input.text).byteLength;
  if (!isBodyWithinCaptureLimit(byteSize, input.captureLimit)) {
    return createOversizedJsonBodySnapshot(contentType, byteSize);
  }

  return createJsonBodySnapshot(input.text, input.redactionPatterns);
}

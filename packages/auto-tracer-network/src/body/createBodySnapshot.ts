import { createNonTextBodySnapshot } from "./createNonTextBodySnapshot.js";
import { createTextBodySnapshot } from "./createTextBodySnapshot.js";

/**
 * Creates the safe snapshot for a script-visible body value.
 *
 * @param input - Body value and request-scoped capture policy.
 * @returns A body snapshot selected by value type and declared media type.
 */
export function createBodySnapshot(
  input: Readonly<{
    body: BodyInit;
    contentType: string | null;
    captureLimit: number;
    redactionPatterns: readonly string[];
  }>,
):
  | ReturnType<typeof createTextBodySnapshot>
  | ReturnType<typeof createNonTextBodySnapshot> {
  if (typeof input.body === "string") {
    return createTextBodySnapshot({
      text: input.body,
      contentType: input.contentType,
      captureLimit: input.captureLimit,
      redactionPatterns: input.redactionPatterns,
    });
  }

  return createNonTextBodySnapshot({
    body: input.body,
    contentType: input.contentType,
    captureLimit: input.captureLimit,
  });
}

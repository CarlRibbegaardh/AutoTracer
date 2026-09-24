import { redactJsonFields } from "../redaction/redactJsonFields.js";
import { parseJsonBodyText } from "./parseJsonBodyText.js";

/**
 * Parses declared JSON and redacts fields when structural parsing succeeds.
 *
 * @param text - Declared JSON body text.
 * @param redactionPatterns - Field-name patterns to redact recursively.
 * @returns A redacted parsed snapshot or the unchanged malformed-JSON result.
 */
export function createJsonBodySnapshot(
  text: string,
  redactionPatterns: readonly string[],
):
  | { readonly status: "parsed"; readonly value: unknown }
  | {
      readonly status: "invalid-json";
      readonly rawText: string;
      readonly fieldRedactionApplied: false;
    } {
  const parsedBody = parseJsonBodyText(text);

  if (parsedBody.status === "invalid-json") {
    return parsedBody;
  }

  return {
    status: "parsed",
    value: redactJsonFields(parsedBody.value, redactionPatterns),
  };
}

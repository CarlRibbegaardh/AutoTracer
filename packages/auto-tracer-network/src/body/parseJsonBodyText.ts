/**
 * Parses JSON body text while preserving malformed input and its redaction limitation.
 *
 * @param text - Declared JSON body text.
 * @returns Parsed structure or an invalid-JSON snapshot retaining the raw text.
 */
export function parseJsonBodyText(
  text: string,
):
  | { readonly status: "parsed"; readonly value: unknown }
  | {
      readonly status: "invalid-json";
      readonly rawText: string;
      readonly fieldRedactionApplied: false;
    } {
  try {
    return { status: "parsed", value: JSON.parse(text) };
  } catch {
    return {
      status: "invalid-json",
      rawText: text,
      fieldRedactionApplied: false,
    };
  }
}

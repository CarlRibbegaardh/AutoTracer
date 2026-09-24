import { isRedactionNameMatched } from "./isRedactionNameMatched.js";

/**
 * Creates a detached header snapshot with matched values redacted.
 *
 * @param headers - Script-visible headers to snapshot.
 * @param redactionPatterns - Exact or glob strings identifying sensitive names.
 * @returns A detached header collection with sensitive values replaced.
 */
export function redactHeaders(
  headers: Headers,
  redactionPatterns: readonly string[],
): Headers {
  const redactedHeaders = new Headers(headers);

  for (const name of redactedHeaders.keys()) {
    if (isRedactionNameMatched(name, redactionPatterns)) {
      redactedHeaders.set(name, "[REDACTED]");
    }
  }

  return redactedHeaders;
}

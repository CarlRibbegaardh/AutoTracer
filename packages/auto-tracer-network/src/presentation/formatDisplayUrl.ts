import { isRedactionNameMatched } from "../redaction/isRedactionNameMatched.js";

/**
 * Formats a normalized requested URL for lifecycle output.
 *
 * @param normalizedUrl - Absolute normalized requested URL.
 * @param baseUrl - Main-window URL used to determine the request origin.
 * @param redactionPatterns - Patterns identifying query values to redact.
 * @returns A path and query for same-origin requests or an absolute URL otherwise.
 */
export function formatDisplayUrl(
  normalizedUrl: string,
  baseUrl: string,
  redactionPatterns: readonly string[] = [],
): string {
  const requestedUrl = new URL(normalizedUrl);
  const mainWindowUrl = new URL(baseUrl);

  for (const name of requestedUrl.searchParams.keys()) {
    if (isRedactionNameMatched(name, redactionPatterns)) {
      requestedUrl.searchParams.set(name, "[REDACTED]");
    }
  }

  const displayUrl = requestedUrl
    .toString()
    .replaceAll("%5BREDACTED%5D", "[REDACTED]");

  if (requestedUrl.origin === mainWindowUrl.origin) {
    return displayUrl.slice(requestedUrl.origin.length);
  }

  return displayUrl;
}

import type { EventToken } from "./EventToken.js";

/**
 * Creates renderer-neutral tokens for a request start event.
 *
 * @param requestId - Session request identifier.
 * @param method - Script-requested HTTP method.
 * @param url - Display URL for the requested endpoint.
 * @returns An immutable request start event.
 */
export function createRequestStartEvent(
  requestId: number,
  method: string,
  url: string,
): { readonly kind: "start"; readonly tokens: readonly EventToken[] } {
  return {
    kind: "start",
    tokens: [
      { role: "identity", text: `Network #${requestId}` },
      { role: "direction", text: " -> " },
      { role: "method", text: method },
      { role: "plain", text: " " },
      { role: "url", text: url },
    ],
  };
}

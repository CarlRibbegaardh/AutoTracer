import type { EventToken } from "./EventToken.js";

/**
 * Creates a correlated detail event for unavailable capture data.
 *
 * @param requestId - Session request identifier.
 * @param label - Unavailable detail label.
 * @returns An immutable unavailable detail event.
 */
export function createUnavailableDetailEvent(
  requestId: number,
  label: string,
): {
  readonly kind: "unavailable-detail";
  readonly tokens: readonly EventToken[];
} {
  return {
    kind: "unavailable-detail",
    tokens: [
      { role: "identity", text: `Network #${requestId}` },
      { role: "plain", text: "   " },
      { role: "label", text: label },
      { role: "plain", text: " " },
      { role: "unavailable", text: "UNAVAILABLE" },
    ],
  };
}

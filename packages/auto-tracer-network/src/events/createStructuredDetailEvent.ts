import { cloneStructuredSnapshot } from "../output/cloneStructuredSnapshot.js";
import type { EventToken } from "./EventToken.js";

/**
 * Creates a correlated detail event with a detached structured value.
 *
 * @param requestId - Session request identifier.
 * @param label - Detail label.
 * @param value - Structured detail value to detach.
 * @returns An immutable structured detail event.
 */
export function createStructuredDetailEvent<Value>(
  requestId: number,
  label: string,
  value: Value,
): {
  readonly kind: "structured-detail";
  readonly tokens: readonly EventToken[];
  readonly value: Value;
} {
  return {
    kind: "structured-detail",
    tokens: [
      { role: "identity", text: `Network #${requestId}` },
      { role: "plain", text: "   " },
      { role: "label", text: label },
      { role: "plain", text: ": " },
    ],
    value: cloneStructuredSnapshot(value),
  };
}

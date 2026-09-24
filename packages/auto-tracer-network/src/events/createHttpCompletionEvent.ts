import { formatElapsedDuration } from "../timing/formatElapsedDuration.js";
import type { EventToken } from "./EventToken.js";

/**
 * Creates renderer-neutral tokens for an HTTP completion event.
 *
 * @param input - Request identity, HTTP status, and elapsed duration.
 * @returns An immutable HTTP completion event.
 */
export function createHttpCompletionEvent(input: Readonly<{
  requestId: number;
  status: number;
  method: string;
  url: string;
  elapsedMilliseconds: number;
}>): {
  readonly kind: "http-completion";
  readonly tokens: readonly EventToken[];
} {
  return {
    kind: "http-completion",
    tokens: [
      { role: "identity", text: `Network #${input.requestId}` },
      { role: "direction", text: " <- " },
      { role: "status", text: String(input.status) },
      { role: "plain", text: " " },
      { role: "method", text: input.method },
      { role: "plain", text: " " },
      { role: "url", text: input.url },
      { role: "plain", text: " (" },
      {
        role: "duration",
        text: formatElapsedDuration(input.elapsedMilliseconds),
      },
      { role: "plain", text: ")" },
    ],
  };
}

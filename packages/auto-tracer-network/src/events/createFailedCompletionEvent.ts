import { formatElapsedDuration } from "../timing/formatElapsedDuration.js";
import type { EventToken } from "./EventToken.js";

/**
 * Creates renderer-neutral tokens for a failed transport completion.
 *
 * @param input - Request identity and elapsed duration.
 * @returns An immutable failed completion event.
 */
export function createFailedCompletionEvent(input: Readonly<{
  requestId: number;
  method: string;
  url: string;
  elapsedMilliseconds: number;
}>): {
  readonly kind: "failed-completion";
  readonly tokens: readonly EventToken[];
} {
  return {
    kind: "failed-completion",
    tokens: [
      { role: "identity", text: `Network #${input.requestId}` },
      { role: "direction", text: " <- " },
      { role: "outcome", text: "FAILED" },
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

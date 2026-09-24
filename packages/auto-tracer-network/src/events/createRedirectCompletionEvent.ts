import { formatElapsedDuration } from "../timing/formatElapsedDuration.js";
import type { EventToken } from "./EventToken.js";

/**
 * Creates one renderer-neutral multiline redirect completion event.
 *
 * @param input - Redirected request identity, endpoints, status, and duration.
 * @returns An immutable redirect completion event.
 */
export function createRedirectCompletionEvent(input: Readonly<{
  requestId: number;
  status: number;
  method: string;
  requestedUrl: string;
  finalUrl: string;
  elapsedMilliseconds: number;
}>): {
  readonly kind: "redirect-completion";
  readonly completionTokens: readonly EventToken[];
  readonly requestedTokens: readonly EventToken[];
  readonly finalTokens: readonly EventToken[];
} {
  return {
    kind: "redirect-completion",
    completionTokens: [
      { role: "identity", text: `Network #${input.requestId}` },
      { role: "direction", text: " <- " },
      { role: "status", text: String(input.status) },
      { role: "plain", text: " " },
      { role: "redirect", text: "REDIRECTED" },
      { role: "plain", text: " (" },
      {
        role: "duration",
        text: formatElapsedDuration(input.elapsedMilliseconds),
      },
      { role: "plain", text: ")" },
    ],
    requestedTokens: [
      { role: "plain", text: "  " },
      { role: "label", text: "requested" },
      { role: "plain", text: ": " },
      { role: "method", text: input.method },
      { role: "plain", text: " " },
      { role: "url", text: input.requestedUrl },
    ],
    finalTokens: [
      { role: "plain", text: "  " },
      { role: "label", text: "final" },
      { role: "plain", text: ":     " },
      { role: "url", text: input.finalUrl },
    ],
  };
}

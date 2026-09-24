/**
 * Maps a native XHR failure event to its NetworkTracer outcome token.
 *
 * @param eventType - Native XHR failure event type.
 * @returns The corresponding terminal outcome token.
 */
export function getXhrTerminalOutcome(
  eventType: "error" | "abort" | "timeout",
): "FAILED" | "ABORTED" | "TIMED OUT" {
  switch (eventType) {
    case "error":
      return "FAILED";
    case "abort":
      return "ABORTED";
    case "timeout":
      return "TIMED OUT";
  }
}

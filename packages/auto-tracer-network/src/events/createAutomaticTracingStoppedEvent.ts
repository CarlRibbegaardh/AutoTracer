import type { EventToken } from "./EventToken.js";

/**
 * Creates the renderer-neutral automatic-stop lifecycle marker.
 *
 * @param requestLimit - Included-request limit that triggered automatic stop.
 * @returns An immutable automatic-stop event.
 */
export function createAutomaticTracingStoppedEvent(requestLimit: number): {
  readonly kind: "automatic-tracing-stopped";
  readonly tokens: readonly EventToken[];
} {
  return {
    kind: "automatic-tracing-stopped",
    tokens: [
      {
        role: "runtime-control",
        text: `Network tracing stopped automatically (limit: ${requestLimit} requests)`,
      },
    ],
  };
}

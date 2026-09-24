import type { EventToken } from "./EventToken.js";

/**
 * Creates the renderer-neutral tracing-stopping lifecycle marker.
 *
 * @param pendingRequestCount - Included requests still pending during drain.
 * @returns An immutable tracing-stopping event.
 */
export function createTracingStoppingEvent(pendingRequestCount: number): {
  readonly kind: "tracing-stopping";
  readonly tokens: readonly EventToken[];
} {
  return {
    kind: "tracing-stopping",
    tokens: [
      {
        role: "runtime-control",
        text: `Network tracing stopping (${pendingRequestCount} requests pending)`,
      },
    ],
  };
}

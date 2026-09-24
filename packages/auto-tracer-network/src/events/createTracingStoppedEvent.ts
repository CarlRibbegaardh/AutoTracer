import type { EventToken } from "./EventToken.js";

/**
 * Creates the renderer-neutral tracing-stopped lifecycle marker.
 *
 * @returns An immutable tracing-stopped event.
 */
export function createTracingStoppedEvent(): {
  readonly kind: "tracing-stopped";
  readonly tokens: readonly EventToken[];
} {
  return {
    kind: "tracing-stopped",
    tokens: [{ role: "runtime-control", text: "Network tracing stopped" }],
  };
}

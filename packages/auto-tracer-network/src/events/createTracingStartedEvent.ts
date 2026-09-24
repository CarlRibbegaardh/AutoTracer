import type { EventToken } from "./EventToken.js";

/**
 * Creates the renderer-neutral tracing-started lifecycle marker.
 *
 * @returns An immutable tracing-started event.
 */
export function createTracingStartedEvent(): {
  readonly kind: "tracing-started";
  readonly tokens: readonly EventToken[];
} {
  return {
    kind: "tracing-started",
    tokens: [{ role: "runtime-control", text: "Network tracing started" }],
  };
}

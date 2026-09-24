import { getOrCreateSharedControl } from "./getOrCreateSharedControl.js";

/**
 * Check if the reactTracer is currently active.
 *
 * Pure query - reads from shared global state without side effects.
 *
 * @returns True if the tracer is currently active, false otherwise
 */
export function isReactTracerInitialized(): boolean {
  return getOrCreateSharedControl().isReactTracerActive;
}

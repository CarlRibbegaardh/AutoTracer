import type { OutputMode } from "./OutputMode.js";
import { getOrCreateAutoTracerGlobalApi } from "./getOrCreateAutoTracerGlobalApi.js";

/**
 * Subscribes a callback to output mode changes.
 *
 * Side effects: mutates global AutoTracer internal subscriber list.
 */
export function subscribeToOutputModeChanges(
  callback: (mode: OutputMode) => void
): void {
  getOrCreateAutoTracerGlobalApi();

  const internal = globalThis.__autoTracerInternal;
  if (internal === undefined) return;

  if (internal.outputMode !== "devtools" && internal.outputMode !== "copy-paste") {
    return;
  }

  internal.subscribers.push(callback);
  callback(internal.outputMode);
}

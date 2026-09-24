import type { ReactTracerOptions } from "../interfaces/ReactTracerOptions.js";
import { getTraceOptions, logTracerOptionsUpdate, setTracerOptions } from "../types/globalState.js";
import { mergeValidatedOptions } from "./mergeValidatedOptions.js";
import { shouldAutoStop } from "./shouldAutoStop.js";
import { getOrCreateSharedControl } from "./getOrCreateSharedControl.js";
import { stopReactTracer } from "./stopReactTracer.js";
import { applyInternalLogLevel } from "@logger/internalLogger.js";

/**
 * Update tracing options dynamically.
 *
 * Side effects:
 * - Validates and merges options into current options
 * - Applies internal log level
 * - Updates shared tracer options state
 * - Logs the options update
 * - Auto-stops tracer if transitioning from enabled true to false
 *
 * @param options - Partial options to merge with current options
 */
export function updateReactTracerOptions(
  options: Partial<ReactTracerOptions>,
): void {
  const currentOptions = getTraceOptions();
  const prevEnabled = currentOptions.enabled;

  // Pure transformation: validate and merge
  const updatedOptions = mergeValidatedOptions(currentOptions, options);

  // Side effect: apply log level
  applyInternalLogLevel(updatedOptions.internalLogLevel);

  // Command: update shared state
  setTracerOptions(updatedOptions);
  logTracerOptionsUpdate(options);

  // Command: auto-stop if transitioning from enabled true -> false
  const isActive = getOrCreateSharedControl().isReactTracerActive;
  if (shouldAutoStop(prevEnabled, updatedOptions.enabled, isActive)) {
    stopReactTracer();
  }
}

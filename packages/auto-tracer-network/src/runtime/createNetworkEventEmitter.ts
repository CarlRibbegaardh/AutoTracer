import type { createNetworkEventArguments } from "../output/createNetworkEventArguments.js";
import { createNetworkEventArguments as createEventArguments } from "../output/createNetworkEventArguments.js";

/**
 * Creates an event sink that renders against the current output settings.
 *
 * @param getOutputSettings - Returns the current output settings.
 * @param log - Writes one normal-level console entry.
 * @returns A renderer-neutral NetworkTracer event sink.
 */
export function createNetworkEventEmitter(
  getOutputSettings: () => Parameters<typeof createNetworkEventArguments>[1],
  log: (...arguments_: readonly unknown[]) => void,
): (event: Parameters<typeof createNetworkEventArguments>[0]) => void {
  return (event) => {
    log(...createEventArguments(event, getOutputSettings()));
  };
}

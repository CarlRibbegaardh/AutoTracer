import type { StateChangesBuilder } from "./strategies/StateChangesBuilder.js";
import { createHybridBuilder } from "./strategies/hybrid/createHybridBuilder.js";
import { createLabelsOnlyBuilder } from "./strategies/labelsOnly/createLabelsOnlyBuilder.js";
import { getTraceOptions } from "../../../../../types/globalState.js";

/**
 * Factory function that creates a state changes builder based on configuration.
 * Pure function - reads global config, returns strategy implementation.
 *
 * Strategy selection:
 * - "hybrid" (default): Fiber traversal + label matching with heuristics
 * - "labels-only": Only explicitly labeled state
 *
 * @returns StateChangesBuilder implementation based on current configuration
 */
export function createStateChangesBuilder(): StateChangesBuilder {
  const strategy = getTraceOptions().trackedStateResolution ?? "hybrid";
  return strategy === "labels-only"
    ? createLabelsOnlyBuilder()
    : createHybridBuilder();
}

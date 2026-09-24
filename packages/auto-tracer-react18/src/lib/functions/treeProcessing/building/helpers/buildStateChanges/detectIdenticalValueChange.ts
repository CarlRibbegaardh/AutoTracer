import { areValuesIdentical } from "../../../../areValuesIdentical.js";
import { getTraceOptions } from "../../../../../types/globalState.js";

/**
 * Detects if a value change is an identical value change (same deep structure, different reference).
 * Only performs detection if the feature is enabled in traceOptions.
 *
 * Pure function - deterministic output based on inputs and global option.
 *
 * @param prevValue - Previous value
 * @param value - Current value
 * @returns True if values are different references but identical structure
 */
export function detectIdenticalValueChange(
  prevValue: unknown,
  value: unknown
): boolean {
  return (
    !!getTraceOptions().detectIdenticalValueChanges &&
    prevValue !== value &&
    areValuesIdentical(prevValue, value)
  );
}

import type { LogDispatch } from "../types/LogDispatch.js";
import type { RenderedStateChange } from "../details/renderStateChange.js";
import {
  log,
  logIdenticalStateValueWarning,
  logStateChange,
} from "../../../log.js";
import { computeObjectFieldDiff } from "../utils/computeObjectFieldDiff.js";
import { formatFieldDiff } from "../utils/formatFieldDiff.js";

/**
 * Determines which log function to use for a state change and constructs arguments.
 * Pure function that returns dispatch instructions without executing side effects.
 *
 * @param rendered - The rendered state change data
 * @param prefix - The indentation prefix
 * @param isObjectMode - Whether object rendering mode is active
 * @returns Log dispatch instructions
 */
export function dispatchStateLog(
  rendered: RenderedStateChange,
  prefix: string,
  isObjectMode: boolean,
): LogDispatch {
  // Determine base dispatch
  let baseDispatch: LogDispatch;

  if (rendered.level === "state-identical") {
    baseDispatch = {
      logFn: logIdenticalStateValueWarning as (...args: unknown[]) => void,
      args: [prefix, rendered.message],
    };
  } else if (rendered.level === "state-initial") {
    baseDispatch = {
      logFn: logStateChange as (...args: unknown[]) => void,
      args: [prefix, rendered.message, true],
    };
  } else {
    baseDispatch = {
      logFn: logStateChange as (...args: unknown[]) => void,
      args: [prefix, rendered.message, false],
    };
  }

  // Wrap with object mode logging if needed
  if (isObjectMode && rendered.values) {
    const values = rendered.values;
    return {
      logFn: () => {
        if (values.length === 1) {
          // Initial: single value on same line - pass as additional arg
          baseDispatch.logFn(...(baseDispatch.args as []), values[0]);
        } else {
          // Update: Before/After on separate lines
          baseDispatch.logFn(...(baseDispatch.args as []));
          log(`${prefix}  Before`, values[0]);
          log(`${prefix}  After `, values[1]);

          // Add field-level diff for objects (skip for identical values)
          if (rendered.level !== "state-identical") {
            const fieldDiff = computeObjectFieldDiff(values[0], values[1]);
            if (fieldDiff) {
              const diffLines = formatFieldDiff(fieldDiff, prefix);
              for (const line of diffLines) {
                log(line);
              }
            }
          }
        }
      },
      args: [],
    };
  }

  return baseDispatch;
}

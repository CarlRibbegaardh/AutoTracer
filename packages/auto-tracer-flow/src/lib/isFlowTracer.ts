/**
 * @file Provides runtime type guards for the minimal FlowTracer surface.
 */

import type { FlowTracer } from "./FlowTracer.js";
import { isRecord } from "./isRecord.js";

/**
 * Checks whether a value satisfies the minimal FlowTracer surface used by injected code.
 *
 * @param value - Unknown value.
 * @returns True when value behaves like a FlowTracer.
 */
export function isFlowTracer(value: unknown): value is FlowTracer {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value["enter"] === "function" &&
    typeof value["exit"] === "function" &&
    typeof value["enterAsync"] === "function" &&
    typeof value["exitAsync"] === "function" &&
    typeof value["traceParameter"] === "function" &&
    typeof value["traceReturnValue"] === "function" &&
    typeof value["traceException"] === "function"
  );
}

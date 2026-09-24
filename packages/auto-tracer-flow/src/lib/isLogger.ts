/**
 * @file Provides runtime type guards for the minimal Logger surface.
 */

import type { Logger } from "@autotracer/logger";
import { isRecord } from "./isRecord.js";

/**
 * Checks whether a value satisfies the minimal Logger surface needed for runtime control.
 *
 * @param value - Unknown value.
 * @returns True when value behaves like a Logger.
 */
export function isLogger(value: unknown): value is Logger {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value["setLogLevel"] === "function" &&
    typeof value["log"] === "function" &&
    typeof value["setGroupMode"] === "function"
  );
}

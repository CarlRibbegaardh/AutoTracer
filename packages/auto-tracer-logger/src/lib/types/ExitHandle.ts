import type { LogLevel } from "./LogLevel.js";

/**
 * Exit handle returned by enter() function.
 * Contains timing and context information for the corresponding exit() call.
 * Treated as an opaque token - do not modify its properties.
 * The object reference is used for stack matching via reference equality.
 */
export interface ExitHandle {
  /** Label identifying the operation being tracked */
  readonly label: string;
  /** Timestamp when enter() was called (milliseconds since epoch) */
  readonly startTime: number;
  /** Log level at which this enter/exit pair should output */
  readonly level: LogLevel;
  /** Optional parameters to preserve from enter() for use in exit() elapsed message */
  readonly optionalParams?: unknown[];
}

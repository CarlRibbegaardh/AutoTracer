/**
 * State tracking for function-based auto-start/stop triggers.
 * This module maintains the triggered flag used to control re-arming behavior.
 */

/**
 * Flag indicating whether tracing was started by the start trigger.
 * Used to determine whether end trigger should stop tracing and whether to re-arm.
 */
let triggeredByStart = false;

/**
 * Gets the current triggered state.
 * @returns True if tracing was started by start trigger
 */
export function isTriggeredByStart(): boolean {
  return triggeredByStart;
}

/**
 * Sets the triggered state.
 * @param value - New triggered state
 */
export function setTriggeredByStart(value: boolean): void {
  triggeredByStart = value;
}

/**
 * Resets the triggered state to false.
 * Called when tracer is manually stopped or when re-arming after end trigger.
 */
export function resetTriggerState(): void {
  triggeredByStart = false;
}

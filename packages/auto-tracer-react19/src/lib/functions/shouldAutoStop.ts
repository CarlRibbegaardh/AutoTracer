/**
 * Checks if tracer should auto-stop based on enabled flag transition.
 *
 * Pure function - no side effects. Returns true when transitioning from
 * enabled to disabled while the tracer is currently active. This is used
 * to automatically stop tracing when the enabled flag changes to false.
 *
 * @param prevEnabled - Previous enabled state (before the change)
 * @param newEnabled - New enabled state (after the change)
 * @param isActive - Whether tracer is currently active
 * @returns True if should auto-stop, false otherwise
 */
export function shouldAutoStop(
  prevEnabled: boolean | undefined,
  newEnabled: boolean | undefined,
  isActive: boolean,
): boolean {
  return prevEnabled === true && newEnabled === false && isActive;
}

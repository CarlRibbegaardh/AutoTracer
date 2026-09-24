import type { createAutomaticTracingStoppedEvent } from "../events/createAutomaticTracingStoppedEvent.js";
import type { createTracingStoppedEvent } from "../events/createTracingStoppedEvent.js";

/**
 * Creates storage for the final event selected when a drain begins.
 *
 * @returns Final-event read, write, and clear operations.
 */
export function createNetworkTracingDrainStore(): Readonly<{
  getFinalEvent: () =>
    | ReturnType<typeof createTracingStoppedEvent>
    | ReturnType<typeof createAutomaticTracingStoppedEvent>
    | undefined;
  setFinalEvent: (
    event:
      | ReturnType<typeof createTracingStoppedEvent>
      | ReturnType<typeof createAutomaticTracingStoppedEvent>,
  ) => void;
  clearFinalEvent: () => void;
}> {
  let finalEvent:
    | ReturnType<typeof createTracingStoppedEvent>
    | ReturnType<typeof createAutomaticTracingStoppedEvent>
    | undefined;

  /** Returns the event selected for the active drain. */
  function getFinalEvent(): typeof finalEvent {
    return finalEvent;
  }

  /** Selects the event emitted when the active drain settles. */
  function setFinalEvent(event: Exclude<typeof finalEvent, undefined>): void {
    finalEvent = event;
  }

  /** Clears the selected final event. */
  function clearFinalEvent(): void {
    finalEvent = undefined;
  }

  return { getFinalEvent, setFinalEvent, clearFinalEvent };
}

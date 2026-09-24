import type { StructuredDetailEvent } from "../events/StructuredDetailEvent.js";
import type { TokenizedEvent } from "../events/TokenizedEvent.js";
import type { createFetchRejectionEvents } from "./createFetchRejectionEvents.js";

/**
 * Emits a Fetch rejection completion followed by its optional failure detail.
 *
 * @param events - Fetch rejection events to emit.
 * @param emit - Event sink that receives each event in display order.
 */
export function emitFetchRejectionEvents(
  events: ReturnType<typeof createFetchRejectionEvents>,
  emit: (event: TokenizedEvent | StructuredDetailEvent) => void,
): void {
  emit(events.completion);

  if (events.failureDetail !== undefined) {
    emit(events.failureDetail);
  }
}

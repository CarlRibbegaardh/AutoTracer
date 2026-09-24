import { createFetchOutcomeObservers } from "./createFetchOutcomeObservers.js";

/**
 * Creates Fetch outcome observers that settle pending request work.
 *
 * @param input - Outcome observer inputs and pending-work settlement command.
 * @returns Response, rejection, and synchronous-failure observers.
 */
export function createSettlingFetchOutcomeObservers(
  input: Parameters<typeof createFetchOutcomeObservers>[0] &
    Readonly<{
      startResponseDetails?: (response: Response) => void;
      canEmitPendingOutput: () => boolean;
      settlePendingWork: () => void;
    }>,
): ReturnType<typeof createFetchOutcomeObservers> {
  const observers = createFetchOutcomeObservers(input);

  /** Emits a response outcome before settling its pending request work. */
  function onResolved(response: Response): void {
    try {
      if (input.canEmitPendingOutput()) {
        observers.onResolved(response);
        input.startResponseDetails?.(response);
      }
    } finally {
      input.settlePendingWork();
    }
  }

  /** Emits rejection output before settling its pending request work. */
  function onRejected(failure: unknown): void {
    try {
      if (input.canEmitPendingOutput()) {
        observers.onRejected(failure);
      }
    } finally {
      input.settlePendingWork();
    }
  }

  return {
    onResolved,
    onRejected,
    onSynchronousFailure: onRejected,
  };
}

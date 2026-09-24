import { emitPendingDetail } from "./emitPendingDetail.js";

/**
 * Runs one synchronous detail capture within pending-work accounting.
 *
 * @param createDetail - Creates the detached detail value.
 * @param lifecycle - Pending-work and live output operations.
 */
export function runPendingDetailCapture<Value>(
  createDetail: () => Value,
  lifecycle: Readonly<{
    beginPendingWork: () => void;
    canEmitPendingOutput: () => boolean;
    emit: (detail: Value) => void;
    settlePendingWork: () => void;
  }>,
): void {
  lifecycle.beginPendingWork();

  try {
    emitPendingDetail(createDetail(), lifecycle);
  } catch {
    return;
  } finally {
    lifecycle.settlePendingWork();
  }
}

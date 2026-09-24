import { emitPendingDetail } from "./emitPendingDetail.js";

/**
 * Registers and observes one asynchronous pending detail task.
 *
 * @param createDetail - Starts asynchronous detail capture.
 * @param lifecycle - Pending-work and live output operations.
 * @returns A promise that resolves after capture and pending settlement finish.
 */
export function startPendingDetailTask<Value>(
  createDetail: () => Promise<Value>,
  lifecycle: Readonly<{
    beginPendingWork: () => void;
    canEmitPendingOutput: () => boolean;
    emit: (detail: Value) => void;
    settlePendingWork: () => void;
  }>,
): Promise<void> {
  lifecycle.beginPendingWork();

  let detailTask: Promise<Value>;
  try {
    detailTask = createDetail();
  } catch {
    lifecycle.settlePendingWork();
    return Promise.resolve();
  }

  return detailTask
    .then(
      (detail) => {return emitPendingDetail(detail, lifecycle)},
      () => {return undefined},
    )
    .finally(lifecycle.settlePendingWork);
}

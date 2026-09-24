/**
 * Emits a settled detail only while pending output remains allowed.
 *
 * @param detail - Settled detail value.
 * @param output - Live output gate and event sink.
 */
export function emitPendingDetail<Value>(
  detail: Value,
  output: Readonly<{
    canEmitPendingOutput: () => boolean;
    emit: (detail: Value) => void;
  }>,
): void {
  if (!output.canEmitPendingOutput()) return;

  try {
    output.emit(detail);
  } catch {
    return;
  }
}

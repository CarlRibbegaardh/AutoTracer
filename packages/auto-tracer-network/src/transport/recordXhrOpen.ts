import { createXhrOpenMetadata } from "./createXhrOpenMetadata.js";
import { replaceActiveXhrRequest } from "./replaceActiveXhrRequest.js";
import type { startTracedXhrRequest } from "./startTracedXhrRequest.js";
import type { XhrOpenMetadata } from "./XhrOpenMetadata.js";
import type { XhrOpenMetadataInput } from "./XhrOpenMetadataInput.js";

/**
 * Records tracing state after one successful native XHR open invocation.
 *
 * @param openInput - Script-provided open values.
 * @param state - Per-instance open metadata and active request operations.
 * @param runtime - Replacement timing and output operations.
 */
export function recordXhrOpen(
  openInput: XhrOpenMetadataInput,
  state: Readonly<{
    getActiveRequest: () =>
      | ReturnType<typeof startTracedXhrRequest>
      | undefined;
    clearActiveRequest: () => void;
    setOpenMetadata: (metadata: XhrOpenMetadata) => void;
  }>,
  runtime: Readonly<{
    getCompletionMarker: () => number;
    emit: Parameters<typeof replaceActiveXhrRequest>[2];
  }>,
): void {
  const activeRequest = state.getActiveRequest();
  if (activeRequest !== undefined) {
    replaceActiveXhrRequest(
      activeRequest,
      runtime.getCompletionMarker(),
      runtime.emit,
    );
    state.clearActiveRequest();
  }

  state.setOpenMetadata(createXhrOpenMetadata(openInput));
}

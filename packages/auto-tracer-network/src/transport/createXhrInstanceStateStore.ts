import type { XhrOpenMetadata } from "./XhrOpenMetadata.js";
import type { startTracedXhrRequest } from "./startTracedXhrRequest.js";

/**
 * Creates tracing state storage for one XHR instance.
 *
 * @returns Independent open metadata and active request operations.
 */
export function createXhrInstanceStateStore(): Readonly<{
  getOpenMetadata: () => XhrOpenMetadata | undefined;
  setOpenMetadata: (metadata: XhrOpenMetadata) => void;
  getActiveRequest: () =>
    | ReturnType<typeof startTracedXhrRequest>
    | undefined;
  setActiveRequest: (
    request: ReturnType<typeof startTracedXhrRequest>,
  ) => void;
  clearActiveRequest: () => void;
}> {
  let openMetadata: XhrOpenMetadata | undefined;
  let activeRequest: ReturnType<typeof startTracedXhrRequest> | undefined;

  /** Returns metadata from the latest open invocation. */
  function getOpenMetadata(): XhrOpenMetadata | undefined {
    return openMetadata;
  }

  /** Replaces metadata for the next send invocation. */
  function setOpenMetadata(metadata: XhrOpenMetadata): void {
    openMetadata = metadata;
  }

  /** Returns the currently active traced request. */
  function getActiveRequest():
    | ReturnType<typeof startTracedXhrRequest>
    | undefined {
    return activeRequest;
  }

  /** Replaces the currently active traced request. */
  function setActiveRequest(
    request: ReturnType<typeof startTracedXhrRequest>,
  ): void {
    activeRequest = request;
  }

  /** Clears the currently active traced request. */
  function clearActiveRequest(): void {
    activeRequest = undefined;
  }

  return {
    getOpenMetadata,
    setOpenMetadata,
    getActiveRequest,
    setActiveRequest,
    clearActiveRequest,
  };
}

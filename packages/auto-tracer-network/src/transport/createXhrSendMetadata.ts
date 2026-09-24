import type { XhrOpenMetadata } from "./XhrOpenMetadata.js";

/**
 * Creates detached metadata for one XHR send invocation.
 *
 * @param openMetadata - Metadata from the latest XHR open invocation.
 * @returns An immutable request-scoped metadata snapshot.
 */
export function createXhrSendMetadata(
  openMetadata: XhrOpenMetadata,
): XhrOpenMetadata {
  return {
    method: openMetadata.method,
    requestedUrl: openMetadata.requestedUrl,
    async: openMetadata.async,
  };
}

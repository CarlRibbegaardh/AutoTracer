import { normalizeHttpMethod } from "./normalizeHttpMethod.js";
import type { XhrOpenMetadata } from "./XhrOpenMetadata.js";
import type { XhrOpenMetadataInput } from "./XhrOpenMetadataInput.js";

/**
 * Creates immutable tracing metadata from an XMLHttpRequest open call.
 *
 * @param input - Script-provided open values.
 * @returns Normalized metadata without credentials.
 */
export function createXhrOpenMetadata(
  input: XhrOpenMetadataInput,
): XhrOpenMetadata {
  return {
    method: normalizeHttpMethod(input.method),
    requestedUrl: input.requestedUrl,
    async: input.async ?? true,
  };
}

import { createEffectiveFetchHeadersSnapshot } from "./createEffectiveFetchHeadersSnapshot.js";
import type { FetchRequestMetadata } from "./FetchRequestMetadata.js";
import { getEffectiveFetchMethod } from "./getEffectiveFetchMethod.js";
import { getFetchRequestedUrl } from "./getFetchRequestedUrl.js";
import { getHeaderContentType } from "./getHeaderContentType.js";

/**
 * Creates immutable synchronous metadata for a Fetch invocation.
 *
 * @param input - Fetch Request, URL, or string input.
 * @param init - Optional Fetch initialization overrides.
 * @returns Effective method, URL, headers, and content type.
 */
export function createFetchRequestMetadata(
  input: RequestInfo | URL,
  init?: RequestInit,
): FetchRequestMetadata {
  const headers = createEffectiveFetchHeadersSnapshot(input, init);

  return {
    method: getEffectiveFetchMethod(input, init),
    requestedUrl: getFetchRequestedUrl(input),
    headers,
    contentType: getHeaderContentType(headers),
  };
}

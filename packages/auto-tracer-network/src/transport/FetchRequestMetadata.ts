/**
 * Immutable synchronous metadata for one Fetch invocation.
 */
export interface FetchRequestMetadata {
  /** Effective normalized HTTP method. */
  readonly method: string;

  /** Requested URL text from the Fetch input. */
  readonly requestedUrl: string;

  /** Detached effective script-visible headers. */
  readonly headers: Headers;

  /** Content type read from the effective header snapshot. */
  readonly contentType: string | null;
}

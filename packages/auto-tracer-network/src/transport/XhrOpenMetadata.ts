/**
 * Immutable tracing metadata captured from an XMLHttpRequest open call.
 */
export interface XhrOpenMetadata {
  /** Normalized HTTP method. */
  readonly method: string;
  /** Requested URL text. */
  readonly requestedUrl: string;
  /** Effective asynchronous mode. */
  readonly async: boolean;
}

/**
 * Script-provided values from an XMLHttpRequest open call.
 */
export interface XhrOpenMetadataInput {
  /** Requested HTTP method. */
  readonly method: string;
  /** Requested URL text. */
  readonly requestedUrl: string;
  /** Optional asynchronous mode. */
  readonly async?: boolean;
  /** Optional user name excluded from captured metadata. */
  readonly username?: string | null;
  /** Optional password excluded from captured metadata. */
  readonly password?: string | null;
}

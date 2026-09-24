/**
 * Defines request-scoped capture settings retained for the request lifetime.
 */
export interface RequestCaptureSnapshot {
  /** Whether script-provided request headers are captured. */
  readonly captureRequestHeaders: boolean;

  /** Whether the request body is captured. */
  readonly captureRequestBody: boolean;

  /** Whether script-visible response headers are captured. */
  readonly captureResponseHeaders: boolean;

  /** Whether the response body is captured. */
  readonly captureResponseBody: boolean;

  /** Maximum number of bytes captured from a body. */
  readonly bodyCaptureLimit: number;

  /** Field-name patterns used for request-scoped redaction. */
  readonly redactionPatterns: readonly string[];
}

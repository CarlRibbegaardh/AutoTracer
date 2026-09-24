/**
 * Defines the in-memory NetworkTracer configuration established by package defaults.
 */
export interface NetworkTracerConfig {
  /** Whether tracing starts when the runtime loads. */
  readonly enabledOnLoad: boolean;

  /** Whether script-provided request headers are captured. */
  readonly captureRequestHeaders: boolean;

  /** Whether request bodies are captured. */
  readonly captureRequestBody: boolean;

  /** Whether script-visible response headers are captured. */
  readonly captureResponseHeaders: boolean;

  /** Whether response bodies are captured. */
  readonly captureResponseBody: boolean;

  /** Maximum number of bytes captured from a body. */
  readonly bodyCaptureLimit: number;

  /** Field-name patterns used for case-insensitive redaction. */
  readonly redactionPatterns: readonly string[];

  /** URL patterns that admit matching network requests. */
  readonly includePatterns: readonly string[];

  /** URL patterns that hide matching network requests. */
  readonly excludePatterns: readonly string[];

  /** Whether manual stop drains pending logging work. */
  readonly waitForPendingRequestsOnStop: boolean;

  /** Included-request admission limit, or `undefined` when disabled. */
  readonly autoStopAfterRequests: number | undefined;
}

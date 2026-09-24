import type { NetworkTracerConfig } from "./NetworkTracerConfig.js";

/**
 * Exposes the currently implemented live NetworkTracer configuration operations.
 */
export interface NetworkTracerConfigStore {
  /**
   * Returns an immutable snapshot of the resolved configuration.
   *
   * @returns A configuration snapshot without live array references.
   */
  readonly getConfig: () => NetworkTracerConfig;

  /**
   * Persists whether tracing starts when the runtime loads.
   *
   * @param value - Whether tracing starts on load.
   */
  readonly setEnabledOnLoad: (value: boolean) => void;

  /**
   * Persists request-header capture enablement.
   *
   * @param value - Whether script-provided request headers are captured.
   */
  readonly setCaptureRequestHeaders: (value: boolean) => void;

  /**
   * Persists request-body capture enablement.
   *
   * @param value - Whether request bodies are captured.
   */
  readonly setCaptureRequestBody: (value: boolean) => void;

  /**
   * Persists response-header capture enablement.
   *
   * @param value - Whether script-visible response headers are captured.
   */
  readonly setCaptureResponseHeaders: (value: boolean) => void;

  /**
   * Persists response-body capture enablement.
   *
   * @param value - Whether response bodies are captured.
   */
  readonly setCaptureResponseBody: (value: boolean) => void;

  /**
   * Validates and persists a body capture limit.
   *
   * @param value - Positive integer body capture limit.
   */
  readonly setBodyCaptureLimit: (value: number) => void;

  /**
   * Persists whether manual stop drains pending logging work.
   *
   * @param value - Whether manual stop waits for pending requests.
   */
  readonly setWaitForPendingRequestsOnStop: (value: boolean) => void;

  /**
   * Validates and persists a positive automatic-stop request limit.
   *
  * @param value - Positive included-request admission limit, or undefined to disable it.
   */
  readonly setAutoStopAfterRequests: (value: number | undefined) => void;

  /**
   * Replaces the persisted redaction-pattern list.
   *
   * @param value - Valid case-insensitive field-name patterns.
   */
  readonly setRedactionPatterns: (value: readonly string[]) => void;

  /**
   * Replaces the persisted URL inclusion-pattern list.
   *
   * @param value - URL patterns that admit matching requests.
   */
  readonly setIncludePatterns: (value: readonly string[]) => void;

  /**
   * Replaces the persisted URL exclusion-pattern list.
   *
   * @param value - URL patterns that hide matching requests.
   */
  readonly setExcludePatterns: (value: readonly string[]) => void;

  /** Clears persisted settings and restores configuration defaults. */
  readonly resetConfig: () => void;
}

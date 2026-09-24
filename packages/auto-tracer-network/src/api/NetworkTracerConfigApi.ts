import type { NetworkTracerConfig } from "../configuration/NetworkTracerConfig.js";

/**
 * Exposes live NetworkTracer configuration controls.
 */
export interface NetworkTracerConfigApi {
  /** Returns whether tracing starts when the runtime loads. */
  readonly getEnabledOnLoad: () => boolean;
  /** Persists whether tracing starts when the runtime loads. */
  readonly setEnabledOnLoad: (value: boolean) => void;
  /** Returns whether request headers are captured. */
  readonly getCaptureRequestHeaders: () => boolean;
  /** Persists request-header capture enablement. */
  readonly setCaptureRequestHeaders: (value: boolean) => void;
  /** Returns whether request bodies are captured. */
  readonly getCaptureRequestBody: () => boolean;
  /** Persists request-body capture enablement. */
  readonly setCaptureRequestBody: (value: boolean) => void;
  /** Returns whether response headers are captured. */
  readonly getCaptureResponseHeaders: () => boolean;
  /** Persists response-header capture enablement. */
  readonly setCaptureResponseHeaders: (value: boolean) => void;
  /** Returns whether response bodies are captured. */
  readonly getCaptureResponseBody: () => boolean;
  /** Persists response-body capture enablement. */
  readonly setCaptureResponseBody: (value: boolean) => void;
  /** Returns the body capture limit in bytes. */
  readonly getBodyCaptureLimit: () => number;
  /** Persists the body capture limit in bytes. */
  readonly setBodyCaptureLimit: (value: number) => void;
  /** Returns detached URL inclusion patterns. */
  readonly getIncludePatterns: () => readonly string[];
  /** Persists URL inclusion patterns. */
  readonly setIncludePatterns: (value: readonly string[]) => void;
  /** Returns detached URL exclusion patterns. */
  readonly getExcludePatterns: () => readonly string[];
  /** Persists URL exclusion patterns. */
  readonly setExcludePatterns: (value: readonly string[]) => void;
  /** Returns detached field-redaction patterns. */
  readonly getRedactionPatterns: () => readonly string[];
  /** Persists field-redaction patterns. */
  readonly setRedactionPatterns: (value: readonly string[]) => void;
  /** Returns whether manual stop drains pending work. */
  readonly getWaitForPendingRequestsOnStop: () => boolean;
  /** Persists whether manual stop drains pending work. */
  readonly setWaitForPendingRequestsOnStop: (value: boolean) => void;
  /** Returns the automatic-stop request limit. */
  readonly getAutoStopAfterRequests: () => number | undefined;
  /** Persists or disables the automatic-stop request limit. */
  readonly setAutoStopAfterRequests: (value: number | undefined) => void;
  /** Returns a detached snapshot of all current settings. */
  readonly getConfig: () => NetworkTracerConfig;
  /** Clears persisted settings and restores project defaults. */
  readonly resetConfig: () => void;
}

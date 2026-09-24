import type { StyledExitHandle } from "@autotracer/logger";

/**
 * Parameters for creating a runtime-filtered Flow tracer.
 */
export type CreateRuntimeFilteredFlowTracerParams = {
  /**
   * Base tracer implementation.
   */
  readonly baseTracer: {
    readonly enter: (functionName: string, ...args: unknown[]) => StyledExitHandle;
    readonly exit: (handle: StyledExitHandle) => void;
    readonly enterAsync: (
      functionName: string,
      ...args: unknown[]
    ) => StyledExitHandle;
    readonly exitAsync: (handle: StyledExitHandle) => void;
    readonly traceParameter: (name: string, value: unknown) => void;
    readonly traceReturnValue: (value: unknown) => void;
    readonly traceException: (functionName: string, error: unknown) => void;
    readonly trace: (...args: unknown[]) => void;
    readonly debug: (...args: unknown[]) => void;
  };

  /**
   * Runtime name filter store.
   */
  readonly store: {
    /**
     * Returns true when a name matches any runtime filter.
     */
    readonly matchesName: (name: string) => boolean;
  };

  /**
   * Returns whether filterMode is enabled.
   */
  readonly isFilterModeEnabled: () => boolean;

  /**
   * Creates a filter action handle for a function name.
   *
   * Return value is passed through to console as an additional argument.
   */
  readonly createFilterAction: (functionName: string) => unknown;

  /**
   * Logger reference (currently unused by the wrapper, reserved for future diagnostics).
   */
  readonly logger: {
    readonly trace: (...args: unknown[]) => void;
  };
};

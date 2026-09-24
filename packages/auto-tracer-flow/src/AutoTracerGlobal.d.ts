import type { OutputMode } from "./lib/OutputMode.js";
import type { TracerRuntimeControls } from "./lib/TracerRuntimeControls.js";

export {};

declare global {
  /**
   * The canonical runtime AutoTracer API surface.
   *
   * This is a global var declaration so that TypeScript correctly models
   * `globalThis.autoTracer` without casts.
   *
   * Both tracer properties are optional - only the installed tracers are present.
   */
  // eslint-disable-next-line no-var
  var autoTracer:
    | {
        getOutputMode(): OutputMode;
        setOutputMode(mode: OutputMode): void;
        reactTracer?: TracerRuntimeControls;
        flowTracer?: TracerRuntimeControls;
      }
    | undefined;

  /**
   * Internal AutoTracer runtime state.
   *
   * This is intentionally separate from the public `autoTracer` API so that
   * multiple tracer packages can share a single canonical outputMode value and
   * notification channel independent of initialization order.
   */
  // eslint-disable-next-line no-var
  var __autoTracerInternal:
    | {
        outputMode: OutputMode;
        subscribers: Array<(mode: OutputMode) => void>;
      }
    | undefined;

  /**
   * Strictly-typed augmentation for the canonical AutoTracer global API.
   */
  interface GlobalThis {
    /**
     * The canonical runtime AutoTracer API surface.
     *
     * Side effects:
     * - Assigned during runtime by the Flow global installer.
     */
    autoTracer?:
      | {
          getOutputMode(): OutputMode;
          setOutputMode(mode: OutputMode): void;
          reactTracer?: TracerRuntimeControls;
          flowTracer?: TracerRuntimeControls;
        }
      | undefined;

    /**
     * Internal AutoTracer runtime state.
     */
    __autoTracerInternal?:
      | {
          outputMode: OutputMode;
          subscribers: Array<(mode: OutputMode) => void>;
        }
      | undefined;
  }
}

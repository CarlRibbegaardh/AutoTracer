import type { OutputMode } from "./OutputMode.js";
import type { TracerRuntimeControls } from "./TracerRuntimeControls.js";

/**
 * Minimal runtime global API required by the spec.
 */
export interface AutoTracerGlobalApi {
  /**
   * Gets the canonical output mode.
   */
  getOutputMode(): OutputMode;

  /**
   * Sets the canonical output mode.
   */
  setOutputMode(mode: OutputMode): void;

  /**
   * ReactTracer runtime controls.
   * Provided by @autotracer/react18.
   */
  reactTracer: TracerRuntimeControls;

  /**
   * FlowTracer runtime controls.
   * Only present when @autotracer/flow is installed.
   */
  flowTracer?: TracerRuntimeControls;
}

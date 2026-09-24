import type { Logger } from "@autotracer/logger";

/**
 * Creates the canonical flow runtime control methods.
 *
 * Side effects:
 * - `start()` mutates the logger log level to `"trace"`.
 * - `stop()` mutates the logger log level to `"off"`.
 * - `stop()` resets trigger state to allow re-arming.
 *
 * @param logger - Logger instance used by the Flow tracer
 * @param initiallyEnabled - Whether tracing should start enabled
 * @returns Runtime control methods compatible with `window.autoTracer.flowTracer`
 */
export function createFlowRuntimeControls(
  logger: Logger,
  initiallyEnabled: boolean
): {
  start: () => void;
  stop: () => void;
  isEnabled: () => boolean;
} {
  let isActive = initiallyEnabled;

  function start(): void {
    logger.setLogLevel("trace");
    isActive = true;
  }

  function stop(): void {
    logger.setLogLevel("off");
    isActive = false;
    // Do NOT reset trigger state here — the re-arm mode decision belongs
    // exclusively to the trigger handlers in FlowTracer.ts.
    // Resetting here would make "once" mode indistinguishable from "always".
  }

  function isEnabled(): boolean {
    return isActive;
  }

  if (initiallyEnabled) {
    start();
  } else {
    stop();
  }

  return { start, stop, isEnabled };
}

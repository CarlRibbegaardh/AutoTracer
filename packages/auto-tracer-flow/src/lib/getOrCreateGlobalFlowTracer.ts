import type { Logger } from "@autotracer/logger";
import { getLogger } from "@autotracer/logger";
import { mergeThemes } from "./functions/theme/mergeThemes.js";
import { createFlowTracer } from "./FlowTracer.js";
import type { FlowTracer } from "./FlowTracer.js";
import { isLogger } from "./isLogger.js";
import { isFlowTracer } from "./isFlowTracer.js";
import { isFlowThemeConfig } from "./isFlowThemeConfig.js";
import { isRecord } from "./isRecord.js";

let _cached:
  | {
      logger: Logger;
      tracer: FlowTracer;
    }
  | undefined;

/**
 * Gets or creates the singleton Flow tracer state.
 *
 * Side effects:
 * - Creates a logger instance via the logger registry.
 * - Reads `globalThis.__FLOWTRACER_THEME__` when present.
 *
 * @returns The Flow tracer singleton (logger + tracer)
 */
export function getOrCreateGlobalFlowTracer(): {
  logger: Logger;
  tracer: FlowTracer;
} {
  if (isRecord(_cached)) {
    const logger = _cached["logger"];
    const tracer = _cached["tracer"];
    if (isLogger(logger) && isFlowTracer(tracer)) {
      return { logger, tracer };
    }
  }

  const logger = getLogger("FlowTracer");
  logger.setShowName(false);

  const themeFromFilesCandidate = globalThis.__FLOWTRACER_THEME__;
  const theme = mergeThemes(
    isFlowThemeConfig(themeFromFilesCandidate)
      ? themeFromFilesCandidate
      : undefined,
  );
  const tracer = createFlowTracer(logger, { theme });

  const state = { logger, tracer };
  _cached = state;

  return state;
}

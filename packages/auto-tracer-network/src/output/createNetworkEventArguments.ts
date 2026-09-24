import type { RedirectCompletionEvent } from "../events/RedirectCompletionEvent.js";
import type { StructuredDetailEvent } from "../events/StructuredDetailEvent.js";
import type { TokenizedEvent } from "../events/TokenizedEvent.js";
import type { NetworkThemeConfig } from "../theme/NetworkThemeConfig.js";
import { createCopyPasteEventArguments } from "./createCopyPasteEventArguments.js";
import { createCopyPasteRedirectArguments } from "./createCopyPasteRedirectArguments.js";
import { createCopyPasteStructuredDetailArguments } from "./createCopyPasteStructuredDetailArguments.js";
import { createDevToolsEventArguments } from "./createDevToolsEventArguments.js";
import { createDevToolsRedirectArguments } from "./createDevToolsRedirectArguments.js";
import { createDevToolsStructuredDetailArguments } from "./createDevToolsStructuredDetailArguments.js";

/**
 * Creates console arguments for one event under the active output settings.
 *
 * @param event - Renderer-neutral NetworkTracer event.
 * @param output - Active output mode, theme, and color mode.
 * @returns Console arguments for one normal-level log call.
 */
export function createNetworkEventArguments(
  event: TokenizedEvent | StructuredDetailEvent | RedirectCompletionEvent,
  output: Readonly<{
    outputMode: "devtools" | "copy-paste";
    theme: NetworkThemeConfig;
    colorMode: "light" | "dark";
  }>,
): readonly unknown[] {
  if ("completionTokens" in event) {
    return output.outputMode === "devtools"
      ? createDevToolsRedirectArguments(
          event,
          output.theme,
          output.colorMode,
        )
      : createCopyPasteRedirectArguments(event);
  }

  if ("value" in event) {
    return output.outputMode === "devtools"
      ? createDevToolsStructuredDetailArguments(
          event,
          output.theme,
          output.colorMode,
        )
      : createCopyPasteStructuredDetailArguments(event);
  }

  return output.outputMode === "devtools"
    ? createDevToolsEventArguments(event, output.theme, output.colorMode)
    : createCopyPasteEventArguments(event);
}

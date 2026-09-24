import type { StructuredDetailEvent } from "../events/StructuredDetailEvent.js";
import type { NetworkThemeConfig } from "../theme/NetworkThemeConfig.js";
import { formatDetailValueForOutputMode } from "./formatDetailValueForOutputMode.js";
import { renderEventTokensForDevTools } from "./renderEventTokensForDevTools.js";

/**
 * Creates console arguments for an expandable DevTools detail row.
 *
 * @param event - Renderer-neutral structured detail event.
 * @param theme - Resolved Network theme.
 * @param mode - Active light or dark color mode.
 * @returns Styled format text, aligned CSS values, and a detached detail value.
 */
export function createDevToolsStructuredDetailArguments(
  event: StructuredDetailEvent,
  theme: NetworkThemeConfig,
  mode: "light" | "dark",
): readonly unknown[] {
  const renderedTokens = renderEventTokensForDevTools(
    event.tokens,
    theme,
    mode,
  );

  return [
    renderedTokens.format,
    ...renderedTokens.styles,
    formatDetailValueForOutputMode(event.value, "devtools"),
  ];
}

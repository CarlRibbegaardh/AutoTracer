import type { TokenizedEvent } from "../events/TokenizedEvent.js";
import type { NetworkThemeConfig } from "../theme/NetworkThemeConfig.js";
import { renderEventTokensForDevTools } from "./renderEventTokensForDevTools.js";

/**
 * Creates aligned DevTools console arguments for a token-only event.
 *
 * @param event - Renderer-neutral token event.
 * @param theme - Resolved Network theme.
 * @param mode - Active light or dark color mode.
 * @returns Styled format text followed by one CSS value per token.
 */
export function createDevToolsEventArguments(
  event: TokenizedEvent,
  theme: NetworkThemeConfig,
  mode: "light" | "dark",
): readonly string[] {
  const renderedTokens = renderEventTokensForDevTools(
    event.tokens,
    theme,
    mode,
  );

  return [renderedTokens.format, ...renderedTokens.styles];
}

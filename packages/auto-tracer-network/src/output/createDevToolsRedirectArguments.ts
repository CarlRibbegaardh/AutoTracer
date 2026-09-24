import type { RedirectCompletionEvent } from "../events/RedirectCompletionEvent.js";
import type { NetworkThemeConfig } from "../theme/NetworkThemeConfig.js";
import { renderEventTokensForDevTools } from "./renderEventTokensForDevTools.js";

/**
 * Creates one multiline DevTools console argument set for a redirect event.
 *
 * @param event - Renderer-neutral redirect completion event.
 * @param theme - Resolved Network theme.
 * @param mode - Active light or dark color mode.
 * @returns Multiline format text followed by one CSS value per token.
 */
export function createDevToolsRedirectArguments(
  event: RedirectCompletionEvent,
  theme: NetworkThemeConfig,
  mode: "light" | "dark",
): readonly string[] {
  const completion = renderEventTokensForDevTools(
    event.completionTokens,
    theme,
    mode,
  );
  const requested = renderEventTokensForDevTools(
    event.requestedTokens,
    theme,
    mode,
  );
  const final = renderEventTokensForDevTools(
    event.finalTokens,
    theme,
    mode,
  );

  return [
    `${completion.format}\n${requested.format}\n${final.format}`,
    ...completion.styles,
    ...requested.styles,
    ...final.styles,
  ];
}

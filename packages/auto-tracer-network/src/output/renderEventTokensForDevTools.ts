import type { EventToken } from "../events/EventToken.js";
import { buildNetworkThemeStyle } from "../theme/buildNetworkThemeStyle.js";
import type { NetworkThemeConfig } from "../theme/NetworkThemeConfig.js";
import { resolveEventTokenThemeCategory } from "../theme/resolveEventTokenThemeCategory.js";

/**
 * Converts event tokens into aligned DevTools console format and style values.
 *
 * @param tokens - Ordered renderer-neutral event tokens.
 * @param theme - Resolved Network theme.
 * @param mode - Active light or dark color mode.
 * @returns Console format text and one CSS value per token.
 */
export function renderEventTokensForDevTools(
  tokens: readonly EventToken[],
  theme: NetworkThemeConfig,
  mode: "light" | "dark",
): Readonly<{ readonly format: string; readonly styles: readonly string[] }> {
  let format = "";
  const styles: string[] = [];

  for (const token of tokens) {
    const category = resolveEventTokenThemeCategory(token);
    const options =
      category === undefined
        ? {}
        : theme[category][mode === "dark" ? "darkMode" : "lightMode"];

    format += `%c${token.text}`;
    styles.push(buildNetworkThemeStyle(options));
  }

  return { format, styles };
}

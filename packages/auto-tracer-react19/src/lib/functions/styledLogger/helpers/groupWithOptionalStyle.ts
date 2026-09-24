import { safeGroup } from "../../consoleUtils.js";

/**
 * Internal helper: creates console group with CSS style if provided, otherwise plain text.
 *
 * @param prefix - Monochrome prefix text
 * @param content - Styled content text
 * @param style - CSS style string
 * @param args - Additional arguments to pass to console.group
 */
export function groupWithOptionalStyle(
  prefix: string,
  content: string,
  style: string,
  ...args: unknown[]
): void {
  if (style && style.length > 0) {
    safeGroup(`${prefix}%c${content}`, style, ...args);
  } else {
    safeGroup(`${prefix}${content}`, ...args);
  }
}

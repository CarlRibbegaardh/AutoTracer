import type { EventToken } from "../events/EventToken.js";

/**
 * Concatenates renderer-neutral event tokens into plain display text.
 *
 * @param tokens - Ordered semantic event tokens.
 * @returns Their text without semantic-role modification.
 */
export function concatenateEventTokens(
  tokens: readonly EventToken[],
): string {
  return tokens.map((token) => {return token.text}).join("");
}

import type { StructuredDetailEvent } from "../events/StructuredDetailEvent.js";
import { concatenateEventTokens } from "./concatenateEventTokens.js";
import { formatDetailValueForOutputMode } from "./formatDetailValueForOutputMode.js";

/**
 * Creates one deterministic console argument for a copy-paste detail row.
 *
 * @param event - Renderer-neutral structured detail event.
 * @returns One complete plain-text detail line.
 */
export function createCopyPasteStructuredDetailArguments(
  event: StructuredDetailEvent,
): readonly [string] {
  const prefix = concatenateEventTokens(event.tokens);
  const value = formatDetailValueForOutputMode(event.value, "copy-paste");

  return [`${prefix}${String(value)}`];
}

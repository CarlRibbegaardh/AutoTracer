import type { EventToken } from "./EventToken.js";

/**
 * Renderer-neutral event represented by one ordered token line.
 */
export type TokenizedEvent = Readonly<{
  tokens: readonly EventToken[];
}>;

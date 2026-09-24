import type { EventToken } from "./EventToken.js";

/**
 * Renderer-neutral structured detail event.
 */
export type StructuredDetailEvent = Readonly<{
  kind: "structured-detail";
  tokens: readonly EventToken[];
  value: unknown;
}>;

import { commentHasDisable } from "./commentHasDisable.js";
import { commentHasTrace } from "./commentHasTrace.js";
import type { PragmaResult } from "./PragmaResult.js";

/**
 * Reducer that merges a single AST comment node into an accumulated {@link PragmaResult}.
 *
 * @remarks
 * `CommentBlock` nodes (`/* … *\/` and `/** … *\/`) are completely ignored.
 * Only `CommentLine` nodes (`//`) are examined for pragma tokens.
 *
 * @param acc - The accumulated pragma result so far.
 * @param comment - A single comment node with a `type` and `value` field.
 * @returns An updated `PragmaResult` with flags OR-ed from the comment.
 */
export const accumulate = (
  acc: PragmaResult,
  comment: { readonly value: string; readonly type: string },
): PragmaResult => {
  if (comment.type !== "CommentLine") return acc;
  return {
    hasTrace: acc.hasTrace || commentHasTrace(comment.value),
    hasDisable: acc.hasDisable || commentHasDisable(comment.value),
  };
};

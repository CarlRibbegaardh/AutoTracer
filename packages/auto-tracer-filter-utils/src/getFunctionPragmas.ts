import { accumulate } from "./accumulate.js";
import type { PragmaCommentHost } from "./PragmaCommentHost.js";
import type { PragmaResult } from "./PragmaResult.js";

/**
 * Scans the leading comments on `host` for `@trace` and `@trace-disable` pragmas.
 *
 * @remarks
 * - Only `CommentLine` nodes (i.e. `//` comments) are examined.  `CommentBlock`
 *   nodes (`/* … *\/` and TSDoc `/** … *\/`) are completely ignored.
 * - Token matching is exact: `@traceable` does **not** match `@trace`.
 * - Pragmas placed after a TSDoc block comment **are** detected, unlike the
 *   legacy local implementation that stopped scanning at the first block comment.
 *
 * @param host - An AST node or compatible shape that carries `leadingComments`.
 * @returns A {@link PragmaResult} with `hasTrace` and `hasDisable` flags.
 *
 * @pure
 */
export const getFunctionPragmas = (host: PragmaCommentHost): PragmaResult => {
  const empty: PragmaResult = { hasTrace: false, hasDisable: false };
  return (host.leadingComments ?? []).reduce(accumulate, empty);
};

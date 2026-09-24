import { isValidPragmaToken } from "./isValidPragmaToken.js";

/**
 * Returns `true` when a single CommentLine node's value contains the `@trace` pragma token.
 *
 * @remarks
 * The check also guards against the `@trace-disable` token: a comment whose
 * trimmed value starts with `@trace-disable` is rejected because the `-` character
 * is not a valid pragma boundary for `@trace`.  The guard is retained here as an
 * explicit safety measure in case token-boundary logic changes in the future.
 *
 * @param value - The raw string value of a single comment node (leading/trailing spaces allowed).
 * @returns `true` when the comment contains a valid `@trace` token.
 */
export const commentHasTrace = (value: string): boolean =>
  isValidPragmaToken(value, "@trace") && !isValidPragmaToken(value, "@trace-disable");

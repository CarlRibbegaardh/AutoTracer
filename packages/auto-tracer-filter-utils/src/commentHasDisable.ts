import { isValidPragmaToken } from "./isValidPragmaToken.js";

/**
 * Returns `true` when a single CommentLine node's value contains the `@trace-disable` pragma token.
 *
 * @param value - The raw string value of a single comment node (leading/trailing spaces allowed).
 * @returns `true` when the comment contains a valid `@trace-disable` token.
 */
export const commentHasDisable = (value: string): boolean =>
  isValidPragmaToken(value, "@trace-disable");

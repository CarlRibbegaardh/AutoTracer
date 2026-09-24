/**
 * Checks whether the trimmed comment text starts with `token` as an exact token.
 *
 * @remarks
 * A token match is valid when the character immediately following the token is:
 * - end-of-string
 * - a whitespace character (space or tab)
 * - a colon `:`
 *
 * This prevents near-miss strings such as `@traceable` matching `@trace`
 * or `@trace-disable-later` matching `@trace-disable`.
 *
 * @param text - The raw comment text to check (leading/trailing spaces are ignored).
 * @param token - The pragma token to look for (e.g. `"@trace"` or `"@trace-disable"`).
 * @returns `true` when `text` starts with `token` at an exact boundary.
 */
export const isValidPragmaToken = (text: string, token: string): boolean => {
  const trimmed = text.trim();
  if (!trimmed.startsWith(token)) return false;
  const nextChar = trimmed[token.length];
  return nextChar === undefined || nextChar === " " || nextChar === "\t" || nextChar === ":";
};

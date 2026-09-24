/**
 * Builds a message string where each line is prefixed with the provided indent
 * followed by the provided prefix.
 *
 * This is a pure formatting helper used to separate structural output (indentation)
 * from visual styling (color/prefix).
 *
 * @param indent - Indentation prefix to prepend to every line.
 * @param prefix - Text prefix to prepend after the indent.
 * @param message - Message to format.
 * @returns Message with indent and prefix applied to each line.
 */
export function buildIndentPrefixedMessage(
  indent: string,
  prefix: string,
  message: unknown
): string {
  const messageStr = String(message);

  return messageStr
    .split("\n")
    .map((line) => {return `${indent}${prefix} ${line}`})
    .join("\n");
}

/**
 * Builds a message string where each line is prefixed with the provided indent.
 *
 * This is a pure formatting helper used to separate structural output (indentation)
 * from visual styling (color/prefix).
 *
 * @param indent - Indentation prefix to prepend to every line.
 * @param message - Message to format.
 * @returns Message with indent applied to each line.
 */
export function buildIndentedMessage(indent: string, message: unknown): string {
  const messageStr = String(message);
  if (indent === "") {
    return messageStr;
  }

  return messageStr
    .split("\n")
    .map((line) => {return indent + line})
    .join("\n");
}

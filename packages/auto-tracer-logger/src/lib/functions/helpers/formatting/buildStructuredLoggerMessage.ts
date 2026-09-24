/**
 * Builds the logger's structural output message.
 *
 * This function applies structural formatting only:
 * - Text-mode indentation (depth markers) when provided via `indent`
 * - Optional logger name prefix
 * - Optional level prefix
 * - Per-line application for multiline messages
 *
 * Side effects: none.
 *
 * @param input - Structural message inputs
 * @returns A single message string with structural formatting applied
 */
export function buildStructuredLoggerMessage(input: {
  /** Depth marker indentation (e.g., "│  │  ") or empty string */
  readonly indent: string;

  /** Logger name */
  readonly name: string;

  /** Whether the logger name should be included */
  readonly showName: boolean;

  /** Level prefix (e.g., "[TRACE]") or empty string */
  readonly prefix: string;

  /** Message to format */
  readonly message: unknown;
}): string {
  const messageStr = input.message === undefined ? "" : String(input.message);
  const lines = messageStr.split("\n");

  const nameSegment =
    input.showName && input.name !== "" ? `[${input.name}] ` : "";
  const prefixSegment = input.prefix === "" ? "" : `${input.prefix} `;

  return lines
    .map((line) => {
      return `${input.indent}${nameSegment}${prefixSegment}${line}`;
    })
    .join("\n");
}

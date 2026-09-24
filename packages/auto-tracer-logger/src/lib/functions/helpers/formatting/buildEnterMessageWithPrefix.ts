/**
 * Builds an enter message by optionally prepending a prefix to the label.
 *
 * @param label - The label of the operation being entered.
 * @param enterPrefix - The prefix to prepend to the label. If empty, the label is returned as-is.
 * @returns The label with the prefix prepended, or just the label if prefix is empty.
 *
 * @remarks
 * This function follows a simple concatenation pattern: if a prefix is provided,
 * it prepends it with a space separator. If the prefix is empty, it returns the
 * label unchanged.
 *
 * @example
 * ```typescript
 * buildEnterMessageWithPrefix("myFunc", "→"); // "→ myFunc"
 * buildEnterMessageWithPrefix("myFunc", ""); // "myFunc"
 * ```
 */
export function buildEnterMessageWithPrefix(
  label: string,
  enterPrefix: string
): string {
  return enterPrefix ? `${enterPrefix} ${label}` : label;
}

/**
 * Calculates the indentation string for group/enter output in text mode.
 *
 * The indentation is based on the current groupStack depth, using "│  "
 * (pipe + 2 spaces) repeated by the depth.
 *
 * @param groupStack - The current group stack depth
 * @returns The indentation string
 */
export function calculateGroupIndent(groupStack: number): string {
  return "│  ".repeat(groupStack);
}

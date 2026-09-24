/**
 * Calculates the indentation string for exit output in text mode.
 *
 * The indentation is based on the current groupStack depth minus 1,
 * using "│  " (pipe + 2 spaces) repeated. Guards against negative values.
 *
 * Exit messages show at the depth they're closing (groupStack - 1) before
 * the stack is actually decremented.
 *
 * @param groupStack - The current group stack depth
 * @returns The indentation string
 */
export function calculateExitIndent(groupStack: number): string {
  return "│  ".repeat(groupStack > 0 ? groupStack - 1 : 0);
}

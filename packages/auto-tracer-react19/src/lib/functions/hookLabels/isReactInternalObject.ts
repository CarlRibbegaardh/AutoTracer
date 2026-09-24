/**
 * Detects if a value is a React internal object that would cause infinite recursion.
 * Checks for React symbols, fiber properties, and excessive depth.
 *
 * Pure function - deterministic output based on input structure.
 *
 * @param value - Value to check
 * @returns True if value is a React internal object
 */
export function isReactInternalObject(value: unknown): boolean {
  if (value === null || typeof value !== "object") {
    return false;
  }

  // Check for React symbols and fiber properties
  if (
    "$$typeof" in value ||
    "stateNode" in value ||
    "containerInfo" in value ||
    "tag" in value
  ) {
    return true;
  }

  // Try to stringify with depth limit to detect circular/deep structures
  try {
    let depth = 0;
    JSON.stringify(value, (_key, val) => {
      depth++;
      if (depth > 100) {
        throw new Error("Max depth exceeded");
      }
      return val;
    });
    return false;
  } catch {
    return true;
  }
}

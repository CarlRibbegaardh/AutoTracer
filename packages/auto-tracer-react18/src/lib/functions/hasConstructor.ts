/**
 * Type guard to check if a value has a constructor property.
 *
 * @param value - Value to check
 * @returns true if value has a constructor property with a name
 */
export function hasConstructor(
  value: object
): value is object & { constructor: { name: string } } {
  return (
    "constructor" in value &&
    value.constructor !== null &&
    typeof value.constructor === "function" &&
    "name" in value.constructor &&
    typeof (value.constructor as { name?: unknown }).name === "string"
  );
}

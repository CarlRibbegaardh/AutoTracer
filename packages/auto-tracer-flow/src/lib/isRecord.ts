/**
 * Checks whether a value is a non-null object.
 *
 * @param value - Unknown value.
 * @returns True when value is a record.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Validates an automatic-stop request limit without coercing or clamping it.
 *
 * @param value - Candidate automatic-stop request limit.
 * @returns The unchanged positive integer, or `undefined` when disabled.
 * @throws When the value is neither a positive integer nor `undefined`.
 */
export function validateAutoStopAfterRequests(
  value: unknown,
): number | undefined {
  if (value === undefined) return undefined;

  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value <= 0
  ) {
    throw new Error(
      "NetworkTracer: autoStopAfterRequests must be a positive integer or undefined",
    );
  }

  return value;
}

/**
 * Validates a body capture limit without coercing or clamping it.
 *
 * @param value - Candidate body capture limit.
 * @returns The unchanged positive integer.
 * @throws When the value is not a positive integer.
 */
export function validateBodyCaptureLimit(value: unknown): number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value <= 0
  ) {
    throw new Error(
      "NetworkTracer: bodyCaptureLimit must be a positive integer",
    );
  }

  return value;
}

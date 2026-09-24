import { isRedactionNameMatched } from "./isRedactionNameMatched.js";

/**
 * Creates an immutable JSON snapshot with matching field values redacted.
 *
 * @param value - Parsed JSON value to snapshot.
 * @param patterns - Case-insensitive field-name patterns to redact.
 * @returns A cloned JSON value with matching fields replaced by `[REDACTED]`.
 */
export function redactJsonFields(
  value: unknown,
  patterns: readonly string[],
): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => {return redactJsonFields(item, patterns)});
  }

  if (typeof value !== "object" || value === null) return value;

  const snapshot: Record<string, unknown> = {};
  for (const [name, nestedValue] of Object.entries(value)) {
    snapshot[name] = isRedactionNameMatched(name, patterns)
      ? "[REDACTED]"
      : redactJsonFields(nestedValue, patterns);
  }

  return snapshot;
}

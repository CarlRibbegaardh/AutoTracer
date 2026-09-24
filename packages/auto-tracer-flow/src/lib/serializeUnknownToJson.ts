/**
 * Serializes an unknown JavaScript value to stable JSON text for copy/paste output.
 *
 * Uses the repo-standard `safe-stable-stringify` configuration for deterministic
 * key ordering and safe handling of cycles.
 *
 * This is intended for copy/paste console output mode where values must be
 * represented as stable text.
 *
 * Notes:
 * - Cycles are represented as the JSON string value `"[Circular]"`.
 * - `undefined`, functions, and symbols are not representable in JSON; they are
 *   omitted from objects and represented as `null` in arrays.
 * - `Error` is normalized to an object containing `name`, `message`, and `stack`.
 * - `Map` is normalized to an array-of-entries representation.
 * - `Set` is normalized to an array of values.
 * - `BigInt` is normalized to a string like `"123n"`.
 *
 * @param value - The value to serialize.
 * @returns A JSON string representation.
 */
import safeStringify from "safe-stable-stringify";

const stableJsonStringify = safeStringify.configure({
  circularValue: "[Circular]",
  maximumDepth: 10,
  maximumBreadth: 50,
});

export function serializeUnknownToJson(value: unknown): string {
  /**
   * Normalizes special runtime types to JSON-compatible shapes.
   *
   * The replacement happens via a replacer so it applies at any depth.
   *
   * @param _key - JSON key (unused).
   * @param v - Candidate value.
   * @returns A JSON-compatible replacement.
   */
  function toJsonCompatible(_key: string, v: unknown): unknown {
    if (typeof v === "bigint") return `${v}n`;

    if (v instanceof Error) {
      return {
        name: v.name,
        message: v.message,
        stack: v.stack ?? null,
      };
    }

    if (v instanceof Map) return Array.from(v.entries());
    if (v instanceof Set) return Array.from(v.values());

    return v;
  }

  try {
    const result = stableJsonStringify(value, toJsonCompatible);
    return result ?? '"[Unserializable]"';
  } catch {
    return '"[Unserializable]"';
  }
}

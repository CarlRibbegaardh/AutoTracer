import safeStringify from "safe-stable-stringify";
import { cloneStructuredSnapshot } from "./cloneStructuredSnapshot.js";

/**
 * Formats a detached detail value for the selected shared output mode.
 *
 * @param value - Detail value to detach or serialize.
 * @param outputMode - Shared AutoTracer output mode.
 * @returns An expandable clone or stable copy-paste representation.
 */
export function formatDetailValueForOutputMode(
  value: unknown,
  outputMode: "devtools" | "copy-paste",
): unknown {
  if (typeof value !== "object" || value === null) {
    return value;
  }

  if (outputMode === "devtools") {
    return cloneStructuredSnapshot(value);
  }

  const stringify = safeStringify.configure({
    circularValue: "[Circular]",
    maximumDepth: 10,
    maximumBreadth: 50,
  });

  /**
   * Converts non-JSON platform values without exposing error stacks.
   *
   * @param _key - Current property name.
   * @param candidate - Current value.
   * @returns A JSON-compatible value.
   */
  function toJsonCompatible(_key: string, candidate: unknown): unknown {
    if (typeof candidate === "bigint") return `${candidate}n`;
    if (candidate instanceof Error) {
      return { name: candidate.name, message: candidate.message };
    }
    if (candidate instanceof Map) return Array.from(candidate.entries());
    if (candidate instanceof Set) return Array.from(candidate.values());
    return candidate;
  }

  try {
    return stringify(value, toJsonCompatible) ?? '"[Unserializable]"';
  } catch {
    return '"[Unserializable]"';
  }
}

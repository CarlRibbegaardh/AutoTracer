/**
 * @file Pure function to create a label entry with normalization.
 */

import { normalizeValue } from "../normalization/normalizeValue.js";
import { classifyObjectProperties } from "../classifyObjectProperties.js";
import type { LabelEntry } from "./LabelEntry.js";

/**
 * Creates a label entry with computed normalization and metadata.
 * This is a pure function that does not mutate input or global state.
 *
 * @param label - The friendly name for the hook
 * @param index - Build-time ordinal position
 * @param value - Original hook value
 * @param prevValue - Optional previous value from prior render
 * @returns A complete label entry with computed fields
 */
export function createLabelEntry(
  label: string,
  index: number,
  value: unknown,
  prevValue?: unknown
): LabelEntry {
  // Compute metadata from original value (before normalization preserves function detection)
  const metadataOriginal = classifyObjectProperties(value);

  // Apply Structural Comparison Normalization for matching
  const normalizedValue = normalizeValue(value);

  return {
    label,
    index,
    value, // Keep original for display (function identity preserved)
    prevValue, // Store previous value for ref-based matching
    normalizedValue, // Store normalized for comparison
    propertyMetadata: metadataOriginal ?? undefined,
  };
}

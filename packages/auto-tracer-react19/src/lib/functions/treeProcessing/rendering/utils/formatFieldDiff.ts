import type { FieldDiff } from "./computeObjectFieldDiff.js";
import { stringifyForDisplay } from "../../../stringifyForDisplay.js";

/**
 * Format a value for diff display (shortened for readability).
 *
 * @param value - The value to format
 * @returns Formatted string
 */
function formatDiffValue(value: unknown): string {
  if (value === undefined) {
    return "undefined";
  }
  if (value === null) {
    return "null";
  }

  const str = stringifyForDisplay(value);

  // Truncate long values for readability
  if (str.length > 80) {
    return `${str.slice(0, 77)}...`;
  }

  return str;
}

/**
 * Per-status formatters. Ensures exhaustive handling when the status union changes.
 */
const statusFormatters: Record<FieldDiff["status"], (diff: FieldDiff) => string> = {
  changed: (diff) => {return `~ ${diff.name}: ${formatDiffValue(diff.prevValue)} → ${formatDiffValue(diff.currentValue)}`},
  added: (diff) => {return `+ ${diff.name}: ${formatDiffValue(diff.currentValue)}`},
  removed: (diff) => {return `- ${diff.name}: ${formatDiffValue(diff.prevValue)}`},
  unchanged: (diff) => {return `  ${diff.name}: (unchanged)`},
  reference: (diff) => {return `≈ ${diff.name}: (same content, new reference)`},
} as const;

/**
 * Format a single field diff for console output.
 *
 * @param diff - The field difference to format
 * @returns Formatted string for console display
 */
function formatSingleFieldDiff(diff: FieldDiff): string {
  return statusFormatters[diff.status](diff);
}

/**
 * Build the summary parts array (e.g. `["1 changed", "3 reference-only"]`).
 *
 * @param diffs - Array of field differences
 * @returns Array of summary part strings
 */
function buildSummaryParts(diffs: FieldDiff[]): string[] {
  const parts: string[] = [];
  const changedCount = diffs.filter((d) => { return d.status === "changed" }).length;
  const addedCount = diffs.filter((d) => { return d.status === "added" }).length;
  const removedCount = diffs.filter((d) => { return d.status === "removed" }).length;
  const referenceCount = diffs.filter((d) => { return d.status === "reference" }).length;
  if (changedCount > 0) parts.push(`${changedCount} changed`);
  if (addedCount > 0) parts.push(`${addedCount} added`);
  if (removedCount > 0) parts.push(`${removedCount} removed`);
  if (referenceCount > 0) parts.push(`${referenceCount} reference-only`);
  return parts;
}

/**
 * Format the summary header line.
 *
 * @param diffs - Array of field differences
 * @param prefix - Indentation prefix
 * @returns Single-element array with the summary line, or empty array
 */
function formatSummaryLine(diffs: FieldDiff[], prefix: string): string[] {
  const parts = buildSummaryParts(diffs);
  if (parts.length === 0) return [];
  return [`${prefix}  Fields: ${parts.join(", ")}:`];
}

/**
 * Format individual lines for changed, added, and removed entries.
 * Excludes reference-only and unchanged entries.
 *
 * @param diffs - Array of field differences
 * @param prefix - Indentation prefix
 * @returns Array of formatted change lines
 */
function formatChangedLines(diffs: FieldDiff[], prefix: string): string[] {
  return diffs
    .filter((d) => { return d.status !== "reference" && d.status !== "unchanged" })
    .map((d) => { return `${prefix}    ${formatSingleFieldDiff(d)}` });
}

/**
 * Format reference-only entries as a single collapsed group line.
 *
 * @param diffs - Array of field differences
 * @param prefix - Indentation prefix
 * @returns Single-element array with the group line, or empty array
 */
function formatReferenceGroup(diffs: FieldDiff[], prefix: string): string[] {
  const refs = diffs.filter((d) => { return d.status === "reference" });
  if (refs.length === 0) return [];
  const names = refs.map((d) => { return d.name }).join(", ");
  return [`${prefix}    ≈ ${names} (same content, new reference)`];
}

/**
 * Format field-level differences for console output.
 * Creates a summary line, individual change lines for genuine diffs,
 * and a single collapsed group line for reference-only entries.
 *
 * @param diffs - Array of field differences
 * @param prefix - Indentation prefix
 * @returns Array of formatted log lines
 */
export function formatFieldDiff(
  diffs: FieldDiff[],
  prefix: string
): string[] {
  if (!diffs || diffs.length === 0) {
    return [];
  }

  return [
    ...formatSummaryLine(diffs, prefix),
    ...formatChangedLines(diffs, prefix),
    ...formatReferenceGroup(diffs, prefix),
  ];
}

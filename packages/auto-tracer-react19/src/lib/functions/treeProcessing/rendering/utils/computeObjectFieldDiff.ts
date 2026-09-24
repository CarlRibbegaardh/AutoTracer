/**
 * Represents a field change in an object diff.
 */
export interface FieldDiff {
  /** Field name */
  name: string;
  /**
   * Field status:
   * - `'changed'`: Different content
   * - `'unchanged'`: Same reference (only included when `showUnchanged` is true)
   * - `'added'`: Not present in before
   * - `'removed'`: Not present in after
   * - `'reference'`: Different reference but identical serialized content
   */
  status: "changed" | "unchanged" | "added" | "removed" | "reference";
  /** Previous value (undefined for 'added') */
  prevValue?: unknown;
  /** Current value (undefined for 'removed') */
  currentValue?: unknown;
}

/**
 * Configuration for object diff computation.
 */
export interface DiffConfig {
  /** Maximum number of fields to show (default: 20) */
  maxFields?: number;
  /** Maximum depth to traverse for nested objects (default: 1) */
  maxDepth?: number;
  /** Whether to show unchanged fields (default: false) */
  showUnchanged?: boolean;
}

/**
 * Checks whether two already-snapshotted values are content-equal via JSON serialization.
 * Intended for use on values already processed by `snapshotValue`, where functions
 * have been replaced with `(fn:ID)` strings and circular references are resolved.
 */
function isContentEqual(a: unknown, b: unknown): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

/**
 * Classifies a field that exists in both before and after.
 * Returns null when value is unchanged and `showUnchanged` is false.
 */
function classifyExistingField(
  key: string,
  prevValue: unknown,
  currentValue: unknown,
  showUnchanged: boolean
): FieldDiff | null {
  if (prevValue === currentValue) {
    if (!showUnchanged) return null;
    return { name: key, status: "unchanged", prevValue, currentValue };
  }
  if (isContentEqual(prevValue, currentValue)) {
    return { name: key, status: "reference", prevValue, currentValue };
  }
  return { name: key, status: "changed", prevValue, currentValue };
}

/**
 * Builds a diff entry for a single object key.
 */
function processObjectKey(
  key: string,
  beforeObj: Record<string, unknown>,
  afterObj: Record<string, unknown>,
  showUnchanged: boolean
): FieldDiff | null {
  if (!(key in beforeObj)) {
    return { name: key, status: "added", currentValue: afterObj[key] };
  }
  if (!(key in afterObj)) {
    return { name: key, status: "removed", prevValue: beforeObj[key] };
  }
  return classifyExistingField(key, beforeObj[key], afterObj[key], showUnchanged);
}

/**
 * Returns true if `diffs` contains at least one actionable (non-unchanged) entry.
 */
function hasUsefulDiffs(diffs: FieldDiff[]): boolean {
  return diffs.length > 0 && !diffs.every((d) => { return d.status === "unchanged" });
}

/**
 * Checks whether a value is a plain (non-array) object.
 */
function isPlainObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

/**
 * Builds a diff for a plain object (3–50 fields).
 */
function buildObjectDiff(
  beforeObj: Record<string, unknown>,
  afterObj: Record<string, unknown>,
  config: DiffConfig
): FieldDiff[] | null {
  const { maxFields = 20, showUnchanged = false } = config;
  const keys = new Set([...Object.keys(beforeObj), ...Object.keys(afterObj)]);
  if (keys.size < 3 || keys.size > 50) return null;

  const diffs = [...keys]
    .slice(0, maxFields)
    .map((key) => { return processObjectKey(key, beforeObj, afterObj, showUnchanged) })
    .filter((d): d is FieldDiff => { return d !== null });

  return hasUsefulDiffs(diffs) ? diffs : null;
}

/**
 * Classifies a single array element at `index`.
 */
function classifyArrayElement(
  index: number,
  before: unknown[],
  after: unknown[]
): FieldDiff | null {
  const key = `[${index}]`;
  if (index >= before.length) {
    return { name: key, status: "added", currentValue: after[index] };
  }
  if (index >= after.length) {
    return { name: key, status: "removed", prevValue: before[index] };
  }
  return classifyExistingField(key, before[index], after[index], false);
}

/**
 * Builds a diff for an array (1–50 elements).
 */
function buildArrayDiff(
  before: unknown[],
  after: unknown[],
  maxFields: number
): FieldDiff[] | null {
  const len = Math.max(before.length, after.length);
  if (len < 1 || len > 50) return null;

  const indices = Array.from({ length: Math.min(len, maxFields) }, (_, i) => {return i});
  const diffs = indices
    .map((i) => { return classifyArrayElement(i, before, after) })
    .filter((d): d is FieldDiff => { return d !== null });

  return diffs.length > 0 ? diffs : null;
}

/**
 * Compute field-level differences between two objects or arrays.
 *
 * For plain objects: only processes objects with 3–50 fields.
 * For arrays: processes arrays with 1–50 elements.
 *
 * Fields/elements that are different references but have identical serialized content
 * are classified as `'reference'` rather than `'changed'`, so callers can present
 * them separately from genuine content changes.
 *
 * @param before - Previous value
 * @param after - Current value
 * @param config - Configuration options
 * @returns Array of field differences, or null if diff should be skipped
 */
export function computeObjectFieldDiff(
  before: unknown,
  after: unknown,
  config: DiffConfig = {}
): FieldDiff[] | null {
  if (Array.isArray(before) && Array.isArray(after)) {
    return buildArrayDiff(before, after, config.maxFields ?? 20);
  }
  if (!isPlainObject(before) || !isPlainObject(after)) {
    return null;
  }
  return buildObjectDiff(before, after, config);
}

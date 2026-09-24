/**
 * @file Deep Structural Normalization for Stringify Performance
 *
 * Recursively normalizes values by replacing ALL functions at ALL nesting levels
 * with a placeholder token. This enables calling safeStringify without a replacer,
 * eliminating the catastrophic performance issue where replacer callbacks cause
 * 6+ second delays and application crashes.
 *
 * **Problem**: Passing functionReplacer to safeStringify causes deep recursion
 * in the library's internal stringifyFnReplacer mechanism, resulting in:
 * - 6+ seconds of blocking time per render
 * - Out-of-memory crashes (Chrome white screen)
 * - Application becomes unusable
 *
 * **Solution**: Pre-process the entire value tree ONCE, replacing all functions
 * at all levels, then call safeStringify(normalized) with NO replacer.
 *
 * **Normalization Type**: Structural Comparison Normalization (Deep Variant)
 * - Functions → `"(fn)"` at ALL nesting levels
 * - Purpose: Enable safe stringify without replacer callbacks
 * - Trade-off: Loses function instance information (same as shallow normalizeValue)
 *
 * @see {@link normalizeValue} for shallow (one-level) normalization
 * @see stringify-replacer-analysis.md for performance profiling evidence
 */

import { internalLogger } from "@logger/internalLogger.js";
import { checkCircularReference } from "./helpers/checkCircularReference.js";
import { checkDepthLimit } from "./helpers/checkDepthLimit.js";
import { checkNodeLimit } from "./helpers/checkNodeLimit.js";
import { fingerprintDOMObject } from "./fingerprinting/fingerprintDOMObject.js";
import { fingerprintFiberNode } from "./fingerprinting/fingerprintFiberNode.js";
import { fingerprintReactElement } from "./fingerprinting/fingerprintReactElement.js";
import { FUNCTION_PLACEHOLDER } from "./normalizeValue.js";

/**
 * Deeply normalizes a value for structural comparison.
 *
 * Unlike normalizeValue (which only normalizes one level), this function
 * recursively traverses nested objects and arrays, replacing ALL functions
 * at ALL levels with the placeholder token.
 *
 * This enables stringify to work WITHOUT a replacer, eliminating the
 * performance overhead and memory exhaustion from replacer callbacks.
 *
 * **Performance impact**:
 * - Before: 6+ seconds in stringifyFnReplacer per render, application crashes
 * - After: Near-zero overhead (single normalization pass, no replacer callbacks)
 *
 * **Performance Limits**: To prevent hanging on extremely large objects:
 * - Maximum depth: 10 levels
 * - Maximum nodes processed: 1000
 *
 * **Normalization Type**: Structural Comparison Normalization (Deep)
 * - All function instances → `"(fn)"` at all nesting levels
 * - Same as normalizeValue but recursive
 *
 * **Circular References**: Automatically detected and stopped to prevent stack overflow.
 * The original circular object reference is passed through (safe-stable-stringify
 * will handle it via `circularValue` option).
 *
 * **Special Objects** (Date, RegExp, Error, etc.): Passed through unchanged.
 * These have `.toJSON()` methods or special serialization, so safe-stable-stringify
 * handles them correctly.
 *
 * @param value - Value to normalize (may be deeply nested)
 * @param visited - Internal: tracks visited objects to detect circular references
 * @param depth - Internal: current recursion depth
 * @param nodeCount - Internal: tracks total nodes processed
 * @returns Normalized value with all functions replaced at all levels
 *
 * @example
 * ```typescript
 * const nested = {
 *   shallow: () => {},
 *   deep: {
 *     deeper: {
 *       fn: () => {}
 *     }
 *   }
 * };
 *
 * normalizeValueDeep(nested)
 * // → {
 * //     shallow: "(fn)",
 * //     deep: {
 * //       deeper: {
 * //         fn: "(fn)"
 * //       }
 * //     }
 * //   }
 * ```
 *
 * @see {@link normalizeValue} for shallow normalization (one level only)
 */
export function normalizeValueDeep(
  value: unknown,
  visited: WeakSet<object> = new WeakSet(),
  depth: number = 0,
  nodeCount: { count: number } = { count: 0 }
): unknown {
  internalLogger.trace("normalizeValueDeep", value, depth, nodeCount);

  // Check depth limit
  const depthCheck = checkDepthLimit(depth);
  if (depthCheck !== null) {
    return depthCheck;
  }

  // Check node count limit
  nodeCount.count++;
  const nodeCheck = checkNodeLimit(nodeCount);
  if (nodeCheck !== null) {
    return nodeCheck;
  }

  // Handle functions FIRST (before object check, since functions are objects in JS)
  if (typeof value === "function") {
    return FUNCTION_PLACEHOLDER;
  }

  // Handle primitives and null
  if (typeof value !== "object" || value === null) {
    return value;
  }

  // Check circular references
  const circularCheck = checkCircularReference(value, visited);
  if (circularCheck !== null) {
    return circularCheck;
  }

  // Check React element fingerprint
  const reactElementCheck = fingerprintReactElement(value);
  if (reactElementCheck !== null) {
    return reactElementCheck;
  }

  // Check Fiber node fingerprint
  const fiberCheck = fingerprintFiberNode(value);
  if (fiberCheck !== null) {
    return fiberCheck;
  }

  // Check DOM object fingerprint
  const domCheck = fingerprintDOMObject(value);
  if (domCheck !== null) {
    return domCheck;
  }

  // Special objects (Date, RegExp, Error, etc.) that passed DOM check
  // Check if it has a non-standard prototype
  const proto = Object.getPrototypeOf(value);
  if (
    proto !== Object.prototype &&
    proto !== Array.prototype &&
    proto !== null
  ) {
    // Not a DOM object (already checked), so must be a safe special object
    // Pass through unchanged - safe-stable-stringify will serialize them natively
    return value;
  }

  // Mark as visited BEFORE recursing (prevents infinite loops)
  visited.add(value);

  // Handle arrays - recursively normalize elements
  if (Array.isArray(value)) {
    return value.map((item) => {
      return normalizeValueDeep(item, visited, depth + 1, nodeCount);
    });
  }

  // Handle plain objects - recursively normalize properties
  const normalized: Record<string, unknown> = {};

  // Use for-of with keys instead of Object.entries to avoid potential getter issues
  const keys = Object.keys(value);
  for (const key of keys) {
    // Wrap property access in try-catch to handle getters that might throw or hang
    try {
      const val = (value as Record<string, unknown>)[key];
      normalized[key] = normalizeValueDeep(val, visited, depth + 1, nodeCount);
    } catch {
      // If accessing the property fails, use a placeholder
      normalized[key] = "[Error]";
    }
  }
  return normalized;
}

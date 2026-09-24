/**
 * @file Deep Normalization with Function Identity Tracking
 *
 * Recursively normalizes values by replacing ALL functions at ALL nesting levels
 * with unique identity strings `(fn:N)`. This enables calling safeStringify without
 * a replacer while preserving function instance information.
 *
 * **Difference from normalizeValueDeep:**
 * - `normalizeValueDeep` → all functions become `"(fn)"` (structural comparison)
 * - `normalizeValueDeepWithIDs` → functions become `"(fn:1)"`, `"(fn:2)"` etc (instance tracking)
 *
 * @see {@link normalizeValueDeep} for structural comparison (all functions equivalent)
 */

import { internalLogger } from "@logger/internalLogger.js";
import { checkCircularReference } from "./helpers/checkCircularReference.js";
import { checkDepthLimit } from "./helpers/checkDepthLimit.js";
import { checkNodeLimit } from "./helpers/checkNodeLimit.js";
import { fingerprintDOMObject } from "./fingerprinting/fingerprintDOMObject.js";
import { fingerprintFiberNode } from "./fingerprinting/fingerprintFiberNode.js";
import { fingerprintReactElement } from "./fingerprinting/fingerprintReactElement.js";
import { getFunctionId } from "../getFunctionId.js";

/**
 * Deeply normalizes a value with function instance ID tracking.
 *
 * Recursively traverses nested objects and arrays, replacing ALL functions
 * at ALL levels with unique identity strings like `"(fn:1)"`, `"(fn:2)"`.
 *
 * This enables stringify to work WITHOUT a replacer (eliminating the 6+ second
 * performance issue) while still preserving function instance distinctness.
 *
 * **Performance Limits**: To prevent hanging on extremely large objects:
 * - Maximum depth: 10 levels
 * - Maximum nodes processed: 1000
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
 * @returns Normalized value with all functions replaced by identity strings
 *
 * @example
 * ```typescript
 * const fn1 = () => {};
 * const fn2 = () => {};
 * const nested = {
 *   handler: fn1,
 *   deep: {
 *     callback: fn2,
 *     another: fn1  // Same function as handler
 *   }
 * };
 *
 * normalizeValueDeepWithIDs(nested)
 * // Returns:
 * // {
 * //   handler: "(fn:1)",
 * //   deep: {
 * //     callback: "(fn:2)",
 * //     another: "(fn:1)"
 * //   }
 * // }
 * ```
 *
 * @see {@link normalizeValueDeep} for structural comparison (all `(fn)`)
 * @see {@link getFunctionId} for function identity tracking
 */
export function normalizeValueDeepWithIDs(
  value: unknown,
  visited: WeakSet<object> = new WeakSet(),
  depth: number = 0,
  nodeCount: { count: number } = { count: 0 }
): unknown {
  const h = internalLogger.enter(
    "normalizeValueDeepWithIDs",
    value,
    depth,
    nodeCount
  );
  try {
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
      const id = getFunctionId(value);
      return `(fn:${id})`;
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
      const result = value.map((item) => {
        return normalizeValueDeepWithIDs(item, visited, depth + 1, nodeCount);
      });
      return result;
    }

    // Handle plain objects - recursively normalize properties
    const normalized: Record<string, unknown> = {};

    // Use for-of with keys instead of Object.entries to avoid potential getter issues
    const keys = Object.keys(value);
    for (const key of keys) {
      // Wrap property access in try-catch to handle getters that might throw or hang
      try {
        const val = (value as Record<string, unknown>)[key];
        normalized[key] = normalizeValueDeepWithIDs(
          val,
          visited,
          depth + 1,
          nodeCount
        );
      } catch {
        // If accessing the property fails, use a placeholder
        normalized[key] = "[Error]";
      }
    }
    return normalized;
  } finally {
    internalLogger.exit(h);
  }
}

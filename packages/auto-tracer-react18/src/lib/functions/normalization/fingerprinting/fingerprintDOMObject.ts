/**
 * @file DOM Object Fingerprinting
 *
 * Detects DOM/browser objects and returns a fingerprint string to prevent
 * deep traversal of massive object graphs and circular references.
 */

/**
 * Fingerprints DOM and browser objects to prevent deep traversal.
 *
 * DOM objects (Elements, Nodes, Window, Document) have:
 * - Massive object graphs (DOM trees)
 * - Circular references (HTMLElement.__reactFiber$.stateNode → HTMLElement)
 * - Non-serializable native objects
 *
 * This function detects them by checking prototype chain and constructor name.
 * Safe special objects (Date, RegExp, Error) are NOT fingerprinted - they have
 * proper .toJSON() methods and can be safely serialized.
 *
 * @param value - Value to check for DOM object structure
 * @returns `[${ConstructorName}]` if the value is a DOM object, null otherwise
 *
 * @example
 * ```typescript
 * const div = document.createElement('div');
 * fingerprintDOMObject(div); // → "[HTMLDivElement]"
 *
 * const date = new Date();
 * fingerprintDOMObject(date); // → null (safe to serialize)
 *
 * const plainObj = { a: 1 };
 * fingerprintDOMObject(plainObj); // → null
 * ```
 */
export function fingerprintDOMObject(value: unknown): string | null {
  // Not an object - can't be a DOM object
  if (typeof value !== "object" || value === null) {
    return null;
  }

  // Check if it has a non-standard prototype (not plain Object or Array)
  const proto = Object.getPrototypeOf(value);
  if (
    proto === Object.prototype ||
    proto === Array.prototype ||
    proto === null
  ) {
    return null;
  }

  const constructorName = value.constructor?.name || "Object";

  // Check for DOM/browser objects that can have circular references
  const isDOMOrBrowserObject =
    (typeof Element !== "undefined" && value instanceof Element) ||
    (typeof HTMLElement !== "undefined" && value instanceof HTMLElement) ||
    (typeof Node !== "undefined" && value instanceof Node) ||
    constructorName.includes("HTML") ||
    constructorName.includes("Element") ||
    constructorName === "Window" ||
    constructorName === "Document";

  if (isDOMOrBrowserObject) {
    return `[${constructorName}]`;
  }

  // Not a DOM object (might be Date, RegExp, Error, etc. which are safe)
  return null;
}

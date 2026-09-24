/**
 * @file React Fiber Node Fingerprinting
 *
 * Detects React Fiber nodes (internal React data structures) and returns
 * a fingerprint string to prevent deep traversal of massive circular graphs.
 */

/**
 * Fingerprints React Fiber nodes to prevent deep traversal.
 *
 * React Fiber nodes are plain objects (Object.prototype) with specific
 * properties that form massive circular object graphs (fiber.child.return → fiber).
 * This function detects them by checking for a numeric `tag` property plus
 * React-specific properties and tree structure.
 *
 * Detection requires:
 * - `tag` property (number)
 * - At least 2 React-specific properties: `stateNode`, `alternate`, `elementType`, `memoizedProps`, `memoizedState`
 * - Tree structure: `return` AND `child` properties
 *
 * This prevents false positives from generic tree structures or linked lists.
 *
 * @param value - Value to check for Fiber node structure
 * @returns "[FiberNode]" if the value is a Fiber node, null otherwise
 *
 * @example
 * ```typescript
 * const fiber = {
 *   tag: 5,
 *   stateNode: {},
 *   alternate: null,
 *   return: null,
 *   child: null,
 *   memoizedProps: {}
 * };
 * fingerprintFiberNode(fiber); // → "[FiberNode]"
 *
 * const notFiber = { tag: 0, child: null, sibling: null };
 * fingerprintFiberNode(notFiber); // → null (missing React-specific properties)
 * ```
 */
export function fingerprintFiberNode(value: unknown): string | null {
  // Not an object - can't be a Fiber node
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const valueAsAny = value as Record<string, unknown>;

  // Must have numeric tag property
  if (typeof valueAsAny.tag !== "number") {
    return null;
  }

  // Check for React-specific properties
  const hasStateNode = "stateNode" in valueAsAny;
  const hasAlternate = "alternate" in valueAsAny;
  const hasElementType = "elementType" in valueAsAny;
  const hasMemoizedProps = "memoizedProps" in valueAsAny;
  const hasMemoizedState = "memoizedState" in valueAsAny;
  const hasReturn = "return" in valueAsAny;
  const hasChild = "child" in valueAsAny;

  // Count React-specific properties (not generic tree properties)
  let reactSpecificCount = 0;
  if (hasStateNode) reactSpecificCount++;
  if (hasAlternate) reactSpecificCount++;
  if (hasElementType) reactSpecificCount++;
  if (hasMemoizedProps) reactSpecificCount++;
  if (hasMemoizedState) reactSpecificCount++;

  // Require at least 2 React-specific properties + the generic tree structure
  const hasTreeStructure = hasReturn && hasChild;
  if (reactSpecificCount >= 2 && hasTreeStructure) {
    return "[FiberNode]";
  }

  return null;
}

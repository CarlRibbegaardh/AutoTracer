import { getComponentName } from "./getComponentName.js";
import type { FiberNode } from "../interfaces/FiberNode.js";

/**
 * Extracts the real component name from a Fiber node, handling forwardRef and memo wrappers.
 *
 * @param fiberNode - The React Fiber node to extract the component name from.
 * @returns The component name as a string, or "Unknown" if it cannot be determined.
 */
export function getRealComponentName(fiberNode: FiberNode): string {
  // Check if this is a forwardRef component
  const typeWithRender = fiberNode.type as {
    render?: { name?: string };
    type?: { name?: string };
  } | undefined;

  if (typeWithRender?.render?.name) {
    return typeWithRender.render.name;
  }

  // Check if this is a memo component
  if (typeWithRender?.type && typeof typeWithRender.type === "function") {
    const func = typeWithRender.type as { name?: string };
    return func.name || "Unknown";
  }

  // Regular component
  const elementType = fiberNode.elementType || fiberNode.type;
  return getComponentName(elementType) || "Unknown";
}

import type { FiberNode, Hook } from "../../interfaces/FiberNode.js";
import { getTrackedGUIDsSet } from "./getTrackedGUIDsSet.js";

/**
 * Get the tracking GUID for a fiber if it was registered as having rendered this cycle.
 * Searches the fiber's memoizedState for a useRef with our GUID.
 * @returns The GUID string if tracked, null if not tracked
 */
export function getTrackingGUID(fiberNode: FiberNode): string | null {
  // Walk the hooks chain to find our tracking ref
  let hook = fiberNode.memoizedState as Hook; // Note: All fields are optional except memoizedState but it's any...

  while (hook) {
    const hookState = hook.memoizedState;

    // Check if this is a ref hook with our GUID pattern
    if (
      hookState &&
      typeof hookState === "object" &&
      "current" in hookState &&
      typeof (hookState as { current: unknown }).current === "string"
    ) {
      const refValue = (hookState as { current: string }).current;

      // Check if this ref contains one of our tracked GUIDs
      if (
        refValue.startsWith("render-track-") &&
        getTrackedGUIDsSet().has(refValue)
      ) {
        return refValue;
      }
    }

    hook = hook.next as Hook; // Note: All fields are optional except memoizedState but it's any...
  }

  return null;
}

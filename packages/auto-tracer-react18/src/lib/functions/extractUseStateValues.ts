import type { FiberNode, Hook } from "../interfaces/FiberNode.js";
import type { StateValue } from "../interfaces/StateValue.js";
import { logWarn } from "./log.js";

const MAX_HOOK_CHAIN_DEPTH = 50 as const;

export function extractUseStateValues(fiberNode: FiberNode): Array<StateValue> {
  const stateValues: Array<StateValue> = [];

  try {
    // Validate fiber node structure
    if (!fiberNode || typeof fiberNode !== "object") {
      return stateValues;
    }

    // const fiberNodeTyped = fiberNode as {
    //   memoizedState?: Record<string, unknown>;
    //   alternate?: Record<string, unknown>;
    // };

    // Get current and previous state chains
    let currentHook = fiberNode.memoizedState as Hook | null;
    let prevHook = fiberNode.alternate?.memoizedState;
    let hookIndex = 0;

    // Walk through the hook chain to find useState hooks
    while (currentHook && hookIndex < MAX_HOOK_CHAIN_DEPTH) {
      const typedHook = currentHook as Hook;
      const typedPrevHook = prevHook as Hook | null;

      // useState hooks have a queue for updates (memoizedState can be undefined)
      if (typedHook.queue) {
        const currentValue = typedHook.memoizedState;
        const prevValue = typedPrevHook?.memoizedState;

        // Try to extract a meaningful name by looking at the fiber string
        // const hookName = extractHookNameFromFiber(
        //   fiberNode,
        //   currentValue,
        //   hookIndex
        // );
        // Name states by their global hook position to match test expectations
        const hookName = `state${hookIndex}`;

        stateValues.push({
          name: hookName,
          value: currentValue,
          prevValue: prevValue,
          hook: typedHook as {
            memoizedState: unknown;
            queue: unknown;
            next: unknown;
          },
        });
      }

      // Move to next hook
      currentHook = typedHook.next;
      prevHook = typedPrevHook?.next;
      hookIndex++;
    }
  } catch (error) {
    // Handle errors in fiber traversal - React internals may change
    logWarn("ReactTracer: Error extracting useState values:", error);
  }

  return stateValues;
}

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildTreeNode } from "../../../../../src/lib/functions/treeProcessing/building/buildTreeNode";
import type { Hook } from "../../../../../src/lib/functions/hookMapping/types";
import { traceOptions } from "../../../../../src/lib/types/globalState";
import type { ReactTracerOptions } from "../../../../../src/lib/interfaces/ReactTracerOptions";
import type { FiberNode } from "../../../../../src/lib/interfaces/FiberNode";
import { REACTTRACER_STATE_MARKER } from "../../../../../src/lib/types/marker";
import {
  addLabelForGuid,
  clearAllHookLabels,
} from "../../../../../src/lib/functions/hookLabels";
import {
  clearRenderRegistry,
  registerTrackedGUID,
} from "../../../../../src/lib/functions/renderRegistry";

/**
 * Integration tests for useState label resolution in buildTreeNode.
 *
 * These tests verify that:
 * 1. useState hooks get their proper variable names resolved
 * 2. Hook anchor matching works correctly
 * 3. Both mount and update scenarios are handled
 *
 * These tests should FAIL initially, proving the bug exists at integration level
 * before we fix it in the E2E tests.
 */

describe("buildTreeNode - useState label resolution integration", () => {
  beforeEach(() => {
    // Reset to default settings
    Object.assign(traceOptions, {
      filterEmptyNodes: "none",
      includeReconciled: "never" as const,
      includeSkipped: "never" as const,
      internalLogLevel: "error",
      includeNonTrackedBranches: true,
      detectIdenticalValueChanges: false,
    } satisfies Partial<ReactTracerOptions>);
  });

  afterEach(() => {
    // Clean up label registry and render tracking after each test
    clearAllHookLabels();
    clearRenderRegistry();
  });

  /**
   * Helper to create a tracking ref hook
   */
  function createTrackingRefHook(guid: string): Hook {
    return {
      memoizedState: { current: guid },
      baseState: { current: guid },
      baseQueue: null,
      queue: null,
      next: null,
    };
  }

  /**
   * Helper to create a useState hook in the hook chain
   */
  function createUseStateHook(value: unknown, prevValue?: unknown): Hook {
    return {
      memoizedState: value,
      baseState: prevValue ?? value,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null as unknown as (action: unknown) => void,
        lastRenderedReducer: null as unknown as (
          state: unknown,
          action: unknown
        ) => unknown,
        lastRenderedState: prevValue ?? value,
      },
      next: null,
    };
  }

  /**
   * Helper to chain hooks together
   */
  function chainHooks(hooks: Hook[]): Hook | null {
    if (hooks.length === 0) {
      return null;
    }

    for (let i = 0; i < hooks.length - 1; i++) {
      hooks[i]!.next = hooks[i + 1]!;
    }

    return hooks[0]!;
  }

  /**
   * Helper to create a minimal fiber with useState hooks
   */
  function createFiberWithUseState(
    componentName: string,
    hooks: Hook[],
    trackingGUID: string | null = null,
    alternate?: FiberNode | null
  ) {
    // If trackingGUID provided, prepend a ref hook
    const allHooks = trackingGUID
      ? [createTrackingRefHook(trackingGUID), ...hooks]
      : hooks;

    const memoizedState = chainHooks(allHooks);

    const hookTypes = trackingGUID
      ? ["useRef", ...hooks.map(() => {return "useState"})]
      : hooks.map(() => {return "useState"});

    return {
      elementType: { name: componentName },
      type: { name: componentName },
      alternate: alternate ?? null,
      flags: 1, // Has some work (Update flag)
      memoizedProps: {},
      pendingProps: {},
      memoizedState,
      _debugHookTypes: hookTypes,
    };
  }

  describe("Single useState hook", () => {
    it("should resolve useState variable name on update", () => {
      // Create a component with one useState hook: const [title, setTitle] = useState("")
      const titleHook = createUseStateHook("Hello", "");
      const guid = "render-track-test-component-guid";
      registerTrackedGUID(guid);

      // Create previous fiber (for alternate)
      const prevTitleHook = createUseStateHook("");
      const alternateFiber = createFiberWithUseState(
        "AddTodoForm",
        [prevTitleHook],
        guid
      );

      // Create current fiber with updated state
      const currentFiber = createFiberWithUseState(
        "AddTodoForm",
        [titleHook],
        guid,
        alternateFiber
      );

      // Register the label as the Babel plugin would do
      // The label is registered with the NEW value after state change
      addLabelForGuid(guid, {
        label: "title",
        index: 0,
        value: "Hello",
      });

      const treeNode = buildTreeNode(currentFiber, 0);

      // Debug: Log what we got
      console.log("State changes:", treeNode.stateChanges);
      if (treeNode.stateChanges[0]) {
        console.log("First state change name:", treeNode.stateChanges[0].name);
        console.log(
          "First state change value:",
          treeNode.stateChanges[0].value
        );
        console.log("First state change hook:", treeNode.stateChanges[0].hook);
      }

      // Now this should pass with the label registered
      expect(treeNode.stateChanges).toHaveLength(1);
      expect(treeNode.stateChanges[0]?.name).toBe("title");
      expect(treeNode.stateChanges[0]?.value).toBe("Hello");
      expect(treeNode.stateChanges[0]?.prevValue).toBe("");
    });

    it("should resolve useState variable name when value changes", () => {
      // Create a component with loading state: const [loading, setLoading] = useState(false)
      const loadingHook = createUseStateHook(true, false);
      const guid = "render-track-todolist-guid";
      registerTrackedGUID(guid);

      const prevLoadingHook = createUseStateHook(false);
      const alternateFiber = createFiberWithUseState(
        "TodoList",
        [prevLoadingHook],
        guid
      );

      const currentFiber = createFiberWithUseState(
        "TodoList",
        [loadingHook],
        guid,
        alternateFiber
      );

      // Register the label with the NEW value
      addLabelForGuid(guid, {
        label: "loading",
        index: 0,
        value: true,
      });

      const treeNode = buildTreeNode(currentFiber, 0);

      // Should pass with label registered
      expect(treeNode.stateChanges).toHaveLength(1);
      expect(treeNode.stateChanges[0]?.name).toBe("loading");
      expect(treeNode.stateChanges[0]?.value).toBe(true);
      expect(treeNode.stateChanges[0]?.prevValue).toBe(false);
    });

    it("should keep the explicit label on the first hybrid update after mount", () => {
      const previousTrackedStateResolution = traceOptions.trackedStateResolution;
      traceOptions.trackedStateResolution = "hybrid";

      try {
        const guid = "render-track-first-hybrid-update-guid";
        registerTrackedGUID(guid);

        const mountedFiber = createFiberWithUseState(
          "Counter",
          [createUseStateHook(1)],
          guid
        );

        addLabelForGuid(guid, {
          label: "count",
          index: 0,
          value: 1,
        });

        const mountNode = buildTreeNode(mountedFiber, 0);
        expect(mountNode.stateChanges[0]?.name).toBe("count");

        clearAllHookLabels();
        addLabelForGuid(guid, {
          label: "count",
          index: 0,
          value: 2,
        });

        const updateFiber = createFiberWithUseState(
          "Counter",
          [createUseStateHook(2, 1)],
          guid,
          mountedFiber
        );

        const updateNode = buildTreeNode(updateFiber, 0);

        expect(updateNode.stateChanges).toHaveLength(1);
        expect(updateNode.stateChanges[0]?.name).toBe("count");
        expect(updateNode.stateChanges[0]?.name).not.toBe("unknown");
        expect(updateNode.stateChanges[0]?.prevValue).toBe(1);
        expect(updateNode.stateChanges[0]?.value).toBe(2);
      } finally {
        traceOptions.trackedStateResolution = previousTrackedStateResolution;
      }
    });
  });

  describe("Multiple useState hooks", () => {
    it("should resolve duplicate primitive updates without falling back to unknown", () => {
      const previousTrackedStateResolution = traceOptions.trackedStateResolution;
      traceOptions.trackedStateResolution = "hybrid";

      try {
        const guid = "render-track-seat-reservation-guid";
        registerTrackedGUID(guid);

        const alternateFiber = createFiberWithUseState(
          "SeatReservationTracePage",
          [
            createUseStateHook(4),
            createUseStateHook(4),
            createUseStateHook(false),
            createUseStateHook(0),
          ],
          guid
        );

        const currentFiber = createFiberWithUseState(
          "SeatReservationTracePage",
          [
            createUseStateHook(5, 4),
            createUseStateHook(5, 4),
            createUseStateHook(false, false),
            createUseStateHook(0, 0),
          ],
          guid,
          alternateFiber
        );

        addLabelForGuid(guid, {
          label: "confirmedSeats",
          index: 0,
          value: 5,
        });
        addLabelForGuid(guid, {
          label: "draftSeats",
          index: 1,
          value: 5,
        });
        addLabelForGuid(guid, {
          label: "isDraftBlank",
          index: 2,
          value: false,
        });
        addLabelForGuid(guid, {
          label: "editorRevision",
          index: 3,
          value: 0,
        });

        const treeNode = buildTreeNode(currentFiber, 0);
        const stateChangeNames = treeNode.stateChanges.map((change) => {
          return change.name;
        });

        expect(treeNode.stateChanges).toHaveLength(2);
        expect(stateChangeNames).toStrictEqual([
          "confirmedSeats",
          "draftSeats",
        ]);
      } finally {
        traceOptions.trackedStateResolution = previousTrackedStateResolution;
      }
    });

    it("should resolve duplicate primitive updates when the ReactTracer marker state precedes user hooks", () => {
      const previousTrackedStateResolution = traceOptions.trackedStateResolution;
      traceOptions.trackedStateResolution = "hybrid";

      const createFiberWithTracerMarker = (
        componentName: string,
        hooks: Hook[],
        trackingGUID: string,
        alternate?: FiberNode | null
      ) => {
        return createFiberWithUseState(
          componentName,
          [createUseStateHook(REACTTRACER_STATE_MARKER), ...hooks],
          trackingGUID,
          alternate
        );
      };

      try {
        const guid = "render-track-seat-reservation-marker-guid";
        registerTrackedGUID(guid);

        const alternateFiber = createFiberWithTracerMarker(
          "SeatReservationTracePage",
          [
            createUseStateHook(4),
            createUseStateHook(4),
            createUseStateHook(false),
            createUseStateHook(0),
          ],
          guid
        );

        const currentFiber = createFiberWithTracerMarker(
          "SeatReservationTracePage",
          [
            createUseStateHook(5, 4),
            createUseStateHook(5, 4),
            createUseStateHook(false, false),
            createUseStateHook(0, 0),
          ],
          guid,
          alternateFiber
        );

        addLabelForGuid(guid, {
          label: "confirmedSeats",
          index: 0,
          value: 5,
        });
        addLabelForGuid(guid, {
          label: "draftSeats",
          index: 1,
          value: 5,
        });
        addLabelForGuid(guid, {
          label: "isDraftBlank",
          index: 2,
          value: false,
        });
        addLabelForGuid(guid, {
          label: "editorRevision",
          index: 3,
          value: 0,
        });

        const treeNode = buildTreeNode(currentFiber, 0);
        const stateChangeNames = treeNode.stateChanges.map((change) => {
          return change.name;
        });

        expect(treeNode.stateChanges).toHaveLength(2);
        expect(stateChangeNames).toStrictEqual([
          "confirmedSeats",
          "draftSeats",
        ]);
      } finally {
        traceOptions.trackedStateResolution = previousTrackedStateResolution;
      }
    });

    it("should resolve multiple useState variable names correctly", () => {
      // Component with two useState hooks:
      // const [title, setTitle] = useState("")
      // const [description, setDescription] = useState("")

      const titleHook = createUseStateHook("Hello", "");
      const descriptionHook = createUseStateHook("World", "");
      const guid = "render-track-form-guid";
      registerTrackedGUID(guid);

      const prevTitleHook = createUseStateHook("");
      const prevDescriptionHook = createUseStateHook("");
      const alternateFiber = createFiberWithUseState(
        "AddTodoForm",
        [prevTitleHook, prevDescriptionHook],
        guid
      );

      const currentFiber = createFiberWithUseState(
        "AddTodoForm",
        [titleHook, descriptionHook],
        guid,
        alternateFiber
      );

      // Register both labels with their NEW values
      addLabelForGuid(guid, {
        label: "title",
        index: 0,
        value: "Hello",
      });
      addLabelForGuid(guid, {
        label: "description",
        index: 1,
        value: "World",
      });

      const treeNode = buildTreeNode(currentFiber, 0);

      // Should pass with labels registered
      expect(treeNode.stateChanges).toHaveLength(2);

      // First hook should be "title"
      expect(treeNode.stateChanges[0]?.name).toBe("title");
      expect(treeNode.stateChanges[0]?.value).toBe("Hello");
      expect(treeNode.stateChanges[0]?.prevValue).toBe("");

      // Second hook should be "description"
      expect(treeNode.stateChanges[1]?.name).toBe("description");
      expect(treeNode.stateChanges[1]?.value).toBe("World");
      expect(treeNode.stateChanges[1]?.prevValue).toBe("");
    });

    it("should handle mixed hooks (only one changing)", () => {
      // Two useState hooks, but only one changes
      const titleHook = createUseStateHook("Hello", "");
      const descriptionHook = createUseStateHook("", ""); // Unchanged
      const guid = "render-track-form-guid-2";
      registerTrackedGUID(guid);

      const prevTitleHook = createUseStateHook("");
      const prevDescriptionHook = createUseStateHook("");
      const alternateFiber = createFiberWithUseState(
        "AddTodoForm",
        [prevTitleHook, prevDescriptionHook],
        guid
      );

      const currentFiber = createFiberWithUseState(
        "AddTodoForm",
        [titleHook, descriptionHook],
        guid,
        alternateFiber
      );

      // Register both labels even though only one changes
      addLabelForGuid(guid, {
        label: "title",
        index: 0,
        value: "Hello",
      });
      addLabelForGuid(guid, {
        label: "description",
        index: 1,
        value: "",
      });

      const treeNode = buildTreeNode(currentFiber, 0);

      // Only one state change (title changed, description didn't)
      expect(treeNode.stateChanges).toHaveLength(1);
      expect(treeNode.stateChanges[0]?.name).toBe("title");
      expect(treeNode.stateChanges[0]?.value).toBe("Hello");
    });
  });

  describe("Mount scenario", () => {
    it("should handle initial mount with useState", () => {
      // On mount, there's no alternate fiber
      const titleHook = createUseStateHook("");
      const guid = "render-track-form-guid-mount";
      registerTrackedGUID(guid);

      const currentFiber = createFiberWithUseState(
        "AddTodoForm",
        [titleHook],
        guid,
        null // No alternate on mount
      );

      // Remove alternate flag to simulate mount
      delete (currentFiber as { alternate?: FiberNode | null }).alternate;

      const treeNode = buildTreeNode(currentFiber, 0);

      // On mount, we surface initial state entries (prevValue is undefined)
      expect(treeNode.renderType).toBe("Mount");
      expect(treeNode.stateChanges).toHaveLength(1);
      expect(treeNode.stateChanges[0]?.prevValue).toBeUndefined();
    });
  });

  describe("Hook chain integrity", () => {
    it("should maintain hook chain references correctly", () => {
      // This test verifies that the hook references from extractUseStateValues
      // are the SAME objects as those from findStatefulHookAnchors
      // This is critical for indexOf to work

      const hook1 = createUseStateHook("value1", "prev1");
      const hook2 = createUseStateHook("value2", "prev2");
      const hook3 = createUseStateHook("value3", "prev3");
      const guid = "render-track-test-guid-chain";
      registerTrackedGUID(guid);

      const prevHook1 = createUseStateHook("prev1");
      const prevHook2 = createUseStateHook("prev2");
      const prevHook3 = createUseStateHook("prev3");

      const alternateFiber = createFiberWithUseState(
        "TestComponent",
        [prevHook1, prevHook2, prevHook3],
        guid
      );

      const currentFiber = createFiberWithUseState(
        "TestComponent",
        [hook1, hook2, hook3],
        guid,
        alternateFiber
      );

      const treeNode = buildTreeNode(currentFiber, 0);

      // All three hooks changed
      expect(treeNode.stateChanges).toHaveLength(3);

      // Each should have a unique name (even if it's "unknown")
      // The key is that we should be able to resolve them at all
      expect(treeNode.stateChanges[0]?.hook).toBe(hook1);
      expect(treeNode.stateChanges[1]?.hook).toBe(hook2);
      expect(treeNode.stateChanges[2]?.hook).toBe(hook3);
    });
  });
});

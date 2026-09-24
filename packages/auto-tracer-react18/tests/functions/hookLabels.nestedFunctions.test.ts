import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addLabelForGuid, clearAllHookLabels, resolveHookLabel } from "../../src/lib/functions/hookLabels";

/**
 * Tests for label resolution with nested objects containing functions.
 *
 * The critical scenario: When a label is registered with a nested object
 * containing functions, and then we try to match it in a later render where
 * the function instances have changed.
 *
 * Current behavior with shallow normalization + stringify with IDs:
 * - Registration: normalizedValue has nested functions as actual function objects
 * - Comparison: stringify assigns different IDs to different function instances
 * - Result: MISMATCH even though structures are identical
 *
 * Expected behavior with deep structural normalization:
 * - All functions at all levels → "(fn)"
 * - Same structure with different function instances → MATCH
 */
describe("hookLabels - nested objects with functions", () => {
  beforeEach(() => {
    clearAllHookLabels();
  });

  afterEach(() => {
    clearAllHookLabels();
  });

  describe("simple nested object (1 level deep)", () => {
    it("should match when nested function instances change", () => {
      const guid = "test-nested-simple";

      // First render - register label with nested function
      const fn1 = () => {return "handler1"};
      const registeredValue = {
        config: {
          endpoint: "/api/data",
          fetch: fn1,
        },
      };

      addLabelForGuid(guid, {
        label: "apiConfig",
        index: 0,
        value: registeredValue,
      });

      // Second render - same structure, different function instance
      const fn2 = () => {
        return "handler2";
      };
      const currentValue = {
        config: {
          endpoint: "/api/data",
          fetch: fn2,  // DIFFERENT instance
        },
      };

      const allFiberAnchors = [{ index: 0, value: currentValue }];

      const resolved = resolveHookLabel(0, currentValue, { guid, allAnchors: allFiberAnchors });

      // Should match despite different function instance
      expect(resolved).toBe("apiConfig");
    });

    it("should match when nested primitive value changes (structural identity)", () => {
      const guid = "test-nested-value-change";

      const fn = () => {};
      addLabelForGuid(guid, {
        label: "config",
        index: 0,
        value: {
          settings: { theme: "dark", update: fn },
        },
      });

      const currentValue = {
        settings: { theme: "light", update: fn },  // theme changed but structure same
      };

      const allFiberAnchors = [{ index: 0, value: currentValue }];

      const resolved = resolveHookLabel(0, currentValue, { guid, allAnchors: allFiberAnchors });

      // SHOULD match because structure (keys) is identical - system uses structural identity
      expect(resolved).toBe("config");
    });
  });

  describe("deeply nested objects (2+ levels)", () => {
    it("should match when deeply nested function instances change", () => {
      const guid = "test-deeply-nested";

      const fn1 = () => {};
      const fn2 = () => {};
      const registeredValue = {
        user: {
          profile: {
            name: "John",
            update: fn1,
          },
          settings: {
            theme: "dark",
            save: fn2,
          },
        },
      };

      addLabelForGuid(guid, {
        label: "userState",
        index: 0,
        value: registeredValue,
      });

      // Next render - same structure, completely different function instances
      const fn3 = () => {};
      const fn4 = () => {};
      const currentValue = {
        user: {
          profile: {
            name: "John",
            update: fn3,  // DIFFERENT
          },
          settings: {
            theme: "dark",
            save: fn4,  // DIFFERENT
          },
        },
      };

      const allFiberAnchors = [{ index: 0, value: currentValue }];

      const resolved = resolveHookLabel(0, currentValue, { guid, allAnchors: allFiberAnchors });

      // Should match despite all function instances being different
      expect(resolved).toBe("userState");
    });

    it("should match when deeply nested primitive changes (structural identity)", () => {
      const guid = "test-deep-value-change";

      const fn = () => {};
      addLabelForGuid(guid, {
        label: "state",
        index: 0,
        value: {
          level1: {
            level2: {
              value: "original",
              handler: fn,
            },
          },
        },
      });

      const currentValue = {
        level1: {
          level2: {
            value: "changed",  // value changed but structure same
            handler: fn,
          },
        },
      };

      const allFiberAnchors = [{ index: 0, value: currentValue }];

      const resolved = resolveHookLabel(0, currentValue, { guid, allAnchors: allFiberAnchors });

      // SHOULD match because structure (nested keys) is identical - structural identity
      expect(resolved).toBe("state");
    });
  });

  describe("mixed: functions at multiple nesting levels", () => {
    it("should match when functions at all levels change instances", () => {
      const guid = "test-mixed-levels";

      const fn1 = () => {};
      const fn2 = () => {};
      const fn3 = () => {};
      const registeredValue = {
        topLevelHandler: fn1,
        nested: {
          middleHandler: fn2,
          deep: {
            deepHandler: fn3,
            value: "test",
          },
        },
      };

      addLabelForGuid(guid, {
        label: "mixedState",
        index: 0,
        value: registeredValue,
      });

      // Next render - all new function instances
      const fn4 = () => {};
      const fn5 = () => {};
      const fn6 = () => {};
      const currentValue = {
        topLevelHandler: fn4,  // NEW
        nested: {
          middleHandler: fn5,  // NEW
          deep: {
            deepHandler: fn6,  // NEW
            value: "test",
          },
        },
      };

      const allFiberAnchors = [{ index: 0, value: currentValue }];

      const resolved = resolveHookLabel(0, currentValue, { guid, allAnchors: allFiberAnchors });

      // Should match - functions at all levels are structurally equivalent
      expect(resolved).toBe("mixedState");
    });
  });

  describe("arrays with nested functions", () => {
    it("should match when array contains objects with function instances that change", () => {
      const guid = "test-array-nested";

      const fn1 = () => {};
      const fn2 = () => {};
      const registeredValue = {
        handlers: [
          { id: 1, callback: fn1 },
          { id: 2, callback: fn2 },
        ],
      };

      addLabelForGuid(guid, {
        label: "handlerList",
        index: 0,
        value: registeredValue,
      });

      const fn3 = () => {};
      const fn4 = () => {};
      const currentValue = {
        handlers: [
          { id: 1, callback: fn3 },  // DIFFERENT instance
          { id: 2, callback: fn4 },  // DIFFERENT instance
        ],
      };

      const allFiberAnchors = [{ index: 0, value: currentValue }];

      const resolved = resolveHookLabel(0, currentValue, { guid, allAnchors: allFiberAnchors });

      // Should match - array structure and values identical, only function instances differ
      expect(resolved).toBe("handlerList");
    });
  });

  describe("real-world scenario: Redux-style state", () => {
    it("should match Redux-like state object across renders", () => {
      const guid = "test-redux-style";

      // Initial render
      const dispatch1 = () => {};
      const subscribe1 = () => {};
      const getState1 = () => {};

      const registeredValue = {
        state: {
          user: { id: 123, name: "Alice" },
          ui: { theme: "dark", sidebar: "collapsed" },
        },
        actions: {
          dispatch: dispatch1,
          subscribe: subscribe1,
          getState: getState1,
        },
      };

      addLabelForGuid(guid, {
        label: "reduxStore",
        index: 0,
        value: registeredValue,
      });

      // Next render - React recreates the actions object with new function instances
      const dispatch2 = () => {};
      const subscribe2 = () => {};
      const getState2 = () => {};

      const currentValue = {
        state: {
          user: { id: 123, name: "Alice" },
          ui: { theme: "dark", sidebar: "collapsed" },
        },
        actions: {
          dispatch: dispatch2,  // NEW instance
          subscribe: subscribe2,  // NEW instance
          getState: getState2,  // NEW instance
        },
      };

      const allFiberAnchors = [{ index: 0, value: currentValue }];

      const resolved = resolveHookLabel(0, currentValue, { guid, allAnchors: allFiberAnchors });

      // Should match - state structure identical, function instances changed
      expect(resolved).toBe("reduxStore");
    });

    it("should match when nested state value changes (structural identity)", () => {
      const guid = "test-redux-state-change";

      const dispatch = () => {};
      addLabelForGuid(guid, {
        label: "store",
        index: 0,
        value: {
          state: { count: 5 },
          actions: { dispatch },
        },
      });

      const currentValue = {
        state: { count: 6 },  // count changed but structure same
        actions: { dispatch },
      };

      const allFiberAnchors = [{ index: 0, value: currentValue }];

      const resolved = resolveHookLabel(0, currentValue, { guid, allAnchors: allFiberAnchors });

      // SHOULD match because structure is identical - known limitation for data-heavy hooks
      expect(resolved).toBe("store");
    });
  });

  describe("edge case: circular references with nested functions", () => {
    it("should handle circular refs without crashing", () => {
      const guid = "test-circular-nested";

      const fn = () => {
        /* no-op */
      };
      interface NestedValue {
        config: {
          fetch: () => void;
        };
        data?: { value: string; update: () => void };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        self?: any;
      }

      const registeredValue: NestedValue = {
        config: { fetch: fn },
        data: { value: "test", update: fn },
      };
      registeredValue.self = registeredValue;  // circular

      addLabelForGuid(guid, {
        label: "circular",
        index: 0,
        value: registeredValue,
      });

      const fn2 = () => {
        /* no-op */
      };
      const currentValue: NestedValue = {
        config: { fetch: fn2 },
        data: { value: "test", update: fn2 },
      };
      currentValue.self = currentValue;  // circular

      const allFiberAnchors = [{ index: 0, value: currentValue }];

      // Should not crash
      const resolved = resolveHookLabel(0, currentValue, { guid, allAnchors: allFiberAnchors });

      // May or may not match depending on circular handling, but should not crash
      expect(resolved).toMatch(/circular|unknown/);
    });
  });
});

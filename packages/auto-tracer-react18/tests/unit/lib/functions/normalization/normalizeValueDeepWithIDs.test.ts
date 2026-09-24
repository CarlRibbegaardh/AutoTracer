/**
 * @file Tests for normalizeValueDeepWithIDs
 * Focus: Ensuring React elements and Fiber nodes are fingerprinted without deep traversal
 */

import { describe, expect, it } from "vitest";
import { normalizeValueDeepWithIDs } from "../../../../../src/lib/functions/normalization/normalizeValueDeepWithIDs";

describe("normalizeValueDeepWithIDs", () => {
  describe("React element handling", () => {
    it("should fingerprint React element without deep traversal", () => {
      // Create a mock React element (object with $$typeof: Symbol(react.element))
      const reactElement = {
        $$typeof: Symbol.for("react.element"),
        type: "div",
        props: {
          children: "Hello",
          onClick: () => {
            /* click handler */
          },
        },
        key: null,
        ref: null,
        _owner: null,
        _store: {},
      };

      const result = normalizeValueDeepWithIDs(reactElement);

      // Should return fingerprint, not attempt to traverse the object
      expect(result).toBe("[ReactElement]");
    });

    it("should fingerprint nested React elements without deep traversal", () => {
      const parent = {
        name: "Parent",
        child: {
          $$typeof: Symbol.for("react.element"),
          type: "span",
          props: {
            nested: {
              deeply: {
                nested: {
                  value: "should not traverse this far",
                },
              },
            },
          },
        },
      };

      const result = normalizeValueDeepWithIDs(parent);

      expect(result).toEqual({
        name: "Parent",
        child: "[ReactElement]",
      });
    });
  });

  describe("Fiber node handling", () => {
    it("should fingerprint Fiber node without deep traversal", () => {
      // Create a mock Fiber node with typical Fiber properties
      const fiberNode = {
        tag: 5,
        type: "div",
        stateNode: {},
        return: null,
        child: null,
        sibling: null,
        alternate: null,
        memoizedProps: {},
        memoizedState: null,
        pendingProps: {},
        _debugOwner: null,
        _debugSource: null,
      };

      const result = normalizeValueDeepWithIDs(fiberNode);

      // Should return fingerprint, not attempt to traverse the massive Fiber tree
      expect(result).toBe("[FiberNode]");
    });

    it("should fingerprint nested Fiber nodes without deep traversal", () => {
      const container = {
        data: "some data",
        fiber: {
          tag: 3,
          stateNode: {},
          return: null,
          child: null,
          alternate: null,
          memoizedProps: {},
        },
      };

      const result = normalizeValueDeepWithIDs(container);

      expect(result).toEqual({
        data: "some data",
        fiber: "[FiberNode]",
      });
    });
  });

  describe("Normal object handling (baseline)", () => {
    it("should recursively normalize plain objects", () => {
      const nested = {
        handler: () => {},
        deep: {
          callback: () => {},
          value: 42,
        },
      };

      const result = normalizeValueDeepWithIDs(nested);

      // Functions should be replaced with IDs, structure preserved
      expect(result).toEqual({
        handler: expect.stringMatching(/^\(fn:\d+\)$/),
        deep: {
          callback: expect.stringMatching(/^\(fn:\d+\)$/),
          value: 42,
        },
      });
    });
  });
});

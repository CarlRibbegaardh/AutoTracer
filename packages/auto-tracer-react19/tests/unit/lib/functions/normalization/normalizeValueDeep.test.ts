/**
 * @file Tests for normalizeValueDeep safeguards
 */

import { describe, expect, it } from "vitest";
import { normalizeValueDeep } from "../../../../../src/lib/functions/normalization/normalizeValueDeep";

describe("normalizeValueDeep", () => {
  describe("React element handling", () => {
    it("should fingerprint React element without deep traversal", () => {
      // Create a mock React element
      const reactElement = {
        $$typeof: Symbol.for("react.element"),
        type: "div",
        props: {
          children: "Hello",
          nested: {
            deep: {
              veryDeep: "Should not traverse this",
            },
          },
        },
      };

      const result = normalizeValueDeep(reactElement);

      // Should return fingerprint, not attempt to traverse the massive prop tree
      expect(result).toBe("[ReactElement]");
    });

    it("should fingerprint nested React elements without deep traversal", () => {
      const container = {
        data: "some data",
        element: {
          $$typeof: Symbol.for("react.element"),
          type: "span",
          props: { text: "test" },
        },
      };

      const result = normalizeValueDeep(container);

      expect(result).toEqual({
        data: "some data",
        element: "[ReactElement]",
      });
    });
  });

  describe("Fiber node handling", () => {
    it("should fingerprint Fiber node without deep traversal", () => {
      // Mock a React Fiber node structure (simplified but realistic)
      const fiberNode = {
        tag: 5, // HostComponent
        type: "div",
        stateNode: {}, // DOM node reference
        return: null, // Parent fiber
        child: null, // First child fiber
        sibling: null, // Next sibling fiber
        alternate: null, // Alternate fiber for double buffering
        elementType: "div",
        memoizedProps: {},
        memoizedState: null,
        pendingProps: {},
        _debugOwner: null,
        _debugSource: null,
      };

      const result = normalizeValueDeep(fiberNode);

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

      const result = normalizeValueDeep(container);

      expect(result).toEqual({
        data: "some data",
        fiber: "[FiberNode]",
      });
    });
  });

  describe("Depth limit", () => {
    it("should stop recursion at maximum depth", () => {
      // Create a deeply nested object (15 levels)
      let deep: Record<string, unknown> = { value: "bottom" };
      for (let i = 0; i < 15; i++) {
        deep = { nested: deep };
      }

      const result = normalizeValueDeep(deep);

      // With MAX_DEPTH = 10 and depth > MAX_DEPTH check:
      // Depth 0-10 process normally (11 levels)
      // Depth 11+ returns [MaxDepth]
      // Navigate to depth 9, check nested (depth 10) has nested (depth 11) that is [MaxDepth]
      let current: unknown = result;
      for (let i = 0; i < 9; i++) {
        expect(current).toHaveProperty("nested");
        current = (current as Record<string, unknown>).nested;
      }
      // Current is now at depth 9
      expect(current).toHaveProperty("nested");
      const depth10 = (current as Record<string, unknown>).nested;
      expect(depth10).toHaveProperty("nested");
      const depth11 = (depth10 as Record<string, unknown>).nested;
      expect(depth11).toBe("[MaxDepth]");
    });
  });

  describe("Node count limit", () => {
    it("should stop processing after maximum nodes", () => {
      // Create an object with 1100 nodes (exceeds MAX_NODES = 1000)
      const largeObject: Record<string, unknown> = {};
      for (let i = 0; i < 1100; i++) {
        largeObject[`key${i}`] = { value: i };
      }

      const result = normalizeValueDeep(largeObject);

      // Should have stopped processing and some values should be [MaxNodes]
      const resultObj = result as Record<string, unknown>;
      const values = Object.values(resultObj);
      const hasMaxNodesMarker = values.some((v) => {
        return v === "[MaxNodes]";
      });
      expect(hasMaxNodesMarker).toBe(true);
    });
  });

  describe("DOM object fingerprinting", () => {
    it("should fingerprint DOM-like objects", () => {
      const domLikeObject = {
        nodeType: 1,
        constructor: { name: "HTMLDivElement" },
      };

      // Create a mock with proper prototype
      Object.setPrototypeOf(domLikeObject, {
        constructor: { name: "HTMLDivElement" },
      });

      const result = normalizeValueDeep(domLikeObject);

      // Should fingerprint DOM objects
      expect(result).toBe("[HTMLDivElement]");
    });
  });

  describe("Normal object handling (baseline)", () => {
    it("should recursively normalize plain objects", () => {
      const obj = {
        a: 1,
        b: {
          c: 2,
          d: {
            e: 3,
          },
        },
      };

      const result = normalizeValueDeep(obj);

      expect(result).toEqual({
        a: 1,
        b: {
          c: 2,
          d: {
            e: 3,
          },
        },
      });
    });
  });
});

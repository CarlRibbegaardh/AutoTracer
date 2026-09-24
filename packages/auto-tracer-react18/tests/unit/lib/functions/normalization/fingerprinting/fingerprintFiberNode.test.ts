/**
 * @file Tests for fingerprintFiberNode
 */

import { describe, expect, it } from "vitest";
import { fingerprintFiberNode } from "../../../../../../src/lib/functions/normalization/fingerprinting/fingerprintFiberNode";

describe("fingerprintFiberNode", () => {
  it("should return '[FiberNode]' for valid Fiber node", () => {
    const fiber = {
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

    const result = fingerprintFiberNode(fiber);

    expect(result).toBe("[FiberNode]");
  });

  it("should return '[FiberNode]' for minimal Fiber node", () => {
    const fiber = {
      tag: 3,
      stateNode: {},
      alternate: null,
      return: null,
      child: null,
      memoizedProps: {},
    };

    const result = fingerprintFiberNode(fiber);

    expect(result).toBe("[FiberNode]");
  });

  it("should return null for object without tag", () => {
    const notFiber = {
      stateNode: {},
      return: null,
      child: null,
    };

    const result = fingerprintFiberNode(notFiber);

    expect(result).toBeNull();
  });

  it("should return null for object with non-numeric tag", () => {
    const notFiber = {
      tag: "5",
      stateNode: {},
      return: null,
      child: null,
    };

    const result = fingerprintFiberNode(notFiber);

    expect(result).toBeNull();
  });

  it("should return null for object with tag but missing React-specific properties", () => {
    const notFiber = {
      tag: 0,
      return: null,
      child: null,
      sibling: null,
    };

    const result = fingerprintFiberNode(notFiber);

    expect(result).toBeNull();
  });

  it("should return null for object with tag and only 1 React-specific property", () => {
    const notFiber = {
      tag: 0,
      stateNode: {},
      return: null,
      child: null,
    };

    const result = fingerprintFiberNode(notFiber);

    expect(result).toBeNull();
  });

  it("should return null for object with tag and React properties but missing tree structure", () => {
    const notFiber = {
      tag: 5,
      stateNode: {},
      alternate: null,
      memoizedProps: {},
      // Missing return and child
    };

    const result = fingerprintFiberNode(notFiber);

    expect(result).toBeNull();
  });

  it("should return null for primitives", () => {
    expect(fingerprintFiberNode("string")).toBeNull();
    expect(fingerprintFiberNode(42)).toBeNull();
    expect(fingerprintFiberNode(true)).toBeNull();
    expect(fingerprintFiberNode(null)).toBeNull();
    expect(fingerprintFiberNode(undefined)).toBeNull();
  });

  it("should return null for arrays", () => {
    const result = fingerprintFiberNode([1, 2, 3]);

    expect(result).toBeNull();
  });

  it("should return null for plain objects", () => {
    const result = fingerprintFiberNode({ a: 1, b: 2 });

    expect(result).toBeNull();
  });
});

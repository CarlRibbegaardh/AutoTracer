/**
 * @file Tests for normalization helper functions
 */

import { describe, expect, it } from "vitest";
import { checkCircularReference } from "../../../../../../src/lib/functions/normalization/helpers/checkCircularReference";
import {
  MAX_DEPTH,
  checkDepthLimit,
} from "../../../../../../src/lib/functions/normalization/helpers/checkDepthLimit";
import {
  MAX_NODES,
  type NodeCount,
  checkNodeLimit,
} from "../../../../../../src/lib/functions/normalization/helpers/checkNodeLimit";

describe("checkDepthLimit", () => {
  it("should return null when depth is below limit", () => {
    expect(checkDepthLimit(0)).toBeNull();
    expect(checkDepthLimit(5)).toBeNull();
    expect(checkDepthLimit(9)).toBeNull();
  });

  it("should return null when depth equals MAX_DEPTH", () => {
    expect(checkDepthLimit(MAX_DEPTH)).toBeNull();
  });

  it("should return '[MaxDepth]' when depth exceeds limit", () => {
    expect(checkDepthLimit(MAX_DEPTH + 1)).toBe("[MaxDepth]");
    expect(checkDepthLimit(MAX_DEPTH + 10)).toBe("[MaxDepth]");
    expect(checkDepthLimit(100)).toBe("[MaxDepth]");
  });
});

describe("checkNodeLimit", () => {
  it("should return null when node count is below limit", () => {
    expect(checkNodeLimit({ count: 0 })).toBeNull();
    expect(checkNodeLimit({ count: 500 })).toBeNull();
    expect(checkNodeLimit({ count: 999 })).toBeNull();
  });

  it("should return null when node count equals MAX_NODES", () => {
    expect(checkNodeLimit({ count: MAX_NODES })).toBeNull();
  });

  it("should return '[MaxNodes]' when node count exceeds limit", () => {
    expect(checkNodeLimit({ count: MAX_NODES + 1 })).toBe("[MaxNodes]");
    expect(checkNodeLimit({ count: MAX_NODES + 100 })).toBe("[MaxNodes]");
    expect(checkNodeLimit({ count: 10000 })).toBe("[MaxNodes]");
  });

  it("should work with mutable node counter", () => {
    const counter: NodeCount = { count: 0 };

    expect(checkNodeLimit(counter)).toBeNull();

    counter.count = MAX_NODES;
    expect(checkNodeLimit(counter)).toBeNull();

    counter.count = MAX_NODES + 1;
    expect(checkNodeLimit(counter)).toBe("[MaxNodes]");
  });
});

describe("checkCircularReference", () => {
  it("should return null for primitives", () => {
    const visited = new WeakSet();

    expect(checkCircularReference("string", visited)).toBeNull();
    expect(checkCircularReference(42, visited)).toBeNull();
    expect(checkCircularReference(true, visited)).toBeNull();
    expect(checkCircularReference(null, visited)).toBeNull();
    expect(checkCircularReference(undefined, visited)).toBeNull();
  });

  it("should return null for unvisited objects", () => {
    const visited = new WeakSet();
    const obj = { a: 1 };

    const result = checkCircularReference(obj, visited);

    expect(result).toBeNull();
  });

  it("should return '[Circular]' for visited objects", () => {
    const visited = new WeakSet();
    const obj = { a: 1 };

    visited.add(obj);
    const result = checkCircularReference(obj, visited);

    expect(result).toBe("[Circular]");
  });

  it("should return '[Circular]' for visited arrays", () => {
    const visited = new WeakSet();
    const arr = [1, 2, 3];

    visited.add(arr);
    const result = checkCircularReference(arr, visited);

    expect(result).toBe("[Circular]");
  });

  it("should handle multiple objects", () => {
    const visited = new WeakSet();
    const obj1 = { a: 1 };
    const obj2 = { b: 2 };

    visited.add(obj1);

    expect(checkCircularReference(obj1, visited)).toBe("[Circular]");
    expect(checkCircularReference(obj2, visited)).toBeNull();
  });
});

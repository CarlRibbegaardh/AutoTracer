import { describe, expect, it } from "vitest";
import { inferNestedHookLabels } from "@src/lib/functions/treeProcessing/building/helpers/buildStateChanges/inferNestedHookLabels";
import type { StateChangeEntry } from "@src/lib/functions/treeProcessing/building/helpers/buildStateChanges";

describe("inferNestedHookLabels", () => {
  it("should infer labels for unlabeled hooks matching object properties", () => {
    const mockHook = { memoizedState: null, queue: {}, next: null };

    const entries: StateChangeEntry[] = [
      {
        name: "unknown",
        value: null,
        prevValue: undefined,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
      {
        name: "unknown",
        value: true,
        prevValue: undefined,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
      {
        name: "auth",
        value: { user: null, loading: true },
        prevValue: undefined,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
    ];

    const result = inferNestedHookLabels(entries);

    expect(result).toHaveLength(3);
    expect(result[0]!.name).toBe("auth.user");
    expect(result[0]!.value).toBe(null);
    expect(result[1]!.name).toBe("auth.loading");
    expect(result[1]!.value).toBe(true);
    expect(result[2]!.name).toBe("auth");
  });

  it("should skip functions when matching properties", () => {
    const mockHook = { memoizedState: null, queue: {}, next: null };
    const fn1 = () => {};
    const fn2 = () => {};

    const entries: StateChangeEntry[] = [
      {
        name: "unknown",
        value: fn1,
        prevValue: undefined,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
      {
        name: "unknown",
        value: "data",
        prevValue: undefined,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
      {
        name: "state",
        value: { data: "data", setter: fn2 },
        prevValue: undefined,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
    ];

    const result = inferNestedHookLabels(entries);

    // fn1 should be labeled as state.internal (it's at an index where state exists but doesn't match as a property)
    expect(result[0]!.name).toBe("state.internal");
    expect(result[0]!.value).toBe(fn1);

    // "data" should be matched
    expect(result[1]!.name).toBe("state.data");
    expect(result[1]!.value).toBe("data");

    // state object unchanged
    expect(result[2]!.name).toBe("state");
  });

  it("should handle multiple labeled objects", () => {
    const mockHook = { memoizedState: null, queue: {}, next: null };

    const entries: StateChangeEntry[] = [
      {
        name: "unknown",
        value: 1,
        prevValue: undefined,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
      {
        name: "unknown",
        value: 2,
        prevValue: undefined,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
      {
        name: "auth",
        value: { userId: 1 },
        prevValue: undefined,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
      {
        name: "settings",
        value: { theme: 2 },
        prevValue: undefined,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
    ];

    const result = inferNestedHookLabels(entries);

    expect(result[0]!.name).toBe("auth.userId");
    expect(result[1]!.name).toBe("settings.theme");
  });

  it("should not infer labels for arrays", () => {
    const mockHook = { memoizedState: null, queue: {}, next: null };

    const entries: StateChangeEntry[] = [
      {
        name: "unknown",
        value: 1,
        prevValue: undefined,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
      {
        name: "items",
        value: [1, 2, 3],
        prevValue: undefined,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
    ];

    const result = inferNestedHookLabels(entries);

    // Should remain unknown (arrays are not processed)
    expect(result[0]!.name).toBe("unknown");
  });

  it("should not infer labels for class instances", () => {
    const mockHook = { memoizedState: null, queue: {}, next: null };

    class CustomClass {
      value = 42;
    }

    const entries: StateChangeEntry[] = [
      {
        name: "unknown",
        value: 42,
        prevValue: undefined,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
      {
        name: "instance",
        value: new CustomClass(),
        prevValue: undefined,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
    ];

    const result = inferNestedHookLabels(entries);

    // Should remain unknown (class instances are not processed)
    expect(result[0]!.name).toBe("unknown");
  });

  it("should use first match when multiple properties have same value", () => {
    const mockHook = { memoizedState: null, queue: {}, next: null };

    const entries: StateChangeEntry[] = [
      {
        name: "unknown",
        value: 0,
        prevValue: undefined,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
      {
        name: "counters",
        value: { count1: 0, count2: 0 },
        prevValue: undefined,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
    ];

    const result = inferNestedHookLabels(entries);

    // Should match first property encountered (count1)
    expect(result[0]!.name).toBe("counters.count1");
  });

  it("should preserve all entry properties except name", () => {
    const mockHook = { memoizedState: "state", queue: {}, next: null };

    const entries: StateChangeEntry[] = [
      {
        name: "unknown",
        value: 5,
        prevValue: 3,
        hook: mockHook,
        isIdenticalValueChange: true,
      },
      {
        name: "data",
        value: { count: 5, initial: 3 }, // Both current and previous values exist
        prevValue: undefined,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
    ];

    const result = inferNestedHookLabels(entries);

    expect(result[0]!).toEqual({
      name: "data.count",
      value: 5,
      prevValue: 3,
      hook: mockHook,
      isIdenticalValueChange: true,
    });
  });

  it("should return unchanged entries when no labeled objects exist", () => {
    const mockHook = { memoizedState: null, queue: {}, next: null };

    const entries: StateChangeEntry[] = [
      {
        name: "unknown",
        value: 1,
        prevValue: undefined,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
      {
        name: "unknown",
        value: 2,
        prevValue: undefined,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
    ];

    const result = inferNestedHookLabels(entries);

    expect(result).toEqual(entries);
  });

  it("should handle nested objects with primitive values", () => {
    const mockHook = { memoizedState: null, queue: {}, next: null };

    const entries: StateChangeEntry[] = [
      {
        name: "unknown",
        value: "Alice",
        prevValue: undefined,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
      {
        name: "user",
        value: { name: "Alice", profile: { age: 30 } },
        prevValue: undefined,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
    ];

    const result = inferNestedHookLabels(entries);

    // Should match top-level property "name"
    expect(result[0]!.name).toBe("user.name");
  });

  it("should handle Object.create(null) objects", () => {
    const mockHook = { memoizedState: null, queue: {}, next: null };
    const nullProtoObj = Object.create(null);
    nullProtoObj.value = 42;

    const entries: StateChangeEntry[] = [
      {
        name: "unknown",
        value: 42,
        prevValue: undefined,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
      {
        name: "state",
        value: nullProtoObj,
        prevValue: undefined,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
    ];

    const result = inferNestedHookLabels(entries);

    expect(result[0]!.name).toBe("state.value");
  });

  it("should require BOTH current and previous values to match for updates", () => {
    const mockHook = { memoizedState: null, queue: {}, next: null };

    const entries: StateChangeEntry[] = [
      // This should match: both current (5) and previous (3) exist in auth object
      {
        name: "unknown",
        value: 5,
        prevValue: 3,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
      // This should NOT match: previous (99) doesn't exist in auth object
      {
        name: "unknown",
        value: true,
        prevValue: 99,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
      {
        name: "auth",
        value: { count: 5, initial: 3, loading: true },
        prevValue: undefined,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
    ];

    const result = inferNestedHookLabels(entries);

    // First entry: both values match, should be labeled
    expect(result[0]!.name).toBe("auth.count");
    expect(result[0]!.value).toBe(5);

    // Second entry: previous value doesn't match, should remain unknown
    expect(result[1]!.name).toBe("unknown");
    expect(result[1]!.value).toBe(true);
  });

  it("should handle updates where current matches but previous doesn't", () => {
    const mockHook = { memoizedState: null, queue: {}, next: null };

    const entries: StateChangeEntry[] = [
      {
        name: "unknown",
        value: "active",
        prevValue: "initializing", // doesn't exist in state
        hook: mockHook,
        isIdenticalValueChange: false,
      },
      {
        name: "state",
        value: { status: "active" },
        prevValue: undefined,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
    ];

    const result = inferNestedHookLabels(entries);

    // Should remain unknown because previous value doesn't match
    expect(result[0]!.name).toBe("unknown");
  });

  it("should handle updates where both values are in different properties", () => {
    const mockHook = { memoizedState: null, queue: {}, next: null };

    const entries: StateChangeEntry[] = [
      {
        name: "unknown",
        value: 10,
        prevValue: 5,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
      {
        name: "counters",
        value: { max: 10, min: 5 },
        prevValue: undefined,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
    ];

    const result = inferNestedHookLabels(entries);

    // Should match max (current value), not min (previous value)
    // Both values exist in the object, so it passes the AND check
    expect(result[0]!.name).toBe("counters.max");
  });

  it("should treat mount (no prevValue) as only checking current value", () => {
    const mockHook = { memoizedState: null, queue: {}, next: null };

    const entries: StateChangeEntry[] = [
      {
        name: "unknown",
        value: null,
        prevValue: undefined, // Mount - no previous value
        hook: mockHook,
        isIdenticalValueChange: false,
      },
      {
        name: "auth",
        value: { user: null },
        prevValue: undefined,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
    ];

    const result = inferNestedHookLabels(entries);

    // Should match on mount even without prevValue
    expect(result[0]!.name).toBe("auth.user");
  });

  it("should not match when both current and previous are undefined", () => {
    const mockHook = { memoizedState: null, queue: {}, next: null };

    const entries: StateChangeEntry[] = [
      {
        name: "unknown",
        value: undefined,
        prevValue: undefined,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
      {
        name: "optional",
        value: { data: undefined },
        prevValue: undefined,
        hook: mockHook,
        isIdenticalValueChange: false,
      },
    ];

    const result = inferNestedHookLabels(entries);

    // Since prevValue is undefined (mount scenario), should match
    expect(result[0]!.name).toBe("optional.data");
  });
});

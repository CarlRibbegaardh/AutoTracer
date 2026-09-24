import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePrevValueStore } from "@src/lib/hooks/usePrevValueStore";

describe("usePrevValueStore", () => {
  it("should return undefined for values that have not been set", () => {
    const { result } = renderHook(() => {
      return usePrevValueStore();
    });

    const value = result.current.get(0, "count");
    expect(value).toBeUndefined();
  });

  it("should store and retrieve a primitive value", () => {
    const { result } = renderHook(() => {
      return usePrevValueStore();
    });

    result.current.set(0, "count", 42);
    const value = result.current.get(0, "count");
    expect(value).toBe(42);
  });

  it("should store and retrieve an object reference", () => {
    const { result } = renderHook(() => {
      return usePrevValueStore();
    });

    const obj = { x: 1 };
    result.current.set(0, "data", obj);
    const value = result.current.get(0, "data");
    expect(value).toBe(obj);
  });

  it("should handle multiple independent keys", () => {
    const { result } = renderHook(() => {
      return usePrevValueStore();
    });

    result.current.set(0, "count", 10);
    result.current.set(1, "name", "Alice");
    result.current.set(0, "enabled", true);

    expect(result.current.get(0, "count")).toBe(10);
    expect(result.current.get(1, "name")).toBe("Alice");
    expect(result.current.get(0, "enabled")).toBe(true);
  });

  it("should overwrite values when set multiple times", () => {
    const { result } = renderHook(() => {
      return usePrevValueStore();
    });

    result.current.set(0, "count", 5);
    expect(result.current.get(0, "count")).toBe(5);

    result.current.set(0, "count", 10);
    expect(result.current.get(0, "count")).toBe(10);
  });

  it("should maintain stability across re-renders", () => {
    const { result, rerender } = renderHook(() => {
      return usePrevValueStore();
    });

    result.current.set(0, "count", 42);

    // Trigger re-render
    rerender();

    // Value should still be accessible
    expect(result.current.get(0, "count")).toBe(42);
  });

  it("should create unique keys from index and label combination", () => {
    const { result } = renderHook(() => {
      return usePrevValueStore();
    });

    // Same index, different labels
    result.current.set(0, "count", 1);
    result.current.set(0, "name", "Alice");

    expect(result.current.get(0, "count")).toBe(1);
    expect(result.current.get(0, "name")).toBe("Alice");

    // Same label, different indices
    result.current.set(1, "count", 2);
    expect(result.current.get(0, "count")).toBe(1);
    expect(result.current.get(1, "count")).toBe(2);
  });
});

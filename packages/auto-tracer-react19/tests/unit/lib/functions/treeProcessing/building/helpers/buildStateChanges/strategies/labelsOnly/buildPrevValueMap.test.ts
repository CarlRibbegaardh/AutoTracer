import { describe, expect, it } from "vitest";
import { buildPrevValueMap } from "@src/lib/functions/treeProcessing/building/helpers/buildStateChanges/strategies/labelsOnly/buildPrevValueMap";
import type { LabelEntry } from "@src/lib/functions/hookLabels/LabelEntry";

describe("buildPrevValueMap", () => {
  it("creates empty map from empty array", () => {
    const result = buildPrevValueMap([]);
    expect(result.size).toBe(0);
  });

  it("creates map with single label", () => {
    const labels: LabelEntry[] = [
      {
        index: 0,
        label: "count",
        value: 42,
        normalizedValue: 42,
      },
    ];

    const result = buildPrevValueMap(labels);

    expect(result.size).toBe(1);
    expect(result.get("count")).toBe(42);
  });

  it("creates map with multiple labels", () => {
    const labels: LabelEntry[] = [
      { index: 0, label: "title", value: "Hello", normalizedValue: "Hello" },
      { index: 1, label: "count", value: 5, normalizedValue: 5 },
      {
        index: 2,
        label: "user",
        value: { name: "Alice" },
        normalizedValue: { name: "Alice" },
      },
    ];

    const result = buildPrevValueMap(labels);

    expect(result.size).toBe(3);
    expect(result.get("title")).toBe("Hello");
    expect(result.get("count")).toBe(5);
    expect(result.get("user")).toEqual({ name: "Alice" });
  });

  it("preserves reference identity", () => {
    const obj = { data: "test" };
    const labels: LabelEntry[] = [
      { index: 0, label: "state", value: obj, normalizedValue: obj },
    ];

    const result = buildPrevValueMap(labels);

    expect(result.get("state")).toBe(obj); // Same reference
  });

  it("returns readonly map", () => {
    const labels: LabelEntry[] = [
      { index: 0, label: "count", value: 1, normalizedValue: 1 },
    ];

    const result: ReadonlyMap<string, unknown> = buildPrevValueMap(labels);

    expect(result).toBeInstanceOf(Map);
    expect(result.get("count")).toBe(1);
  });

  it("handles duplicate labels by keeping last value", () => {
    const labels: LabelEntry[] = [
      { index: 0, label: "value", value: "first", normalizedValue: "first" },
      { index: 1, label: "value", value: "second", normalizedValue: "second" },
    ];

    const result = buildPrevValueMap(labels);

    expect(result.size).toBe(1);
    expect(result.get("value")).toBe("second");
  });
});

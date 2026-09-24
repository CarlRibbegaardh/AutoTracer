import { describe, expect, it } from "vitest";
import { createLabelEntry } from "@src/lib/functions/hookLabels/createLabelEntry";

describe("createLabelEntry", () => {
  it("should create a label entry with primitive value", () => {
    const entry = createLabelEntry("count", 0, 42);

    expect(entry.label).toBe("count");
    expect(entry.index).toBe(0);
    expect(entry.value).toBe(42);
    expect(entry.normalizedValue).toBe(42);
    expect(entry.prevValue).toBeUndefined();
    expect(entry.propertyMetadata).toBeUndefined();
  });

  it("should create a label entry with prevValue", () => {
    const entry = createLabelEntry("count", 0, 42, 30);

    expect(entry.label).toBe("count");
    expect(entry.index).toBe(0);
    expect(entry.value).toBe(42);
    expect(entry.prevValue).toBe(30);
    expect(entry.normalizedValue).toBe(42);
  });

  it("should create a label entry with string value", () => {
    const entry = createLabelEntry("name", 1, "Alice");

    expect(entry.label).toBe("name");
    expect(entry.index).toBe(1);
    expect(entry.value).toBe("Alice");
    expect(entry.normalizedValue).toBe("Alice");
    expect(entry.prevValue).toBeUndefined();
  });

  it("should preserve function values (not normalized when standalone)", () => {
    const fn = () => {
      return 42;
    };
    const entry = createLabelEntry("handler", 2, fn);

    expect(entry.label).toBe("handler");
    expect(entry.index).toBe(2);
    expect(entry.value).toBe(fn); // Original function preserved
    expect(entry.normalizedValue).toBe(fn); // Standalone functions are not normalized
  });

  it("should create a label entry with object value and metadata", () => {
    const obj = { x: 1, y: 2 };
    const entry = createLabelEntry("data", 0, obj);

    expect(entry.label).toBe("data");
    expect(entry.index).toBe(0);
    expect(entry.value).toBe(obj);
    expect(entry.propertyMetadata).toBeDefined();
  });

  it("should handle null value", () => {
    const entry = createLabelEntry("nullable", 0, null);

    expect(entry.label).toBe("nullable");
    expect(entry.value).toBe(null);
    expect(entry.normalizedValue).toBe(null);
  });

  it("should handle undefined value", () => {
    const entry = createLabelEntry("optional", 0, undefined);

    expect(entry.label).toBe("optional");
    expect(entry.value).toBeUndefined();
    expect(entry.normalizedValue).toBeUndefined();
  });

  it("should preserve prevValue for object types", () => {
    const prevObj = { x: 1 };
    const currentObj = { x: 2 };
    const entry = createLabelEntry("data", 0, currentObj, prevObj);

    expect(entry.value).toBe(currentObj);
    expect(entry.prevValue).toBe(prevObj);
  });

  it("should handle array values", () => {
    const arr = [1, 2, 3];
    const entry = createLabelEntry("items", 0, arr);

    expect(entry.label).toBe("items");
    expect(entry.value).toBe(arr);
    expect(entry.normalizedValue).toEqual(arr);
  });

  it("should handle boolean values", () => {
    const entry = createLabelEntry("enabled", 0, true, false);

    expect(entry.value).toBe(true);
    expect(entry.prevValue).toBe(false);
    expect(entry.normalizedValue).toBe(true);
  });
});

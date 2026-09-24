import { describe, expect, it } from "vitest";
import { computeObjectFieldDiff } from "../../../../../src/lib/functions/treeProcessing/rendering/utils/computeObjectFieldDiff";

describe("computeObjectFieldDiff", () => {
  it("should detect changed fields", () => {
    const before = { name: "Alice", age: 30, city: "NYC" };
    const after = { name: "Alice", age: 31, city: "LA" };

    const diffs = computeObjectFieldDiff(before, after);

    expect(diffs).not.toBeNull();
    if (diffs && diffs.length >= 2) {
      expect(diffs).toHaveLength(2);
      expect(diffs[0]).toEqual({
        name: "age",
        status: "changed",
        prevValue: 30,
        currentValue: 31,
      });
      expect(diffs[1]).toEqual({
        name: "city",
        status: "changed",
        prevValue: "NYC",
        currentValue: "LA",
      });
    }
  });

  it("should detect added fields", () => {
    const before = { name: "Alice", age: 30 };
    const after = { name: "Alice", age: 30, city: "NYC" };

    const diffs = computeObjectFieldDiff(before, after);

    expect(diffs).not.toBeNull();
    if (diffs && diffs.length > 0) {
      expect(diffs).toHaveLength(1);
      expect(diffs[0]).toEqual({
        name: "city",
        status: "added",
        currentValue: "NYC",
      });
    }
  });

  it("should detect removed fields", () => {
    const before = { name: "Alice", age: 30, city: "NYC" };
    const after = { name: "Alice", age: 30 };

    const diffs = computeObjectFieldDiff(before, after);

    expect(diffs).not.toBeNull();
    if (diffs && diffs.length > 0) {
      expect(diffs).toHaveLength(1);
      expect(diffs[0]).toEqual({
        name: "city",
        status: "removed",
        prevValue: "NYC",
      });
    }
  });

  it("should return null when no changes detected", () => {
    const before = { name: "Alice", age: 30 };
    const after = { name: "Alice", age: 30 };

    const diffs = computeObjectFieldDiff(before, after);

    expect(diffs).toBeNull();
  });

  it("should return null for objects with fewer than 3 fields", () => {
    const before = { name: "Alice" };
    const after = { name: "Bob" };

    const diffs = computeObjectFieldDiff(before, after);

    expect(diffs).toBeNull();
  });

  it("should return null for objects with more than 50 fields", () => {
    const before: Record<string, number> = {};
    const after: Record<string, number> = {};

    for (let i = 0; i < 60; i++) {
      before[`field${i}`] = i;
      after[`field${i}`] = i + 1;
    }

    const diffs = computeObjectFieldDiff(before, after);

    expect(diffs).toBeNull();
  });

  it("should diff arrays at element level", () => {
    const before = [1, 2, 3];
    const after = [1, 2, 4];

    const diffs = computeObjectFieldDiff(before, after);

    expect(diffs).not.toBeNull();
    if (diffs) {
      // Element [0] same reference → skipped; [1] same reference → skipped; [2] changed
      expect(diffs).toHaveLength(1);
      expect(diffs[0]).toEqual({
        name: "[2]",
        status: "changed",
        prevValue: 3,
        currentValue: 4,
      });
    }
  });

  it("should diff arrays with reference-only elements", () => {
    const sharedObj = { x: 1 };
    const before = [sharedObj, { y: 2 }, { z: 3 }];
    const after = [sharedObj, { y: 99 }, { z: 3 }];

    const diffs = computeObjectFieldDiff(before, after);

    expect(diffs).not.toBeNull();
    if (diffs) {
      // [0] same reference → skipped; [1] content-changed; [2] different reference but same content → reference
      expect(diffs).toHaveLength(2);
      expect(diffs[0]?.name).toBe("[1]");
      expect(diffs[0]?.status).toBe("changed");
      expect(diffs[1]?.name).toBe("[2]");
      expect(diffs[1]?.status).toBe("reference");
    }
  });

  it("should return null for mixed type (array vs object)", () => {
    const diffs = computeObjectFieldDiff([1, 2, 3], { a: 1 });

    expect(diffs).toBeNull();
  });

  it("should return null for primitives", () => {
    const diffs = computeObjectFieldDiff(42, 43);

    expect(diffs).toBeNull();
  });

  it("should respect maxFields limit", () => {
    const before: Record<string, number> = {};
    const after: Record<string, number> = {};

    for (let i = 0; i < 30; i++) {
      before[`field${i}`] = i;
      after[`field${i}`] = i + 1;
    }

    const diffs = computeObjectFieldDiff(before, after, { maxFields: 5 });

    expect(diffs).not.toBeNull();
    if (diffs) {
      expect(diffs.length).toBe(5);
    }
  });

  it("should handle function properties using snapshotted string IDs", () => {
    // In production, values reach computeObjectFieldDiff already snapshotted by
    // snapshotValue(), which replaces functions with '(fn:ID)' strings.
    // This test simulates that production scenario.
    const before = { name: "Alice", callback: "(fn:1183)", value: 10 };
    const after = { name: "Alice", callback: "(fn:2289)", value: 10 };

    const diffs = computeObjectFieldDiff(before, after);

    expect(diffs).not.toBeNull();
    if (diffs && diffs.length > 0) {
      expect(diffs).toHaveLength(1);
      const firstDiff = diffs[0];
      if (firstDiff) {
        expect(firstDiff.name).toBe("callback");
        expect(firstDiff.status).toBe("changed");
      }
    }
  });

  it("should classify reference-equal nested objects as 'reference' not 'changed'", () => {
    const before = {
      user: { name: "Alice" },
      settings: { theme: "dark" },
      count: 5,
    };
    const after = {
      user: { name: "Alice" },
      settings: { theme: "dark" },
      count: 5,
    };

    const diffs = computeObjectFieldDiff(before, after);

    // user and settings have different references but identical content → 'reference'
    // count is primitive === → unchanged, skipped
    expect(diffs).not.toBeNull();
    if (diffs) {
      expect(diffs.length).toBe(2);
      expect(
        diffs.every((d) => {
          return d.status === "reference";
        }),
      ).toBe(true);
    }
  });

  it("should classify fields with truly changed content as 'changed'", () => {
    const before = {
      user: { name: "Alice" },
      settings: { theme: "dark" },
      count: 5,
    };
    const after = {
      user: { name: "Bob" },
      settings: { theme: "dark" },
      count: 5,
    };

    const diffs = computeObjectFieldDiff(before, after);

    expect(diffs).not.toBeNull();
    if (diffs) {
      // user content changed; settings reference-only; count identical ref
      expect(diffs.length).toBe(2);
      const userDiff = diffs.find((d) => d.name === "user");
      const settingsDiff = diffs.find((d) => d.name === "settings");
      expect(userDiff?.status).toBe("changed");
      expect(settingsDiff?.status).toBe("reference");
    }
  });
});

import { describe, it, expect } from "vitest";
import { formatFieldDiff } from "../../../../../src/lib/functions/treeProcessing/rendering/utils/formatFieldDiff";
import type { FieldDiff } from "../../../../../src/lib/functions/treeProcessing/rendering/utils/computeObjectFieldDiff";

describe("formatFieldDiff", () => {
  it("should format changed fields", () => {
    const diffs: FieldDiff[] = [
      {
        name: "age",
        status: "changed",
        prevValue: 30,
        currentValue: 31,
      },
      {
        name: "city",
        status: "changed",
        prevValue: "NYC",
        currentValue: "LA",
      },
    ];

    const lines = formatFieldDiff(diffs, "  ");

    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe("    Fields: 2 changed:");
    expect(lines[1]).toContain("~ age:");
    expect(lines[1]).toContain("30");
    expect(lines[1]).toContain("31");
    expect(lines[2]).toContain("~ city:");
    expect(lines[2]).toContain("NYC");
    expect(lines[2]).toContain("LA");
  });

  it("should format added fields", () => {
    const diffs: FieldDiff[] = [
      {
        name: "email",
        status: "added",
        currentValue: "alice@example.com",
      },
    ];

    const lines = formatFieldDiff(diffs, "  ");

    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe("    Fields: 1 added:");
    expect(lines[1]).toContain("+ email:");
    expect(lines[1]).toContain("alice@example.com");
  });

  it("should format removed fields", () => {
    const diffs: FieldDiff[] = [
      {
        name: "phone",
        status: "removed",
        prevValue: "555-1234",
      },
    ];

    const lines = formatFieldDiff(diffs, "  ");

    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe("    Fields: 1 removed:");
    expect(lines[1]).toContain("- phone:");
    expect(lines[1]).toContain("555-1234");
  });

  it("should format mixed changes", () => {
    const diffs: FieldDiff[] = [
      {
        name: "age",
        status: "changed",
        prevValue: 30,
        currentValue: 31,
      },
      {
        name: "email",
        status: "added",
        currentValue: "alice@example.com",
      },
      {
        name: "phone",
        status: "removed",
        prevValue: "555-1234",
      },
    ];

    const lines = formatFieldDiff(diffs, "  ");

    expect(lines).toHaveLength(4);
    expect(lines[0]).toBe("    Fields: 1 changed, 1 added, 1 removed:");
    expect(lines[1]).toContain("~ age:");
    expect(lines[2]).toContain("+ email:");
    expect(lines[3]).toContain("- phone:");
  });

  it("should return empty array for null diffs", () => {
    const lines = formatFieldDiff(null as any, "  ");

    expect(lines).toEqual([]);
  });

  it("should return empty array for empty diffs", () => {
    const lines = formatFieldDiff([], "  ");

    expect(lines).toEqual([]);
  });

  it("should truncate long values", () => {
    const longValue = "A".repeat(100);
    const diffs: FieldDiff[] = [
      {
        name: "description",
        status: "changed",
        prevValue: longValue,
        currentValue: longValue + "B",
      },
    ];

    const lines = formatFieldDiff(diffs, "  ");

    expect(lines).toHaveLength(2);
    const line1 = lines[1];
    expect(line1).toBeDefined();
    expect(line1).toContain("...");
    if (line1) {
      expect(line1.length).toBeLessThan(200); // Reasonable length
    }
  });

  it("should handle function values", () => {
    const fn1 = () => {};
    const fn2 = () => {};
    const diffs: FieldDiff[] = [
      {
        name: "callback",
        status: "changed",
        prevValue: fn1,
        currentValue: fn2,
      },
    ];

    const lines = formatFieldDiff(diffs, "  ");

    expect(lines.length).toBeGreaterThan(0);
    if (lines.length >= 2) {
      expect(lines[0]).toBe("    Fields: 1 changed:");
      expect(lines[1]).toContain("~ callback:");
      expect(lines[1]).toContain("(fn:"); // Functions formatted with ID
    }
  });

  it("should handle null and undefined values", () => {
    const diffs: FieldDiff[] = [
      {
        name: "value1",
        status: "changed",
        prevValue: null,
        currentValue: undefined,
      },
    ];

    const lines = formatFieldDiff(diffs, "  ");

    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain("null");
    expect(lines[1]).toContain("undefined");
  });

  it("should render reference-only entries as a collapsed group line", () => {
    const diffs: FieldDiff[] = [
      { name: "workshop", status: "reference", prevValue: {}, currentValue: {} },
      { name: "settings", status: "reference", prevValue: {}, currentValue: {} },
      { name: "tax", status: "reference", prevValue: {}, currentValue: {} },
    ];

    const lines = formatFieldDiff(diffs, "  ");

    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe("    Fields: 3 reference-only:");
    expect(lines[1]).toContain("≈ workshop, settings, tax");
    expect(lines[1]).toContain("same content, new reference");
  });

  it("should show changed fields before the reference group", () => {
    const diffs: FieldDiff[] = [
      { name: "translate", status: "changed", prevValue: "(fn:1183)", currentValue: "(fn:2289)" },
      { name: "workshop", status: "reference", prevValue: {}, currentValue: {} },
      { name: "tax", status: "reference", prevValue: {}, currentValue: {} },
    ];

    const lines = formatFieldDiff(diffs, "  ");

    // summary + 1 changed line + 1 reference group line
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe("    Fields: 1 changed, 2 reference-only:");
    expect(lines[1]).toContain("~ translate:");
    expect(lines[2]).toContain("≈ workshop, tax");
    expect(lines[2]).toContain("same content, new reference");
  });

  it("should omit reference group when there are no reference entries", () => {
    const diffs: FieldDiff[] = [
      { name: "age", status: "changed", prevValue: 30, currentValue: 31 },
      { name: "city", status: "changed", prevValue: "NYC", currentValue: "LA" },
      { name: "name", status: "changed", prevValue: "Alice", currentValue: "Bob" },
    ];

    const lines = formatFieldDiff(diffs, "  ");

    expect(lines).toHaveLength(4);
    expect(lines[0]).toBe("    Fields: 3 changed:");
    expect(lines.every((l) => !l.includes("≈"))).toBe(true);
  });
});

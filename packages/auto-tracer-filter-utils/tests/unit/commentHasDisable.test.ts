import { describe, it, expect } from "vitest";
import { commentHasDisable } from "../../src/commentHasDisable";

describe("commentHasDisable", () => {
  describe("matching @trace-disable", () => {
    it("returns true for bare @trace-disable", () => {
      expect(commentHasDisable(" @trace-disable")).toBe(true);
    });

    it("returns true for @trace-disable with colon boundary", () => {
      expect(commentHasDisable(" @trace-disable: too noisy")).toBe(true);
    });

    it("returns true for @trace-disable with space boundary", () => {
      expect(commentHasDisable(" @trace-disable some reason")).toBe(true);
    });

    it("returns true for @trace-disable at start of trimmed value", () => {
      expect(commentHasDisable("@trace-disable")).toBe(true);
    });
  });

  describe("rejecting near-miss tokens", () => {
    it("returns false for @trace-disable-later (invalid dash boundary)", () => {
      expect(commentHasDisable(" @trace-disable-later")).toBe(false);
    });

    it("returns false for @trace (not the disable token)", () => {
      expect(commentHasDisable(" @trace")).toBe(false);
    });

    it("returns false for unrelated comment", () => {
      expect(commentHasDisable(" some comment")).toBe(false);
    });

    it("returns false for empty string", () => {
      expect(commentHasDisable("")).toBe(false);
    });
  });
});

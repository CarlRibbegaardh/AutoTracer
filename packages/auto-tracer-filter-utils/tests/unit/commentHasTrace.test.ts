import { describe, it, expect } from "vitest";
import { commentHasTrace } from "../../src/commentHasTrace";

describe("commentHasTrace", () => {
  describe("matching @trace", () => {
    it("returns true for bare @trace", () => {
      expect(commentHasTrace(" @trace")).toBe(true);
    });

    it("returns true for @trace with colon boundary", () => {
      expect(commentHasTrace(" @trace: enable profiling")).toBe(true);
    });

    it("returns true for @trace with space boundary", () => {
      expect(commentHasTrace(" @trace some note")).toBe(true);
    });

    it("returns true for @trace at start of trimmed value (no leading space)", () => {
      expect(commentHasTrace("@trace")).toBe(true);
    });
  });

  describe("rejecting near-miss tokens", () => {
    it("returns false for @traceable (invalid dash boundary character)", () => {
      expect(commentHasTrace(" @traceable")).toBe(false);
    });

    it("returns false for @trace-disable (dash is not a valid boundary for @trace)", () => {
      expect(commentHasTrace(" @trace-disable")).toBe(false);
    });

    it("returns false for unrelated comment", () => {
      expect(commentHasTrace(" some other comment")).toBe(false);
    });

    it("returns false for empty string", () => {
      expect(commentHasTrace("")).toBe(false);
    });
  });
});

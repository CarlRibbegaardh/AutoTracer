import { describe, it, expect } from "vitest";
import { isValidPragmaToken } from "../../src/isValidPragmaToken";

describe("isValidPragmaToken", () => {
  describe("exact match (end of string)", () => {
    it("returns true for bare @trace token", () => {
      expect(isValidPragmaToken("@trace", "@trace")).toBe(true);
    });

    it("returns true for bare @trace-disable token", () => {
      expect(isValidPragmaToken("@trace-disable", "@trace-disable")).toBe(true);
    });
  });

  describe("space boundary", () => {
    it("returns true for @trace followed by space and text", () => {
      expect(isValidPragmaToken("@trace because profiling", "@trace")).toBe(true);
    });

    it("returns true for @trace-disable followed by space and text", () => {
      expect(isValidPragmaToken("@trace-disable this function", "@trace-disable")).toBe(true);
    });
  });

  describe("tab boundary", () => {
    it("returns true for @trace followed by a tab", () => {
      expect(isValidPragmaToken("@trace\treason", "@trace")).toBe(true);
    });

    it("returns true for @trace-disable followed by a tab", () => {
      expect(isValidPragmaToken("@trace-disable\tnote", "@trace-disable")).toBe(true);
    });
  });

  describe("colon boundary", () => {
    it("returns true for @trace: with suffix text", () => {
      expect(isValidPragmaToken("@trace: enable this", "@trace")).toBe(true);
    });

    it("returns true for @trace-disable: with suffix text", () => {
      expect(isValidPragmaToken("@trace-disable: too noisy", "@trace-disable")).toBe(true);
    });
  });

  describe("near-miss strings — must NOT match", () => {
    it("returns false for @traceable (letter boundary after @trace)", () => {
      expect(isValidPragmaToken("@traceable", "@trace")).toBe(false);
    });

    it("returns false for @trace-disable-later (dash boundary after @trace-disable)", () => {
      expect(isValidPragmaToken("@trace-disable-later", "@trace-disable")).toBe(false);
    });

    it("returns false for @trace-disable when checking @trace (dash boundary)", () => {
      expect(isValidPragmaToken("@trace-disable", "@trace")).toBe(false);
    });

    it("returns false when text does not start with token", () => {
      expect(isValidPragmaToken("TODO: @trace later", "@trace")).toBe(false);
    });

    it("returns false for empty string", () => {
      expect(isValidPragmaToken("", "@trace")).toBe(false);
    });

    it("returns false for wrong case (@TRACE)", () => {
      expect(isValidPragmaToken("@TRACE", "@trace")).toBe(false);
    });

    it("returns false for @TRACE-DISABLE", () => {
      expect(isValidPragmaToken("@TRACE-DISABLE", "@trace-disable")).toBe(false);
    });
  });
});

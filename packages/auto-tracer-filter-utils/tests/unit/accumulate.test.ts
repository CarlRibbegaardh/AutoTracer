import { describe, it, expect } from "vitest";
import { accumulate } from "../../src/accumulate";
import type { PragmaResult } from "../../src/PragmaResult";

const EMPTY: PragmaResult = { hasTrace: false, hasDisable: false } as const;

describe("accumulate", () => {
  describe("comment type filtering", () => {
    it("ignores CommentBlock nodes and returns acc unchanged", () => {
      const result = accumulate(EMPTY, { type: "CommentBlock", value: " @trace" });
      expect(result).toEqual(EMPTY);
    });

    it("ignores CommentBlock nodes even for @trace-disable", () => {
      const result = accumulate(EMPTY, { type: "CommentBlock", value: " @trace-disable" });
      expect(result).toEqual(EMPTY);
    });

    it("processes CommentLine nodes", () => {
      const result = accumulate(EMPTY, { type: "CommentLine", value: " @trace" });
      expect(result).toEqual({ hasTrace: true, hasDisable: false });
    });
  });

  describe("@trace detection", () => {
    it("sets hasTrace when CommentLine contains @trace", () => {
      const result = accumulate(EMPTY, { type: "CommentLine", value: " @trace" });
      expect(result.hasTrace).toBe(true);
      expect(result.hasDisable).toBe(false);
    });

    it("preserves accumulated hasTrace=true across a non-pragma comment", () => {
      const acc: PragmaResult = { hasTrace: true, hasDisable: false };
      const result = accumulate(acc, { type: "CommentLine", value: " unrelated" });
      expect(result.hasTrace).toBe(true);
    });
  });

  describe("@trace-disable detection", () => {
    it("sets hasDisable when CommentLine contains @trace-disable", () => {
      const result = accumulate(EMPTY, { type: "CommentLine", value: " @trace-disable" });
      expect(result.hasDisable).toBe(true);
      expect(result.hasTrace).toBe(false);
    });

    it("preserves accumulated hasDisable=true across a non-pragma comment", () => {
      const acc: PragmaResult = { hasTrace: false, hasDisable: true };
      const result = accumulate(acc, { type: "CommentLine", value: " unrelated" });
      expect(result.hasDisable).toBe(true);
    });
  });

  describe("accumulation over a series of comments", () => {
    it("sets hasTrace via OR when a later comment has @trace", () => {
      const acc1 = accumulate(EMPTY, { type: "CommentLine", value: " normal comment" });
      const acc2 = accumulate(acc1, { type: "CommentLine", value: " @trace" });
      expect(acc2.hasTrace).toBe(true);
    });

    it("sets hasDisable via OR when a later comment has @trace-disable", () => {
      const acc1 = accumulate(EMPTY, { type: "CommentLine", value: " @trace" });
      const acc2 = accumulate(acc1, { type: "CommentLine", value: " @trace-disable" });
      expect(acc2.hasDisable).toBe(true);
      expect(acc2.hasTrace).toBe(true);
    });
  });
});

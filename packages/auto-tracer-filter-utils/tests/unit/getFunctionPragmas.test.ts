import { describe, it, expect } from "vitest";
import { getFunctionPragmas } from "../../src/getFunctionPragmas";
import type { PragmaCommentHost } from "../../src/PragmaCommentHost";

/** Helper to build a host from CommentLine entries. */
const lineHost = (values: string[]): PragmaCommentHost => ({
  leadingComments: values.map((value) => ({ value, type: "CommentLine" })),
});

/** Helper to build a host from CommentBlock entries. */
const blockHost = (values: string[]): PragmaCommentHost => ({
  leadingComments: values.map((value) => ({ value, type: "CommentBlock" })),
});

describe("getFunctionPragmas", () => {
  describe("no pragma signals", () => {
    it("returns false/false for null leadingComments", () => {
      const result = getFunctionPragmas({ leadingComments: null });
      expect(result).toEqual({ hasTrace: false, hasDisable: false });
    });

    it("returns false/false for undefined leadingComments", () => {
      const result = getFunctionPragmas({});
      expect(result).toEqual({ hasTrace: false, hasDisable: false });
    });

    it("returns false/false for empty leadingComments array", () => {
      const result = getFunctionPragmas({ leadingComments: [] });
      expect(result).toEqual({ hasTrace: false, hasDisable: false });
    });

    it("returns false/false for an unrelated comment", () => {
      const result = getFunctionPragmas(lineHost([" some other comment"]));
      expect(result).toEqual({ hasTrace: false, hasDisable: false });
    });
  });

  describe("@trace detection (CommentLine only)", () => {
    it("detects bare @trace comment", () => {
      const result = getFunctionPragmas(lineHost([" @trace"]));
      expect(result).toEqual({ hasTrace: true, hasDisable: false });
    });

    it("detects @trace with colon boundary", () => {
      const result = getFunctionPragmas(lineHost([" @trace: enable this"]));
      expect(result).toEqual({ hasTrace: true, hasDisable: false });
    });

    it("detects @trace with space boundary", () => {
      const result = getFunctionPragmas(lineHost([" @trace because profiling"]));
      expect(result).toEqual({ hasTrace: true, hasDisable: false });
    });
  });

  describe("@trace-disable detection (CommentLine only)", () => {
    it("detects bare @trace-disable comment", () => {
      const result = getFunctionPragmas(lineHost([" @trace-disable"]));
      expect(result).toEqual({ hasTrace: false, hasDisable: true });
    });

    it("detects @trace-disable with colon boundary", () => {
      const result = getFunctionPragmas(lineHost([" @trace-disable: too noisy"]));
      expect(result).toEqual({ hasTrace: false, hasDisable: true });
    });

    it("detects @trace-disable with space boundary", () => {
      const result = getFunctionPragmas(lineHost([" @trace-disable this function"]));
      expect(result).toEqual({ hasTrace: false, hasDisable: true });
    });
  });

  describe("both pragmas present", () => {
    it("detects both hasTrace and hasDisable when both present", () => {
      const result = getFunctionPragmas(lineHost([" @trace", " @trace-disable"]));
      expect(result).toEqual({ hasTrace: true, hasDisable: true });
    });
  });

  describe("CommentBlock nodes are ignored", () => {
    it("does not detect @trace in a block comment", () => {
      const result = getFunctionPragmas(blockHost(["* @trace *"]));
      expect(result).toEqual({ hasTrace: false, hasDisable: false });
    });

    it("does not detect @trace-disable in a block comment", () => {
      const result = getFunctionPragmas(blockHost(["* @trace-disable *"]));
      expect(result).toEqual({ hasTrace: false, hasDisable: false });
    });

    it("does not detect block-comment form /** @trace */", () => {
      // Represents the legacy documentation form that used to be suggested
      const result = getFunctionPragmas({ leadingComments: [{ value: "* @trace ", type: "CommentBlock" }] });
      expect(result).toEqual({ hasTrace: false, hasDisable: false });
    });

    it("does not detect block-comment form /** @trace-disable */", () => {
      const result = getFunctionPragmas({ leadingComments: [{ value: "* @trace-disable ", type: "CommentBlock" }] });
      expect(result).toEqual({ hasTrace: false, hasDisable: false });
    });
  });

  describe("pragma after TSDoc (CommentBlock before CommentLine)", () => {
    it("detects @trace on a CommentLine that follows a TSDoc CommentBlock", () => {
      // This was NOT detected in the previous local implementation (stopped at block comment).
      // The new shared parser ignores CommentBlock entirely and detects the CommentLine.
      const result = getFunctionPragmas({
        leadingComments: [
          { value: "* My function TSDoc comment. ", type: "CommentBlock" },
          { value: " @trace", type: "CommentLine" },
        ],
      });
      expect(result).toEqual({ hasTrace: true, hasDisable: false });
    });

    it("detects @trace-disable on a CommentLine that follows a TSDoc CommentBlock", () => {
      const result = getFunctionPragmas({
        leadingComments: [
          { value: "* My function TSDoc comment. ", type: "CommentBlock" },
          { value: " @trace-disable", type: "CommentLine" },
        ],
      });
      expect(result).toEqual({ hasTrace: false, hasDisable: true });
    });

    it("also detects @trace on a CommentLine that precedes a TSDoc CommentBlock", () => {
      const result = getFunctionPragmas({
        leadingComments: [
          { value: " @trace", type: "CommentLine" },
          { value: "* My function TSDoc comment. ", type: "CommentBlock" },
        ],
      });
      expect(result).toEqual({ hasTrace: true, hasDisable: false });
    });
  });

  describe("near-miss strings — must NOT match", () => {
    it("does not detect @traceable as @trace", () => {
      const result = getFunctionPragmas(lineHost([" @traceable"]));
      expect(result).toEqual({ hasTrace: false, hasDisable: false });
    });

    it("does not detect @trace-disable-later as @trace-disable", () => {
      const result = getFunctionPragmas(lineHost([" @trace-disable-later"]));
      expect(result).toEqual({ hasTrace: false, hasDisable: false });
    });

    it("does not detect TODO: @trace later as @trace", () => {
      const result = getFunctionPragmas(lineHost([" TODO: @trace later"]));
      expect(result).toEqual({ hasTrace: false, hasDisable: false });
    });
  });
});

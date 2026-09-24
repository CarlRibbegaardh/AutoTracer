/**
 * @file Unit tests for parseThemedMessage helper
 */

import { describe, expect, it } from "vitest";
import { parseThemedMessage } from "../../../../../src/lib/functions/theme/parseThemedMessage";

describe("parseThemedMessage", () => {
  describe("with styled message", () => {
    it("extracts message and CSS from applyTheme output", () => {
      const input = "%chello world%ccolor: #ff0000; font-weight: bold";
      const result = parseThemedMessage(input);

      expect(result).toEqual({
        message: "%chello world",
        css: "color: #ff0000; font-weight: bold",
      });
    });

    it("handles message with no styling", () => {
      const input = "plain message";
      const result = parseThemedMessage(input);

      expect(result).toEqual({
        message: "plain message",
        css: undefined,
      });
    });

    it("handles empty CSS string", () => {
      const input = "%cmessage%c";
      const result = parseThemedMessage(input);

      expect(result).toEqual({
        message: "%cmessage",
        css: "",
      });
    });
  });

  describe("edge cases", () => {
    it("handles empty string", () => {
      const result = parseThemedMessage("");

      expect(result).toEqual({
        message: "",
        css: undefined,
      });
    });

    it("handles single %c (malformed)", () => {
      const result = parseThemedMessage("%cmessage");

      expect(result).toEqual({
        message: "%cmessage",
        css: undefined,
      });
    });

    it("handles message with multiple %c markers", () => {
      const input = "%cpart1%cpart2%ccolor: red";
      const result = parseThemedMessage(input);

      // Should split on LAST %c
      expect(result).toEqual({
        message: "%cpart1%cpart2",
        css: "color: red",
      });
    });
  });
});

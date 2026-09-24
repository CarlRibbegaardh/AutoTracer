import { describe, it, expect } from "vitest";
import { passesRemainingPragmaSelection } from "../../src/passesRemainingPragmaSelection";
import { DEFAULT_CONFIG } from "../../src/types/index";
import type { NormalizedBabelPluginFlowConfig } from "../../src/types/index";

const optOut: NormalizedBabelPluginFlowConfig = { ...DEFAULT_CONFIG, mode: "opt-out" };
const optIn: NormalizedBabelPluginFlowConfig = { ...DEFAULT_CONFIG, mode: "opt-in" };

describe("passesRemainingPragmaSelection", () => {
  describe("@trace-disable always skips", () => {
    it("returns false when hasDisable is true in opt-out mode", () => {
      expect(passesRemainingPragmaSelection({ hasTrace: false, hasDisable: true }, optOut)).toBe(false);
    });

    it("returns false when hasDisable is true in opt-in mode even with hasTrace", () => {
      expect(passesRemainingPragmaSelection({ hasTrace: true, hasDisable: true }, optIn)).toBe(false);
    });
  });

  describe("@trace enables in both modes", () => {
    it("returns true when hasTrace is true in opt-out mode", () => {
      expect(passesRemainingPragmaSelection({ hasTrace: true, hasDisable: false }, optOut)).toBe(true);
    });

    it("returns true when hasTrace is true in opt-in mode", () => {
      expect(passesRemainingPragmaSelection({ hasTrace: true, hasDisable: false }, optIn)).toBe(true);
    });
  });

  describe("no pragma", () => {
    it("returns true with no pragma in opt-out mode (default on)", () => {
      expect(passesRemainingPragmaSelection({ hasTrace: false, hasDisable: false }, optOut)).toBe(true);
    });

    it("returns false with no pragma in opt-in mode", () => {
      expect(passesRemainingPragmaSelection({ hasTrace: false, hasDisable: false }, optIn)).toBe(false);
    });
  });
});

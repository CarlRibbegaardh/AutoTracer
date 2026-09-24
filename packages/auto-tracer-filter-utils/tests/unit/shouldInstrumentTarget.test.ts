import { describe, it, expect } from "vitest";
import { shouldInstrumentTarget } from "../../src/shouldInstrumentTarget";

describe("shouldInstrumentTarget", () => {
  describe("no filters", () => {
    it("should instrument all named targets when no filters specified", () => {
      expect(shouldInstrumentTarget("Button")).toBe(true);
      expect(shouldInstrumentTarget("handleClick")).toBe(true);
    });

    it("should instrument anonymous targets when no filters specified", () => {
      expect(shouldInstrumentTarget("anonymous")).toBe(true);
    });
  });

  describe("anonymous targets", () => {
    it("should exclude anonymous when include patterns specified", () => {
      expect(shouldInstrumentTarget("anonymous", ["Button"])).toBe(false);
      expect(shouldInstrumentTarget("anonymous", ["*"])).toBe(false);
    });

    it("should include anonymous when no include patterns specified", () => {
      expect(shouldInstrumentTarget("anonymous", undefined, ["Debug*"])).toBe(true);
    });

    it("should respect custom anonymous name", () => {
      expect(shouldInstrumentTarget("myAnon", ["*"], undefined, "myAnon")).toBe(false);
      expect(shouldInstrumentTarget("myAnon", undefined, undefined, "myAnon")).toBe(true);
    });
  });

  describe("exclude patterns", () => {
    it("should exclude targets matching exclude patterns (string)", () => {
      const exclude = ["Debug", "Test"];

      expect(shouldInstrumentTarget("Debug", undefined, exclude)).toBe(false);
      expect(shouldInstrumentTarget("Test", undefined, exclude)).toBe(false);
      expect(shouldInstrumentTarget("Button", undefined, exclude)).toBe(true);
    });

    it("should exclude targets matching exclude patterns (glob)", () => {
      const exclude = ["Debug*", "_*"];

      expect(shouldInstrumentTarget("DebugPanel", undefined, exclude)).toBe(false);
      expect(shouldInstrumentTarget("_privateFunction", undefined, exclude)).toBe(false);
      expect(shouldInstrumentTarget("Button", undefined, exclude)).toBe(true);
    });

    it("should exclude targets matching exclude patterns (regex)", () => {
      const exclude = [/^Debug/, /Test$/];

      expect(shouldInstrumentTarget("DebugPanel", undefined, exclude)).toBe(false);
      expect(shouldInstrumentTarget("ComponentTest", undefined, exclude)).toBe(false);
      expect(shouldInstrumentTarget("Button", undefined, exclude)).toBe(true);
    });
  });

  describe("include patterns", () => {
    it("should only include targets matching include patterns (string)", () => {
      const include = ["Button", "Card"];

      expect(shouldInstrumentTarget("Button", include)).toBe(true);
      expect(shouldInstrumentTarget("Card", include)).toBe(true);
      expect(shouldInstrumentTarget("Header", include)).toBe(false);
    });

    it("should only include targets matching include patterns (glob)", () => {
      const include = ["Button*", "*Page"];

      expect(shouldInstrumentTarget("ButtonPrimary", include)).toBe(true);
      expect(shouldInstrumentTarget("HomePage", include)).toBe(true);
      expect(shouldInstrumentTarget("Card", include)).toBe(false);
    });

    it("should only include targets matching include patterns (regex)", () => {
      const include = [/^Button/, /Page$/];

      expect(shouldInstrumentTarget("ButtonPrimary", include)).toBe(true);
      expect(shouldInstrumentTarget("HomePage", include)).toBe(true);
      expect(shouldInstrumentTarget("Card", include)).toBe(false);
    });
  });

  describe("include and exclude combined", () => {
    it("should exclude takes precedence over include", () => {
      const include = ["Button*"];
      const exclude = ["ButtonDebug"];

      expect(shouldInstrumentTarget("ButtonPrimary", include, exclude)).toBe(true);
      expect(shouldInstrumentTarget("ButtonDebug", include, exclude)).toBe(false);
    });

    it("should handle mixed pattern types", () => {
      const include = ["Button*", /^handle/];
      const exclude = [/Debug$/, "_*"];

      expect(shouldInstrumentTarget("ButtonPrimary", include, exclude)).toBe(true);
      expect(shouldInstrumentTarget("handleClick", include, exclude)).toBe(true);
      expect(shouldInstrumentTarget("ButtonDebug", include, exclude)).toBe(false);
      expect(shouldInstrumentTarget("_privateHandler", include, exclude)).toBe(false);
      expect(shouldInstrumentTarget("Card", include, exclude)).toBe(false);
    });
  });
});

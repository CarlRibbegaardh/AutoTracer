import { describe, it, expect } from "vitest";
import { shouldProcessFile } from "../../src/shouldProcessFile";

describe("shouldProcessFile", () => {
  describe("no filters", () => {
    it("should process all files when no filters specified", () => {
      expect(shouldProcessFile("src/App.tsx")).toBe(true);
      expect(shouldProcessFile("tests/App.test.tsx")).toBe(true);
    });
  });

  describe("exclude patterns", () => {
    it("should exclude files matching exclude patterns", () => {
      const exclude = { paths: ["**/*.test.*", "**/node_modules/**"] };

      expect(shouldProcessFile("src/App.test.tsx", undefined, exclude)).toBe(false);
      expect(shouldProcessFile("tests/Button.test.ts", undefined, exclude)).toBe(false);
      expect(shouldProcessFile("node_modules/react/index.js", undefined, exclude)).toBe(false);
    });

    it("should process files not matching exclude patterns", () => {
      const exclude = { paths: ["**/*.test.*"] };

      expect(shouldProcessFile("src/App.tsx", undefined, exclude)).toBe(true);
      expect(shouldProcessFile("src/components/Button.tsx", undefined, exclude)).toBe(true);
    });
  });

  describe("include patterns", () => {
    it("should only process files matching include patterns", () => {
      const include = { paths: ["src/**/*.tsx"] };

      expect(shouldProcessFile("src/App.tsx", include)).toBe(true);
      expect(shouldProcessFile("src/components/Button.tsx", include)).toBe(true);
      expect(shouldProcessFile("tests/App.test.tsx", include)).toBe(false);
      expect(shouldProcessFile("lib/utils.ts", include)).toBe(false);
    });

    it("should match project-relative include paths against absolute filenames", () => {
      const include = { paths: ["src/**/*.tsx"] };
      const absoluteFilename =
        "C:/Projects/ReactTracer/ReactTracer/apps/perf-test-mui/src/pages/LocationEditor.tsx";

      expect(shouldProcessFile(absoluteFilename, include)).toBe(true);
    });
  });

  describe("include and exclude combined", () => {
    it("should exclude takes precedence over include", () => {
      const include = { paths: ["src/**"] };
      const exclude = { paths: ["**/*.test.*"] };

      expect(shouldProcessFile("src/App.tsx", include, exclude)).toBe(true);
      expect(shouldProcessFile("src/App.test.tsx", include, exclude)).toBe(false);
    });
  });

  describe("path normalization", () => {
    it("should normalize Windows paths", () => {
      const include = { paths: ["src/**"] };

      expect(shouldProcessFile("src\\App.tsx", include)).toBe(true);
      expect(shouldProcessFile("src\\components\\Button.tsx", include)).toBe(true);
    });
  });
});

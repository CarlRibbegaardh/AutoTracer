import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveTracerOptions } from "@src/lib/resolveTracerOptions";
import type { ReactTracerOptions } from "@src/lib/interfaces/ReactTracerOptions";
import type { ReactTracerInternalOptions } from "@src/lib/types/ReactTracerInternalOptions";

vi.mock("@src/lib/functions/theme/index.js", () => ({
  mergeThemes: vi.fn((input: unknown) => ({ merged: true, input })),
}));

vi.mock("@src/lib/functions/validateOptions.js", () => ({
  validateReactTracerOptions: vi.fn((options: ReactTracerOptions) => options),
}));

vi.mock("@src/lib/functions/deepMerge.js", () => ({
  deepMergeOptions: vi.fn(
    (_current: ReactTracerInternalOptions, incoming: ReactTracerOptions) =>
      incoming as ReactTracerInternalOptions,
  ),
}));

const baseCurrentOptions: ReactTracerInternalOptions = {
  enabled: true,
  internalLogLevel: "error",
  includeReconciled: "never",
  includeSkipped: "never",
  showFlags: false,
  maxFiberDepth: 100,
  detectIdenticalValueChanges: true,
  includeNonTrackedBranches: false,
  skippedObjectProps: [],
};

describe("resolveTracerOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset theme global injection point
    Reflect.deleteProperty(globalThis, "__REACTTRACER_THEME__");
  });

  describe("enabledOnLoadOverride", () => {
    it("should apply override when enabledOnLoadOverride is true", async () => {
      const { validateReactTracerOptions } = vi.mocked(
        await import("@src/lib/functions/validateOptions.js"),
      );

      const options: ReactTracerOptions = { enabled: false };
      resolveTracerOptions(options, true, baseCurrentOptions);

      const calledWith = validateReactTracerOptions.mock.calls[0]?.[0];
      expect(calledWith?.enabled).toBe(true);
    });

    it("should apply override when enabledOnLoadOverride is false", async () => {
      const { validateReactTracerOptions } = vi.mocked(
        await import("@src/lib/functions/validateOptions.js"),
      );

      const options: ReactTracerOptions = { enabled: true };
      resolveTracerOptions(options, false, baseCurrentOptions);

      const calledWith = validateReactTracerOptions.mock.calls[0]?.[0];
      expect(calledWith?.enabled).toBe(false);
    });

    it("should preserve options.enabled when enabledOnLoadOverride is null", async () => {
      const { validateReactTracerOptions } = vi.mocked(
        await import("@src/lib/functions/validateOptions.js"),
      );

      const options: ReactTracerOptions = { enabled: true };
      resolveTracerOptions(options, null, baseCurrentOptions);

      const calledWith = validateReactTracerOptions.mock.calls[0]?.[0];
      expect(calledWith?.enabled).toBe(true);
    });
  });

  describe("theme merging", () => {
    it("should read theme from globalThis.__REACTTRACER_THEME__ and pass to mergeThemes", async () => {
      const { mergeThemes } = vi.mocked(
        await import("@src/lib/functions/theme/index.js"),
      );

      const injectedTheme = { definitiveRender: { lightMode: { text: "#ff0000" } } };
      Object.assign(globalThis, { __REACTTRACER_THEME__: injectedTheme });

      resolveTracerOptions({}, null, baseCurrentOptions);

      expect(mergeThemes).toHaveBeenCalledWith(injectedTheme);
    });

    it("should use empty object for theme when globalThis.__REACTTRACER_THEME__ is not set", async () => {
      const { mergeThemes } = vi.mocked(
        await import("@src/lib/functions/theme/index.js"),
      );

      resolveTracerOptions({}, null, baseCurrentOptions);

      expect(mergeThemes).toHaveBeenCalledWith({});
    });

    it("should use mergeThemes result as colors when options does not provide colors", async () => {
      const { mergeThemes } = vi.mocked(
        await import("@src/lib/functions/theme/index.js"),
      );
      const { validateReactTracerOptions } = vi.mocked(
        await import("@src/lib/functions/validateOptions.js"),
      );

      resolveTracerOptions({}, null, baseCurrentOptions);

      // The first mergeThemes call (for the global theme) should be used as colors
      const mergeThemesFirstReturn = mergeThemes.mock.results[0]?.value;
      const calledWith = validateReactTracerOptions.mock.calls[0]?.[0];
      expect(calledWith?.colors).toBe(mergeThemesFirstReturn);
    });

    it("should merge user-provided colors with mergeThemes when options.colors is provided", async () => {
      const { mergeThemes } = vi.mocked(
        await import("@src/lib/functions/theme/index.js"),
      );
      const { validateReactTracerOptions } = vi.mocked(
        await import("@src/lib/functions/validateOptions.js"),
      );

      const userColors = { definitiveRender: { lightMode: { text: "#123456" } } };
      resolveTracerOptions({ colors: userColors }, null, baseCurrentOptions);

      expect(mergeThemes).toHaveBeenCalledWith(userColors);
      const mergeThemesFirstReturn = mergeThemes.mock.results[0]?.value;
      const calledWith = validateReactTracerOptions.mock.calls[0]?.[0];
      expect(calledWith?.colors).toBe(mergeThemesFirstReturn);
    });

    it("should let injected theme files override programmatic colors", async () => {
      const { validateReactTracerOptions } = vi.mocked(
        await import("@src/lib/functions/validateOptions.js"),
      );

      const userColors = {
        definitiveRender: {
          lightMode: {
            text: "#0066cc",
            bold: true,
          },
        },
      };
      const injectedTheme = {
        definitiveRender: {
          lightMode: {
            text: "#ff00ff",
          },
        },
      };

      Object.assign(globalThis, { __REACTTRACER_THEME__: injectedTheme });

      resolveTracerOptions({ colors: userColors }, null, baseCurrentOptions);

      const calledWith = validateReactTracerOptions.mock.calls[0]?.[0];
      expect(calledWith?.colors).toEqual({
        merged: true,
        input: {
          definitiveRender: {
            lightMode: {
              text: "#ff00ff",
              bold: true,
            },
          },
        },
      });
    });
  });

  describe("validation and merging pipeline", () => {
    it("should call validateReactTracerOptions with the theme-applied options", async () => {
      const { validateReactTracerOptions } = vi.mocked(
        await import("@src/lib/functions/validateOptions.js"),
      );

      resolveTracerOptions({ enabled: true }, null, baseCurrentOptions);

      expect(validateReactTracerOptions).toHaveBeenCalledTimes(1);
    });

    it("should call deepMergeOptions with currentOptions and the validated options", async () => {
      const { validateReactTracerOptions } = vi.mocked(
        await import("@src/lib/functions/validateOptions.js"),
      );
      const { deepMergeOptions } = vi.mocked(
        await import("@src/lib/functions/deepMerge.js"),
      );

      const validatedResult: ReactTracerOptions = { enabled: true, internalLogLevel: "debug" };
      validateReactTracerOptions.mockReturnValue(validatedResult);

      resolveTracerOptions({}, null, baseCurrentOptions);

      expect(deepMergeOptions).toHaveBeenCalledWith(baseCurrentOptions, validatedResult);
    });

    it("should return validatedOptions as the result of validateReactTracerOptions", async () => {
      const { validateReactTracerOptions } = vi.mocked(
        await import("@src/lib/functions/validateOptions.js"),
      );

      const validatedResult: ReactTracerOptions = { enabled: false };
      validateReactTracerOptions.mockReturnValue(validatedResult);

      const result = resolveTracerOptions({}, null, baseCurrentOptions);

      expect(result.validatedOptions).toBe(validatedResult);
    });

    it("should return mergedOptions as the result of deepMergeOptions", async () => {
      const { deepMergeOptions } = vi.mocked(
        await import("@src/lib/functions/deepMerge.js"),
      );

      const mergedResult: ReactTracerInternalOptions = {
        ...baseCurrentOptions,
        enabled: false,
      };
      deepMergeOptions.mockReturnValue(mergedResult);

      const result = resolveTracerOptions({}, null, baseCurrentOptions);

      expect(result.mergedOptions).toBe(mergedResult);
    });
  });
});

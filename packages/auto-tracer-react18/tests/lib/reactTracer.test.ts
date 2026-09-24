import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock DevTools utils using vi.hoisted() to ensure proper hoisting
const {
  mockInstallRenderHook,
  mockRestoreRenderHook,
  mockCreateSafeRenderHook,
  mockIsDevToolsAvailable,
  mockLogDevToolsStatus,
} = vi.hoisted(() => {
  return {
    mockInstallRenderHook: vi.fn(),
    mockRestoreRenderHook: vi.fn(),
    mockCreateSafeRenderHook: vi.fn(),
    mockIsDevToolsAvailable: vi.fn(),
    mockLogDevToolsStatus: vi.fn(),
  };
});

import {
  isReactTracerInitialized,
  reactTracer,
  stopReactTracer,
  updateReactTracerOptions,
  useReactTracer,
} from "@src/lib/reactTracer";

// Mock global state
vi.mock("@src/lib/types/globalState.js", () => {
  let totalRenderCycles = 0;
  let startSnapshot = 0;
  let traceOptions: any = { enabled: true };
  return {
    setTracerOptions: vi.fn((options) => { traceOptions = options; }),
    logTracerOptionsUpdate: vi.fn(),
    setIsGlobalTracerInstalled: vi.fn(),
    setRenderStartTime: vi.fn(),
    incrementRenderCycle: vi.fn(() => {
      totalRenderCycles++;
    }),
    getRenderCycleInfo: vi.fn(() => {return {
      totalRenderCycles,
      lastDisplayedCycle: 0,
    }}),
    resetRenderCycleCounter: vi.fn(() => {
      totalRenderCycles = 0;
      startSnapshot = 0;
    }),
    getTotalRenderCount: vi.fn(() => {return totalRenderCycles}),
    snapshotRenderCycleStart: vi.fn(() => {
      startSnapshot = totalRenderCycles;
    }),
    getRenderCyclesDelta: vi.fn(() => {return totalRenderCycles - startSnapshot}),
    getTraceOptions: vi.fn(() => {return traceOptions}),
  };
});

// Mock validation
vi.mock("@src/lib/functions/validateOptions.js", () => {
  return {
    validateReactTracerOptions: vi.fn((options) => {
      return options;
    }),
  };
});

// Mock deep merge
vi.mock("@src/lib/functions/deepMerge.js", () => {
  return {
    deepMergeOptions: vi.fn((_target, source) => {
      // For testing, always start with defaults and merge the source
      const defaults = {
        enabled: true,
        internalLogLevel: "error",
        includeReconciled: "never" as const,
        includeSkipped: "never" as const,
        showFlags: false,
        maxFiberDepth: 100,
        detectIdenticalValueChanges: true,
        includeNonTrackedBranches: false,
        skippedObjectProps: [],
      };
      return { ...defaults, ...source };
    }),
  };
});

// Mock default settings
vi.mock("@src/lib/types/defaultSettings.js", () => {
  return {
    defaultReactTracerOptions: {
      enabled: true,
      internalLogLevel: "error",
      includeReconciled: "never" as const,
      includeSkipped: "never" as const,
      showFlags: false,
      maxFiberDepth: 100,
      detectIdenticalValueChanges: true,
      includeNonTrackedBranches: false,
      skippedObjectProps: [],
    },
  };
});

vi.mock("@src/lib/functions/devToolsUtils.js", () => {
  return {
    installRenderHook: mockInstallRenderHook,
    restoreRenderHook: mockRestoreRenderHook,
    createSafeRenderHook: mockCreateSafeRenderHook,
    isDevToolsAvailable: mockIsDevToolsAvailable,
    logDevToolsStatus: mockLogDevToolsStatus,
  };
});

// Mock detect updated components
vi.mock("@src/lib/functions/detectUpdatedComponents.js", () => {
  return {
    detectUpdatedComponents: vi.fn(),
    setAutoStopCallback: vi.fn(),
    setAutoStartCallback: vi.fn(),
    setIsEnabledCallback: vi.fn(),
    syncAutoStopLimitFromStorage: vi.fn(),
    syncTriggerSettingsFromStorage: vi.fn(),
    updateCachedAutoStopLimit: vi.fn(),
    updateCachedStartTrigger: vi.fn(),
    updateCachedEndTrigger: vi.fn(),
    updateCachedEndTriggerMode: vi.fn(),
    updateCachedTriggerRearmMode: vi.fn(),
    getCachedStartTrigger: vi.fn(() => {return null}),
  };
});

// Mock internalLogger
const mockInternalLogger = vi.hoisted(() => {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
});

vi.mock("@logger/internalLogger.js", () => {
  return {
    internalLogger: mockInternalLogger,
    applyInternalLogLevel: vi.fn(),
  };
});

// Mock render registry (include clearRenderRegistry to satisfy stopReactTracer clearing logic)
vi.mock("@src/lib/functions/renderRegistry.js", () => {
  return {
    useReactTracer: vi.fn(),
    clearRenderRegistry: vi.fn(),
  };
});

// Mock trigger state
vi.mock("@src/lib/functions/triggers/triggerState.js", () => {
  return {
    resetTriggerState: vi.fn(),
    isTriggeredByStart: vi.fn(() => {return false}),
    setTriggeredByStart: vi.fn(),
  };
});

// Mock theme functions
vi.mock("@src/lib/functions/theme/index.js", () => {
  return {
    mergeThemes: vi.fn((customTheme) => {
      // Default mock: return the input merged with defaults (proper ColorOptions structure)
      return {
        definitiveRender: {
          lightMode: { text: "#0044ff", bold: true },
          icon: "⚡",
        },
        propInitial: { lightMode: { text: "#ff00f2", italic: true } },
        propChange: { lightMode: { text: "#ff00f2" } },
        stateInitial: { lightMode: { text: "#ff9100", italic: true } },
        stateChange: { lightMode: { text: "#ff9100" } },
        logStatements: { lightMode: { text: "#00aa00" } },
        warnStatements: {
          lightMode: { text: "#000000", background: "#fbf6d7" },
          icon: "⚠️",
        },
        errorStatements: {
          lightMode: { text: "#000000", background: "#f6eceb" },
          icon: "⛔",
        },
        reconciled: { lightMode: { text: "#6b7280" } },
        skipped: { lightMode: { text: "#9ca3af" } },
        identicalStateValueWarning: { lightMode: { text: "#ff9100" } },
        identicalPropValueWarning: { lightMode: { text: "#ff00f2" } },
        other: { lightMode: { text: "#000000" } },
        ...customTheme,
      };
    }),
  };
});

describe("reactTracer", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset reactTracer state before each test
    if (isReactTracerInitialized()) {
      stopReactTracer();
    }
    // Set default mock return values (don't set mockIsDevToolsAvailable - let tests control it)
    mockCreateSafeRenderHook.mockReturnValue(vi.fn());
    mockInstallRenderHook.mockReturnValue(vi.fn());
    mockLogDevToolsStatus.mockImplementation(() => {});
    mockRestoreRenderHook.mockImplementation(() => {});

    // Set up detectUpdatedComponents mock
    const { detectUpdatedComponents } =
      await import("@src/lib/functions/detectUpdatedComponents.js");
    vi.mocked(detectUpdatedComponents).mockImplementation(() => {});
  });

  afterEach(() => {
    // Clean up after each test
    if (isReactTracerInitialized()) {
      stopReactTracer();
    }
  });

  describe("reactTracer function", () => {
    it("should return cleanup function when disabled", () => {
      const cleanup = reactTracer({
        enabled: false,
      });

      expect(typeof cleanup).toBe("function");
      expect(mockInternalLogger.debug).toHaveBeenCalledWith(
        "ReactTracer: Disabled via enabled: false option",
      );
      expect(isReactTracerInitialized()).toBe(false);
    });

    it("should handle when DevTools is not available", () => {
      mockIsDevToolsAvailable.mockReturnValue(false);

      const cleanup = reactTracer();

      expect(mockLogDevToolsStatus).toHaveBeenCalledWith(false);
      expect(typeof cleanup).toBe("function");
      expect(isReactTracerInitialized()).toBe(false);
    });

    it("should initialize successfully when DevTools is available", () => {
      mockIsDevToolsAvailable.mockReturnValue(true);
      mockCreateSafeRenderHook.mockReturnValue(vi.fn());
      mockInstallRenderHook.mockReturnValue(vi.fn());

      const cleanup = reactTracer();

      expect(mockCreateSafeRenderHook).toHaveBeenCalled();
      expect(mockInstallRenderHook).toHaveBeenCalled();
      expect(isReactTracerInitialized()).toBe(true);
      expect(mockInternalLogger.info).toHaveBeenCalledWith(
        "ReactTracer: Global render monitor initialized",
      );
      expect(typeof cleanup).toBe("function");
    });

    it("should return existing cleanup when already initialized", () => {
      mockIsDevToolsAvailable.mockReturnValue(true);
      mockCreateSafeRenderHook.mockReturnValue(vi.fn());
      mockInstallRenderHook.mockReturnValue(vi.fn());

      // First initialization
      reactTracer();
      expect(isReactTracerInitialized()).toBe(true);

      // Second call should return stopReactTracer without warning
      const cleanup = reactTracer();

      expect(mockInternalLogger.debug).toHaveBeenCalledWith(
        "ReactTracer is already active. Returning existing cleanup function.",
      );
      expect(cleanup).toBe(stopReactTracer);
    });

    it("should handle options properly", async () => {
      mockIsDevToolsAvailable.mockReturnValue(true);
      mockCreateSafeRenderHook.mockReturnValue(vi.fn());
      mockInstallRenderHook.mockReturnValue(vi.fn());

      const options = {
        includeReconciled: "always" as const,
        maxFiberDepth: 200,
      };

      reactTracer(options);

      const { validateReactTracerOptions } =
        await import("@src/lib/functions/validateOptions.js");
      const { deepMergeOptions } =
        await import("@src/lib/functions/deepMerge.js");
      const { setTracerOptions } =
        await import("@src/lib/types/globalState.js");

      // Should be called with options plus merged theme colors
      expect(validateReactTracerOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          includeReconciled: "always",
          maxFiberDepth: 200,
          colors: expect.any(Object), // Theme colors are merged
        }),
      );
      expect(deepMergeOptions).toHaveBeenCalled();
      expect(setTracerOptions).toHaveBeenCalled();
    });

    // TDD failing test: syncAutoStopLimitFromStorage must be called on initial enabled:true startup.
    // Without the fix, auto-stop limits stored in localStorage are silently ignored on page load
    // because only syncTriggerSettingsFromStorage was called in the initial enabled path.
    it("should sync auto-stop limit from storage on initial enabled start", async () => {
      mockIsDevToolsAvailable.mockReturnValue(true);
      mockCreateSafeRenderHook.mockReturnValue(vi.fn());
      mockInstallRenderHook.mockReturnValue(vi.fn());

      reactTracer({ enabled: true });

      const { syncAutoStopLimitFromStorage } = await import(
        "@src/lib/functions/detectUpdatedComponents.js"
      );
      expect(vi.mocked(syncAutoStopLimitFromStorage)).toHaveBeenCalled();
    });
  });

  describe("stopReactTracer", () => {
    it("should do nothing when not initialized", () => {
      expect(isReactTracerInitialized()).toBe(false);

      stopReactTracer();

      expect(mockRestoreRenderHook).not.toHaveBeenCalled();
    });

    it("should demote to passive mode when stopped", () => {
      mockIsDevToolsAvailable.mockReturnValue(true);
      mockCreateSafeRenderHook.mockReturnValue(vi.fn());
      const originalHook = vi.fn();
      mockInstallRenderHook.mockReturnValue(originalHook);

      reactTracer();
      expect(isReactTracerInitialized()).toBe(true);

      stopReactTracer();

      // Hook stays in passive mode, not fully restored
      expect(mockRestoreRenderHook).not.toHaveBeenCalled();
      expect(isReactTracerInitialized()).toBe(false);
    });
  });

  describe("isReactTracerInitialized", () => {
    it("should return false initially", () => {
      expect(isReactTracerInitialized()).toBe(false);
    });

    it("should return true when initialized", () => {
      mockIsDevToolsAvailable.mockReturnValue(true);
      mockCreateSafeRenderHook.mockReturnValue(vi.fn());
      mockInstallRenderHook.mockReturnValue(vi.fn());

      reactTracer();
      expect(isReactTracerInitialized()).toBe(true);
    });

    it("should return false after stopping", () => {
      mockIsDevToolsAvailable.mockReturnValue(true);
      mockCreateSafeRenderHook.mockReturnValue(vi.fn());
      mockInstallRenderHook.mockReturnValue(vi.fn());

      reactTracer();
      expect(isReactTracerInitialized()).toBe(true);

      stopReactTracer();
      expect(isReactTracerInitialized()).toBe(false);
    });
  });

  describe("updateReactTracerOptions", () => {
    it("should update options", async () => {
      const newOptions = {
        includeReconciled: "always" as const,
        maxFiberDepth: 150,
      };

      updateReactTracerOptions(newOptions);

      const { validateReactTracerOptions } =
        await import("@src/lib/functions/validateOptions.js");
      const { deepMergeOptions } =
        await import("@src/lib/functions/deepMerge.js");
      const { setTracerOptions } =
        await import("@src/lib/types/globalState.js");

      expect(validateReactTracerOptions).toHaveBeenCalledWith(newOptions);
      expect(deepMergeOptions).toHaveBeenCalled();
      expect(setTracerOptions).toHaveBeenCalled();
    });

    it("should handle empty options", async () => {
      updateReactTracerOptions({});

      const { validateReactTracerOptions } =
        await import("@src/lib/functions/validateOptions.js");
      expect(validateReactTracerOptions).toHaveBeenCalledWith({});
    });
  });

  describe("useReactTracer export", () => {
    it("should re-export useReactTracer from renderRegistry", () => {
      expect(useReactTracer).toBeDefined();
      expect(typeof useReactTracer).toBe("function");
    });
  });

  describe("theme integration", () => {
    let originalGlobal: typeof globalThis;

    beforeEach(() => {
      // Save original globalThis
      originalGlobal = globalThis;
      mockIsDevToolsAvailable.mockReturnValue(true);
      mockCreateSafeRenderHook.mockReturnValue(vi.fn());
      mockInstallRenderHook.mockReturnValue(vi.fn());
    });

    afterEach(() => {
      // Clean up globalThis
      delete (globalThis as any).__REACTTRACER_THEME__;
    });

    it("should use default theme when no global theme is injected", async () => {
      const { mergeThemes } = await import("@src/lib/functions/theme/index.js");
      const mergeSpy = vi.mocked(mergeThemes);

      reactTracer();

      // Should call mergeThemes with empty object (no injected theme)
      expect(mergeSpy).toHaveBeenCalledWith({});
    });

    it("should read and merge theme from globalThis.__REACTTRACER_THEME__", async () => {
      const injectedTheme = {
        definitiveRender: { lightMode: { text: "#00ff00" } },
        propChange: { lightMode: { text: "#ff0000" } },
      };
      (globalThis as any).__REACTTRACER_THEME__ = injectedTheme;

      const { mergeThemes } = await import("@src/lib/functions/theme/index.js");
      const mergeSpy = vi.mocked(mergeThemes);

      reactTracer();

      // Should call mergeThemes with the injected theme
      expect(mergeSpy).toHaveBeenCalledWith(injectedTheme);
    });

    it("should merge user-provided colors with theme from files", async () => {
      const injectedTheme = {
        definitiveRender: { lightMode: { text: "#00ff00" } },
        propChange: { lightMode: { text: "#ff0000" } },
      };
      (globalThis as any).__REACTTRACER_THEME__ = injectedTheme;

      const userColors = {
        definitiveRender: { lightMode: { text: "#0000ff" } }, // Override
        stateChange: { lightMode: { text: "#ffff00" } }, // New color
      };

      const { mergeThemes } = await import("@src/lib/functions/theme/index.js");
      const mergeSpy = vi.mocked(mergeThemes);

      reactTracer({ colors: userColors });

      expect(mergeSpy).toHaveBeenCalledWith({
        definitiveRender: { lightMode: { text: "#00ff00" } },
        propChange: { lightMode: { text: "#ff0000" } },
        stateChange: { lightMode: { text: "#ffff00" } },
      });
      expect(mergeSpy).toHaveBeenCalledTimes(1);
    });

    it("should use merged theme from files when user provides no colors option", async () => {
      const injectedTheme = {
        definitiveRender: { lightMode: { text: "#00ff00" } },
        propChange: { lightMode: { text: "#ff0000" } },
      };
      (globalThis as any).__REACTTRACER_THEME__ = injectedTheme;

      const { mergeThemes } = await import("@src/lib/functions/theme/index.js");
      const mergeSpy = vi.mocked(mergeThemes);

      // Mock mergeThemes to return a recognizable merged theme
      const mergedResult = { ...injectedTheme, merged: true };
      mergeSpy.mockReturnValue(mergedResult as any);

      reactTracer({ includeReconciled: "always" }); // Options without colors

      // Should call mergeThemes once with injected theme
      expect(mergeSpy).toHaveBeenCalledWith(injectedTheme);
      expect(mergeSpy).toHaveBeenCalledTimes(1);
    });

    it("should handle empty globalThis.__REACTTRACER_THEME__", async () => {
      (globalThis as any).__REACTTRACER_THEME__ = {};

      const { mergeThemes } = await import("@src/lib/functions/theme/index.js");
      const mergeSpy = vi.mocked(mergeThemes);

      reactTracer();

      // Should still call mergeThemes with empty object
      expect(mergeSpy).toHaveBeenCalledWith({});
    });

    it("should handle undefined globalThis.__REACTTRACER_THEME__", async () => {
      // Explicitly ensure it's undefined
      delete (globalThis as any).__REACTTRACER_THEME__;

      const { mergeThemes } = await import("@src/lib/functions/theme/index.js");
      const mergeSpy = vi.mocked(mergeThemes);

      reactTracer();

      // Should call mergeThemes with empty object (fallback)
      expect(mergeSpy).toHaveBeenCalledWith({});
    });

    it("should pass merged theme to validateReactTracerOptions", async () => {
      const injectedTheme = {
        definitiveRender: { lightMode: { text: "#00ff00" } },
        propChange: { lightMode: { text: "#ff0000" } },
      };
      (globalThis as any).__REACTTRACER_THEME__ = injectedTheme;

      const { mergeThemes } = await import("@src/lib/functions/theme/index.js");
      const mergeSpy = vi.mocked(mergeThemes);
      const mergedResult = {
        definitiveRender: { lightMode: { text: "#00ff00" } },
        propChange: { lightMode: { text: "#ff0000" } },
        stateChange: { lightMode: { text: "#df7f02" } },
      };
      mergeSpy.mockReturnValue(mergedResult as any);

      const { validateReactTracerOptions } =
        await import("@src/lib/functions/validateOptions.js");
      const validateSpy = vi.mocked(validateReactTracerOptions);

      reactTracer({ maxFiberDepth: 200 });

      // Should validate options containing the merged theme
      expect(validateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          maxFiberDepth: 200,
          colors: mergedResult,
        }),
      );
    });

    it("should let injected theme override overlapping project colors", async () => {
      const injectedTheme = {
        definitiveRender: { lightMode: { text: "#00ff00" } },
        propChange: { lightMode: { text: "#ff0000" } },
      };
      (globalThis as any).__REACTTRACER_THEME__ = injectedTheme;

      const userColors = {
        definitiveRender: { lightMode: { text: "#0000ff" } }, // User override
      };

      const { mergeThemes } = await import("@src/lib/functions/theme/index.js");
      const mergeSpy = vi.mocked(mergeThemes);

      const mergedTheme = {
        definitiveRender: { lightMode: { text: "#00ff00" } },
        propChange: { lightMode: { text: "#ff0000" } },
        other: { lightMode: { text: "#000000" } },
      };
      mergeSpy.mockReturnValue(mergedTheme as any);

      const { validateReactTracerOptions } =
        await import("@src/lib/functions/validateOptions.js");
      const validateSpy = vi.mocked(validateReactTracerOptions);

      reactTracer({ colors: userColors });

      expect(mergeSpy).toHaveBeenCalledWith({
        definitiveRender: { lightMode: { text: "#00ff00" } },
        propChange: { lightMode: { text: "#ff0000" } },
      });

      expect(validateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          colors: mergedTheme,
        }),
      );
    });

    it("should work when both theme and colors are undefined", async () => {
      delete (globalThis as any).__REACTTRACER_THEME__;

      const { mergeThemes } = await import("@src/lib/functions/theme/index.js");
      const mergeSpy = vi.mocked(mergeThemes);

      const { validateReactTracerOptions } =
        await import("@src/lib/functions/validateOptions.js");
      const validateSpy = vi.mocked(validateReactTracerOptions);

      reactTracer({});

      expect(mergeSpy).toHaveBeenCalledWith({});
      const mergedTheme = mergeSpy.mock.results[0]?.value;
      expect(validateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          colors: mergedTheme,
        }),
      );
    });
  });

  describe("trigger setter wiring on globalThis.autoTracer.reactTracer", () => {
    beforeEach(() => {
      mockIsDevToolsAvailable.mockReturnValue(true);
      mockCreateSafeRenderHook.mockReturnValue(vi.fn());
      mockInstallRenderHook.mockReturnValue(vi.fn());
    });

    it("should expose setStartTrigger on globalThis.autoTracer.reactTracer", () => {
      reactTracer();

      expect(typeof globalThis.autoTracer?.reactTracer?.setStartTrigger).toBe("function");
    });

    it("should expose setEndTrigger on globalThis.autoTracer.reactTracer", () => {
      reactTracer();

      expect(typeof globalThis.autoTracer?.reactTracer?.setEndTrigger).toBe("function");
    });

    it("should expose setEndTriggerMode on globalThis.autoTracer.reactTracer", () => {
      reactTracer();

      expect(typeof globalThis.autoTracer?.reactTracer?.setEndTriggerMode).toBe("function");
    });

    it("should expose setTriggerRearmMode on globalThis.autoTracer.reactTracer", () => {
      reactTracer();

      expect(typeof globalThis.autoTracer?.reactTracer?.setTriggerRearmMode).toBe("function");
    });

    it("should expose clearAllTriggers on globalThis.autoTracer.reactTracer", () => {
      reactTracer();

      expect(typeof globalThis.autoTracer?.reactTracer?.clearAllTriggers).toBe("function");
    });

    it("should call updateCachedStartTrigger when setStartTrigger is invoked", async () => {
      reactTracer();

      const { updateCachedStartTrigger } = await import(
        "@src/lib/functions/detectUpdatedComponents.js"
      );

      globalThis.autoTracer?.reactTracer?.setStartTrigger?.("MyComponent");

      expect(vi.mocked(updateCachedStartTrigger)).toHaveBeenCalledWith("MyComponent");
    });

    it("should call updateCachedEndTrigger when setEndTrigger is invoked", async () => {
      reactTracer();

      const { updateCachedEndTrigger } = await import(
        "@src/lib/functions/detectUpdatedComponents.js"
      );

      globalThis.autoTracer?.reactTracer?.setEndTrigger?.("Cleanup");

      expect(vi.mocked(updateCachedEndTrigger)).toHaveBeenCalledWith("Cleanup");
    });

    it("should call updateCachedEndTriggerMode when setEndTriggerMode is invoked", async () => {
      reactTracer();

      const { updateCachedEndTriggerMode } = await import(
        "@src/lib/functions/detectUpdatedComponents.js"
      );

      globalThis.autoTracer?.reactTracer?.setEndTriggerMode?.("on-entry");

      expect(vi.mocked(updateCachedEndTriggerMode)).toHaveBeenCalledWith("on-entry");
    });

    it("should call updateCachedTriggerRearmMode when setTriggerRearmMode is invoked", async () => {
      reactTracer();

      const { updateCachedTriggerRearmMode } = await import(
        "@src/lib/functions/detectUpdatedComponents.js"
      );

      globalThis.autoTracer?.reactTracer?.setTriggerRearmMode?.("always");

      expect(vi.mocked(updateCachedTriggerRearmMode)).toHaveBeenCalledWith("always");
    });
  });
});

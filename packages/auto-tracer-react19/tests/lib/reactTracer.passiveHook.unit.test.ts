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
} from "@src/lib/reactTracer";

vi.mock("@src/lib/types/globalState.js", () => {
  let totalRenderCycles = 0;
  let startSnapshot = 0;
  let traceOptions: any = { enabled: true };
  return {
    setTracerOptions: vi.fn((options) => { traceOptions = options; }),
    logTracerOptionsUpdate: vi.fn(),
    setIsGlobalTracerInstalled: vi.fn(),
    setRenderStartTime: vi.fn(),
    incrementRenderCycle: vi.fn(() => { totalRenderCycles++; }),
    getRenderCycleInfo: vi.fn(() => {return { totalRenderCycles, lastDisplayedCycle: 0 }}),
    resetRenderCycleCounter: vi.fn(() => { totalRenderCycles = 0; startSnapshot = 0; }),
    getTotalRenderCount: vi.fn(() => {return totalRenderCycles}),
    snapshotRenderCycleStart: vi.fn(() => { startSnapshot = totalRenderCycles; }),
    getRenderCyclesDelta: vi.fn(() => {return totalRenderCycles - startSnapshot}),
    getTraceOptions: () => traceOptions,
  };
});

vi.mock("@src/lib/functions/validateOptions.js", () => {return {
  validateReactTracerOptions: vi.fn((options) => {return options}),
}});

vi.mock("@src/lib/functions/deepMerge.js", () => {return {
  deepMergeOptions: vi.fn((_target, source) => {return {
    enabled: true,
    internalLogLevel: "error",
    includeReconciled: "never" as const,
    includeSkipped: "never" as const,
    showFlags: false,
    maxFiberDepth: 100,
    detectIdenticalValueChanges: true,
    includeNonTrackedBranches: false,
    skippedObjectProps: [],
    startTriggerFunctionName: null,
    endTriggerFunctionName: null,
    ...source,
  }}),
}});

vi.mock("@src/lib/types/defaultSettings.js", () => {return {
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
}});

vi.mock("@src/lib/functions/devToolsUtils.js", () => {return {
  installRenderHook: mockInstallRenderHook,
  restoreRenderHook: mockRestoreRenderHook,
  createSafeRenderHook: mockCreateSafeRenderHook,
  isDevToolsAvailable: mockIsDevToolsAvailable,
  logDevToolsStatus: mockLogDevToolsStatus,
}});

vi.mock("@src/lib/functions/detectUpdatedComponents.js", () => {return {
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
}});

vi.mock("@logger/internalLogger.js", () => {return {
  internalLogger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  applyInternalLogLevel: vi.fn(),
}});

vi.mock("@src/lib/functions/renderRegistry.js", () => {return {
  useReactTracer: vi.fn(),
  clearRenderRegistry: vi.fn(),
}});

vi.mock("@src/lib/functions/triggers/triggerState.js", () => {return {
  resetTriggerState: vi.fn(),
  isTriggeredByStart: vi.fn(() => {return false}),
  setTriggeredByStart: vi.fn(),
}});

vi.mock("@src/lib/functions/theme/index.js", () => {return {
  mergeThemes: vi.fn((customTheme) => {return {
    definitiveRender: { lightMode: { text: "#0044ff", bold: true }, icon: "⚡" },
    propInitial: { lightMode: { text: "#ff00f2", italic: true } },
    propChange: { lightMode: { text: "#ff00f2" } },
    stateInitial: { lightMode: { text: "#ff9100", italic: true } },
    stateChange: { lightMode: { text: "#ff9100" } },
    logStatements: { lightMode: { text: "#00aa00" } },
    warnStatements: { lightMode: { text: "#000000", background: "#fbf6d7" }, icon: "⚠️" },
    errorStatements: { lightMode: { text: "#000000", background: "#f6eceb" }, icon: "⛔" },
    reconciled: { lightMode: { text: "#6b7280" } },
    skipped: { lightMode: { text: "#9ca3af" } },
    identicalStateValueWarning: { lightMode: { text: "#ff9100" } },
    identicalPropValueWarning: { lightMode: { text: "#ff00f2" } },
    other: { lightMode: { text: "#000000" } },
    ...customTheme,
  }}),
}});

describe("reactTracer passive hook (start trigger watching)", () => {
  beforeEach(async () => {
    // Clean up any active or passive hook state first, then clear mocks
    // so cleanup calls don't pollute call counts for the actual test.
    if (isReactTracerInitialized()) {
      stopReactTracer();
    }
    stopReactTracer(); // also cleans up passive hook if present
    vi.clearAllMocks();
    mockCreateSafeRenderHook.mockReturnValue(vi.fn());
    mockInstallRenderHook.mockReturnValue(vi.fn());
    mockLogDevToolsStatus.mockImplementation(() => {});
    mockRestoreRenderHook.mockImplementation(() => {});
    mockIsDevToolsAvailable.mockReturnValue(true);
    // Reset getCachedStartTrigger to null (vi.clearAllMocks doesn't reset implementations)
    const { getCachedStartTrigger } = await import("@src/lib/functions/detectUpdatedComponents.js");
    vi.mocked(getCachedStartTrigger).mockReturnValue(null);
  });

  afterEach(() => {
    if (isReactTracerInitialized()) {
      stopReactTracer();
    }
  });

  describe("initial disabled state with start trigger", () => {
    it("should install the hook when disabled but start trigger is configured", () => {
      reactTracer({ enabled: false, startTriggerFunctionName: "MyComponent" });

      expect(mockInstallRenderHook).toHaveBeenCalledTimes(1);
    });

    it("should install passive hook when disabled and start trigger is saved in localStorage (but not in options)", async () => {
      // Simulate: dashboard saved a trigger to localStorage before page load.
      // syncTriggerSettingsFromStorage() runs during reactTracer(), and
      // getCachedStartTrigger() returns the loaded value.
      const { getCachedStartTrigger } = await import(
        "@src/lib/functions/detectUpdatedComponents.js"
      );
      vi.mocked(getCachedStartTrigger).mockReturnValue("Header");

      // App calls reactTracer with no trigger in options — the common case
      reactTracer({ enabled: false });

      // Passive hook must be installed so the localStorage-sourced trigger can fire
      expect(mockInstallRenderHook).toHaveBeenCalledTimes(1);
    });

    it("should install passive hook when disabled (to support runtime .start())", () => {
      reactTracer({ enabled: false });

      // Passive hook is always installed when disabled to allow runtime .start() to activate it
      expect(mockInstallRenderHook).toHaveBeenCalledTimes(1);
    });

    it("should not report as active (isReactTracerInitialized returns false) in passive mode", () => {
      reactTracer({ enabled: false, startTriggerFunctionName: "MyComponent" });

      expect(isReactTracerInitialized()).toBe(false);
    });
  });

  describe("stop with start trigger configured", () => {
    it("should keep the hook installed (demote to passive mode) when stopping", async () => {
      reactTracer({ enabled: true });

      const { getCachedStartTrigger } = await import(
        "@src/lib/functions/detectUpdatedComponents.js"
      );
      vi.mocked(getCachedStartTrigger).mockReturnValue("MyComponent");

      stopReactTracer();

      expect(mockRestoreRenderHook).not.toHaveBeenCalled();
    });

    it("should keep hook in passive mode (not restore) even when no start trigger is set", async () => {
      const { getCachedStartTrigger } = await import(
        "@src/lib/functions/detectUpdatedComponents.js"
      );
      vi.mocked(getCachedStartTrigger).mockReturnValue(null);

      reactTracer({ enabled: true });

      stopReactTracer();

      // Hook stays in passive mode to support runtime .start()
      expect(mockRestoreRenderHook).not.toHaveBeenCalled();
    });

    it("should report as not active after stop even when hook stays installed", async () => {
      reactTracer({ enabled: true });

      const { getCachedStartTrigger } = await import(
        "@src/lib/functions/detectUpdatedComponents.js"
      );
      vi.mocked(getCachedStartTrigger).mockReturnValue("MyComponent");

      stopReactTracer();

      expect(isReactTracerInitialized()).toBe(false);
    });
  });

  describe("startReactTracer when hook already installed passively", () => {
    it("should not call installRenderHook a second time when hook is already installed", async () => {
      // Start in passive mode (disabled with trigger)
      reactTracer({ enabled: false, startTriggerFunctionName: "MyComponent" });

      expect(mockInstallRenderHook).toHaveBeenCalledTimes(1);

      // Simulate trigger firing: startReactTracer called
      globalThis.autoTracer?.reactTracer?.start?.();

      // Hook was already installed — should not install again
      expect(mockInstallRenderHook).toHaveBeenCalledTimes(1);
    });
  });

  describe("passive hook auto-install when setStartTrigger is called at runtime", () => {
    it("should not reinstall passive hook when setStartTrigger is called (hook already in passive mode)", async () => {
      const { getCachedStartTrigger } = await import(
        "@src/lib/functions/detectUpdatedComponents.js"
      );
      vi.mocked(getCachedStartTrigger).mockReturnValue(null);

      // Start and stop the tracer (hook stays in passive mode)
      reactTracer({ enabled: true });
      stopReactTracer();

      vi.clearAllMocks();
      mockCreateSafeRenderHook.mockReturnValue(vi.fn());
      mockInstallRenderHook.mockReturnValue(vi.fn());

      // Set a start trigger at runtime while tracer is stopped
      globalThis.autoTracer?.reactTracer?.setStartTrigger?.("FreeTextSearch");

      // Hook is already installed in passive mode, no need to reinstall
      expect(mockInstallRenderHook).not.toHaveBeenCalled();
    });

    it("should NOT install passive hook when setStartTrigger is called while tracer is already active", async () => {
      // Tracer is active (hook already fully installed)
      reactTracer({ enabled: true });
      vi.clearAllMocks();
      mockInstallRenderHook.mockReturnValue(vi.fn());

      // Set a start trigger — tracer is already running, no extra hook install needed
      globalThis.autoTracer?.reactTracer?.setStartTrigger?.("FreeTextSearch");

      expect(mockInstallRenderHook).not.toHaveBeenCalled();
    });

    it("should NOT install passive hook when setStartTrigger is called with null", async () => {
      const { getCachedStartTrigger } = await import(
        "@src/lib/functions/detectUpdatedComponents.js"
      );
      vi.mocked(getCachedStartTrigger).mockReturnValue(null);

      reactTracer({ enabled: true });
      stopReactTracer();

      vi.clearAllMocks();
      mockInstallRenderHook.mockReturnValue(vi.fn());

      // Clear trigger — should not install a passive hook
      globalThis.autoTracer?.reactTracer?.setStartTrigger?.(null);

      expect(mockInstallRenderHook).not.toHaveBeenCalled();
    });

    it("should NOT install passive hook when DevTools is unavailable", async () => {
      const { getCachedStartTrigger } = await import(
        "@src/lib/functions/detectUpdatedComponents.js"
      );
      vi.mocked(getCachedStartTrigger).mockReturnValue(null);

      reactTracer({ enabled: true });
      stopReactTracer();

      vi.clearAllMocks();
      mockInstallRenderHook.mockReturnValue(vi.fn());
      mockIsDevToolsAvailable.mockReturnValue(false);

      globalThis.autoTracer?.reactTracer?.setStartTrigger?.("FreeTextSearch");

      expect(mockInstallRenderHook).not.toHaveBeenCalled();
    });
  });

  describe("trigger state preservation on stop", () => {
    it("should NOT reset trigger state when stopping an active tracer that demotes to passive (preserves 'once' re-arm lock)", async () => {
      const { resetTriggerState } = await import(
        "@src/lib/functions/triggers/triggerState.js"
      );
      const { getCachedStartTrigger } = await import(
        "@src/lib/functions/detectUpdatedComponents.js"
      );
      vi.mocked(getCachedStartTrigger).mockReturnValue("Header");

      reactTracer({ enabled: true });
      vi.clearAllMocks();

      stopReactTracer();

      expect(vi.mocked(resetTriggerState)).not.toHaveBeenCalled();
    });

    it("should NOT reset trigger state when fully stopping an active tracer with no start trigger", async () => {
      const { resetTriggerState } = await import(
        "@src/lib/functions/triggers/triggerState.js"
      );
      const { getCachedStartTrigger } = await import(
        "@src/lib/functions/detectUpdatedComponents.js"
      );
      vi.mocked(getCachedStartTrigger).mockReturnValue(null);

      reactTracer({ enabled: true });
      vi.clearAllMocks();

      stopReactTracer();

      expect(vi.mocked(resetTriggerState)).not.toHaveBeenCalled();
    });
  });
});

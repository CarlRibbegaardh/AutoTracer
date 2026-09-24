import { describe, it, expect, beforeEach, vi } from "vitest";
import { stopReactTracer } from "@src/lib/functions/stopReactTracer.js";
import { getOrCreateSharedControl } from "@src/lib/functions/getOrCreateSharedControl.js";
import { setIsGlobalTracerInstalled } from "@src/lib/types/globalState.js";

vi.mock("@src/lib/functions/getOrCreateSharedControl.js");
vi.mock("@src/lib/functions/devToolsUtils.js");
vi.mock("@src/lib/types/globalState.js");
vi.mock("@src/lib/functions/renderRegistry.js");
vi.mock("@src/lib/functions/triggers/triggerState.js");
vi.mock("@logger/internalLogger.js");

describe("stopReactTracer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (globalThis as any).__autoTracerInternal;
  });

  it("should clean up state when not active", () => {
    const mockSharedControl = {
      isReactTracerActive: false,
      isPassiveHookInstalled: false,
      isIntendedToBeEnabled: true,
      hasInitializedOnce: false,
      originalOnCommitFiberRoot: null,
    };
    vi.mocked(getOrCreateSharedControl).mockReturnValue(mockSharedControl);

    stopReactTracer();

    expect(mockSharedControl.isIntendedToBeEnabled).toBe(false);
    expect(mockSharedControl.isPassiveHookInstalled).toBe(false);
  });

  it("should demote to passive mode when active", () => {
    const mockOriginalHook = vi.fn();
    const mockSharedControl = {
      isReactTracerActive: true,
      isPassiveHookInstalled: false,
      isIntendedToBeEnabled: true,
      hasInitializedOnce: false,
      originalOnCommitFiberRoot: mockOriginalHook,
    };
    vi.mocked(getOrCreateSharedControl).mockReturnValue(mockSharedControl);

    stopReactTracer();

    expect(mockSharedControl.isReactTracerActive).toBe(false);
    expect(mockSharedControl.isIntendedToBeEnabled).toBe(false);
    expect(mockSharedControl.isPassiveHookInstalled).toBe(true);
    expect(setIsGlobalTracerInstalled).toHaveBeenCalledWith(false);
  });

  it("should keep passive hook when hook is installed", () => {
    const mockSharedControl = {
      isReactTracerActive: true,
      isPassiveHookInstalled: false,
      isIntendedToBeEnabled: true,
      hasInitializedOnce: false,
      originalOnCommitFiberRoot: vi.fn(),
    };
    vi.mocked(getOrCreateSharedControl).mockReturnValue(mockSharedControl);

    stopReactTracer();

    expect(mockSharedControl.isPassiveHookInstalled).toBe(true);
  });
});

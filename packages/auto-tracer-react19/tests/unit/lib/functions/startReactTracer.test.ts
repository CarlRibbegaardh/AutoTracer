import { describe, it, expect, beforeEach, vi } from "vitest";
import { startReactTracer } from "@src/lib/functions/startReactTracer.js";
import { getOrCreateSharedControl } from "@src/lib/functions/getOrCreateSharedControl.js";
import { setIsGlobalTracerInstalled } from "@src/lib/types/globalState.js";

vi.mock("@src/lib/functions/getOrCreateSharedControl.js");
vi.mock("@src/lib/functions/detectUpdatedComponents.js");
vi.mock("@src/lib/types/globalState.js");
vi.mock("@logger/internalLogger.js");

describe("startReactTracer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (globalThis as any).__autoTracerInternal;
  });

  it("should do nothing if already active", () => {
    const mockSharedControl = {
      isReactTracerActive: true,
      isPassiveHookInstalled: false,
      isIntendedToBeEnabled: false,
      hasInitializedOnce: false,
      originalOnCommitFiberRoot: null,
    };
    vi.mocked(getOrCreateSharedControl).mockReturnValue(mockSharedControl);

    startReactTracer();

    expect(mockSharedControl.isIntendedToBeEnabled).toBe(false);
  });

  it("should promote passive hook to active when passive hook is installed", () => {
    const mockSharedControl = {
      isReactTracerActive: false,
      isPassiveHookInstalled: true,
      isIntendedToBeEnabled: false,
      hasInitializedOnce: false,
      originalOnCommitFiberRoot: vi.fn(),
    };
    vi.mocked(getOrCreateSharedControl).mockReturnValue(mockSharedControl);

    startReactTracer();

    expect(mockSharedControl.isIntendedToBeEnabled).toBe(true);
    expect(mockSharedControl.isPassiveHookInstalled).toBe(false);
    expect(mockSharedControl.isReactTracerActive).toBe(true);
    expect(setIsGlobalTracerInstalled).toHaveBeenCalledWith(true);
  });

  it("should warn if no hook is installed", async () => {
    const mockSharedControl = {
      isReactTracerActive: false,
      isPassiveHookInstalled: false,
      isIntendedToBeEnabled: false,
      hasInitializedOnce: false,
      originalOnCommitFiberRoot: null,
    };
    vi.mocked(getOrCreateSharedControl).mockReturnValue(mockSharedControl);

    const { internalLogger } = await import("@logger/internalLogger.js");

    startReactTracer();

    expect(mockSharedControl.isIntendedToBeEnabled).toBe(true);
    expect(internalLogger.warn).toHaveBeenCalled();
  });
});

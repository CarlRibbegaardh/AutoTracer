import { describe, it, expect, beforeEach, vi } from "vitest";
import { updateReactTracerOptions } from "@src/lib/functions/updateReactTracerOptions.js";
import type { ReactTracerOptions } from "@src/lib/interfaces/ReactTracerOptions.js";

vi.mock("@src/lib/functions/mergeValidatedOptions.js");
vi.mock("@src/lib/functions/shouldAutoStop.js");
vi.mock("@src/lib/functions/stopReactTracer.js");
vi.mock("@src/lib/types/globalState.js");
vi.mock("@logger/internalLogger.js");

describe("updateReactTracerOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should merge options and update state", async () => {
    const partialOptions: Partial<ReactTracerOptions> = {
      enabled: true,
      internalLogLevel: "debug",
    };

    const mockMergedOptions = {
      enabled: true,
      internalLogLevel: "debug",
      detectIdenticalValueChanges: false,
    };

    const { mergeValidatedOptions } = await import("@src/lib/functions/mergeValidatedOptions.js");
    const { getTraceOptions, setTracerOptions, logTracerOptionsUpdate } = await import("@src/lib/types/globalState.js");
    const { shouldAutoStop } = await import("@src/lib/functions/shouldAutoStop.js");
    const { applyInternalLogLevel } = await import("@logger/internalLogger.js");

    vi.mocked(getTraceOptions).mockReturnValue({ enabled: false } as any);
    vi.mocked(mergeValidatedOptions).mockReturnValue(mockMergedOptions as any);
    vi.mocked(shouldAutoStop).mockReturnValue(false);

    updateReactTracerOptions(partialOptions);

    expect(mergeValidatedOptions).toHaveBeenCalled();
    expect(applyInternalLogLevel).toHaveBeenCalledWith("debug");
    expect(setTracerOptions).toHaveBeenCalledWith(mockMergedOptions);
    expect(logTracerOptionsUpdate).toHaveBeenCalledWith(partialOptions);
  });

  it("should call stopReactTracer when shouldAutoStop returns true", async () => {
    const partialOptions: Partial<ReactTracerOptions> = { enabled: false };

    const { mergeValidatedOptions } = await import("@src/lib/functions/mergeValidatedOptions.js");
    const { getTraceOptions } = await import("@src/lib/types/globalState.js");
    const { shouldAutoStop } = await import("@src/lib/functions/shouldAutoStop.js");
    const { stopReactTracer } = await import("@src/lib/functions/stopReactTracer.js");

    vi.mocked(getTraceOptions).mockReturnValue({ enabled: true } as any);
    vi.mocked(mergeValidatedOptions).mockReturnValue({ enabled: false } as any);
    vi.mocked(shouldAutoStop).mockReturnValue(true);

    updateReactTracerOptions(partialOptions);

    expect(stopReactTracer).toHaveBeenCalled();
  });
});

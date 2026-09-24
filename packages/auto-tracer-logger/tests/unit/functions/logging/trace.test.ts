import { beforeEach, describe, expect, it, vi } from "vitest";

describe("trace", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let consoleLogSpy: any;

  beforeEach(() => {
    vi.resetModules();
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("should call console.log when log level is trace", async () => {
    const { setLogLevel } = await import("@src/lib/functions/state/setLogLevel.js");
    const { trace } = await import("@src/lib/functions/logging/trace.js");

    setLogLevel("trace");
    trace("test message", 123);

    expect(consoleLogSpy).toHaveBeenCalledWith("test message", 123);
  });

  it("should not call console.log when log level is less verbose than trace", async () => {
    const { setLogLevel } = await import("@src/lib/functions/state/setLogLevel.js");
    const { trace } = await import("@src/lib/functions/logging/trace.js");

    setLogLevel("verbose");
    consoleLogSpy.mockClear();
    trace("test message");

    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it("should not call console.log when log level is fatal", async () => {
    const { setLogLevel } = await import("@src/lib/functions/state/setLogLevel.js");
    const { trace } = await import("@src/lib/functions/logging/trace.js");

    setLogLevel("fatal");
    consoleLogSpy.mockClear();
    trace("test");

    expect(consoleLogSpy).not.toHaveBeenCalled();
  });
});

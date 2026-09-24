import { beforeEach, describe, expect, it, vi } from "vitest";

describe("fatal", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let consoleErrorSpy: any;

  beforeEach(() => {
    vi.resetModules();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should call console.error when log level is fatal", async () => {
    const { setLogLevel } = await import("@src/lib/functions/state/setLogLevel.js");
    const { fatal } = await import("@src/lib/functions/logging/fatal.js");

    setLogLevel("fatal");
    fatal("test message", 123);

    expect(consoleErrorSpy).toHaveBeenCalledWith("test message", 123);
  });

  it("should call console.error when log level is more verbose than fatal", async () => {
    const { setLogLevel } = await import("@src/lib/functions/state/setLogLevel.js");
    const { fatal } = await import("@src/lib/functions/logging/fatal.js");

    setLogLevel("error");
    fatal("test message");

    expect(consoleErrorSpy).toHaveBeenCalledWith("test message");
  });

  it("should call console.error at all log levels (fatal is always shown)", async () => {
    const { setLogLevel } = await import("@src/lib/functions/state/setLogLevel.js");
    const { fatal } = await import("@src/lib/functions/logging/fatal.js");

    setLogLevel("trace");
    fatal("test");

    expect(consoleErrorSpy).toHaveBeenCalledWith("test");
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

describe("safeLog", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let consoleLogSpy: any;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("should call console.log with provided arguments", async () => {
    const { safeLog } = await import("@src/lib/functions/safe/safeLog.js");

    safeLog("test message", 123, { key: "value" });

    expect(consoleLogSpy).toHaveBeenCalledWith("test message", 123, { key: "value" });
  });

  it("should not throw if console.log throws", async () => {
    consoleLogSpy.mockImplementation(() => {
      throw new Error("Console error");
    });

    const { safeLog } = await import("@src/lib/functions/safe/safeLog.js");

    expect(() => {return safeLog("test")}).not.toThrow();
  });

  it("should call console.log even when it throws", async () => {
    consoleLogSpy.mockImplementation(() => {
      throw new Error("Console error");
    });

    const { safeLog } = await import("@src/lib/functions/safe/safeLog.js");

    safeLog("test");

    expect(consoleLogSpy).toHaveBeenCalledWith("test");
  });
});

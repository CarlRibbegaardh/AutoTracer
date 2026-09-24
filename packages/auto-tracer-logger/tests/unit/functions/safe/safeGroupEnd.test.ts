import { beforeEach, describe, expect, it, vi } from "vitest";

describe("safeGroupEnd", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let consoleGroupEndSpy: any;

  beforeEach(() => {
    consoleGroupEndSpy = vi.spyOn(console, "groupEnd").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleGroupEndSpy.mockRestore();
  });

  it("should call console.groupEnd", async () => {
    const { safeGroupEnd } = await import("@src/lib/functions/safe/safeGroupEnd.js");

    safeGroupEnd();

    expect(consoleGroupEndSpy).toHaveBeenCalledTimes(1);
  });

  it("should not throw if console.groupEnd throws", async () => {
    consoleGroupEndSpy.mockImplementation(() => {
      throw new Error("Console error");
    });

    const { safeGroupEnd } = await import("@src/lib/functions/safe/safeGroupEnd.js");

    expect(() => {return safeGroupEnd()}).not.toThrow();
  });

  it("should call console.groupEnd even when it throws", async () => {
    consoleGroupEndSpy.mockClear();
    consoleGroupEndSpy.mockImplementation(() => {
      throw new Error("Console error");
    });

    const { safeGroupEnd } = await import("@src/lib/functions/safe/safeGroupEnd.js");

    safeGroupEnd();

    expect(consoleGroupEndSpy).toHaveBeenCalledTimes(1);
  });
});

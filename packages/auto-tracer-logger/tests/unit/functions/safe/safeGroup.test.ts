import { beforeEach, describe, expect, it, vi } from "vitest";

describe("safeGroup", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let consoleGroupSpy: any;

  beforeEach(() => {
    consoleGroupSpy = vi.spyOn(console, "group").mockImplementation(() => {});
  });

  it("should call console.group with provided label", async () => {
    const { safeGroup } = await import("@src/lib/functions/safe/safeGroup.js");

    safeGroup("test group");

    expect(consoleGroupSpy).toHaveBeenCalledWith("test group");
  });

  it("should not throw if console.group throws", async () => {
    consoleGroupSpy.mockImplementation(() => {
      throw new Error("Console error");
    });

    const { safeGroup } = await import("@src/lib/functions/safe/safeGroup.js");

    expect(() => {return safeGroup("test")}).not.toThrow();
  });

  it("should call console.group even when it throws", async () => {
    consoleGroupSpy.mockImplementation(() => {
      throw new Error("Console error");
    });

    const { safeGroup } = await import("@src/lib/functions/safe/safeGroup.js");

    safeGroup("test");

    expect(consoleGroupSpy).toHaveBeenCalledWith("test");
  });
});

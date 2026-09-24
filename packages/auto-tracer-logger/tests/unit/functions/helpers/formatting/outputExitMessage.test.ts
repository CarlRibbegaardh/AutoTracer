import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { outputExitMessage } from "../../../../../src/lib/functions/helpers/formatting/outputExitMessage";

describe("outputExitMessage", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should output message with console.group in default mode", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const groupEndSpy = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

    const result = outputExitMessage("test message", "trace", 2, "default");

    expect(consoleSpy).toHaveBeenCalledWith("test message");
    expect(groupEndSpy).toHaveBeenCalled();
    expect(result).toBe(1); // groupStack decremented from 2 to 1
  });

  it("should output message with text prefix in text mode", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const result = outputExitMessage("test message", "trace", 2, "text");

    expect(consoleSpy).toHaveBeenCalledWith("│  └─ test message");
    expect(result).toBe(1); // groupStack decremented from 2 to 1
  });

  it("should calculate correct indent at depth 0 in text mode", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const result = outputExitMessage("message", "trace", 1, "text");

    expect(consoleSpy).toHaveBeenCalledWith("└─ message");
    expect(result).toBe(0);
  });

  it("should calculate correct indent at depth 3 in text mode", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const result = outputExitMessage("message", "trace", 4, "text");

    expect(consoleSpy).toHaveBeenCalledWith("│  │  │  └─ message");
    expect(result).toBe(3);
  });

  it("should use correct console method for log level", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    outputExitMessage("warning message", "warn", 1, "text");

    expect(warnSpy).toHaveBeenCalledWith("└─ warning message");
  });

  it("should use console.error for error level", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    outputExitMessage("error message", "error", 1, "text");

    expect(errorSpy).toHaveBeenCalledWith("└─ error message");
  });

  it("should pass optional parameters through in default mode", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const _groupEndSpy = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

    outputExitMessage("test", "trace", 1, "default", "param1", "param2");

    expect(consoleSpy).toHaveBeenCalledWith("test", "param1", "param2");
  });

  it("should pass optional parameters through in text mode", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    outputExitMessage("test", "trace", 1, "text", "style1", "style2");

    expect(consoleSpy).toHaveBeenCalledWith("└─ test", "style1", "style2");
  });

  it("should handle groupStack of 0 without negative indent", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const result = outputExitMessage("message", "trace", 0, "text");

    // groupStack 0 means we're at root, exit should use groupStack-1 but guard against negative
    expect(consoleSpy).toHaveBeenCalledWith("└─ message");
    expect(result).toBe(-1); // Returns decremented value even if nonsensical
  });

  it("should not call groupEnd in text mode", () => {
    const groupEndSpy = vi.spyOn(console, "groupEnd").mockImplementation(() => {});

    outputExitMessage("test", "trace", 1, "text");

    expect(groupEndSpy).not.toHaveBeenCalled();
  });
});

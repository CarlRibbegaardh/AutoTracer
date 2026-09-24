import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyTheme } from "../../../../src/lib/functions/helpers/applyTheme";
import * as safeConsoleModule from "../../../../src/lib/functions/safe/safeConsole";
import * as themeModule from "../../../../src/lib/functions/state/theme";
import * as groupDepthModule from "../../../../src/lib/functions/state/groupDepth";
import * as groupModeModule from "../../../../src/lib/functions/state/groupMode";

describe("applyTheme", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(groupModeModule, "getGroupModeInternal").mockReturnValue("default");
  });

  it("should call safeConsole with color and prefix when both are configured", () => {
    const safeConsoleSpy = vi.spyOn(safeConsoleModule, "safeConsole");
    vi.spyOn(themeModule, "getThemeInternal").mockReturnValue({
      colors: {
        error: "#ff0000",
      },
      prefixes: {
        error: "[ERROR]",
      },
    });

    applyTheme("error", "test message", "arg1", "arg2");

    expect(safeConsoleSpy).toHaveBeenCalledWith(
      "error",
      "%c[ERROR] test message",
      "color: #ff0000",
      "arg1",
      "arg2"
    );
  });

  it("should call safeConsole with color only when prefix is not configured", () => {
    const safeConsoleSpy = vi.spyOn(safeConsoleModule, "safeConsole");
    vi.spyOn(themeModule, "getThemeInternal").mockReturnValue({
      colors: {
        info: "#0000ff",
      },
      prefixes: {},
    });

    applyTheme("info", "test message", "extra");

    expect(safeConsoleSpy).toHaveBeenCalledWith(
      "info",
      "%ctest message",
      "color: #0000ff",
      "extra"
    );
  });

  it("should call safeConsole with prefix only when color is not configured", () => {
    const safeConsoleSpy = vi.spyOn(safeConsoleModule, "safeConsole");
    vi.spyOn(themeModule, "getThemeInternal").mockReturnValue({
      colors: {},
      prefixes: {
        warn: "[WARN]",
      },
    });

    applyTheme("warn", "test message");

    expect(safeConsoleSpy).toHaveBeenCalledWith("warn", "[WARN] test message");
  });

  it("should call safeConsole with no styling when neither color nor prefix is configured", () => {
    const safeConsoleSpy = vi.spyOn(safeConsoleModule, "safeConsole");
    vi.spyOn(themeModule, "getThemeInternal").mockReturnValue({
      colors: {},
      prefixes: {},
    });

    applyTheme("log", "test message", "arg1");

    expect(safeConsoleSpy).toHaveBeenCalledWith("log", "test message", "arg1");
  });

  it("should preserve user-provided %c directives when color is configured", () => {
    const safeConsoleSpy = vi.spyOn(safeConsoleModule, "safeConsole");
    vi.spyOn(themeModule, "getThemeInternal").mockReturnValue({
      colors: {
        debug: "#00ff00",
      },
      prefixes: {},
    });

    applyTheme(
      "debug",
      "test %cmessage%c",
      "color: blue",
      "color: inherit"
    );

    expect(safeConsoleSpy).toHaveBeenCalledWith(
      "debug",
      "%ctest %cmessage%c",
      "color: #00ff00",
      "color: blue",
      "color: inherit"
    );
  });

  it("should preserve user-provided %c directives when prefix is configured", () => {
    const safeConsoleSpy = vi.spyOn(safeConsoleModule, "safeConsole");
    vi.spyOn(themeModule, "getThemeInternal").mockReturnValue({
      colors: {},
      prefixes: {
        verbose: "[V]",
      },
    });

    applyTheme("verbose", "test %cmessage", "font-weight: bold");

    expect(safeConsoleSpy).toHaveBeenCalledWith(
      "verbose",
      "[V] test %cmessage",
      "font-weight: bold"
    );
  });

  it("should preserve user-provided %c directives when both color and prefix are configured", () => {
    const safeConsoleSpy = vi.spyOn(safeConsoleModule, "safeConsole");
    vi.spyOn(themeModule, "getThemeInternal").mockReturnValue({
      colors: {
        trace: "#888888",
      },
      prefixes: {
        trace: "[TRACE]",
      },
    });

    applyTheme("trace", "%cimportant%c data", "color: red", "");

    expect(safeConsoleSpy).toHaveBeenCalledWith(
      "trace",
      "%c[TRACE] %cimportant%c data",
      "color: #888888",
      "color: red",
      ""
    );
  });

  it("should handle empty message", () => {
    const safeConsoleSpy = vi.spyOn(safeConsoleModule, "safeConsole");
    vi.spyOn(themeModule, "getThemeInternal").mockReturnValue({
      colors: {
        fatal: "#ff0000",
      },
      prefixes: {
        fatal: "[FATAL]",
      },
    });

    applyTheme("fatal", "");

    expect(safeConsoleSpy).toHaveBeenCalledWith(
      "fatal",
      "%c[FATAL] ",
      "color: #ff0000"
    );
  });

  it("should place indentation before prefix when using text group mode and no color", () => {
    const safeConsoleSpy = vi.spyOn(safeConsoleModule, "safeConsole");

    // Mock theme to simulate "minimal" theme (prefix, no color, text group mode)
    vi.spyOn(themeModule, "getThemeInternal").mockReturnValue({
      colors: {},
      prefixes: {
        trace: "[TRACE]",
      },
    });

    vi.spyOn(groupModeModule, "getGroupModeInternal").mockReturnValue("text");

    // Mock depth to simulate nested call
    vi.spyOn(groupDepthModule, "getDepth").mockReturnValue(2);

    applyTheme("trace", "test message");

    expect(safeConsoleSpy).toHaveBeenCalledWith(
      "trace",
      "│  │  [TRACE] test message"
    );
  });

  it("should apply prefix to each line in multiline messages with prefix only", () => {
    const safeConsoleSpy = vi.spyOn(safeConsoleModule, "safeConsole");
    vi.spyOn(themeModule, "getThemeInternal").mockReturnValue({
      colors: {},
      prefixes: {
        error: "[ERROR]",
      },
    });

    applyTheme("error", "Line 1\nLine 2\nLine 3");

    expect(safeConsoleSpy).toHaveBeenCalledWith(
      "error",
      "[ERROR] Line 1\n[ERROR] Line 2\n[ERROR] Line 3"
    );
  });

  it("should apply prefix to each line in multiline messages with color and prefix", () => {
    const safeConsoleSpy = vi.spyOn(safeConsoleModule, "safeConsole");
    vi.spyOn(themeModule, "getThemeInternal").mockReturnValue({
      colors: {
        warn: "#ff9900",
      },
      prefixes: {
        warn: "[WARN]",
      },
    });

    applyTheme("warn", "First line\nSecond line");

    expect(safeConsoleSpy).toHaveBeenCalledWith(
      "warn",
      "%c[WARN] First line\n[WARN] Second line",
      "color: #ff9900"
    );
  });

  it("should apply indent and prefix to each line in text group mode with multiline messages", () => {
    const safeConsoleSpy = vi.spyOn(safeConsoleModule, "safeConsole");
    vi.spyOn(themeModule, "getThemeInternal").mockReturnValue({
      colors: {},
      prefixes: {
        log: "[LOG]",
      },
    });
    vi.spyOn(groupModeModule, "getGroupModeInternal").mockReturnValue("text");
    vi.spyOn(groupDepthModule, "getDepth").mockReturnValue(1);

    applyTheme("log", "Line A\nLine B");

    expect(safeConsoleSpy).toHaveBeenCalledWith(
      "log",
      "│  [LOG] Line A\n│  [LOG] Line B"
    );
  });
});

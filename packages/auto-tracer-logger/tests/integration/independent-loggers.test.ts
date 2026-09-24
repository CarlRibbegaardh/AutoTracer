import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getLogger } from "../../src/index";

describe("Independent Loggers Integration", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let consoleSpy: any;

  beforeEach(() => {
    // Reset loggers registry if possible?
    // The registry is a module-level singleton.
    // In integration tests, it might persist.
    // However, getLogger('UniqueName') ensures fresh instances if names are unique per test.

    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should maintain independent indentation depths for different named loggers in text mode", () => {
    const loggerA = getLogger(`LoggerA-${Date.now()}`);
    const loggerB = getLogger(`LoggerB-${Date.now()}`);

    // Setup Logger A
    loggerA.setTheme({
      colors: {},
      prefixes: { log: "[A]" },
    });
    loggerA.setGroupMode("text");
    loggerA.setLogLevel("log");
    loggerA.setShowName(false);

    // Setup Logger B
    loggerB.setTheme({
      colors: {},
      prefixes: { log: "[B]" },
    });
    loggerB.setGroupMode("text");
    loggerB.setLogLevel("log");
    loggerB.setShowName(false);

    // Action Sequence
    loggerA.group("Group A1");
    loggerA.log("Message A1");

    loggerB.log("Message B1"); // Should NOT be indented by A

    loggerB.group("Group B1");
    loggerB.log("Message B2"); // Indented by B's depth only

    loggerA.log("Message A2"); // Indented by A's depth only

    // Verification
    // The calls happen in sequence:
    // 1. A: ├─ [A] Group A1
    // 2. A: │  [A] Message A1
    // 3. B: [B] Message B1
    // 4. B: ├─ [B] Group B1
    // 5. B: │  [B] Message B2
    // 6. A: │  [A] Message A2

    const calls = consoleSpy.mock.calls.map((c: unknown[]) => {
      return c[0];
    });

    expect(calls).toEqual([
      "├─ Group A1",
      "│  [A] Message A1",
      "[B] Message B1",
      "├─ Group B1",
      "│  [B] Message B2",
      "│  [A] Message A2",
    ]);
  });

  it("should maintain independent indentation depths for enter/exit in text mode", () => {
    const loggerA = getLogger(`LoggerA-EnterExit-${Date.now()}`);
    const loggerB = getLogger(`LoggerB-EnterExit-${Date.now()}`);

    // Setup Logger A
    loggerA.setTheme({
      colors: {},
      prefixes: {
        trace: "[A]",
        enter: "→",
        exit: "←",
      },
    });
    loggerA.setGroupMode("text");
    loggerA.setLogLevel("trace");
    loggerA.setShowName(false);

    // Setup Logger B
    loggerB.setTheme({
      colors: {},
      prefixes: {
        trace: "[B]",
        enter: "→",
        exit: "←",
      },
    });
    loggerB.setGroupMode("text");
    loggerB.setLogLevel("trace");
    loggerB.setShowName(false);

    // Action Sequence
    const handleA = loggerA.enter("Function A");
    const handleB = loggerB.enter("Function B");

    loggerA.trace("Inside A");
    loggerB.trace("Inside B");

    loggerB.exit(handleB);
    loggerA.exit(handleA);

    // Verification
    const calls = consoleSpy.mock.calls.map((c: unknown[]) => {
      return c[0];
    });

    // Check structure (ignoring exact elapsed time)
    expect(calls[0]).toBe("├─ → Function A");
    expect(calls[1]).toBe("├─ → Function B"); // Should NOT be indented
    expect(calls[2]).toBe("│  [A] Inside A");
    expect(calls[3]).toBe("│  [B] Inside B");
    expect(calls[4]).toMatch(/^└─ ← Function B \(elapsed: .*ms\)$/);
    expect(calls[5]).toMatch(/^└─ ← Function A \(elapsed: .*ms\)$/);
  });
});

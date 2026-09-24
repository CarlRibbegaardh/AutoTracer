import { beforeEach, describe, expect, it, vi } from "vitest";
import { createLogger } from "../../src/lib/Logger";

describe("Text Mode: group() and enter() depth behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should increase depth for both group() and enter()", () => {
    const logger = createLogger("test");
    logger.setLogLevel("trace");
    logger.setShowName(false);
    logger.setTheme({ colors: {}, prefixes: {} });
    logger.setGroupMode("text");

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    // Depth 0: No indent
    logger.log("at depth 0");

    // group() increases to depth 1
    logger.group("Group 1");
    logger.log("at depth 1");

    // enter() increases to depth 2
    const h1 = logger.enter("Function 1");
    logger.log("at depth 2");

    // Another group() increases to depth 3
    logger.group("Group 2");
    logger.log("at depth 3");

    // exit() decreases to depth 2
    logger.exit(h1);
    logger.log("back to depth 2");

    // groupEnd() decreases to depth 1
    logger.groupEnd();
    logger.log("back to depth 1");

    // groupEnd() decreases to depth 0
    logger.groupEnd();
    logger.log("back to depth 0");

    const calls = consoleSpy.mock.calls;
    const logMessages = calls.map((call) => {
      return call[0] as string;
    });

    // Depth 0: no indent
    expect(logMessages[0]).toBe("at depth 0");

    // group() output + depth 1 log (│  )
    expect(logMessages[1]).toMatch(/├─.*Group 1/);
    expect(logMessages[2]).toBe("│  at depth 1");

    // enter() output + depth 2 log (│  prefix at depth 1)
    expect(logMessages[3]).toMatch(/│ {2}├─ Function 1/);
    expect(logMessages[4]).toBe("│  │  at depth 2");

    // group() output + depth 3 log (│  │  prefix at depth 2)
    expect(logMessages[5]).toMatch(/│ {2}│ {2}├─.*Group 2/);
    expect(logMessages[6]).toBe("│  │  │  at depth 3");

    // exit() output: shows depth 2 (groupStack-1), then groupStack decrements from 3→2
    expect(logMessages[7]).toMatch(/│ {2}└─.*Function 1.*elapsed/);

    // After exit, groupStack=2 → depth=2 → "│  │  "
    expect(logMessages[8]).toBe("│  │  back to depth 2");

    // After groupEnd(), groupStack=1 → depth=1 → "│  "
    expect(logMessages[9]).toBe("│  back to depth 1");

    // After groupEnd(), groupStack=0 → depth=0 → ""
    expect(logMessages[10]).toBe("back to depth 0");
  });

  it("should apply depth to all log levels (fatal, error, warn, log, info, debug, verbose, trace)", () => {
    const logger = createLogger("test");
    logger.setLogLevel("trace");
    logger.setShowName(false);
    logger.setTheme({ colors: {}, prefixes: {} });
    logger.setGroupMode("text");

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    logger.group("Test Group");

    logger.fatal("fatal msg");
    logger.error("error msg");
    logger.warn("warn msg");
    logger.log("log msg");
    logger.info("info msg");
    logger.debug("debug msg");
    logger.verbose("verbose msg");
    logger.trace("trace msg");

    logger.groupEnd();

    // All should have "│  " prefix
    const fatalCall = errorSpy.mock.calls[0];
    const errorCall = errorSpy.mock.calls[1];
    const warnCall = warnSpy.mock.calls[0];

    expect(fatalCall).toBeDefined();
    expect(errorCall).toBeDefined();
    expect(warnCall).toBeDefined();

    expect((fatalCall![0] as string).startsWith("│  ")).toBe(true); // fatal
    expect((errorCall![0] as string).startsWith("│  ")).toBe(true); // error
    expect((warnCall![0] as string).startsWith("│  ")).toBe(true);  // warn

    const logCalls = consoleSpy.mock.calls.filter((call) => {
      return typeof call[0] === "string" && call[0].includes("msg");
    });

    logCalls.forEach((call, idx) => {
      expect((call[0] as string).startsWith("│  "),
        `Log call ${idx} should have depth marker: ${call[0]}`
      ).toBe(true);
    });
  });

  it("should handle mixed group() and enter() nesting and unwinding", () => {
    const logger = createLogger("test");
    logger.setLogLevel("trace");
    logger.setShowName(false);
    logger.setTheme({ colors: {}, prefixes: {} });
    logger.setGroupMode("text");

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    logger.group("G1");           // depth 1
    const h1 = logger.enter("E1"); // depth 2
    logger.group("G2");           // depth 3
    const h2 = logger.enter("E2"); // depth 4

    logger.log("deepest");        // Should be at depth 4: "│  │  │  │  "

    logger.exit(h2);              // depth 3
    logger.log("after E2");       // Should be at depth 3: "│  │  │  "

    logger.groupEnd();            // depth 2
    logger.exit(h1);              // depth 1
    logger.log("after E1");       // Should be at depth 1: "│  "

    logger.groupEnd();            // depth 0
    logger.log("done");           // Should be at depth 0: ""

    const calls = consoleSpy.mock.calls;
    const logMessages = calls.map((call) => {
      return call[0] as string;
    });

    const deepestMsg = logMessages.find((m) => {
      return m.includes("deepest");
    });
    expect(deepestMsg).toMatch(/^│ {2}│ {2}│ {2}│ {2}deepest/);

    const afterE2Msg = logMessages.find((m) => {
      return m.includes("after E2");
    });
    expect(afterE2Msg).toMatch(/^│ {2}│ {2}│ {2}after E2/);

    const afterE1Msg = logMessages.find((m) => {
      return m.includes("after E1");
    });
    expect(afterE1Msg).toMatch(/^│ {2}after E1/);

    const doneMsg = logMessages.find((m) => {
      return m === "done";
    });
    expect(doneMsg).toBe("done");
  });
});

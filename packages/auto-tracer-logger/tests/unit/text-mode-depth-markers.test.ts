import { beforeEach, describe, expect, it, vi } from "vitest";
import { createLogger } from "../../src/lib/Logger";

describe("Text Mode Depth Markers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should place depth markers OUTSIDE %c formatting for trace messages", () => {
    const logger = createLogger("test");
    logger.setLogLevel("trace");

    // Set text mode with color theme
    logger.setTheme({
      colors: { trace: "#999999" },
      prefixes: {},
    });
    logger.setGroupMode("text");

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    // Enter a group (increments groupStack to 1)
    logger.group("Outer");

    // Log a trace message - should have depth markers
    logger.trace("test message");

    // Find the trace call
    const traceCalls = consoleSpy.mock.calls;
    expect(traceCalls.length).toBeGreaterThan(0);

    // Find the call for "test message"
    const traceCall = traceCalls.find(call => {
      const firstArg = call[0];
      return typeof firstArg === "string" && firstArg.includes("test message");
    });

    expect(traceCall).toBeDefined();

    const [message, style] = traceCall!;

    console.log("\n=== Actual console.log() call ===");
    console.log("Message:", message);
    console.log("Style:", style);

    // The depth markers should be OUTSIDE the %c directive
    // CORRECT: "│  %ctest message"
    // WRONG:   "%c│  test message"

    // Check that message starts with depth markers, NOT with %c
    expect(
      message.startsWith("│"),
      `Message should start with depth marker │, but got: "${message}"`
    ).toBe(true);

    // Check that %c comes AFTER the depth markers
    const depthMarkersMatch = message.match(/^(│\s\s)+/);
    expect(
      depthMarkersMatch,
      "Message should have depth markers at the beginning"
    ).toBeTruthy();

    const depthMarkersLength = depthMarkersMatch![0].length;
    const restOfMessage = message.substring(depthMarkersLength);

    expect(
      restOfMessage.startsWith("%c"),
      `After depth markers, message should start with %c, but got: "${restOfMessage}"`
    ).toBe(true);
  });

  it("should place depth markers OUTSIDE %c formatting in nested groups", () => {
    const logger = createLogger("test");
    logger.setLogLevel("trace");

    logger.setTheme({
      colors: { trace: "#999999" },
      prefixes: {},
    });
    logger.setGroupMode("text");

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    // Create nested groups
    logger.group("Level 1");
    logger.group("Level 2");

    // Now groupStack = 2, so we should have "│  │  " prefix
    logger.trace("nested message");

    const traceCalls = consoleSpy.mock.calls;
    const traceCall = traceCalls.find(call => {
      const firstArg = call[0];
      return typeof firstArg === "string" && firstArg.includes("nested message");
    });

    expect(traceCall).toBeDefined();

    const [message] = traceCall!;

    console.log("\n=== Nested trace message ===");
    console.log("Message:", message);

    // Should have TWO levels of depth markers: "│  │  "
    // And %c should come AFTER them
    expect(
      message.startsWith("│  │  %c"),
      `Message should start with "│  │  %c", but got: "${message.substring(0, 20)}"`
    ).toBe(true);
  });

  it("should NOT add depth markers in default mode (console.group)", () => {
    const logger = createLogger("test");
    logger.setLogLevel("trace");

    // Default mode uses console.group, no text markers
    logger.setTheme({
      colors: { trace: "#999999" },
      prefixes: {},
    });
    logger.setGroupMode("default");

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "group").mockImplementation(() => {});

    logger.group("Outer");
    logger.trace("test message");

    const traceCalls = consoleSpy.mock.calls;
    const traceCall = traceCalls.find(call => {
      const firstArg = call[0];
      return typeof firstArg === "string" && firstArg.includes("test message");
    });

    expect(traceCall).toBeDefined();

    const [message] = traceCall!;

    console.log("\n=== Default mode message ===");
    console.log("Message:", message);

    // In default mode, should NOT have │ markers
    expect(
      message.startsWith("│"),
      `Message should NOT have depth markers in default mode, but got: "${message}"`
    ).toBe(false);
  });
});

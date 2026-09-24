import { describe, it, expect, beforeEach, vi } from "vitest";
import { createFlowTracer } from "../../../src/lib/FlowTracer";
import { createFlowRuntimeControls } from "../../../src/lib/createFlowRuntimeControls";
import { resetTriggerState } from "../../../src/lib/triggers/triggerState";
import { createLogger } from "../../../../auto-tracer-logger/src/lib/Logger";
import type { Logger } from "../../../../auto-tracer-logger/src/lib/Logger";
import type { FlowThemeConfig } from "../../../src/lib/types/FlowThemeConfig";
import type { FlowTracer } from "../../../src/lib/FlowTracer";

/** Narrows a FlowTracer to include its internal wiring methods without an unsafe cast. */
function isExtendedFlowTracer(t: FlowTracer): t is FlowTracer & {
  setAutoStopCallback(cb: (() => void) | null): void;
  setAutoStartCallback(cb: (() => void) | null): void;
  setIsEnabledCallback(cb: (() => boolean) | null): void;
  updateCachedStartTrigger(p: string | null): void;
  updateCachedEndTrigger(p: string | null): void;
  updateCachedEndTriggerMode(m: "on-entry" | "on-exit"): void;
  updateCachedTriggerRearmMode(m: "always" | "once"): void;
} {
  return "setAutoStartCallback" in t;
}

describe("FlowTracer", () => {
  let logger: Logger;
  let enterStyledSpy: ReturnType<typeof vi.fn>;
  let exitStyledSpy: ReturnType<typeof vi.fn>;
  let traceSpy: ReturnType<typeof vi.fn>;
  let debugSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    logger = createLogger("test");
    enterStyledSpy = vi.spyOn(logger, "enterStyled");
    exitStyledSpy = vi.spyOn(logger, "exitStyled");
    traceSpy = vi.spyOn(logger, "trace");
    debugSpy = vi.spyOn(logger, "debug");
  });

  describe("creation", () => {
    it("should create a flow tracer instance", () => {
      const tracer = createFlowTracer(logger);

      expect(tracer).toBeDefined();
      expect(tracer.enter).toBeTypeOf("function");
      expect(tracer.exit).toBeTypeOf("function");
      expect(tracer.trace).toBeTypeOf("function");
      expect(tracer.debug).toBeTypeOf("function");
    });

    it("should create tracer with config parameter (reserved for future)", () => {
      const tracer = createFlowTracer(logger, {
        // logEnter: false,
        // logExit: false,
        // logTiming: false,
      });

      expect(tracer).toBeDefined();
    });
  });

  describe("enter()", () => {
    it("should return a trace handle", () => {
      const tracer = createFlowTracer(logger);
      const handle = tracer.enter("testFunction");

      expect(handle).toBeDefined();
      expect(handle.startTime).toBeTypeOf("number");
    });

    it("should delegate to logger.enterStyled", () => {
      const tracer = createFlowTracer(logger);
      tracer.enter("testFunction");

      // Theme applies: raw label + styled label with icon (→) + bold styling
      expect(enterStyledSpy).toHaveBeenCalledWith(
        "testFunction",
        "%c→ testFunction",
        "font-weight: bold",
      );
    });

    it("should not log when called without parameters", () => {
      const tracer = createFlowTracer(logger);
      tracer.enter("testFunction");

      // Entry is themed with bold
      expect(enterStyledSpy).toHaveBeenCalledWith(
        "testFunction",
        "%c→ testFunction",
        "font-weight: bold",
      );
      expect(traceSpy).not.toHaveBeenCalled();
    });
  });

  describe("exit()", () => {
    it("should delegate to logger.exitStyled", () => {
      const tracer = createFlowTracer(logger);
      const handle = tracer.enter("testFunction");
      tracer.exit(handle);

      expect(exitStyledSpy).toHaveBeenCalledWith(
        handle,
        "%c← testFunction",
        "font-weight: bold",
      );
    });

    it("should apply functionExit theme with correct icon", () => {
      const tracer = createFlowTracer(logger);
      const handle = tracer.enter("myFunction");

      // Enter should use → icon
      expect(enterStyledSpy).toHaveBeenCalledWith(
        "myFunction",
        "%c→ myFunction",
        "font-weight: bold",
      );

      tracer.exit(handle);

      // Exit should pass handle + styled exit label with ← icon
      expect(exitStyledSpy).toHaveBeenCalledTimes(1);
      const [exitHandle, styledLabel, css] = exitStyledSpy.mock.calls[0] as [
        any,
        string,
        string,
      ];

      expect(exitHandle).toBe(handle);
      expect(styledLabel).toBe("%c← myFunction");
      expect(css).toBe("font-weight: bold");
    });
  });

  describe("traceParameter()", () => {
    it("should log parameter with themed styling", () => {
      const tracer = createFlowTracer(logger);
      tracer.traceParameter("arg1", "value1");

      expect(traceSpy).toHaveBeenCalledWith(
        "%cparam arg1:",
        "font-style: italic",
        "value1",
      );
    });

    it("should log multiple parameters", () => {
      const tracer = createFlowTracer(logger);
      tracer.traceParameter("arg1", "value1");
      tracer.traceParameter("arg2", 42);

      expect(traceSpy).toHaveBeenCalledWith(
        "%cparam arg1:",
        "font-style: italic",
        "value1",
      );
      expect(traceSpy).toHaveBeenCalledWith(
        "%cparam arg2:",
        "font-style: italic",
        42,
      );
    });
  });

  describe("traceReturnValue()", () => {
    it("should log return value with themed styling", () => {
      const tracer = createFlowTracer(logger);
      tracer.traceReturnValue("result");

      // Return value uses plain styling (no CSS in default theme)
      expect(traceSpy).toHaveBeenCalledWith("returned:", "result");
    });
  });

  describe("traceException()", () => {
    it("should log exception with themed styling", () => {
      const tracer = createFlowTracer(logger);
      const error = new Error("test error");
      tracer.traceException("testFunction", error);

      // Exception uses bold styling and 💥 icon
      expect(debugSpy).toHaveBeenCalledWith(
        "%c💥 Exception in testFunction:",
        "font-weight: bold",
        error,
      );
    });
  });

  describe("enterAsync()", () => {
    // Spec: docs/work/spec/flow-theme-system-design.md lines 47-48
    // "Async started: Flat trace message with suffix (async started)"
    it("should use flat trace message with (async started) suffix", () => {
      const tracer = createFlowTracer(logger);
      tracer.enterAsync("fetchData");

      // MUST use trace(), NEVER enterStyled() because async operations are NOT collapsible groups
      expect(traceSpy).toHaveBeenCalledWith(
        "%c→ fetchData (async started)",
        "font-weight: bold",
      );
      expect(enterStyledSpy).not.toHaveBeenCalled();
    });
  });

  describe("exitAsync()", () => {
    // Spec: docs/work/spec/flow-theme-system-design.md lines 47-48
    // "Async completed: Flat trace message with suffix (async completed)"
    it("should use flat trace message with (async completed) suffix and timing", () => {
      const tracer = createFlowTracer(logger);
      const handle = tracer.enterAsync("fetchData");
      tracer.exitAsync(handle);

      // MUST use trace(), NEVER exitStyled() because async operations don't nest cleanly
      expect(traceSpy).toHaveBeenCalledTimes(2); // enterAsync + exitAsync
      const exitCall = traceSpy.mock.calls[1];
      expect(exitCall).toBeDefined();
      expect(exitCall![0]).toMatch(
        /^%c← fetchData \(async completed, elapsed: \d+\.\d+ms\)$/,
      );
      expect(exitCall![1]).toBe("font-weight: bold");
      expect(exitStyledSpy).not.toHaveBeenCalled();
    });

    it("should apply asyncComplete theme with correct icon", () => {
      const tracer = createFlowTracer(logger);
      const handle = tracer.enterAsync("myAsyncFunction");

      // EnterAsync should use → icon with (async started) suffix
      expect(traceSpy).toHaveBeenCalledWith(
        "%c→ myAsyncFunction (async started)",
        "font-weight: bold",
      );

      tracer.exitAsync(handle);

      // ExitAsync should use ← icon with (async completed) suffix and timing
      expect(traceSpy).toHaveBeenCalledTimes(2);
      const exitCall = traceSpy.mock.calls[1];
      expect(exitCall).toBeDefined();
      expect(exitCall![0]).toMatch(
        /^%c← myAsyncFunction \(async completed, elapsed: \d+\.\d+ms\)$/,
      );
      expect(exitCall![1]).toBe("font-weight: bold");
    });

    // Spec: docs/work/spec/flow-theme-system-design.md lines 47-48
    // "Async started: Flat trace message with suffix (async started)"
    // "Async completed: Flat trace message with suffix (async completed)"
    it("should use flat trace messages (NOT console.group) for async operations", () => {
      const tracer = createFlowTracer(logger);
      const handle = tracer.enterAsync("fetchData");

      // BUG: Currently uses enterStyled (console.group) but should use trace (flat message)
      // MUST use trace(), NEVER enterStyled() because async operations don't nest cleanly
      expect(traceSpy).toHaveBeenCalledWith(
        "%c→ fetchData (async started)",
        "font-weight: bold",
      );
      expect(enterStyledSpy).not.toHaveBeenCalled();

      tracer.exitAsync(handle);

      // MUST use trace(), NEVER exitStyled() because async operations don't nest cleanly
      expect(traceSpy).toHaveBeenCalledWith(
        expect.stringContaining("← fetchData (async completed"),
        "font-weight: bold",
      );
      expect(exitStyledSpy).not.toHaveBeenCalled();
    });
  });

  describe("trace()", () => {
    it("should delegate to logger.trace", () => {
      const tracer = createFlowTracer(logger);
      tracer.trace("trace message", "param1", 42);

      expect(traceSpy).toHaveBeenCalledWith("trace message", "param1", 42);
    });
  });

  describe("debug()", () => {
    it("should delegate to logger.debug", () => {
      const tracer = createFlowTracer(logger);
      tracer.debug("debug message", "param1", 42);

      expect(debugSpy).toHaveBeenCalledWith("debug message", "param1", 42);
    });
  });

  describe("nested calls", () => {
    it("should handle nested function calls", () => {
      const tracer = createFlowTracer(logger);
      const h1 = tracer.enter("outer");
      const h2 = tracer.enter("inner");

      tracer.exit(h2);
      tracer.exit(h1);

      expect(enterStyledSpy).toHaveBeenCalledTimes(2);
      expect(exitStyledSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("trigger re-arm mode", () => {
    beforeEach(() => {
      // Reset module-level trigger state to isolate tests
      resetTriggerState();
    });

    function wireTracer(
      tracer: FlowTracer,
      controls: ReturnType<typeof createFlowRuntimeControls>,
      startSpy: () => void,
    ): void {
      if (!isExtendedFlowTracer(tracer))
        throw new Error("Internal methods missing");
      tracer.setAutoStopCallback(controls.stop);
      tracer.setAutoStartCallback(startSpy);
      tracer.setIsEnabledCallback(controls.isEnabled);
      tracer.updateCachedStartTrigger("startFunc");
      tracer.updateCachedEndTrigger("endFunc");
      tracer.updateCachedEndTriggerMode("on-entry");
    }

    describe("'once' mode", () => {
      it("should NOT fire the start trigger a second time after the first trigger sequence completes", () => {
        const controls = createFlowRuntimeControls(logger, false);
        const flowTracer = createFlowTracer(logger);
        const startSpy = vi.fn(() => controls.start());

        wireTracer(flowTracer, controls, startSpy);
        if (!isExtendedFlowTracer(flowTracer))
          throw new Error("Internal methods missing");
        flowTracer.updateCachedTriggerRearmMode("once");

        // First trigger sequence: startFunc fires start, endFunc fires stop (on-entry)
        const h1 = flowTracer.enter("startFunc");
        flowTracer.exit(h1);
        const h2 = flowTracer.enter("endFunc");
        flowTracer.exit(h2);

        expect(startSpy).toHaveBeenCalledTimes(1);

        // Second attempt — must NOT re-trigger in "once" mode
        const h3 = flowTracer.enter("startFunc");
        flowTracer.exit(h3);

        expect(startSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe("'always' mode", () => {
      it("should re-fire the start trigger every time the sequence completes in 'always' mode", () => {
        const controls = createFlowRuntimeControls(logger, false);
        const flowTracer = createFlowTracer(logger);
        const startSpy = vi.fn(() => controls.start());

        wireTracer(flowTracer, controls, startSpy);
        if (!isExtendedFlowTracer(flowTracer))
          throw new Error("Internal methods missing");
        flowTracer.updateCachedTriggerRearmMode("always");

        // First trigger sequence
        const h1 = flowTracer.enter("startFunc");
        flowTracer.exit(h1);
        const h2 = flowTracer.enter("endFunc");
        flowTracer.exit(h2);

        expect(startSpy).toHaveBeenCalledTimes(1);

        // Second trigger sequence — MUST re-fire in "always" mode
        const h3 = flowTracer.enter("startFunc");
        flowTracer.exit(h3);

        expect(startSpy).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("theme handling", () => {
    it("should apply default theme styles when no custom theme provided", () => {
      // Simulate empty theme from files (like when no theme file exists)
      const emptyTheme: FlowThemeConfig = {};
      const tracer = createFlowTracer(logger, { theme: emptyTheme });

      tracer.enter("testFunction");

      // Should still have style argument, not just %c without style
      expect(enterStyledSpy).toHaveBeenCalledWith(
        "testFunction",
        "%c→ testFunction",
        "font-weight: bold",
      );
    });
  });
});

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { reactTracer, stopReactTracer } from "../../../src/lib/reactTracer";
import { getOrCreateAutoTracerGlobalApi } from "../../../src/lib/autoTracer/getOrCreateAutoTracerGlobalApi";
import { getTraceOptions } from "../../../src/lib/types/globalState";

/**
 * Unit tests for React18 Runtime Control API.
 *
 * Canonical surface:
 * - globalThis.autoTracer.getOutputMode/setOutputMode
 * - globalThis.autoTracer.reactTracer.start/stop/isEnabled
 */
describe("RuntimeControl", () => {
  beforeEach(() => {
    globalThis.autoTracer = undefined;
  });

  afterEach(() => {
    // Clean up after each test
    stopReactTracer();

    globalThis.autoTracer = undefined;
  });

  describe("globalThis.autoTracer", () => {
    it("should default outputMode to 'devtools' on first install", () => {
      reactTracer({ enabled: false });

      const autoTracer = globalThis.autoTracer;
      expect(autoTracer).toBeDefined();
      if (autoTracer === undefined) return;

      expect(autoTracer.getOutputMode()).toBe("devtools");
      expect(getTraceOptions().treeRenderingMode).toBe("group");
      expect(getTraceOptions().valueRenderingMode).toBe("as-is");
    });

    it("should be installed when reactTracer is initialized", () => {
      reactTracer({ enabled: false });

      expect(globalThis.autoTracer).toBeDefined();
    });

    it("should expose outputMode runtime controls", () => {
      reactTracer({ enabled: false });

      const autoTracer = globalThis.autoTracer;
      expect(autoTracer).toBeDefined();
      if (autoTracer === undefined) return;

      expect(autoTracer.getOutputMode).toBeTypeOf("function");
      expect(autoTracer.setOutputMode).toBeTypeOf("function");
    });

    it("should expose reactTracer runtime controls", () => {
      reactTracer({ enabled: false });

      const autoTracer = globalThis.autoTracer;
      expect(autoTracer).toBeDefined();
      if (autoTracer === undefined) return;

      expect(autoTracer.reactTracer).toBeDefined();
      if (autoTracer.reactTracer === undefined) return;

      expect(autoTracer.reactTracer.start).toBeTypeOf("function");
      expect(autoTracer.reactTracer.stop).toBeTypeOf("function");
      expect(autoTracer.reactTracer.isEnabled).toBeTypeOf("function");

      // Runtime filtering controls (names-only)
      expect(autoTracer.reactTracer.addFilter).toBeTypeOf("function");
      expect(autoTracer.reactTracer.showFilters).toBeTypeOf("function");
      expect(autoTracer.reactTracer.clearFilters).toBeTypeOf("function");
      expect(autoTracer.reactTracer.filterMode).toBeTypeOf("function");
    });

    it("should map outputMode 'devtools' to ReactTracer options", () => {
      reactTracer({ enabled: false });

      const autoTracer = globalThis.autoTracer;
      expect(autoTracer).toBeDefined();
      if (autoTracer === undefined) return;

      autoTracer.setOutputMode("devtools");

      expect(getTraceOptions().treeRenderingMode).toBe("group");
      expect(getTraceOptions().valueRenderingMode).toBe("as-is");
    });

    it("should map outputMode 'copy-paste' to ReactTracer options", () => {
      reactTracer({ enabled: false });

      const autoTracer = globalThis.autoTracer;
      expect(autoTracer).toBeDefined();
      if (autoTracer === undefined) return;

      autoTracer.setOutputMode("copy-paste");

      expect(getTraceOptions().treeRenderingMode).toBe("lineart");
      expect(getTraceOptions().valueRenderingMode).toBe("serialized");
    });

    it("should not override an existing outputMode set before reactTracer initializes", () => {
      const autoTracer = getOrCreateAutoTracerGlobalApi();
      autoTracer.setOutputMode("devtools");

      reactTracer({ enabled: false });

      expect(autoTracer.getOutputMode()).toBe("devtools");
      expect(getTraceOptions().treeRenderingMode).toBe("group");
      expect(getTraceOptions().valueRenderingMode).toBe("as-is");
    });

    it("should set outputMode from startup options", () => {
      reactTracer({ enabled: false, outputMode: "copy-paste" });

      const autoTracer = globalThis.autoTracer;
      expect(autoTracer).toBeDefined();
      if (autoTracer === undefined) return;

      expect(autoTracer.getOutputMode()).toBe("copy-paste");
      expect(getTraceOptions().treeRenderingMode).toBe("lineart");
      expect(getTraceOptions().valueRenderingMode).toBe("serialized");
    });
  });
});

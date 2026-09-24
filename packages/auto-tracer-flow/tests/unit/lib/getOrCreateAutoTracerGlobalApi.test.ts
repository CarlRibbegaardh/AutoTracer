import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getOrCreateAutoTracerGlobalApi } from "../../../src/lib/getOrCreateAutoTracerGlobalApi";

function deleteGlobalProperty(property: string): void {
  Reflect.deleteProperty(globalThis, property);
}

function setGlobalProperty(property: string, value: unknown): void {
  Reflect.set(globalThis, property, value);
}

function getGlobalProperty(property: string): unknown {
  return Reflect.get(globalThis, property);
}

/**
 * Unit tests for getOrCreateAutoTracerGlobalApi initialization order safety.
 *
 * Covers the scenario where `mountDashboard` (or any other package) installs
 * partial properties on `globalThis.autoTracer` before the tracers initialize.
 */
describe("getOrCreateAutoTracerGlobalApi", () => {
  beforeEach(() => {
    deleteGlobalProperty("autoTracer");
    deleteGlobalProperty("__autoTracerInternal");
  });

  afterEach(() => {
    deleteGlobalProperty("autoTracer");
    deleteGlobalProperty("__autoTracerInternal");
  });

  describe("when globalThis.autoTracer does not exist", () => {
    it("installs getOutputMode and setOutputMode", () => {
      const api = getOrCreateAutoTracerGlobalApi();

      expect(typeof api.getOutputMode).toBe("function");
      expect(typeof api.setOutputMode).toBe("function");
    });

    it("installs flowTracer", () => {
      const api = getOrCreateAutoTracerGlobalApi();

      expect(typeof api.flowTracer).toBe("object");
    });
  });

  describe("when a partial object already exists on globalThis.autoTracer", () => {
    it("preserves pre-existing properties not part of AutoTracerGlobalApi", () => {
      // Simulate what mountDashboard does: set globalThis.autoTracer to an
      // object with only a widget property (no getOutputMode/setOutputMode)
      const mockWidget = { toggle: (): void => undefined };
      setGlobalProperty("autoTracer", { widget: mockWidget });

      getOrCreateAutoTracerGlobalApi();

      const installed = getGlobalProperty("autoTracer");
      expect(installed).toBeDefined();
      expect(typeof installed).toBe("object");

      // The widget must still be present after tracer initialization
      const widget = Reflect.get(installed as object, "widget");
      expect(widget).toBe(mockWidget);
    });

    it("installs getOutputMode and setOutputMode even when properties already existed", () => {
      setGlobalProperty("autoTracer", { widget: { toggle: (): void => undefined } });

      const api = getOrCreateAutoTracerGlobalApi();

      expect(typeof api.getOutputMode).toBe("function");
      expect(typeof api.setOutputMode).toBe("function");
    });

    it("installs flowTracer even when properties already existed", () => {
      setGlobalProperty("autoTracer", { widget: { toggle: (): void => undefined } });

      const api = getOrCreateAutoTracerGlobalApi();

      expect(typeof api.flowTracer).toBe("object");
    });
  });
});

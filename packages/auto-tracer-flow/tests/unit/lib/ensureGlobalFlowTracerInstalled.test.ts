import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ensureGlobalFlowTracerInstalled } from "../../../src/lib/ensureGlobalFlowTracerInstalled";
import { getOrCreateGlobalFlowTracer } from "../../../src/lib/getOrCreateGlobalFlowTracer";

function deleteGlobalProperty(property: string): void {
  Reflect.deleteProperty(globalThis, property);
}

function getGlobal(property: string): unknown {
  return Reflect.get(globalThis, property);
}

function isObject(value: unknown): value is object {
  return typeof value === "object" && value !== null;
}

describe("ensureGlobalFlowTracerInstalled", () => {
  beforeEach(() => {
    deleteGlobalProperty("autoTracer");
    deleteGlobalProperty("__autoTracerInternal");
    deleteGlobalProperty("__flowTracer");
  });

  afterEach(() => {
    deleteGlobalProperty("autoTracer");
    deleteGlobalProperty("__autoTracerInternal");
    deleteGlobalProperty("__flowTracer");
  });

  it("installs a minimal runtime control API at globalThis.autoTracer.flowTracer", () => {
    ensureGlobalFlowTracerInstalled();

    const autoTracer = getGlobal("autoTracer");
    expect(isObject(autoTracer)).toBe(true);
    if (!isObject(autoTracer)) {
      throw new Error("Expected globalThis.autoTracer to be an object");
    }

    const flowTracer = Reflect.get(autoTracer, "flowTracer");

    expect(isObject(flowTracer)).toBe(true);
    if (!isObject(flowTracer)) {
      throw new Error("Expected globalThis.autoTracer.flowTracer to be an object");
    }

    expect(typeof Reflect.get(flowTracer, "start")).toBe("function");
    expect(typeof Reflect.get(flowTracer, "stop")).toBe("function");
    expect(typeof Reflect.get(flowTracer, "isEnabled")).toBe("function");

    // Runtime filtering controls (names-only)
    expect(typeof Reflect.get(flowTracer, "addFilter")).toBe("function");
    expect(typeof Reflect.get(flowTracer, "showFilters")).toBe("function");
    expect(typeof Reflect.get(flowTracer, "clearFilters")).toBe("function");
    expect(typeof Reflect.get(flowTracer, "filterMode")).toBe("function");

    expect(typeof Reflect.get(flowTracer, "enter")).toBe("undefined");
    expect(typeof Reflect.get(flowTracer, "exit")).toBe("undefined");
  });

  it("installs the instrumentation tracer at globalThis.__flowTracer", () => {
    ensureGlobalFlowTracerInstalled();

    const tracer = getGlobal("__flowTracer");
    expect(isObject(tracer)).toBe(true);
    if (!isObject(tracer)) {
      throw new Error("Expected globalThis.__flowTracer to be an object");
    }

    expect(typeof Reflect.get(tracer, "enter")).toBe("function");
    expect(typeof Reflect.get(tracer, "exit")).toBe("function");
    expect(typeof Reflect.get(tracer, "traceParameter")).toBe(
      "function",
    );
  });

  it("serializes object values as JSON strings in copy-paste mode", () => {
    ensureGlobalFlowTracerInstalled();

    const autoTracer = getGlobal("autoTracer");
    expect(isObject(autoTracer)).toBe(true);
    if (!isObject(autoTracer)) {
      throw new Error("Expected globalThis.autoTracer to be an object");
    }

    const setOutputMode = Reflect.get(autoTracer, "setOutputMode");
    expect(typeof setOutputMode).toBe("function");
    if (typeof setOutputMode !== "function") {
      throw new Error("Expected globalThis.autoTracer.setOutputMode to be a function");
    }

    setOutputMode("copy-paste");

    const tracer = getGlobal("__flowTracer");
    expect(isObject(tracer)).toBe(true);
    if (!isObject(tracer)) {
      throw new Error("Expected globalThis.__flowTracer to be an object");
    }

    const traceParameter = Reflect.get(tracer, "traceParameter");
    expect(typeof traceParameter).toBe("function");
    if (typeof traceParameter !== "function") {
      throw new Error("Expected globalThis.__flowTracer.traceParameter to be a function");
    }

    const { logger } = getOrCreateGlobalFlowTracer();
    const traceSpy = vi.spyOn(logger, "trace");

    traceParameter("arg1", { a: 1 });

    expect(traceSpy).toHaveBeenCalledTimes(1);
    expect(traceSpy).toHaveBeenCalledWith(
      "%cparam arg1:",
      "font-style: italic",
      "{\"a\":1}",
    );
  });
});

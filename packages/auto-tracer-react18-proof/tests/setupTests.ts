import { beforeAll, afterAll, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Now safe to import reactTracer (which imports React)
import { reactTracer } from "@autotracer/react18";

let stopReactTracer: (() => void) | undefined;

/**
 * Checks whether a value is a non-null object record.
 *
 * @param value - Unknown value
 * @returns True when value is a record
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Forces the global AutoTracer output mode to the copy-paste format.
 *
 * This suite asserts on serialized string output and line-art tree rendering.
 *
 * Side effects: mutates `globalThis.autoTracer` runtime state.
 */
function setAutoTracerOutputModeToCopyPaste(): void {
  const autoTracer = Reflect.get(globalThis, "autoTracer");
  if (!isRecord(autoTracer)) {
    return;
  }

  const setOutputMode = Reflect.get(autoTracer, "setOutputMode");
  if (typeof setOutputMode !== "function") {
    return;
  }

  setOutputMode("copy-paste");
}

beforeAll(() => {
  stopReactTracer = reactTracer({
    enabled: true,
    showFlags: true,
    includeNonTrackedBranches: false,
    maxFiberDepth: 100,
    internalLogLevel: "error",
    detectIdenticalValueChanges: true,
  });

  setAutoTracerOutputModeToCopyPaste();
});

afterEach(() => cleanup());
afterAll(() => stopReactTracer?.());

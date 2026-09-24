import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getOrCreateAutoTracerGlobalApi } from "../../../src/lib/getOrCreateAutoTracerGlobalApi";
import { subscribeToOutputModeChanges as subscribeToOutputModeChangesReact18 } from "../../../../auto-tracer-react18/src/lib/autoTracer/subscribeToOutputModeChanges";

describe("outputMode init-order compatibility", () => {
  beforeEach(() => {
    delete globalThis.autoTracer;
  });

  afterEach(() => {
    delete globalThis.autoTracer;
  });

  it("should notify React18 subscribers when Flow installs autoTracer first", () => {
    getOrCreateAutoTracerGlobalApi();

    const observed: Array<"devtools" | "copy-paste"> = [];

    subscribeToOutputModeChangesReact18((mode) => {
      observed.push(mode);
    });

    const initial = observed[0];
    expect(initial === "devtools" || initial === "copy-paste").toBe(true);

    const next = initial === "devtools" ? "copy-paste" : "devtools";

    const api = globalThis.autoTracer;
    expect(api).toBeDefined();
    if (api === undefined) return;

    api.setOutputMode(next);

    expect(observed).toEqual([initial, next]);
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createFlowTracer } from "../../src/lib/FlowTracer";
import { ensureGlobalFlowTracerInstalled } from "../../src/lib/ensureGlobalFlowTracerInstalled";
import { getOrCreateGlobalFlowTracer } from "../../src/lib/getOrCreateGlobalFlowTracer";
import { isRecord } from "../../src/lib/isRecord";
import type { Logger } from "@autotracer/logger";

describe("outputMode grouping (breaking change)", () => {
  let logger: Logger;

  beforeEach(() => {
    delete globalThis.autoTracer;
    logger = getOrCreateGlobalFlowTracer().logger;
  });

  afterEach(() => {
    delete globalThis.autoTracer;
    vi.restoreAllMocks();
  });

  it("should not expose setFlowGroupMode on FlowTracer", () => {
    const tracer = createFlowTracer(logger);
    const tracerCandidate: unknown = tracer;
    expect(isRecord(tracerCandidate)).toBe(true);
    if (!isRecord(tracerCandidate)) return;

    expect("setFlowGroupMode" in tracerCandidate).toBe(false);
  });

  it("should set logger grouping based on window.autoTracer outputMode", () => {
    const setGroupModeSpy = vi.spyOn(logger, "setGroupMode");

    ensureGlobalFlowTracerInstalled();

    const autoTracerCandidate: unknown = globalThis.autoTracer;
    expect(isRecord(autoTracerCandidate)).toBe(true);
    if (!isRecord(autoTracerCandidate)) return;

    const setOutputModeCandidate = autoTracerCandidate["setOutputMode"];
    expect(typeof setOutputModeCandidate).toBe("function");
    if (typeof setOutputModeCandidate !== "function") return;

    setOutputModeCandidate("devtools");
    setOutputModeCandidate("copy-paste");

    expect(setGroupModeSpy).toHaveBeenCalledWith("default");
    expect(setGroupModeSpy).toHaveBeenCalledWith("text");
  });
});

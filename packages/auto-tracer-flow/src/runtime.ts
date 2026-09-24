/**
 * Runtime control entry point.
 * Auto-imported by Vite plugin when runtimeControlled: true.
 * Ensures the canonical `window.autoTracer.flowTracer` console controls are present
 * and the internal `globalThis.__flowTracer` instrumentation target is installed,
 * then starts dormant (unless enabledOnLoad is set).
 */

import { ensureGlobalFlowTracerInstalled } from "./lib/ensureGlobalFlowTracerInstalled.js";
import { isRecord } from "./lib/isRecord.js";

ensureGlobalFlowTracerInstalled();

const autoTracerCandidate =
  typeof globalThis === "undefined" ? undefined : globalThis.autoTracer;

const flowTracerCandidate = isRecord(autoTracerCandidate)
  ? autoTracerCandidate["flowTracer"]
  : undefined;

if (isRecord(flowTracerCandidate)) {
  // Check if user wants tracer enabled on load
  const getEnabledOnLoad = flowTracerCandidate["getEnabledOnLoad"];
  const enabledOnLoad =
    typeof getEnabledOnLoad === "function" ? getEnabledOnLoad() : false;

  // Only stop if enabledOnLoad is not set
  // (auto-start in ensureGlobalFlowTracerInstalled already started it if enabledOnLoad === true)
  if (!enabledOnLoad) {
    const stopCandidate = flowTracerCandidate["stop"];
    if (typeof stopCandidate === "function") {
      stopCandidate();
    }
  }
}

export {};

"use client";

import { reactTracer, isReactTracerInitialized } from "@autotracer/react18";

// Initialize auto-tracing on the client as early as possible
// Avoid duplicate initialization across HMR/strict mode
if (typeof window !== "undefined") {
  try {
    if (!isReactTracerInitialized()) {
      reactTracer({
        enabled: true,
      });
    }
  } catch {
    // no-op: guard against SSR or unavailable DevTools hook
  }
}

export function ReactTracerBootstrap(): null {
  return null;
}

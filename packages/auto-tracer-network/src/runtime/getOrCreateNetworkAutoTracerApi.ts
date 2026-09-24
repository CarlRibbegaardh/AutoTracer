import type { NetworkTracerApi } from "../api/NetworkTracerApi.js";

/**
 * Gets or creates the shared AutoTracer output controls for one realm.
 *
 * @param realm - Realm that owns the shared AutoTracer API and output state.
 * @returns Compatible shared output controls that can expose NetworkTracer.
 */
export function getOrCreateNetworkAutoTracerApi(realm: {
  autoTracer?: unknown;
  __autoTracerInternal?: {
    outputMode: "devtools" | "copy-paste";
    subscribers: Array<(mode: "devtools" | "copy-paste") => void>;
  };
}): {
  getOutputMode: () => "devtools" | "copy-paste";
  setOutputMode: (mode: "devtools" | "copy-paste") => void;
  networkTracer?: NetworkTracerApi;
} {
  /** Checks whether a value provides the shared output controls. */
  function isCompatibleApi(value: unknown): value is {
    getOutputMode: () => "devtools" | "copy-paste";
    setOutputMode: (mode: "devtools" | "copy-paste") => void;
    networkTracer?: NetworkTracerApi;
  } {
    if (typeof value !== "object" || value === null) return false;
    return (
      "getOutputMode" in value &&
      typeof value.getOutputMode === "function" &&
      "setOutputMode" in value &&
      typeof value.setOutputMode === "function"
    );
  }

  if (isCompatibleApi(realm.autoTracer)) return realm.autoTracer;

  const state = realm.__autoTracerInternal ?? {
    outputMode: "devtools" as const,
    subscribers: [],
  };
  realm.__autoTracerInternal = state;

  /** Returns the current shared output mode. */
  function getOutputMode(): "devtools" | "copy-paste" {
    return state.outputMode;
  }

  /** Updates the shared output mode and notifies existing subscribers. */
  function setOutputMode(mode: "devtools" | "copy-paste"): void {
    state.outputMode = mode;
    state.subscribers.forEach((subscriber) => {return subscriber(mode)});
  }

  const api = { getOutputMode, setOutputMode };
  realm.autoTracer = api;
  return api;
}

import type { AutoTracerGlobalApi } from "./AutoTracerGlobalApi.js";
import type { OutputMode } from "./OutputMode.js";
import type { TracerRuntimeControls } from "./TracerRuntimeControls.js";

/**
 * Gets or creates the global AutoTracer console API.
 *
 * Side effects: may install `globalThis.autoTracer`.
 */
export function getOrCreateAutoTracerGlobalApi(): AutoTracerGlobalApi {
  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  function isOutputMode(value: unknown): value is OutputMode {
    return value === "devtools" || value === "copy-paste";
  }

  function isAutoTracerGlobalApi(value: unknown): value is AutoTracerGlobalApi {
    if (!isRecord(value)) return false;

    return (
      typeof value["getOutputMode"] === "function" &&
      typeof value["setOutputMode"] === "function"
    );
  }

  function createNoopTracerRuntimeControls(): TracerRuntimeControls {
    let isFilterModeEnabled = false;

    function start(): void {
      return;
    }

    function stop(): void {
      return;
    }

    function isEnabled(): boolean {
      return false;
    }

    function addFilter(_match: string): void {
      return;
    }

    function showFilters(): string {
      return "exclude: { components: [] }";
    }

    function clearFilters(): void {
      return;
    }

    function filterMode(enabled?: boolean): boolean {
      isFilterModeEnabled = enabled ?? true;
      return isFilterModeEnabled;
    }

    function setEnabledOnLoad(_value: boolean): void {
      return;
    }

    function getEnabledOnLoad(): boolean {
      return false;
    }

    function setAutoStopAfterRenders(_limit: number | null): void {
      return;
    }

    function getAutoStopAfterRenders(): number | null {
      return null;
    }

    function getRenderCount(): number {
      return 0;
    }

    function resetRenderCount(): void {
      return;
    }

    function setStartTrigger(_pattern: string | null): void {
      return;
    }

    function getStartTrigger(): string | null {
      return null;
    }

    function setEndTrigger(_pattern: string | null): void {
      return;
    }

    function getEndTrigger(): string | null {
      return null;
    }

    function setEndTriggerMode(_mode: "on-entry" | "on-exit"): void {
      return;
    }

    function getEndTriggerMode(): "on-entry" | "on-exit" {
      return "on-exit";
    }

    function setTriggerRearmMode(_mode: "always" | "once"): void {
      return;
    }

    function getTriggerRearmMode(): "always" | "once" {
      return "once";
    }

    function clearAllTriggers(): void {
      return;
    }

    return {
      start,
      stop,
      isEnabled,
      addFilter,
      showFilters,
      clearFilters,
      filterMode,
      setEnabledOnLoad,
      getEnabledOnLoad,
      setAutoStopAfterRenders,
      getAutoStopAfterRenders,
      getRenderCount,
      resetRenderCount,
      setStartTrigger,
      getStartTrigger,
      setEndTrigger,
      getEndTrigger,
      setEndTriggerMode,
      getEndTriggerMode,
      setTriggerRearmMode,
      getTriggerRearmMode,
      clearAllTriggers,
    };
  }

  function getOrCreateInternalState(): {
    outputMode: OutputMode;
    subscribers: Array<(mode: OutputMode) => void>;
  } {
    if (globalThis.__autoTracerInternal !== undefined) {
      return globalThis.__autoTracerInternal;
    }

    globalThis.__autoTracerInternal = {
      outputMode: "devtools",
      subscribers: [],
    };

    return globalThis.__autoTracerInternal;
  }

  const existing = globalThis.autoTracer;
  if (isAutoTracerGlobalApi(existing)) {
    getOrCreateInternalState();
    return existing;
  }

  const state = getOrCreateInternalState();

  /**
   * Gets the current canonical outputMode.
   *
   * @returns Current outputMode
   */
  function getOutputMode(): OutputMode {
    return state.outputMode;
  }

  /**
   * Sets the canonical outputMode and notifies subscribers.
   *
   * Side effects: notifies registered subscribers.
   *
   * @param mode - New output mode
   */
  function setOutputMode(mode: OutputMode): void {
    if (!isOutputMode(mode)) return;

    state.outputMode = mode;
    state.subscribers.forEach((subscriber) => {
      subscriber(mode);
    });
  }

  const api: AutoTracerGlobalApi = {
    getOutputMode,
    setOutputMode,
    reactTracer: createNoopTracerRuntimeControls(),
  };

  if (isRecord(existing)) {
    Object.keys(existing).forEach((key) => {
      if (!(key in api)) {
        Reflect.set(api, key, Reflect.get(existing, key));
      }
    });
  }

  globalThis.autoTracer = api;

  return api;
}

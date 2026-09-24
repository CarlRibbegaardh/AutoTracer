import type { ReactTracerAPI } from "./RuntimeControl.js";
import type { ReactRuntimeFilteringState } from "./runtimeFiltering/ReactRuntimeFilteringState.js";

/**
 * Builds the runtime API object assigned to `globalThis.autoTracer.reactTracer`.
 *
 * Pure: no side effects. Assembles fields from the runtime control API and
 * runtime filtering state into the canonical public API shape.
 *
 * @param runtimeAPI - Runtime control surface from createRuntimeControl
 * @param runtimeFiltering - Runtime filtering state from getReactRuntimeFilteringState
 * @returns Assembled public API object
 */
export function buildReactTracerApi(
  runtimeAPI: ReactTracerAPI,
  runtimeFiltering: ReactRuntimeFilteringState,
): ReactTracerAPI & Pick<ReactRuntimeFilteringState, "addFilter" | "showFilters" | "clearFilters" | "filterMode"> {
  return {
    start: runtimeAPI.start,
    stop: runtimeAPI.stop,
    isEnabled: runtimeAPI.isEnabled,
    setEnabledOnLoad: runtimeAPI.setEnabledOnLoad,
    getEnabledOnLoad: runtimeAPI.getEnabledOnLoad,
    setAutoStopAfterRenders: runtimeAPI.setAutoStopAfterRenders,
    getAutoStopAfterRenders: runtimeAPI.getAutoStopAfterRenders,
    getRenderCount: runtimeAPI.getRenderCount,
    resetRenderCount: runtimeAPI.resetRenderCount,
    setStartTrigger: runtimeAPI.setStartTrigger,
    getStartTrigger: runtimeAPI.getStartTrigger,
    setEndTrigger: runtimeAPI.setEndTrigger,
    getEndTrigger: runtimeAPI.getEndTrigger,
    setEndTriggerMode: runtimeAPI.setEndTriggerMode,
    getEndTriggerMode: runtimeAPI.getEndTriggerMode,
    setTriggerRearmMode: runtimeAPI.setTriggerRearmMode,
    getTriggerRearmMode: runtimeAPI.getTriggerRearmMode,
    clearAllTriggers: runtimeAPI.clearAllTriggers,
    addFilter: runtimeFiltering.addFilter,
    showFilters: runtimeFiltering.showFilters,
    clearFilters: runtimeFiltering.clearFilters,
    filterMode: runtimeFiltering.filterMode,
  };
}

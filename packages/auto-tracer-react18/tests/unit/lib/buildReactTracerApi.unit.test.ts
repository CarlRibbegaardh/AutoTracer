import { describe, expect, it, vi } from "vitest";
import { buildReactTracerApi } from "@src/lib/buildReactTracerApi";
import type { ReactTracerAPI } from "@src/lib/RuntimeControl";
import type { ReactRuntimeFilteringState } from "@src/lib/runtimeFiltering/ReactRuntimeFilteringState";

function makeRuntimeAPI(): ReactTracerAPI {
  return {
    start: vi.fn(),
    stop: vi.fn(),
    isEnabled: vi.fn(() => false),
    setEnabledOnLoad: vi.fn(),
    getEnabledOnLoad: vi.fn(() => false),
    setAutoStopAfterRenders: vi.fn(),
    getAutoStopAfterRenders: vi.fn(() => null),
    getRenderCount: vi.fn(() => 0),
    resetRenderCount: vi.fn(),
    setStartTrigger: vi.fn(),
    getStartTrigger: vi.fn(() => null),
    setEndTrigger: vi.fn(),
    getEndTrigger: vi.fn(() => null),
    setEndTriggerMode: vi.fn(),
    getEndTriggerMode: vi.fn(() => "on-exit" as const),
    setTriggerRearmMode: vi.fn(),
    getTriggerRearmMode: vi.fn(() => "once" as const),
    clearAllTriggers: vi.fn(),
  };
}

function makeRuntimeFiltering(): ReactRuntimeFilteringState {
  return {
    addFilter: vi.fn(),
    showFilters: vi.fn(() => ""),
    clearFilters: vi.fn(),
    filterMode: vi.fn(() => false),
    isFilterModeEnabled: vi.fn(() => false),
    matchesName: vi.fn(() => false),
    createFilterAction: vi.fn(() => null),
  };
}

describe("buildReactTracerApi", () => {
  describe("runtimeAPI field mapping", () => {
    it("should map start from runtimeAPI", () => {
      const runtimeAPI = makeRuntimeAPI();
      const runtimeFiltering = makeRuntimeFiltering();
      const result = buildReactTracerApi(runtimeAPI, runtimeFiltering);
      expect(result.start).toBe(runtimeAPI.start);
    });

    it("should map stop from runtimeAPI", () => {
      const runtimeAPI = makeRuntimeAPI();
      const result = buildReactTracerApi(runtimeAPI, makeRuntimeFiltering());
      expect(result.stop).toBe(runtimeAPI.stop);
    });

    it("should map isEnabled from runtimeAPI", () => {
      const runtimeAPI = makeRuntimeAPI();
      const result = buildReactTracerApi(runtimeAPI, makeRuntimeFiltering());
      expect(result.isEnabled).toBe(runtimeAPI.isEnabled);
    });

    it("should map setEnabledOnLoad from runtimeAPI", () => {
      const runtimeAPI = makeRuntimeAPI();
      const result = buildReactTracerApi(runtimeAPI, makeRuntimeFiltering());
      expect(result.setEnabledOnLoad).toBe(runtimeAPI.setEnabledOnLoad);
    });

    it("should map getEnabledOnLoad from runtimeAPI", () => {
      const runtimeAPI = makeRuntimeAPI();
      const result = buildReactTracerApi(runtimeAPI, makeRuntimeFiltering());
      expect(result.getEnabledOnLoad).toBe(runtimeAPI.getEnabledOnLoad);
    });

    it("should map setAutoStopAfterRenders from runtimeAPI", () => {
      const runtimeAPI = makeRuntimeAPI();
      const result = buildReactTracerApi(runtimeAPI, makeRuntimeFiltering());
      expect(result.setAutoStopAfterRenders).toBe(runtimeAPI.setAutoStopAfterRenders);
    });

    it("should map getAutoStopAfterRenders from runtimeAPI", () => {
      const runtimeAPI = makeRuntimeAPI();
      const result = buildReactTracerApi(runtimeAPI, makeRuntimeFiltering());
      expect(result.getAutoStopAfterRenders).toBe(runtimeAPI.getAutoStopAfterRenders);
    });

    it("should map getRenderCount from runtimeAPI", () => {
      const runtimeAPI = makeRuntimeAPI();
      const result = buildReactTracerApi(runtimeAPI, makeRuntimeFiltering());
      expect(result.getRenderCount).toBe(runtimeAPI.getRenderCount);
    });

    it("should map resetRenderCount from runtimeAPI", () => {
      const runtimeAPI = makeRuntimeAPI();
      const result = buildReactTracerApi(runtimeAPI, makeRuntimeFiltering());
      expect(result.resetRenderCount).toBe(runtimeAPI.resetRenderCount);
    });

    it("should map setStartTrigger from runtimeAPI", () => {
      const runtimeAPI = makeRuntimeAPI();
      const result = buildReactTracerApi(runtimeAPI, makeRuntimeFiltering());
      expect(result.setStartTrigger).toBe(runtimeAPI.setStartTrigger);
    });

    it("should map getStartTrigger from runtimeAPI", () => {
      const runtimeAPI = makeRuntimeAPI();
      const result = buildReactTracerApi(runtimeAPI, makeRuntimeFiltering());
      expect(result.getStartTrigger).toBe(runtimeAPI.getStartTrigger);
    });

    it("should map setEndTrigger from runtimeAPI", () => {
      const runtimeAPI = makeRuntimeAPI();
      const result = buildReactTracerApi(runtimeAPI, makeRuntimeFiltering());
      expect(result.setEndTrigger).toBe(runtimeAPI.setEndTrigger);
    });

    it("should map getEndTrigger from runtimeAPI", () => {
      const runtimeAPI = makeRuntimeAPI();
      const result = buildReactTracerApi(runtimeAPI, makeRuntimeFiltering());
      expect(result.getEndTrigger).toBe(runtimeAPI.getEndTrigger);
    });

    it("should map setEndTriggerMode from runtimeAPI", () => {
      const runtimeAPI = makeRuntimeAPI();
      const result = buildReactTracerApi(runtimeAPI, makeRuntimeFiltering());
      expect(result.setEndTriggerMode).toBe(runtimeAPI.setEndTriggerMode);
    });

    it("should map getEndTriggerMode from runtimeAPI", () => {
      const runtimeAPI = makeRuntimeAPI();
      const result = buildReactTracerApi(runtimeAPI, makeRuntimeFiltering());
      expect(result.getEndTriggerMode).toBe(runtimeAPI.getEndTriggerMode);
    });

    it("should map setTriggerRearmMode from runtimeAPI", () => {
      const runtimeAPI = makeRuntimeAPI();
      const result = buildReactTracerApi(runtimeAPI, makeRuntimeFiltering());
      expect(result.setTriggerRearmMode).toBe(runtimeAPI.setTriggerRearmMode);
    });

    it("should map getTriggerRearmMode from runtimeAPI", () => {
      const runtimeAPI = makeRuntimeAPI();
      const result = buildReactTracerApi(runtimeAPI, makeRuntimeFiltering());
      expect(result.getTriggerRearmMode).toBe(runtimeAPI.getTriggerRearmMode);
    });

    it("should map clearAllTriggers from runtimeAPI", () => {
      const runtimeAPI = makeRuntimeAPI();
      const result = buildReactTracerApi(runtimeAPI, makeRuntimeFiltering());
      expect(result.clearAllTriggers).toBe(runtimeAPI.clearAllTriggers);
    });
  });

  describe("runtimeFiltering field mapping", () => {
    it("should map addFilter from runtimeFiltering", () => {
      const runtimeFiltering = makeRuntimeFiltering();
      const result = buildReactTracerApi(makeRuntimeAPI(), runtimeFiltering);
      expect(result.addFilter).toBe(runtimeFiltering.addFilter);
    });

    it("should map showFilters from runtimeFiltering", () => {
      const runtimeFiltering = makeRuntimeFiltering();
      const result = buildReactTracerApi(makeRuntimeAPI(), runtimeFiltering);
      expect(result.showFilters).toBe(runtimeFiltering.showFilters);
    });

    it("should map clearFilters from runtimeFiltering", () => {
      const runtimeFiltering = makeRuntimeFiltering();
      const result = buildReactTracerApi(makeRuntimeAPI(), runtimeFiltering);
      expect(result.clearFilters).toBe(runtimeFiltering.clearFilters);
    });

    it("should map filterMode from runtimeFiltering", () => {
      const runtimeFiltering = makeRuntimeFiltering();
      const result = buildReactTracerApi(makeRuntimeAPI(), runtimeFiltering);
      expect(result.filterMode).toBe(runtimeFiltering.filterMode);
    });
  });

  describe("returned object identity", () => {
    it("should return a new object each call", () => {
      const api = makeRuntimeAPI();
      const filtering = makeRuntimeFiltering();
      const result1 = buildReactTracerApi(api, filtering);
      const result2 = buildReactTracerApi(api, filtering);
      expect(result1).not.toBe(result2);
    });

    it("should not mix up fields between runtimeAPI and runtimeFiltering", () => {
      const runtimeAPI = makeRuntimeAPI();
      const runtimeFiltering = makeRuntimeFiltering();
      const result = buildReactTracerApi(runtimeAPI, runtimeFiltering);

      // Spot check: a runtimeAPI field should NOT come from filtering
      expect(result.start).not.toBe(runtimeFiltering.addFilter);
      // And vice versa
      expect(result.addFilter).not.toBe(runtimeAPI.start);
    });
  });
});

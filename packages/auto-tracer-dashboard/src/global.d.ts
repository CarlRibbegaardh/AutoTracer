import type {
  DashboardConfig,
  WidgetControls,
} from "./types/DashboardConfig.js";

declare global {
  interface Window {
    /**
     * Dashboard configuration injected by Vite plugin at build time.
     * Merged with runtime config when mountDashboard is called.
     */
    __autoTracerDashboardConfig?: Partial<DashboardConfig>;
  }

  // eslint-disable-next-line no-var
  var __autoTracerDashboardConfig: Partial<DashboardConfig> | undefined;

  // eslint-disable-next-line no-var
  var __autoTracerDashboardControls: WidgetControls | undefined;

  // eslint-disable-next-line no-var
  var autoTracer:
    | {
        reactTracer?: {
          start: () => void;
          stop: () => void;
          isEnabled: () => boolean;
          setEnabledOnLoad: (value: boolean) => void;
          getEnabledOnLoad: () => boolean;
          setAutoStopAfterRenders?: (limit: number | null) => void;
          getAutoStopAfterRenders?: () => number | null;
          getRenderCount?: () => number;
          resetRenderCount?: () => void;
          setStartTrigger?: (pattern: string | null) => void;
          getStartTrigger?: () => string | null;
          setEndTrigger?: (pattern: string | null) => void;
          getEndTrigger?: () => string | null;
          setEndTriggerMode?: (mode: "on-entry" | "on-exit") => void;
          getEndTriggerMode?: () => "on-entry" | "on-exit";
          setTriggerRearmMode?: (mode: "always" | "once") => void;
          getTriggerRearmMode?: () => "always" | "once";
          clearAllTriggers?: () => void;
        };
        flowTracer?: {
          start: () => void;
          stop: () => void;
          isEnabled: () => boolean;
          setEnabledOnLoad: (value: boolean) => void;
          getEnabledOnLoad: () => boolean;
          setAutoStopTopLevel?: (limit: number | null) => void;
          getAutoStopTopLevel?: () => number | null;
          setAutoStopAll?: (limit: number | null) => void;
          getAutoStopAll?: () => number | null;
          getTopLevelCount?: () => number;
          getTotalCount?: () => number;
          resetCounts?: () => void;
          setStartTrigger?: (pattern: string | null) => void;
          getStartTrigger?: () => string | null;
          setEndTrigger?: (pattern: string | null) => void;
          getEndTrigger?: () => string | null;
          setEndTriggerMode?: (mode: "on-entry" | "on-exit") => void;
          getEndTriggerMode?: () => "on-entry" | "on-exit";
          setTriggerRearmMode?: (mode: "always" | "once") => void;
          getTriggerRearmMode?: () => "always" | "once";
          clearAllTriggers?: () => void;
        };
        networkTracer?: {
          start: () => void;
          stop: () => void;
          forceStop: () => void;
          isEnabled: () => boolean;
          getState: () => "stopped" | "running" | "stopping";
          getPendingRequestCount: () => number;
          getEnabledOnLoad?: () => boolean;
          setEnabledOnLoad?: (value: boolean) => void;
          getCaptureRequestHeaders?: () => boolean;
          setCaptureRequestHeaders?: (value: boolean) => void;
          getCaptureRequestBody?: () => boolean;
          setCaptureRequestBody?: (value: boolean) => void;
          getCaptureResponseHeaders?: () => boolean;
          setCaptureResponseHeaders?: (value: boolean) => void;
          getCaptureResponseBody?: () => boolean;
          setCaptureResponseBody?: (value: boolean) => void;
          getBodyCaptureLimit?: () => number;
          setBodyCaptureLimit?: (value: number) => void;
          getIncludePatterns?: () => readonly string[];
          setIncludePatterns?: (value: readonly string[]) => void;
          getExcludePatterns?: () => readonly string[];
          setExcludePatterns?: (value: readonly string[]) => void;
          getRedactionPatterns?: () => readonly string[];
          setRedactionPatterns?: (value: readonly string[]) => void;
          getWaitForPendingRequestsOnStop?: () => boolean;
          setWaitForPendingRequestsOnStop?: (value: boolean) => void;
          getAutoStopAfterRequests?: () => number | undefined;
          setAutoStopAfterRequests?: (value: number | undefined) => void;
          resetConfig?: () => void;
        };
        widget?: WidgetControls;
      }
    | undefined;
}

export {};

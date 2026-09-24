import { REACTTRACER_STATE_MARKER } from "../types/marker.js";
import { useMemo, useRef, useState } from "react";
import {
  getIsGlobalTracerInstalled,
  getTraceOptions,
} from "../types/globalState.js";
import type { ComponentLogger } from "../interfaces/ComponentLogger.js";
import { componentLogRegistry } from "../functions/componentLogRegistry.js";
import {
  addLabelForGuid,
  clearLabelsForGuid,
} from "../functions/hookLabels.js";
import { logWarn } from "../functions/log.js";
import { registerTrackedGUID } from "../functions/renderRegistry.js";
import { internalLogger } from "@logger/internalLogger.js";
import { usePrevValueStore } from "./usePrevValueStore.js";

// One-time guidance log sentinel to prevent repeated messaging
let hasLoggedMissingInitialization = false;

// Counter for generating unique GUIDs
let guidCounter = 0;

/**
 * Hook that registers a component instance for tracking.
 * Each component instance gets a unique GUID stored in a ref.
 * Call this hook to register the component as having executed.
 * Returns a logger that stores messages until the component is rendered by reactTracer.
 *
 * Usage in component:
 * ```tsx
 * function MyComponent() {
 *   const logger = useReactTracer(); // Call at top of component
 *   logger.log("Hello from MyComponent!");
 *   // ... rest of component logic
 * }
 * ```
 */
export function useReactTracer(
  param?: string | { name?: string },
): ComponentLogger {
  // Anchor to preserve hooks ordering regardless of active/inactive path
  useState(REACTTRACER_STATE_MARKER);

  const traceOptions = getTraceOptions();
  const isGlobalTracerInstalled = getIsGlobalTracerInstalled();
  const isActive =
    traceOptions.enabled === true && isGlobalTracerInstalled === true;

  // Always call hooks unconditionally to satisfy Rules of Hooks
  const guidRef = useRef<string>();
  const isActiveRef = useRef(isActive);
  const prevValueStore = usePrevValueStore();
  const isFirstRenderRef = useRef<boolean>(true);

  isActiveRef.current = isActive;

  // Generate GUID on first render (stable across re-renders)
  if (!guidRef.current) {
    guidRef.current = `render-track-${++guidCounter}-${Date.now()}`;
  }

  // Keep a stable logger reference while reading live tracer state from refs.
  const logger = useMemo<ComponentLogger>(() => {
    return {
      log: (message: string, ...args: unknown[]) => {
        if (isActiveRef.current) {
          componentLogRegistry.addLog(
            guidRef.current!,
            "log",
            message,
            ...args,
          );
        }
      },
      warn: (message: string, ...args: unknown[]) => {
        if (isActiveRef.current) {
          componentLogRegistry.addLog(
            guidRef.current!,
            "warn",
            message,
            ...args,
          );
        }
      },
      error: (message: string, ...args: unknown[]) => {
        if (isActiveRef.current) {
          componentLogRegistry.addLog(
            guidRef.current!,
            "error",
            message,
            ...args,
          );
        }
      },
      /**
       * **Internal API - Not intended for direct developer use**
       *
       * Associates human-readable label(s) with a state hook for debugging purposes.
       * This method is primarily used by the react-tracer Vite plugin during build-time
       * AST transformation to automatically label useState/useSelector hooks.
       *
       * While always available at runtime, developers should generally not call this
       * method directly as the Vite plugin handles labeling automatically.
       *
       * @param index Build-time ordinal position (source order)
       * @param nameValuePairs Alternating name-value pairs: "name1", value1, "name2", value2, ...
       *
       * @example
       * ```tsx
       * // Automatically handled by Vite plugin:
       * const todos = useSelector(selectTodos);
       * // Plugin injects: logger.labelState(0, "todos", todos);
       *
       * // For multi-variable hooks:
       * const [count, setCount] = useState(0);
       * // Plugin injects: logger.labelState(0, "count", count, "setCount", setCount);
       * ```
       */
      labelState: (index: number, ...nameValuePairs: unknown[]) => {
        if (!isActiveRef.current) return;

        try {
          const guid = guidRef.current!;
          const isFirstRender = isFirstRenderRef.current;

          if (typeof index !== "number") {
            throw new Error(
              "ReactTracer: labelState requires an explicit index as first argument.",
            );
          }
          // On first call (index 0), clear previous labels
          if (index === 0) {
            clearLabelsForGuid(guid);
          }
          // Parse alternating name-value pairs: "name1", value1, "name2", value2, ...
          for (let i = 0; i < nameValuePairs.length; i += 2) {
            const label = nameValuePairs[i];
            const value = nameValuePairs[i + 1];
            if (typeof label === "string") {
              // Get previous value from store (only on updates, not first render)
              const prevValue = isFirstRender
                ? undefined
                : prevValueStore.get(index, label);

              // Add label with current and previous values (prevValue only set after first render)
              const labelData: {
                label: string;
                index: number;
                value: unknown;
                prevValue?: unknown;
              } = {
                label,
                index,
                value,
              };

              // Only include prevValue if not the first render
              if (!isFirstRender) {
                labelData.prevValue = prevValue;
              }

              addLabelForGuid(guid, labelData);

              // Store current value for next render
              prevValueStore.set(index, label, value);
            }
          }

          // Mark that first render is complete
          if (isFirstRender) {
            isFirstRenderRef.current = false;
          }
        } catch (error) {
          logWarn(
            `ReactTracer: Error storing labels for index ${index}:`,
            error,
          );
        }
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Always register GUID so the render registry is populated even while passive.
  // This ensures buildTreeFromFiber (with includeNonTrackedBranches: false) can find
  // tracked components the moment the trigger fires, without needing a re-render.
  // The registry is cleared on stopReactTracer() and re-populated on the next render.
  const componentName = typeof param === "string" ? param : param?.name;
  registerTrackedGUID(guidRef.current, componentName);

  // Optional one-time guidance when developer intent is enabled but tracer not initialized
  if (
    !isActive &&
    traceOptions.enabled === true &&
    isGlobalTracerInstalled === false &&
    !hasLoggedMissingInitialization
  ) {
    hasLoggedMissingInitialization = true;
    internalLogger.info(
      "ReactTracer: useReactTracer() called while tracer not initialized. Call reactTracer() early in app startup.",
    );
  }

  return logger;
}

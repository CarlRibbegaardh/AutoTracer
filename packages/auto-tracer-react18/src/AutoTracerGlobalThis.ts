import type { OutputMode } from "./lib/autoTracer/OutputMode.js";
import type { TracerRuntimeControls } from "./lib/autoTracer/TracerRuntimeControls.js";
import type { ReactTracerInternalOptions } from "./lib/types/ReactTracerInternalOptions.js";

export {};

declare global {
  /**
   * AutoTracer runtime API installed by `reactTracer(...)`.
   *
   * Both tracer properties are optional - only the installed tracers are present.
   */
  // eslint-disable-next-line no-var
  var autoTracer:
    | {
        getOutputMode(): OutputMode;
        setOutputMode(mode: OutputMode): void;
        reactTracer?: TracerRuntimeControls;
        flowTracer?: TracerRuntimeControls;
      }
    | undefined;

  /**
   * Internal global state for AutoTracer outputMode synchronization.
   */
  // eslint-disable-next-line no-var
  var __autoTracerInternal:
    | {
        outputMode: OutputMode;
        subscribers: Array<(mode: OutputMode) => void>;
        // Shared component registry for multi-instance coordination
        sharedComponentRegistry?: {
          trackedGUIDs: Set<string>; // GUIDs that rendered this cycle
          trackedNames: Map<string, string>; // GUID -> component name
        };
        // Shared control flags for single hook coordinator
        sharedControl?: {
          isReactTracerActive: boolean;
          isPassiveHookInstalled: boolean;
          isIntendedToBeEnabled: boolean;
          hasInitializedOnce: boolean;
          originalOnCommitFiberRoot: unknown;
        };
        // Shared tracer options and state
        sharedTracerState?: {
          isGlobalTracerInstalled: boolean;
          traceOptions: ReactTracerInternalOptions;
        };
      }
    | undefined;
}

export {};

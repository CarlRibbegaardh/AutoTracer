import type { NetworkTracerApi } from "./api/NetworkTracerApi.js";
import type { NetworkTracerConfigOverrides } from "./configuration/NetworkTracerConfigOverrides.js";

export {};

declare global {
  /** Shared AutoTracer controls installed in the current realm. */
  // eslint-disable-next-line no-var
  var autoTracer:
    | {
        getOutputMode(): "devtools" | "copy-paste";
        setOutputMode(mode: "devtools" | "copy-paste"): void;
        networkTracer?: NetworkTracerApi;
      }
    | undefined;

  /** Internal state shared by AutoTracer output-mode controls. */
  // eslint-disable-next-line no-var
  var __autoTracerInternal:
    | {
        outputMode: "devtools" | "copy-paste";
        subscribers: Array<(mode: "devtools" | "copy-paste") => void>;
      }
    | undefined;

  /** Internal ownership record for the realm's NetworkTracer runtime. */
  // eslint-disable-next-line no-var
  var __autoTracerNetworkRuntime:
    | Readonly<{
        api: NetworkTracerApi;
        initializerDefaults: NetworkTracerConfigOverrides;
      }>
    | undefined;
}

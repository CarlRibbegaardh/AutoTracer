import {
  type NetworkTracerApi,
  type NetworkTracerConfigOverrides,
  networkTracer,
} from "@autotracer/network";

const defaults = {
  captureRequestHeaders: true,
  autoStopAfterRequests: 10,
} satisfies NetworkTracerConfigOverrides;

const api: NetworkTracerApi = networkTracer(defaults);

api.start();
globalThis.autoTracer?.networkTracer?.stop();

// @ts-expect-error NetworkTracer intentionally has no uninstall operation.
api.uninstall();

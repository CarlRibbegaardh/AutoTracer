import type { NetworkTracerApi } from "./api/NetworkTracerApi.js";
import type { NetworkTracerConfigOverrides } from "./configuration/NetworkTracerConfigOverrides.js";
import { createNetworkTracerRuntime } from "./runtime/createNetworkTracerRuntime.js";
import { detectNetworkColorMode } from "./runtime/detectNetworkColorMode.js";
import { getOrCreateNetworkAutoTracerApi } from "./runtime/getOrCreateNetworkAutoTracerApi.js";
import { installNetworkTracerRuntime } from "./runtime/installNetworkTracerRuntime.js";
import { defaultNetworkTheme } from "./theme/defaultNetworkTheme.js";

/**
 * Installs or reuses NetworkTracer in the current browser realm.
 *
 * @param initializerDefaults - Project defaults overridden by persisted developer settings.
 * @returns The realm-owned NetworkTracer control surface.
 */
export function networkTracer(
  initializerDefaults: NetworkTracerConfigOverrides = {},
): NetworkTracerApi {
  const autoTracer = getOrCreateNetworkAutoTracerApi(globalThis);

  return installNetworkTracerRuntime({
    realm: globalThis,
    initializerDefaults,
    createRuntime: (ownedDefaults) =>
      {return createNetworkTracerRuntime({
        target: globalThis,
        storage: globalThis.localStorage,
        initializerDefaults: ownedDefaults,
        baseUrl: globalThis.location.href,
        getMonotonicMarker: () => {return globalThis.performance.now()},
        getOutputSettings: () => {return {
          outputMode: autoTracer.getOutputMode(),
          theme: defaultNetworkTheme,
          colorMode: detectNetworkColorMode(globalThis),
        }},
        log: (...arguments_) => {return globalThis.console.log(...arguments_)},
      })},
    log: (message) => {return globalThis.console.log(message)},
  });
}

import { describe, expect, it, vi } from "vitest";
import { createNetworkTracerRuntime } from "../../../src/runtime/createNetworkTracerRuntime";
import { defaultNetworkTheme } from "../../../src/theme/defaultNetworkTheme";

describe("createNetworkTracerRuntime", () => {
  it("[NET-INSTALL-008,010,012][NET-STATE-001] installs available transports and honors enabled-on-load", () => {
    const nativeFetch: typeof fetch = function nativeFetch() {
      return Promise.resolve(new Response());
    };
    const target = { fetch: nativeFetch };
    const storage = {
      getItem: () => null,
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    const api = createNetworkTracerRuntime({
      target,
      storage,
      initializerDefaults: { enabledOnLoad: true },
      baseUrl: "https://example.test/app/",
      getMonotonicMarker: () => 10,
      getOutputSettings: () => ({
        outputMode: "devtools",
        theme: defaultNetworkTheme,
        colorMode: "dark",
      }),
      log: vi.fn(),
    });

    expect(target.fetch).not.toBe(nativeFetch);
    expect(api.getState()).toBe("running");
    expect(api.isEnabled()).toBe(true);

    api.stop();
    expect(api.getState()).toBe("stopped");

    api.start();
    expect(api.getState()).toBe("running");

    api.forceStop();
    expect(api.getState()).toBe("stopped");
  });

  it("[NET-INSTALL-013] keeps controls dormant when both transports are unavailable", () => {
    const storage = {
      getItem: () => null,
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    const api = createNetworkTracerRuntime({
      target: {},
      storage,
      initializerDefaults: { enabledOnLoad: true },
      baseUrl: "https://example.test/app/",
      getMonotonicMarker: () => 10,
      getOutputSettings: () => ({
        outputMode: "copy-paste",
        theme: defaultNetworkTheme,
        colorMode: "light",
      }),
      log: vi.fn(),
    });

    expect(api.getEnabledOnLoad()).toBe(true);
    expect(api.getState()).toBe("stopped");

    api.start();
    api.stop();
    api.forceStop();

    expect(api.getState()).toBe("stopped");
    expect(api.isEnabled()).toBe(false);
  });
});

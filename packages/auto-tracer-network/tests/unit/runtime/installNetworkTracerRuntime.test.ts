import { describe, expect, it, vi } from "vitest";
import type { NetworkTracerApi } from "../../../src/api/NetworkTracerApi";
import { createNetworkTracerRuntime } from "../../../src/runtime/createNetworkTracerRuntime";
import { installNetworkTracerRuntime } from "../../../src/runtime/installNetworkTracerRuntime";
import { defaultNetworkTheme } from "../../../src/theme/defaultNetworkTheme";

describe("installNetworkTracerRuntime", () => {
  it("[NET-INSTALL-002..007] installs one realm runtime and retains the first defaults", () => {
    const autoTracer: {
      getOutputMode: () => "devtools" | "copy-paste";
      setOutputMode: (mode: "devtools" | "copy-paste") => void;
      networkTracer?: NetworkTracerApi;
    } = {
      getOutputMode: () => "devtools",
      setOutputMode: vi.fn(),
    };
    const realm = { autoTracer };
    const log = vi.fn();
    const createRuntime = vi.fn((initializerDefaults) =>
      createNetworkTracerRuntime({
        target: {},
        storage: {
          getItem: () => null,
          setItem: vi.fn(),
          removeItem: vi.fn(),
        },
        initializerDefaults,
        baseUrl: "https://example.test/app/",
        getMonotonicMarker: () => 10,
        getOutputSettings: () => ({
          outputMode: autoTracer.getOutputMode(),
          theme: defaultNetworkTheme,
          colorMode: "dark",
        }),
        log,
      }),
    );

    const firstApi = installNetworkTracerRuntime({
      realm,
      initializerDefaults: { captureRequestHeaders: true },
      createRuntime,
      log,
    });
    const laterApi = installNetworkTracerRuntime({
      realm,
      initializerDefaults: {
        captureRequestHeaders: false,
        includePatterns: ["/api/**"],
      },
      createRuntime,
      log,
    });

    expect(laterApi).toBe(firstApi);
    expect(autoTracer.networkTracer).toBe(firstApi);
    expect(firstApi.getCaptureRequestHeaders()).toBe(true);
    expect(createRuntime).toHaveBeenCalledExactlyOnceWith({
      captureRequestHeaders: true,
    });
    expect(log).toHaveBeenCalledExactlyOnceWith(
      "NetworkTracer ignored conflicting initializer defaults: captureRequestHeaders, includePatterns.",
    );
  });

  it("[NET-INSTALL-004] silently reuses the runtime for equivalent defaults", () => {
    const autoTracer: {
      getOutputMode: () => "devtools" | "copy-paste";
      setOutputMode: (mode: "devtools" | "copy-paste") => void;
      networkTracer?: NetworkTracerApi;
    } = {
      getOutputMode: () => "copy-paste",
      setOutputMode: vi.fn(),
    };
    const realm = { autoTracer };
    const log = vi.fn();
    const createRuntime = vi.fn((initializerDefaults) =>
      createNetworkTracerRuntime({
        target: {},
        storage: {
          getItem: () => null,
          setItem: vi.fn(),
          removeItem: vi.fn(),
        },
        initializerDefaults,
        baseUrl: "https://example.test/app/",
        getMonotonicMarker: () => 10,
        getOutputSettings: () => ({
          outputMode: autoTracer.getOutputMode(),
          theme: defaultNetworkTheme,
          colorMode: "light",
        }),
        log,
      }),
    );

    const firstApi = installNetworkTracerRuntime({
      realm,
      initializerDefaults: {},
      createRuntime,
      log,
    });
    const laterApi = installNetworkTracerRuntime({
      realm,
      initializerDefaults: { enabledOnLoad: false },
      createRuntime,
      log,
    });

    expect(laterApi).toBe(firstApi);
    expect(createRuntime).toHaveBeenCalledOnce();
    expect(log).not.toHaveBeenCalled();
  });

  it("requires shared AutoTracer controls before first installation", () => {
    expect(() =>
      installNetworkTracerRuntime({
        realm: {},
        initializerDefaults: {},
        createRuntime: vi.fn(),
        log: vi.fn(),
      }),
    ).toThrowError("NetworkTracer requires shared AutoTracer controls.");
  });
});

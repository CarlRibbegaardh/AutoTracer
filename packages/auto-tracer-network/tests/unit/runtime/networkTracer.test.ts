import { afterEach, describe, expect, it, vi } from "vitest";
import { networkTracer } from "../../../src/index";

afterEach(vi.unstubAllGlobals);

describe("networkTracer", () => {
  it("[NET-INSTALL-001..004,010][NET-OUTPUT-001] installs one public browser runtime", () => {
    const nativeFetch: typeof fetch = function nativeFetch() {
      return Promise.resolve(new Response());
    };
    const log = vi.fn();
    const getOutputMode = vi.fn<() => "devtools" | "copy-paste">(
      () => {return "copy-paste"},
    );
    vi.stubGlobal("fetch", nativeFetch);
    vi.stubGlobal("XMLHttpRequest", undefined);
    vi.stubGlobal("localStorage", {
      getItem: () => {return null},
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    vi.stubGlobal("location", { href: "https://example.test/app/" });
    vi.stubGlobal("performance", { now: vi.fn(() => {return 42}) });
    vi.stubGlobal("matchMedia", vi.fn(() => {return { matches: true }}));
    vi.stubGlobal("console", { log });
    vi.stubGlobal("autoTracer", {
      getOutputMode,
      setOutputMode: vi.fn(),
    });
    vi.stubGlobal("__autoTracerNetworkRuntime", undefined);

    const firstApi = networkTracer({ enabledOnLoad: true });
    const installedFetch = globalThis.fetch;
    const laterApi = networkTracer({ enabledOnLoad: true });

    expect(firstApi).toBe(laterApi);
    expect(globalThis.autoTracer?.networkTracer).toBe(firstApi);
    expect(firstApi.getState()).toBe("running");
    expect(globalThis.fetch).toBe(installedFetch);
    expect(globalThis.fetch).not.toBe(nativeFetch);
    expect(getOutputMode).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { networkTracer } from "../../../src/index";

afterEach(vi.unstubAllGlobals);

describe("NetworkTracer configuration integration", () => {
  it("[NET-CONFIG-001..002,006,012..013] persists public operations immediately and resets without changing runtime state", () => {
    const entries = new Map<string, string>();
    const storage = {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => {
        entries.set(key, value);
      },
      removeItem: (key: string) => {
        entries.delete(key);
      },
    };
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response("ok"))));
    vi.stubGlobal("XMLHttpRequest", undefined);
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal("location", { href: "https://example.test/app/" });
    vi.stubGlobal("performance", { now: () => 100 });
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
    vi.stubGlobal("console", { log: vi.fn() });
    vi.stubGlobal("autoTracer", {
      getOutputMode: () => "copy-paste" as const,
      setOutputMode: vi.fn(),
    });
    vi.stubGlobal("__autoTracerNetworkRuntime", undefined);

    const api = networkTracer({
      enabledOnLoad: true,
      captureRequestBody: true,
    });

    api.setBodyCaptureLimit(2_048);
    expect(
      JSON.parse(entries.get("__autotracer.network.config.v1") ?? "null"),
    ).toEqual({
      version: 1,
      config: { bodyCaptureLimit: 2_048 },
    });

    expect(() => api.setBodyCaptureLimit(0)).toThrow(
      "NetworkTracer: bodyCaptureLimit must be a positive integer",
    );
    expect(api.getBodyCaptureLimit()).toBe(2_048);
    expect(() => api.setIncludePatterns(["**/*.{malformed"])).toThrow(
      "NetworkTracer: includePatterns contains an invalid glob: **/*.{malformed",
    );
    expect(api.getIncludePatterns()).toEqual([]);

    expect(api.getState()).toBe("running");
    api.resetConfig();

    expect(api.getState()).toBe("running");
    expect(api.isEnabled()).toBe(true);
    expect(api.getEnabledOnLoad()).toBe(false);
    expect(api.getCaptureRequestBody()).toBe(true);
    expect(api.getBodyCaptureLimit()).toBe(65_536);
    expect(entries.has("__autotracer.network.config.v1")).toBe(false);
    expect("config" in api).toBe(false);
  });
});

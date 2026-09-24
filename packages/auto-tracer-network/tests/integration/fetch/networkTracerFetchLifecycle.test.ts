import { afterEach, describe, expect, it, vi } from "vitest";
import { networkTracer } from "../../../src/index";

afterEach(vi.unstubAllGlobals);

describe("NetworkTracer Fetch lifecycle", () => {
  it("[NET-SCOPE-001][NET-EVENT-001..006][NET-INSTALL-008][NET-NATIVE-001,005] preserves native Fetch behavior across running and stopped states", async () => {
    const response = new Response("created", { status: 201 });
    const nativePromise = Promise.resolve(response);
    const nativeFetch = vi.fn(() => {
      return nativePromise;
    });
    const log = vi.fn();
    const now = vi.fn().mockReturnValueOnce(100).mockReturnValueOnce(175);
    vi.stubGlobal("fetch", nativeFetch);
    vi.stubGlobal("XMLHttpRequest", undefined);
    vi.stubGlobal("localStorage", {
      getItem: () => {
        return null;
      },
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    vi.stubGlobal("location", { href: "https://example.test/app/" });
    vi.stubGlobal("performance", { now });
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => {
        return { matches: false };
      }),
    );
    vi.stubGlobal("console", { log });
    vi.stubGlobal("autoTracer", {
      getOutputMode: () => {
        return "copy-paste" as const;
      },
      setOutputMode: vi.fn(),
    });
    vi.stubGlobal("__autoTracerNetworkRuntime", undefined);

    const api = networkTracer({ enabledOnLoad: true });
    const returnedPromise = globalThis.fetch("/api/orders", {
      method: "POST",
    });

    expect(returnedPromise).toBe(nativePromise);
    expect(log).toHaveBeenCalledExactlyOnceWith(
      "Network #1 -> POST /api/orders",
    );

    await expect(returnedPromise).resolves.toBe(response);
    expect(log.mock.calls).toEqual([
      ["Network #1 -> POST /api/orders"],
      ["Network #1 <- 201 POST /api/orders (75 ms)"],
    ]);

    api.stop();
    log.mockClear();

    const stoppedPromise = globalThis.fetch("/api/stopped");

    expect(stoppedPromise).toBe(nativePromise);
    await stoppedPromise;
    expect(nativeFetch).toHaveBeenCalledTimes(2);
    expect(log).not.toHaveBeenCalled();
  });

  it("[NET-EVENT-012][NET-OUTCOME-002,008..009] logs a synchronous failure and rethrows its exact value", () => {
    const failure = new TypeError("fetch threw");
    const nativeFetch = vi.fn(() => {
      throw failure;
    });
    const log = vi.fn();
    const now = vi.fn().mockReturnValueOnce(100).mockReturnValueOnce(125);
    vi.stubGlobal("fetch", nativeFetch);
    vi.stubGlobal("XMLHttpRequest", undefined);
    vi.stubGlobal("localStorage", {
      getItem: () => {
        return null;
      },
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    vi.stubGlobal("location", { href: "https://example.test/app/" });
    vi.stubGlobal("performance", { now });
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => {
        return { matches: false };
      }),
    );
    vi.stubGlobal("console", { log });
    vi.stubGlobal("autoTracer", {
      getOutputMode: () => {
        return "copy-paste" as const;
      },
      setOutputMode: vi.fn(),
    });
    vi.stubGlobal("__autoTracerNetworkRuntime", undefined);

    networkTracer({ enabledOnLoad: true });

    expect(() => {
      return globalThis.fetch("/api/synchronous-failure", {
        method: "PATCH",
      });
    }).toThrow(failure);
    expect(nativeFetch).toHaveBeenCalledExactlyOnceWith(
      "/api/synchronous-failure",
      { method: "PATCH" },
    );
    expect(log.mock.calls).toEqual([
      ["Network #1 -> PATCH /api/synchronous-failure"],
      ["Network #1 <- FAILED PATCH /api/synchronous-failure (25 ms)"],
      ['Network #1   failure: {"message":"fetch threw","name":"TypeError"}'],
    ]);
  });

  it("[NET-URL-001..006] renders one redirected pair from browser response metadata", async () => {
    const response = new Response("current", { status: 200 });
    Object.defineProperties(response, {
      redirected: { value: true },
      url: { value: "https://auth.example.test/current?flow=login" },
    });
    const nativePromise = Promise.resolve(response);
    const nativeFetch = vi.fn(() => {
      return nativePromise;
    });
    const log = vi.fn();
    const now = vi.fn().mockReturnValueOnce(100).mockReturnValueOnce(150);
    vi.stubGlobal("fetch", nativeFetch);
    vi.stubGlobal("XMLHttpRequest", undefined);
    vi.stubGlobal("localStorage", {
      getItem: () => {
        return null;
      },
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    vi.stubGlobal("location", { href: "https://example.test/app/" });
    vi.stubGlobal("performance", { now });
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => {
        return { matches: false };
      }),
    );
    vi.stubGlobal("console", { log });
    vi.stubGlobal("autoTracer", {
      getOutputMode: () => {
        return "copy-paste" as const;
      },
      setOutputMode: vi.fn(),
    });
    vi.stubGlobal("__autoTracerNetworkRuntime", undefined);

    networkTracer({
      enabledOnLoad: true,
      includePatterns: ["https://example.test/legacy*"],
    });
    const returnedPromise = globalThis.fetch("/legacy?token=visible");

    expect(returnedPromise).toBe(nativePromise);
    await returnedPromise;
    expect(nativeFetch).toHaveBeenCalledExactlyOnceWith(
      "/legacy?token=visible",
    );
    expect(log.mock.calls).toEqual([
      ["Network #1 -> GET /legacy?token=[REDACTED]"],
      [
        "Network #1 <- 200 REDIRECTED (50 ms)\n  requested: GET /legacy?token=[REDACTED]\n  final:     https://auth.example.test/current?flow=login",
      ],
    ]);
  });

  it("[NET-ID-001..003][NET-FILTER-005..009][NET-AUTOSTOP-002..004] excludes hidden requests from admission and drain", async () => {
    const hiddenPromise = new Promise<Response>(() => {});
    const visibleResponse = new Response("visible", { status: 200 });
    const visiblePromise = Promise.resolve(visibleResponse);
    const nativeFetch = vi.fn((input: RequestInfo | URL) => {
      return String(input).endsWith("/visible")
        ? visiblePromise
        : hiddenPromise;
    });
    const log = vi.fn();
    const now = vi.fn().mockReturnValueOnce(100).mockReturnValueOnce(125);
    vi.stubGlobal("fetch", nativeFetch);
    vi.stubGlobal("XMLHttpRequest", undefined);
    vi.stubGlobal("localStorage", {
      getItem: () => {
        return null;
      },
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    vi.stubGlobal("location", { href: "https://example.test/app/" });
    vi.stubGlobal("performance", { now });
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => {
        return { matches: false };
      }),
    );
    vi.stubGlobal("console", { log });
    vi.stubGlobal("autoTracer", {
      getOutputMode: () => {
        return "copy-paste" as const;
      },
      setOutputMode: vi.fn(),
    });
    vi.stubGlobal("__autoTracerNetworkRuntime", undefined);

    const api = networkTracer({
      enabledOnLoad: true,
      includePatterns: ["https://example.test/api/*"],
      excludePatterns: ["https://example.test/api/private/*"],
      autoStopAfterRequests: 1,
    });

    const outsidePromise = globalThis.fetch("/outside");
    const excludedPromise = globalThis.fetch("/api/private/hidden");

    expect(outsidePromise).toBe(hiddenPromise);
    expect(excludedPromise).toBe(hiddenPromise);
    expect(api.getPendingRequestCount()).toBe(0);
    expect(api.getState()).toBe("running");
    expect(log).not.toHaveBeenCalled();

    const returnedVisiblePromise = globalThis.fetch("/api/visible");

    expect(returnedVisiblePromise).toBe(visiblePromise);
    expect(api.getState()).toBe("stopping");
    expect(api.getPendingRequestCount()).toBe(1);
    await returnedVisiblePromise;
    expect(api.getState()).toBe("stopped");
    expect(api.getPendingRequestCount()).toBe(0);
    expect(log.mock.calls).toEqual([
      ["Network #3 -> GET /api/visible"],
      ["Network #3 <- 200 GET /api/visible (25 ms)"],
      ["Network tracing stopped automatically (limit: 1 requests)"],
    ]);
  });
});

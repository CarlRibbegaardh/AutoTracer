import { afterEach, describe, expect, it, vi } from "vitest";
import { networkTracer } from "../../../src/index";

afterEach(vi.unstubAllGlobals);

describe("NetworkTracer stopping", () => {
  it("[NET-STOP-002..003] immediately suppresses unfinished output without aborting Fetch", async () => {
    let resolveResponse: ((response: Response) => void) | undefined;
    const nativePromise = new Promise<Response>((resolve) => {
      resolveResponse = resolve;
    });
    const nativeFetch = vi.fn(() => {
      return nativePromise;
    });
    const log = vi.fn();
    const now = vi.fn().mockReturnValueOnce(100);
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
    const returnedPromise = globalThis.fetch("/api/immediate");

    api.stop();

    expect(api.getState()).toBe("stopped");
    expect(api.getPendingRequestCount()).toBe(1);
    expect(log.mock.calls).toEqual([
      ["Network #1 -> GET /api/immediate"],
      ["Network tracing stopped"],
    ]);

    resolveResponse?.(new Response("completed", { status: 200 }));
    await expect(returnedPromise).resolves.toBeInstanceOf(Response);
    expect(nativeFetch).toHaveBeenCalledOnce();
    expect(api.getPendingRequestCount()).toBe(0);
    expect(log.mock.calls).toEqual([
      ["Network #1 -> GET /api/immediate"],
      ["Network tracing stopped"],
    ]);
  });

  it("[NET-STOP-004..007] drains pending work and preserves identity across resume", async () => {
    const responseResolvers: Array<(response: Response) => void> = [];
    const nativeFetch = vi.fn(() => {
      return new Promise<Response>((resolve) => {
        responseResolvers.push(resolve);
      });
    });
    const log = vi.fn();
    const now = vi
      .fn()
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(200)
      .mockReturnValueOnce(250)
      .mockReturnValueOnce(300)
      .mockReturnValueOnce(350)
      .mockReturnValueOnce(400);
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
      waitForPendingRequestsOnStop: true,
    });
    const firstPromise = globalThis.fetch("/api/first");

    api.stop();
    expect(api.getState()).toBe("stopping");
    expect(log).toHaveBeenLastCalledWith(
      "Network tracing stopping (1 requests pending)",
    );

    const untracedPromise = globalThis.fetch("/api/untraced");
    expect(api.getPendingRequestCount()).toBe(1);
    api.start();
    const secondPromise = globalThis.fetch("/api/second");

    responseResolvers[0]?.(new Response("first", { status: 200 }));
    responseResolvers[1]?.(new Response("untraced", { status: 200 }));
    responseResolvers[2]?.(new Response("second", { status: 201 }));
    await Promise.all([firstPromise, untracedPromise, secondPromise]);

    expect(api.getState()).toBe("running");
    expect(api.getPendingRequestCount()).toBe(0);
    expect(log.mock.calls).toEqual([
      ["Network #1 -> GET /api/first"],
      ["Network tracing stopping (1 requests pending)"],
      ["Network tracing started"],
      ["Network #2 -> GET /api/second"],
      ["Network #1 <- 200 GET /api/first (150 ms)"],
      ["Network #2 <- 201 GET /api/second (100 ms)"],
    ]);

    const finalPromise = globalThis.fetch("/api/final");
    api.stop();
    responseResolvers[3]?.(new Response("final", { status: 202 }));
    await finalPromise;

    expect(api.getState()).toBe("stopped");
    expect(log.mock.calls.slice(-3)).toEqual([
      ["Network tracing stopping (1 requests pending)"],
      ["Network #3 <- 202 GET /api/final (50 ms)"],
      ["Network tracing stopped"],
    ]);
  });

  it("[NET-STOP-008..010][NET-AUTOSTOP-005..008] force-stops a hung automatic drain without aborting Fetch", async () => {
    let resolveResponse: ((response: Response) => void) | undefined;
    const nativePromise = new Promise<Response>((resolve) => {
      resolveResponse = resolve;
    });
    const nativeFetch = vi.fn(() => {
      return nativePromise;
    });
    const log = vi.fn();
    const now = vi.fn().mockReturnValueOnce(100);
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
      autoStopAfterRequests: 1,
    });
    const returnedPromise = globalThis.fetch("/api/hung");

    expect(api.getState()).toBe("stopping");
    expect(api.getPendingRequestCount()).toBe(1);
    expect(log.mock.calls).toEqual([["Network #1 -> GET /api/hung"]]);

    api.forceStop();

    expect(api.getState()).toBe("stopped");
    expect(log.mock.calls).toEqual([
      ["Network #1 -> GET /api/hung"],
      ["Network tracing stopped"],
    ]);

    resolveResponse?.(new Response("completed", { status: 200 }));
    await expect(returnedPromise).resolves.toBeInstanceOf(Response);
    expect(nativeFetch).toHaveBeenCalledOnce();
    expect(api.getPendingRequestCount()).toBe(0);
    expect(log.mock.calls).toEqual([
      ["Network #1 -> GET /api/hung"],
      ["Network tracing stopped"],
    ]);
  });
});

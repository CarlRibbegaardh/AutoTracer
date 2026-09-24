import { afterEach, describe, expect, it, vi } from "vitest";
import { networkTracer } from "../../../src/index";

afterEach(vi.unstubAllGlobals);

describe("NetworkTracer runtime boundaries", () => {
  it("[NET-SCOPE-003,005] leaves unsupported transport-like APIs and correlation state untouched", () => {
    const nativeFetch = vi.fn(() => Promise.resolve(new Response("ok")));
    const sendBeacon = vi.fn(() => true);
    const webSocket = vi.fn();
    const eventSource = vi.fn();
    const worker = vi.fn();
    const serviceWorker = {};
    const log = vi.fn();
    vi.stubGlobal("fetch", nativeFetch);
    vi.stubGlobal("XMLHttpRequest", undefined);
    vi.stubGlobal("WebSocket", webSocket);
    vi.stubGlobal("EventSource", eventSource);
    vi.stubGlobal("Worker", worker);
    vi.stubGlobal("navigator", { sendBeacon, serviceWorker });
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    vi.stubGlobal("location", { href: "https://example.test/app/" });
    vi.stubGlobal("performance", { now: () => 100 });
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
    vi.stubGlobal("console", { log });
    vi.stubGlobal("autoTracer", {
      getOutputMode: () => "copy-paste" as const,
      setOutputMode: vi.fn(),
    });
    vi.stubGlobal("__autoTracerNetworkRuntime", undefined);
    const correlationState = { requestId: 91 };
    vi.stubGlobal("__otherTracerContext", correlationState);

    networkTracer({ enabledOnLoad: true });

    expect(globalThis.WebSocket).toBe(webSocket);
    expect(globalThis.EventSource).toBe(eventSource);
    expect(globalThis.Worker).toBe(worker);
    expect(globalThis.navigator.sendBeacon).toBe(sendBeacon);
    expect(globalThis.navigator.serviceWorker).toBe(serviceWorker);
    expect(Reflect.get(globalThis, "__otherTracerContext")).toBe(
      correlationState,
    );
    expect(log).not.toHaveBeenCalled();
  });

  it("[NET-INSTALL-008..011][NET-STATE-006..010,012] keeps stopped wrappers inert and lifecycle commands idempotent", async () => {
    const nativeResponse = new Response("native");
    const nativeFetch = vi.fn(() => Promise.resolve(nativeResponse));
    const replacementResponse = new Response("replacement");
    const replacementFetch = vi.fn(() => Promise.resolve(replacementResponse));
    const log = vi.fn();
    const warn = vi.fn();
    const error = vi.fn();
    vi.stubGlobal("fetch", nativeFetch);
    vi.stubGlobal("XMLHttpRequest", undefined);
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    vi.stubGlobal("location", { href: "https://example.test/app/" });
    vi.stubGlobal("performance", { now: () => 100 });
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
    vi.stubGlobal("console", { log, warn, error });
    vi.stubGlobal("autoTracer", {
      getOutputMode: () => "copy-paste" as const,
      setOutputMode: vi.fn(),
    });
    vi.stubGlobal("__autoTracerNetworkRuntime", undefined);

    const api = networkTracer();
    const installedFetch = globalThis.fetch;
    const stoppedResponse = await installedFetch("/api/stopped");

    expect(installedFetch).not.toBe(nativeFetch);
    expect(stoppedResponse).toBe(nativeResponse);
    expect("uninstall" in api).toBe(false);
    expect(log).not.toHaveBeenCalled();

    api.start();
    api.start();
    api.stop();
    api.stop();
    api.forceStop();

    expect(log.mock.calls).toEqual([
      ["Network tracing started"],
      ["Network tracing stopped"],
    ]);
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    expect(globalThis.fetch).toBe(installedFetch);

    vi.stubGlobal("fetch", replacementFetch);
    await Promise.resolve();

    expect(globalThis.fetch).toBe(replacementFetch);
    await expect(globalThis.fetch("/api/replacement")).resolves.toBe(
      replacementResponse,
    );
    await expect(installedFetch("/api/captured")).resolves.toBe(nativeResponse);
    expect(replacementFetch).toHaveBeenCalledOnce();
    expect(nativeFetch).toHaveBeenCalledTimes(2);
    expect(log).toHaveBeenCalledTimes(2);
  });

  it("[NET-INSTALL-012..013] installs dormant controls when both transports are unavailable", () => {
    const log = vi.fn();
    vi.stubGlobal("fetch", undefined);
    vi.stubGlobal("XMLHttpRequest", undefined);
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    vi.stubGlobal("location", { href: "https://example.test/app/" });
    vi.stubGlobal("performance", { now: () => 100 });
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
    vi.stubGlobal("console", { log });
    vi.stubGlobal("autoTracer", {
      getOutputMode: () => "copy-paste" as const,
      setOutputMode: vi.fn(),
    });
    vi.stubGlobal("__autoTracerNetworkRuntime", undefined);

    const api = networkTracer({ enabledOnLoad: true });

    expect(globalThis.autoTracer?.networkTracer).toBe(api);
    expect(api.getState()).toBe("stopped");
    expect(api.isEnabled()).toBe(false);
    expect(api.getPendingRequestCount()).toBe(0);
    expect(log).not.toHaveBeenCalled();
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { networkTracer } from "../../../src/index";

afterEach(vi.unstubAllGlobals);

describe("NetworkTracer body capture", () => {
  it("[NET-EVENT-009..011,013][NET-CAPTURE-009..012][NET-BODY-003] emits cloned asynchronous details in settlement order without delaying Fetch", async () => {
    let resolveRequestBody: ((body: string) => void) | undefined;
    let resolveResponseBody: ((body: string) => void) | undefined;
    const requestBody = new Promise<string>((resolve) => {
      resolveRequestBody = resolve;
    });
    const responseBody = new Promise<string>((resolve) => {
      resolveResponseBody = resolve;
    });
    const request = new Request("https://example.test/api/orders", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: "application request",
    });
    const requestClone = request.clone();
    requestClone.text = vi.fn(() => requestBody);
    request.clone = vi.fn(() => requestClone);
    const response = new Response("application response", {
      status: 201,
      headers: { "Content-Type": "text/plain" },
    });
    const responseClone = response.clone();
    responseClone.text = vi.fn(() => responseBody);
    response.clone = vi.fn(() => responseClone);
    let resolveNative: ((response: Response) => void) | undefined;
    const nativePromise = new Promise<Response>((resolve) => {
      resolveNative = resolve;
    });
    const nativeFetch = vi.fn(() => nativePromise);
    const log = vi.fn();
    vi.stubGlobal("fetch", nativeFetch);
    vi.stubGlobal("XMLHttpRequest", undefined);
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    vi.stubGlobal("location", { href: "https://example.test/app/" });
    vi.stubGlobal("performance", {
      now: vi.fn().mockReturnValueOnce(100).mockReturnValueOnce(125),
    });
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
    vi.stubGlobal("console", { log });
    vi.stubGlobal("autoTracer", {
      getOutputMode: () => "copy-paste" as const,
      setOutputMode: vi.fn(),
    });
    vi.stubGlobal("__autoTracerNetworkRuntime", undefined);

    networkTracer({
      enabledOnLoad: true,
      captureRequestBody: true,
      captureResponseBody: true,
    });
    const returnedPromise = globalThis.fetch(request);

    expect(returnedPromise).toBe(nativePromise);
    expect(nativeFetch).toHaveBeenCalledExactlyOnceWith(request);
    expect(log.mock.calls).toEqual([
      ["Network #1 -> POST /api/orders"],
    ]);

    resolveNative?.(response);
    await returnedPromise;
    expect(log.mock.calls).toEqual([
      ["Network #1 -> POST /api/orders"],
      ["Network #1 <- 201 POST /api/orders (25 ms)"],
    ]);

    resolveResponseBody?.("captured response");
    await vi.waitFor(() => {
      expect(log).toHaveBeenCalledTimes(3);
    });
    resolveRequestBody?.("captured request");
    await vi.waitFor(() => {
      expect(log.mock.calls).toEqual([
        ["Network #1 -> POST /api/orders"],
        ["Network #1 <- 201 POST /api/orders (25 ms)"],
        [
          'Network #1   response body: {"capturedByteSize":17,"originalByteSize":17,"status":"captured","text":"captured response","truncated":false}',
        ],
        [
          'Network #1   request body: {"capturedByteSize":16,"originalByteSize":16,"status":"captured","text":"captured request","truncated":false}',
        ],
      ]);
    });
    expect(request.bodyUsed).toBe(false);
    expect(response.bodyUsed).toBe(false);
  });

  it("[NET-BODY-015..016] emits unavailable before completing a manual drain", async () => {
    let rejectResponseBody: ((failure: unknown) => void) | undefined;
    const responseBody = new Promise<string>((_resolve, reject) => {
      rejectResponseBody = reject;
    });
    const response = new Response("application response", { status: 200 });
    const responseClone = response.clone();
    responseClone.text = vi.fn(() => responseBody);
    response.clone = vi.fn(() => responseClone);
    const nativePromise = Promise.resolve(response);
    const log = vi.fn();
    vi.stubGlobal("fetch", vi.fn(() => nativePromise));
    vi.stubGlobal("XMLHttpRequest", undefined);
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    vi.stubGlobal("location", { href: "https://example.test/app/" });
    vi.stubGlobal("performance", {
      now: vi.fn().mockReturnValueOnce(100).mockReturnValueOnce(125),
    });
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
    vi.stubGlobal("console", { log });
    vi.stubGlobal("autoTracer", {
      getOutputMode: () => "copy-paste" as const,
      setOutputMode: vi.fn(),
    });
    vi.stubGlobal("__autoTracerNetworkRuntime", undefined);

    const api = networkTracer({
      enabledOnLoad: true,
      captureResponseBody: true,
      waitForPendingRequestsOnStop: true,
    });
    const returnedPromise = globalThis.fetch("/api/orders");

    await returnedPromise;
    api.stop();
    expect(api.getState()).toBe("stopping");
    expect(api.getPendingRequestCount()).toBe(1);

    rejectResponseBody?.(new TypeError("cannot read"));
    await vi.waitFor(() => {
      expect(api.getState()).toBe("stopped");
    });

    expect(log.mock.calls).toEqual([
      ["Network #1 -> GET /api/orders"],
      ["Network #1 <- 200 GET /api/orders (25 ms)"],
      ["Network tracing stopping (1 requests pending)"],
      ["Network #1   response body UNAVAILABLE"],
      ["Network tracing stopped"],
    ]);
    expect(api.getPendingRequestCount()).toBe(0);
    expect(response.bodyUsed).toBe(false);
  });

  it("[NET-CAPTURE-008][NET-BODY-015] applies force-stop suppression to pending body capture", async () => {
    let resolveResponseBody: ((body: string) => void) | undefined;
    const responseBody = new Promise<string>((resolve) => {
      resolveResponseBody = resolve;
    });
    const response = new Response("application response", { status: 200 });
    const responseClone = response.clone();
    responseClone.text = vi.fn(() => responseBody);
    response.clone = vi.fn(() => responseClone);
    const log = vi.fn();
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(response)));
    vi.stubGlobal("XMLHttpRequest", undefined);
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    vi.stubGlobal("location", { href: "https://example.test/app/" });
    vi.stubGlobal("performance", {
      now: vi.fn().mockReturnValueOnce(100).mockReturnValueOnce(125),
    });
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
    vi.stubGlobal("console", { log });
    vi.stubGlobal("autoTracer", {
      getOutputMode: () => "copy-paste" as const,
      setOutputMode: vi.fn(),
    });
    vi.stubGlobal("__autoTracerNetworkRuntime", undefined);

    const api = networkTracer({
      enabledOnLoad: true,
      captureResponseBody: true,
      waitForPendingRequestsOnStop: true,
    });

    await globalThis.fetch("/api/orders");
    api.stop();
    api.forceStop();
    const callsAtStop = [...log.mock.calls];

    resolveResponseBody?.("captured response");
    await vi.waitFor(() => {
      expect(api.getPendingRequestCount()).toBe(0);
    });

    expect(api.getState()).toBe("stopped");
    expect(log.mock.calls).toEqual(callsAtStop);
    expect(log.mock.calls.at(-1)).toEqual(["Network tracing stopped"]);
    expect(response.bodyUsed).toBe(false);
  });
});

import { describe, expect, it, vi } from "vitest";
import { createRequestBodyDetailEvent } from "../../../src/capture/createRequestBodyDetailEvent";
import { createRequestHeadersDetailEvent } from "../../../src/capture/createRequestHeadersDetailEvent";
import { createResponseBodyDetailEvent } from "../../../src/capture/createResponseBodyDetailEvent";
import { createResponseHeadersDetailEvent } from "../../../src/capture/createResponseHeadersDetailEvent";
import { defaultNetworkTracerConfig } from "../../../src/configuration/defaultNetworkTracerConfig";
import { createFetchResponseEvent } from "../../../src/transport/createFetchResponseEvent";
import { createRequestStartEvent } from "../../../src/events/createRequestStartEvent";
import { invokeFetchRequest } from "../../../src/transport/invokeFetchRequest";

describe("invokeFetchRequest", () => {
  it("[NET-INSTALL-008][NET-NATIVE-001] delegates while tracing is not running", async () => {
    const input = new Request("https://example.test/api/orders");
    const init = { method: "POST" } as const;
    const response = new Response("stopped");
    const nativePromise = Promise.resolve(response);
    const nativeFetch = vi.fn(() => nativePromise);
    const getConfig = vi.fn();
    const getNextRequestId = vi.fn();

    const returnedPromise = invokeFetchRequest(
      nativeFetch,
      { input, init },
      {
        isEnabled: () => false,
        baseUrl: "https://example.test/",
        getConfig,
        getNextRequestId,
        getAdmittedRequestCount: vi.fn(),
        setAdmittedRequestCount: vi.fn(),
        enterStopping: vi.fn(),
        getMonotonicMarker: vi.fn(),
        beginPendingWork: vi.fn(),
        canEmitPendingOutput: () => false,
        settlePendingWork: vi.fn(),
        emit: vi.fn(),
      },
    );

    expect(returnedPromise).toBe(nativePromise);
    await expect(returnedPromise).resolves.toBe(response);
    expect(nativeFetch).toHaveBeenCalledExactlyOnceWith(input, init);
    expect(getConfig).not.toHaveBeenCalled();
    expect(getNextRequestId).not.toHaveBeenCalled();
  });

  it("[NET-ID-001,003][NET-FILTER-005..009] consumes identity but delegates hidden calls without tracing work", async () => {
    const response = new Response("hidden");
    const nativePromise = Promise.resolve(response);
    const nativeFetch = vi.fn(() => nativePromise);
    const getNextRequestId = vi.fn(() => 7);
    const setAdmittedRequestCount = vi.fn();
    const getMonotonicMarker = vi.fn();
    const beginPendingWork = vi.fn();
    const emit = vi.fn();

    const returnedPromise = invokeFetchRequest(
      nativeFetch,
      { input: "/private/orders" },
      {
        isEnabled: () => true,
        baseUrl: "https://example.test/",
        getConfig: () => ({
          ...defaultNetworkTracerConfig,
          includePatterns: [],
          excludePatterns: ["https://example.test/private/**"],
          autoStopAfterRequests: 1,
        }),
        getNextRequestId,
        getAdmittedRequestCount: () => 0,
        setAdmittedRequestCount,
        enterStopping: vi.fn(),
        getMonotonicMarker,
        beginPendingWork,
        canEmitPendingOutput: () => true,
        settlePendingWork: vi.fn(),
        emit,
      },
    );

    expect(returnedPromise).toBe(nativePromise);
    await expect(returnedPromise).resolves.toBe(response);
    expect(getNextRequestId).toHaveBeenCalledOnce();
    expect(setAdmittedRequestCount).not.toHaveBeenCalled();
    expect(getMonotonicMarker).not.toHaveBeenCalled();
    expect(beginPendingWork).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });

  it("[NET-EVENT-001,004,006][NET-AUTOSTOP-002,004][NET-NATIVE-001] traces the final admitted call after entering stopping", async () => {
    const order: string[] = [];
    const emitted: unknown[] = [];
    const response = new Response("created", { status: 201 });
    const nativePromise = Promise.resolve(response);
    const nativeFetch = vi.fn(() => {
      order.push("native");
      return nativePromise;
    });
    const getMonotonicMarker = vi
      .fn()
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(175);

    const returnedPromise = invokeFetchRequest(
      nativeFetch,
      { input: "/api/orders", init: { method: "POST" } },
      {
        isEnabled: () => true,
        baseUrl: "https://example.test/",
        getConfig: () => ({
          ...defaultNetworkTracerConfig,
          includePatterns: ["https://example.test/api/**"],
          excludePatterns: [],
          autoStopAfterRequests: 1,
        }),
        getNextRequestId: () => 12,
        getAdmittedRequestCount: () => 0,
        setAdmittedRequestCount: (count) => {
          order.push(`count:${count}`);
        },
        enterStopping: () => {
          order.push("stopping");
        },
        getMonotonicMarker,
        beginPendingWork: () => {
          order.push("begin");
        },
        canEmitPendingOutput: () => true,
        settlePendingWork: () => {
          order.push("settle");
        },
        emit: (event) => {
          order.push("emit");
          emitted.push(event);
        },
      },
    );

    expect(returnedPromise).toBe(nativePromise);
    expect(order).toEqual([
      "count:1",
      "stopping",
      "begin",
      "emit",
      "native",
    ]);
    expect(emitted).toEqual([
      createRequestStartEvent(12, "POST", "/api/orders"),
    ]);

    await expect(returnedPromise).resolves.toBe(response);
    expect(order).toEqual([
      "count:1",
      "stopping",
      "begin",
      "emit",
      "native",
      "emit",
      "settle",
    ]);
    expect(emitted).toEqual([
      createRequestStartEvent(12, "POST", "/api/orders"),
      createFetchResponseEvent({
        requestId: 12,
        method: "POST",
        requestedUrl: "/api/orders",
        startMarker: 100,
        completionMarker: 175,
        response,
      }),
    ]);
  });

  it("[NET-ID-001][NET-AUTOSTOP-003] delegates a post-limit call without tracing work", async () => {
    const nativePromise = Promise.resolve(new Response("post-limit"));
    const nativeFetch = vi.fn(() => nativePromise);
    const getNextRequestId = vi.fn(() => 13);
    const setAdmittedRequestCount = vi.fn();
    const enterStopping = vi.fn();
    const getMonotonicMarker = vi.fn();
    const beginPendingWork = vi.fn();
    const emit = vi.fn();

    const returnedPromise = invokeFetchRequest(
      nativeFetch,
      { input: "/api/orders" },
      {
        isEnabled: () => true,
        baseUrl: "https://example.test/",
        getConfig: () => ({
          ...defaultNetworkTracerConfig,
          includePatterns: [],
          excludePatterns: [],
          autoStopAfterRequests: 1,
        }),
        getNextRequestId,
        getAdmittedRequestCount: () => 1,
        setAdmittedRequestCount,
        enterStopping,
        getMonotonicMarker,
        beginPendingWork,
        canEmitPendingOutput: () => true,
        settlePendingWork: vi.fn(),
        emit,
      },
    );

    expect(returnedPromise).toBe(nativePromise);
    await returnedPromise;
    expect(getNextRequestId).toHaveBeenCalledOnce();
    expect(setAdmittedRequestCount).not.toHaveBeenCalled();
    expect(enterStopping).not.toHaveBeenCalled();
    expect(getMonotonicMarker).not.toHaveBeenCalled();
    expect(beginPendingWork).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });

  it("[NET-EVENT-001,004,009..011][NET-CAPTURE-004..007,009..012][NET-BODY-015][NET-NATIVE-001,005] applies one capture snapshot around native Fetch", async () => {
    const order: string[] = [];
    const emitted: unknown[] = [];
    const response = new Response("response body", {
      status: 200,
      headers: { "X-Response": "visible" },
    });
    const nativePromise = Promise.resolve(response);

    const returnedPromise = invokeFetchRequest(
      () => {
        order.push("native");
        return nativePromise;
      },
      {
        input: "/api/orders",
        init: {
          method: "POST",
          headers: { "X-Request": "visible" },
          body: "request body",
        },
      },
      {
        isEnabled: () => true,
        baseUrl: "https://example.test/",
        getConfig: () => ({
          enabledOnLoad: false,
          captureRequestHeaders: true,
          captureRequestBody: true,
          captureResponseHeaders: true,
          captureResponseBody: true,
          bodyCaptureLimit: 64,
          redactionPatterns: [],
          includePatterns: [],
          excludePatterns: [],
          waitForPendingRequestsOnStop: false,
          autoStopAfterRequests: undefined,
        }),
        getNextRequestId: () => 20,
        getAdmittedRequestCount: () => 0,
        setAdmittedRequestCount: () => undefined,
        enterStopping: vi.fn(),
        getMonotonicMarker: vi
          .fn()
          .mockReturnValueOnce(100)
          .mockReturnValueOnce(125),
        beginPendingWork: () => {
          order.push("begin");
        },
        canEmitPendingOutput: () => true,
        settlePendingWork: () => {
          order.push("settle");
        },
        emit: (event) => {
          order.push("emit");
          emitted.push(event);
        },
      },
    );

    expect(returnedPromise).toBe(nativePromise);
    expect(order).toEqual([
      "begin",
      "emit",
      "begin",
      "emit",
      "settle",
      "begin",
      "emit",
      "settle",
      "native",
    ]);
    expect(emitted).toEqual([
      createRequestStartEvent(20, "POST", "/api/orders"),
      createRequestHeadersDetailEvent(
        20,
        new Headers({ "X-Request": "visible" }),
        [],
      ),
      createRequestBodyDetailEvent(20, "request body", {
        contentType: "text/plain;charset=UTF-8",
        bodyCaptureLimit: 64,
        redactionPatterns: [],
      }),
    ]);

    await vi.waitFor(() => {
      expect(emitted).toEqual([
        createRequestStartEvent(20, "POST", "/api/orders"),
        createRequestHeadersDetailEvent(
          20,
          new Headers({ "X-Request": "visible" }),
          [],
        ),
        createRequestBodyDetailEvent(20, "request body", {
          contentType: "text/plain;charset=UTF-8",
          bodyCaptureLimit: 64,
          redactionPatterns: [],
        }),
        createFetchResponseEvent({
          requestId: 20,
          method: "POST",
          requestedUrl: "/api/orders",
          startMarker: 100,
          completionMarker: 125,
          response,
        }),
        createResponseHeadersDetailEvent(20, response, []),
        createResponseBodyDetailEvent(20, "response body", {
          contentType: "text/plain;charset=UTF-8",
          bodyCaptureLimit: 64,
          redactionPatterns: [],
        }),
      ]);
    });
    expect(response.bodyUsed).toBe(false);
  });
});

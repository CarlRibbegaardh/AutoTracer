import { describe, expect, it, vi } from "vitest";
import { createRequestHeadersDetailEvent } from "../../../src/capture/createRequestHeadersDetailEvent";
import { createXhrRequestBodyDetailEvent } from "../../../src/capture/createXhrRequestBodyDetailEvent";
import { createXhrResponseBodyDetailEvent } from "../../../src/capture/createXhrResponseBodyDetailEvent";
import { createXhrResponseHeadersDetailEvent } from "../../../src/capture/createXhrResponseHeadersDetailEvent";
import { createXhrResponseHeadersSnapshot } from "../../../src/capture/createXhrResponseHeadersSnapshot";
import { defaultNetworkTracerConfig } from "../../../src/configuration/defaultNetworkTracerConfig";
import { createHttpCompletionEvent } from "../../../src/events/createHttpCompletionEvent";
import { createRequestStartEvent } from "../../../src/events/createRequestStartEvent";
import { createIncludedRequestCountStore } from "../../../src/identity/createIncludedRequestCountStore";
import { createRequestIdStore } from "../../../src/identity/createRequestIdStore";
import { createXhrInstanceStateStore } from "../../../src/transport/createXhrInstanceStateStore";
import { createXhrOpenMetadata } from "../../../src/transport/createXhrOpenMetadata";
import { invokeXhrSendRequest } from "../../../src/transport/invokeXhrSendRequest";

describe("invokeXhrSendRequest", () => {
  it("[NET-INSTALL-008][NET-NATIVE-002] delegates directly while tracing is stopped", () => {
    const nativeSend = vi.fn();
    const getOpenMetadata = vi.fn();
    const getNextRequestId = vi.fn();

    invokeXhrSendRequest(
      nativeSend,
      {
        xhr: {
          status: 0,
          responseURL: "",
          response: "",
          getAllResponseHeaders: vi.fn(),
          getResponseHeader: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        },
        args: [],
      },
      {
        isEnabled: () => false,
        baseUrl: "https://example.test/",
        getConfig: vi.fn(),
        getOpenMetadata,
        getRequestHeaders: vi.fn(),
        getNextRequestId,
        getAdmittedRequestCount: vi.fn(),
        setAdmittedRequestCount: vi.fn(),
        enterStopping: vi.fn(),
        getMonotonicMarker: vi.fn(),
        beginPendingWork: vi.fn(),
        canEmitPendingOutput: () => false,
        settlePendingWork: vi.fn(),
        emit: vi.fn(),
        setActiveRequest: vi.fn(),
      },
    );

    expect(nativeSend).toHaveBeenCalledExactlyOnceWith();
    expect(getOpenMetadata).not.toHaveBeenCalled();
    expect(getNextRequestId).not.toHaveBeenCalled();
  });

  it("[NET-ID-001,003,007..008][NET-FILTER-005..009][NET-AUTOSTOP-002..004][NET-XHR-001..002,005] routes hidden and admitted sends from current open metadata", () => {
    const nativeSend = vi.fn();
    const requestIds = createRequestIdStore();
    const admittedRequests = createIncludedRequestCountStore();
    const state = createXhrInstanceStateStore();
    const requestHeaders = new Headers({
      "Content-Type": "application/json",
      "X-Trace": "visible",
    });
    const requestBody = '{"accessToken":"secret","visible":true}';
    const enterStopping = vi.fn();
    const emitted: unknown[] = [];
    const beginPendingWork = vi.fn();
    const settlePendingWork = vi.fn();
    const xhr = {
      status: 0,
      responseURL: "",
      response: "",
      getAllResponseHeaders: vi.fn(),
      getResponseHeader: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    const runtime = {
      isEnabled: () => true,
      baseUrl: "https://example.test/",
      getConfig: () => ({
        ...defaultNetworkTracerConfig,
        includePatterns: ["https://example.test/api/**"],
        excludePatterns: ["https://example.test/private/**"],
        autoStopAfterRequests: 1,
        captureRequestHeaders: true,
        captureRequestBody: true,
        redactionPatterns: ["*token*"],
      }),
      getOpenMetadata: state.getOpenMetadata,
      getRequestHeaders: () => new Headers(requestHeaders),
      getNextRequestId: requestIds.getNextRequestId,
      getAdmittedRequestCount: admittedRequests.getAdmittedRequestCount,
      setAdmittedRequestCount: admittedRequests.setAdmittedRequestCount,
      enterStopping,
      getMonotonicMarker: () => 100,
      beginPendingWork,
      canEmitPendingOutput: () => true,
      settlePendingWork,
      emit: (
        event: Parameters<
          Parameters<typeof invokeXhrSendRequest>[2]["emit"]
        >[0],
      ) => {
        emitted.push(event);
      },
      setActiveRequest: state.setActiveRequest,
    };

    state.setOpenMetadata(
      createXhrOpenMetadata({
        method: "GET",
        requestedUrl: "/private/orders",
      }),
    );
    invokeXhrSendRequest(nativeSend, { xhr, args: [] }, runtime);

    state.setOpenMetadata(
      createXhrOpenMetadata({
        method: "POST",
        requestedUrl: "/api/orders",
      }),
    );
    invokeXhrSendRequest(nativeSend, { xhr, args: [requestBody] }, runtime);

    expect(nativeSend.mock.calls).toEqual([[], [requestBody]]);
    expect(admittedRequests.getAdmittedRequestCount()).toBe(1);
    expect(enterStopping).toHaveBeenCalledOnce();
    expect(beginPendingWork).toHaveBeenCalledTimes(3);
    expect(settlePendingWork).toHaveBeenCalledTimes(2);
    expect(emitted).toEqual([
      createRequestStartEvent(2, "POST", "/api/orders"),
      createRequestHeadersDetailEvent(2, requestHeaders, ["*token*"]),
      createXhrRequestBodyDetailEvent(2, requestBody, {
        contentType: "application/json",
        bodyCaptureLimit: defaultNetworkTracerConfig.bodyCaptureLimit,
        redactionPatterns: ["*token*"],
      }),
    ]);
    expect(state.getActiveRequest()?.requestId).toBe(2);
  });

  it("[NET-CAPTURE-005..008][NET-EVENT-002,009][NET-BODY-004] captures response details after XHR completion", () => {
    const rawResponseHeaders =
      "Content-Type: application/json\r\nX-Session-Token: secret\r\n";
    const emitted: unknown[] = [];
    let observeLoad: (() => void) | undefined;
    const xhr = {
      status: 200,
      responseURL: "https://example.test/api/orders",
      response: '{"accessToken":"secret","visible":true}',
      getAllResponseHeaders: () => rawResponseHeaders,
      getResponseHeader: () => "application/json",
      addEventListener: (eventType: string, listener: () => void) => {
        if (eventType === "load") observeLoad = listener;
      },
      removeEventListener: vi.fn(),
    };

    invokeXhrSendRequest(
      vi.fn(),
      { xhr, args: [] },
      {
        isEnabled: () => true,
        baseUrl: "https://example.test/",
        getConfig: () => ({
          ...defaultNetworkTracerConfig,
          captureResponseHeaders: true,
          captureResponseBody: true,
          redactionPatterns: ["*token*"],
        }),
        getOpenMetadata: () =>
          createXhrOpenMetadata({
            method: "GET",
            requestedUrl: "/api/orders",
          }),
        getRequestHeaders: () => new Headers(),
        getNextRequestId: () => 32,
        getAdmittedRequestCount: () => 0,
        setAdmittedRequestCount: vi.fn(),
        enterStopping: vi.fn(),
        getMonotonicMarker: () => 100,
        beginPendingWork: vi.fn(),
        canEmitPendingOutput: () => true,
        settlePendingWork: vi.fn(),
        emit: (
          event: Parameters<
            Parameters<typeof invokeXhrSendRequest>[2]["emit"]
          >[0],
        ) => {
          emitted.push(event);
        },
        setActiveRequest: vi.fn(),
      },
    );

    expect(observeLoad).toBeTypeOf("function");
    observeLoad?.();
    expect(emitted).toEqual([
      createRequestStartEvent(32, "GET", "/api/orders"),
      createHttpCompletionEvent({
        requestId: 32,
        status: 200,
        method: "GET",
        url: "/api/orders",
        elapsedMilliseconds: 0,
      }),
      createXhrResponseHeadersDetailEvent(
        32,
        createXhrResponseHeadersSnapshot(rawResponseHeaders),
        ["*token*"],
      ),
      createXhrResponseBodyDetailEvent(
        32,
        '{"accessToken":"secret","visible":true}',
        {
          contentType: "application/json",
          bodyCaptureLimit: defaultNetworkTracerConfig.bodyCaptureLimit,
          redactionPatterns: ["*token*"],
        },
      ),
    ]);
  });
});

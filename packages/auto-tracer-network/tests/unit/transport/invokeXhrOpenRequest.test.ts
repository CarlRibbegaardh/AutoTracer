import { describe, expect, it, vi } from "vitest";
import { createXhrInstanceStateStore } from "../../../src/transport/createXhrInstanceStateStore";
import { createXhrRequestHeadersStore } from "../../../src/transport/createXhrRequestHeadersStore";
import { invokeXhrOpenRequest } from "../../../src/transport/invokeXhrOpenRequest";

describe("invokeXhrOpenRequest", () => {
  it("[NET-XHR-002][NET-NATIVE-002,005] records state only after native open succeeds", () => {
    const order: string[] = [];
    const state = createXhrInstanceStateStore();
    const requestHeaders = createXhrRequestHeadersStore();
    requestHeaders.appendRequestHeader("X-Previous", "value");
    const nativeOpen = vi.fn(() => {
      order.push("native");
      expect(state.getOpenMetadata()).toBeUndefined();
      expect(requestHeaders.getRequestHeaders().get("X-Previous")).toBe(
        "value",
      );
    });

    invokeXhrOpenRequest(
      nativeOpen,
      ["post", "/api/orders", false, "developer", "secret"],
      {
        ...state,
        ...requestHeaders,
        getCompletionMarker: vi.fn(),
        emit: vi.fn(),
      },
    );

    expect(nativeOpen).toHaveBeenCalledExactlyOnceWith(
      "post",
      "/api/orders",
      false,
      "developer",
      "secret",
    );
    expect(order).toEqual(["native"]);
    expect(state.getOpenMetadata()).toEqual({
      method: "POST",
      requestedUrl: "/api/orders",
      async: false,
    });
    expect([...requestHeaders.getRequestHeaders()]).toEqual([]);
  });

  it("[NET-XHR-002][NET-NATIVE-002] preserves a URL argument while recording its text", () => {
    const state = createXhrInstanceStateStore();
    const requestHeaders = createXhrRequestHeadersStore();
    const nativeOpen = vi.fn();
    const url = new URL("https://example.test/api/orders");

    invokeXhrOpenRequest(nativeOpen, ["GET", url], {
      ...state,
      ...requestHeaders,
      getCompletionMarker: vi.fn(),
      emit: vi.fn(),
    });

    expect(nativeOpen).toHaveBeenCalledExactlyOnceWith("GET", url);
    expect(state.getOpenMetadata()?.requestedUrl).toBe(url.toString());
  });
});

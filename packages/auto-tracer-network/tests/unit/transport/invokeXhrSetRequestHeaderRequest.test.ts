import { describe, expect, it, vi } from "vitest";
import { createXhrRequestHeadersStore } from "../../../src/transport/createXhrRequestHeadersStore";
import { invokeXhrSetRequestHeaderRequest } from "../../../src/transport/invokeXhrSetRequestHeaderRequest";

describe("invokeXhrSetRequestHeaderRequest", () => {
  it("[NET-CAPTURE-004][NET-NATIVE-002,005] records a script-provided header after native success", () => {
    const headers = createXhrRequestHeadersStore();
    const nativeSetRequestHeader = vi.fn(() => {
      expect([...headers.getRequestHeaders()]).toEqual([]);
    });

    invokeXhrSetRequestHeaderRequest(
      nativeSetRequestHeader,
      ["X-Trace", "visible"],
      headers.appendRequestHeader,
    );

    expect(nativeSetRequestHeader).toHaveBeenCalledExactlyOnceWith(
      "X-Trace",
      "visible",
    );
    expect(Object.fromEntries(headers.getRequestHeaders())).toEqual({
      "x-trace": "visible",
    });
  });
});

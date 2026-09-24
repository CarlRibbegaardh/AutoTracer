import { describe, expect, it } from "vitest";
import { createXhrResponseHeadersSnapshot } from "../../../src/capture/createXhrResponseHeadersSnapshot";

describe("createXhrResponseHeadersSnapshot", () => {
  it("[NET-CAPTURE-005] parses the browser-exposed XHR response-header block", () => {
    const headers = createXhrResponseHeadersSnapshot(
      "Content-Type: application/json\r\n" +
        "X-Link: https://example.test:8443/orders\r\n" +
        "X-Trace: first\r\n" +
        "X-Trace: second\r\n" +
        "Malformed\r\n",
    );

    expect(Object.fromEntries(headers.entries())).toEqual({
      "content-type": "application/json",
      "x-link": "https://example.test:8443/orders",
      "x-trace": "first, second",
    });
  });

  it("[NET-CAPTURE-005] returns an empty snapshot when XHR exposes no headers", () => {
    expect(
      Object.fromEntries(createXhrResponseHeadersSnapshot("").entries()),
    ).toEqual({});
  });
});

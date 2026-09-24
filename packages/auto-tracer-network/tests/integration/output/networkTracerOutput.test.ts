import { afterEach, describe, expect, it, vi } from "vitest";
import { networkTracer } from "../../../src/index";

afterEach(vi.unstubAllGlobals);

describe("NetworkTracer output integration", () => {
  it("[NET-OUTCOME-005..010][NET-CAPTURE-004..005][NET-OUTPUT-001..008] uses the shared live output mode with detached browser-visible details", async () => {
    let outputMode: "devtools" | "copy-paste" = "devtools";
    const firstResponse = new Response("failed", {
      status: 500,
      headers: { "X-Visible": "initial" },
    });
    const failure = Object.assign(new TypeError("connection failed"), {
      stack: "secret stack",
    });
    const nativeFetch = vi
      .fn<() => Promise<Response>>()
      .mockResolvedValueOnce(firstResponse)
      .mockRejectedValueOnce(failure);
    const log = vi.fn();
    const warn = vi.fn();
    const error = vi.fn();
    const requestHeaders = new Headers({
      Authorization: "private",
      "X-Visible": "initial",
    });
    vi.stubGlobal("fetch", nativeFetch);
    vi.stubGlobal("XMLHttpRequest", undefined);
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    vi.stubGlobal("location", { href: "https://example.test/app/" });
    vi.stubGlobal("performance", {
      now: vi
        .fn()
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(125)
        .mockReturnValueOnce(200)
        .mockReturnValueOnce(225),
    });
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
    vi.stubGlobal("console", { log, warn, error });
    vi.stubGlobal("autoTracer", {
      getOutputMode: () => outputMode,
      setOutputMode: (value: "devtools" | "copy-paste") => {
        outputMode = value;
      },
    });
    vi.stubGlobal("__autoTracerNetworkRuntime", undefined);

    const api = networkTracer({
      enabledOnLoad: true,
      captureRequestHeaders: true,
      captureResponseHeaders: true,
    });
    const firstPromise = globalThis.fetch("/api/failure", {
      headers: requestHeaders,
    });
    requestHeaders.set("X-Visible", "mutated");

    await firstPromise;
    const responseHeadersSnapshot = log.mock.calls[3]?.at(-1);
    firstResponse.headers.set("X-Visible", "mutated");

    expect("getOutputMode" in api).toBe(false);
    expect("setOutputMode" in api).toBe(false);
    expect(log.mock.calls[0]?.[0]).toBe(
      "%cNetwork #1%c -> %cGET%c %c/api/failure",
    );
    expect(log.mock.calls[1]?.at(-1)).toEqual({
      authorization: "[REDACTED]",
      "x-visible": "initial",
    });
    expect(log.mock.calls[2]?.[0]).toContain("%c500%c");
    expect(log.mock.calls[2]).toContain("color: #f44747; font-weight: bold");
    expect(responseHeadersSnapshot).toEqual({
      "content-type": "text/plain;charset=UTF-8",
      "x-visible": "initial",
    });

    globalThis.autoTracer?.setOutputMode("copy-paste");

    await expect(globalThis.fetch("/api/rejected")).rejects.toBe(failure);

    expect(log.mock.calls.slice(4)).toEqual([
      ["Network #2 -> GET /api/rejected"],
      ["Network #2   request headers: {}"],
      ["Network #2 <- FAILED GET /api/rejected (25 ms)"],
      [
        'Network #2   failure: {"message":"connection failed","name":"TypeError"}',
      ],
    ]);
    expect(JSON.stringify(log.mock.calls)).not.toContain("secret stack");
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });
});

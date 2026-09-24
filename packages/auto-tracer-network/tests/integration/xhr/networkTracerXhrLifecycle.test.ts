import { afterEach, describe, expect, it, vi } from "vitest";
import { networkTracer } from "../../../src/index";

class NativeXhrFixture extends EventTarget {
  public status = 0;
  public responseURL = "";
  public readonly openCalls: unknown[][] = [];
  public readonly sendCalls: unknown[][] = [];
  public readonly headerCalls: unknown[][] = [];
  public readonly abort = vi.fn();

  public open(...args: unknown[]): void {
    this.openCalls.push(args);
  }

  public send(...args: unknown[]): void {
    this.sendCalls.push(args);
  }

  public setRequestHeader(...args: unknown[]): void {
    this.headerCalls.push(args);
  }

  public get response(): never {
    throw new TypeError("response access failed");
  }

  public getResponseHeader(): null {
    return null;
  }
}

const nativeOpen = NativeXhrFixture.prototype.open;
const nativeSend = NativeXhrFixture.prototype.send;
const nativeSetRequestHeader = NativeXhrFixture.prototype.setRequestHeader;

afterEach(() => {
  vi.unstubAllGlobals();
  NativeXhrFixture.prototype.open = nativeOpen;
  NativeXhrFixture.prototype.send = nativeSend;
  NativeXhrFixture.prototype.setRequestHeader = nativeSetRequestHeader;
});

describe("NetworkTracer XHR lifecycle", () => {
  it("[NET-SCOPE-002][NET-NATIVE-002..006] preserves native XHR behavior across terminal races, reuse, and stop", () => {
    const log = vi.fn();
    const now = vi
      .fn()
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(125)
      .mockReturnValueOnce(200);
    vi.stubGlobal("fetch", undefined);
    vi.stubGlobal("XMLHttpRequest", NativeXhrFixture);
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
    const xhr = new NativeXhrFixture();
    const nativeLoadListener = vi.fn();
    xhr.addEventListener("load", nativeLoadListener);

    xhr.open("POST", "/api/orders?view=full");
    xhr.setRequestHeader("X-Request-Source", "checkout");
    xhr.send("original body");

    expect(xhr.openCalls).toEqual([["POST", "/api/orders?view=full"]]);
    expect(xhr.headerCalls).toEqual([["X-Request-Source", "checkout"]]);
    expect(xhr.sendCalls).toEqual([["original body"]]);

    xhr.status = 201;
    xhr.responseURL = "https://example.test/api/orders?view=full";
    xhr.dispatchEvent(new Event("load"));
    xhr.dispatchEvent(new Event("error"));

    expect(nativeLoadListener).toHaveBeenCalledOnce();
    expect(log.mock.calls).toEqual([
      ["Network #1 -> POST /api/orders?view=full"],
      ["Network #1 <- 201 POST /api/orders?view=full (25 ms)"],
    ]);

    xhr.open("GET", "/api/reused");
    xhr.send();
    api.stop();
    log.mockClear();
    xhr.status = 200;
    xhr.responseURL = "https://example.test/api/reused";
    xhr.dispatchEvent(new Event("load"));

    expect(xhr.openCalls).toEqual([
      ["POST", "/api/orders?view=full"],
      ["GET", "/api/reused"],
    ]);
    expect(xhr.sendCalls).toEqual([["original body"], []]);
    expect(nativeLoadListener).toHaveBeenCalledTimes(2);
    expect(xhr.abort).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });

  it("[NET-NATIVE-003..005] isolates response capture failure from native XHR completion", () => {
    const log = vi.fn();
    const now = vi.fn().mockReturnValueOnce(100).mockReturnValueOnce(125);
    vi.stubGlobal("fetch", undefined);
    vi.stubGlobal("XMLHttpRequest", NativeXhrFixture);
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
      captureResponseBody: true,
    });
    const xhr = new NativeXhrFixture();
    const nativeLoadListener = vi.fn();
    xhr.addEventListener("load", nativeLoadListener);

    xhr.open("PUT", "/api/profile");
    xhr.send("unchanged body");
    xhr.status = 204;
    xhr.responseURL = "https://example.test/api/profile";

    expect(() => {
      return xhr.dispatchEvent(new Event("load"));
    }).not.toThrow();
    expect(nativeLoadListener).toHaveBeenCalledOnce();
    expect(xhr.openCalls).toEqual([["PUT", "/api/profile"]]);
    expect(xhr.sendCalls).toEqual([["unchanged body"]]);
    expect(xhr.abort).not.toHaveBeenCalled();
    expect(api.getPendingRequestCount()).toBe(0);
    expect(log.mock.calls).toEqual([
      ["Network #1 -> PUT /api/profile"],
      ["Network #1 <- 204 PUT /api/profile (25 ms)"],
      ["Network #1   response body UNAVAILABLE"],
    ]);
  });

  it("[NET-EVENT-001..007][NET-XHR-001..005] replaces an active request before tracing independent reuse", () => {
    const log = vi.fn();
    const now = vi
      .fn()
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(140)
      .mockReturnValueOnce(200)
      .mockReturnValueOnce(260);
    vi.stubGlobal("fetch", undefined);
    vi.stubGlobal("XMLHttpRequest", NativeXhrFixture);
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
    const xhr = new NativeXhrFixture();
    const nativeLoadListener = vi.fn();
    xhr.addEventListener("load", nativeLoadListener);

    xhr.open("GET", "/api/first");
    xhr.send();
    xhr.open("post", "/api/second", false);
    xhr.dispatchEvent(new Event("load"));
    xhr.send("second body");
    xhr.status = 200;
    xhr.responseURL = "https://example.test/api/second";
    xhr.dispatchEvent(new Event("load"));
    xhr.dispatchEvent(new Event("timeout"));

    expect(nativeLoadListener).toHaveBeenCalledTimes(2);
    expect(xhr.openCalls).toEqual([
      ["GET", "/api/first"],
      ["post", "/api/second", false, undefined, undefined],
    ]);
    expect(xhr.sendCalls).toEqual([[], ["second body"]]);
    expect(log.mock.calls).toEqual([
      ["Network #1 -> GET /api/first"],
      ["Network #1 <- ABORTED GET /api/first (40 ms)"],
      ["Network #2 -> POST /api/second"],
      ["Network #2 <- 200 POST /api/second (60 ms)"],
    ]);
  });

  it("[NET-OUTCOME-001..004] distinguishes native XHR failure, abort, and timeout", () => {
    const log = vi.fn();
    const now = vi
      .fn()
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(110)
      .mockReturnValueOnce(200)
      .mockReturnValueOnce(220)
      .mockReturnValueOnce(300)
      .mockReturnValueOnce(330);
    vi.stubGlobal("fetch", undefined);
    vi.stubGlobal("XMLHttpRequest", NativeXhrFixture);
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

    const failedXhr = new NativeXhrFixture();
    failedXhr.open("GET", "/api/failed");
    failedXhr.send();
    failedXhr.dispatchEvent(new Event("error"));

    const abortedXhr = new NativeXhrFixture();
    abortedXhr.open("DELETE", "/api/aborted");
    abortedXhr.send();
    abortedXhr.dispatchEvent(new Event("abort"));

    const timedOutXhr = new NativeXhrFixture();
    timedOutXhr.open("HEAD", "/api/timed-out");
    timedOutXhr.send();
    timedOutXhr.dispatchEvent(new Event("timeout"));

    expect(log.mock.calls).toEqual([
      ["Network #1 -> GET /api/failed"],
      ["Network #1 <- FAILED GET /api/failed (10 ms)"],
      ["Network #2 -> DELETE /api/aborted"],
      ["Network #2 <- ABORTED DELETE /api/aborted (20 ms)"],
      ["Network #3 -> HEAD /api/timed-out"],
      ["Network #3 <- TIMED OUT HEAD /api/timed-out (30 ms)"],
    ]);
  });
});

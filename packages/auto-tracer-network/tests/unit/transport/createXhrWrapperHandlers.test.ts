import { describe, expect, it, vi } from "vitest";
import { defaultNetworkTracerConfig } from "../../../src/configuration/defaultNetworkTracerConfig";
import { createXhrInstanceStoreRegistry } from "../../../src/transport/createXhrInstanceStoreRegistry";
import { createXhrWrapperHandlers } from "../../../src/transport/createXhrWrapperHandlers";

describe("createXhrWrapperHandlers", () => {
  it("[NET-XHR-001..003][NET-CAPTURE-004][NET-NATIVE-002] binds native methods and shares per-instance state", () => {
    const registry = createXhrInstanceStoreRegistry();
    const runtime = {
      isEnabled: () => false,
      baseUrl: "https://example.test/",
      getConfig: () => defaultNetworkTracerConfig,
      getNextRequestId: vi.fn(),
      getAdmittedRequestCount: vi.fn(),
      setAdmittedRequestCount: vi.fn(),
      enterStopping: vi.fn(),
      getMonotonicMarker: vi.fn(),
      beginPendingWork: vi.fn(),
      canEmitPendingOutput: () => false,
      settlePendingWork: vi.fn(),
      emit: vi.fn(),
    };
    const handlers = createXhrWrapperHandlers(registry, runtime);
    const nativeOpen = vi.fn();
    const nativeSend = vi.fn();
    const nativeSetRequestHeader = vi.fn();
    const xhr = Object.create(null);

    handlers.invokeOpen(nativeOpen, xhr, ["POST", "/items"]);
    handlers.invokeSetRequestHeader(nativeSetRequestHeader, xhr, [
      "X-Test",
      "one",
    ]);
    handlers.invokeSend(nativeSend, xhr, []);

    expect(nativeOpen.mock.instances[0]).toBe(xhr);
    expect(nativeSend.mock.instances[0]).toBe(xhr);
    expect(nativeSetRequestHeader.mock.instances[0]).toBe(xhr);
    expect(nativeOpen).toHaveBeenCalledExactlyOnceWith("POST", "/items");
    expect(nativeSend).toHaveBeenCalledExactlyOnceWith();
    expect(nativeSetRequestHeader).toHaveBeenCalledExactlyOnceWith(
      "X-Test",
      "one",
    );
    expect(registry.getInstanceStore(xhr).getOpenMetadata()).toEqual({
      method: "POST",
      requestedUrl: "/items",
      async: true,
    });
    expect(
      Object.fromEntries(registry.getInstanceStore(xhr).getRequestHeaders()),
    ).toEqual({ "x-test": "one" });
  });
});

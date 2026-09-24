import { describe, expect, it, vi } from "vitest";
import { createFetchWrapperHandler } from "../../../src/transport/createFetchWrapperHandler";
import { defaultNetworkTracerConfig } from "../../../src/configuration/defaultNetworkTracerConfig";

describe("createFetchWrapperHandler", () => {
  it("[NET-INSTALL-008,010][NET-NATIVE-001] adapts installed Fetch calls to the request command", () => {
    const nativePromise = Promise.resolve(new Response());
    const nativeFetch = vi.fn(() => nativePromise);
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
    const handler = createFetchWrapperHandler(runtime);
    const init = { method: "POST" };

    const returnedPromise = handler(
      nativeFetch,
      "https://example.test/items",
      init,
    );

    expect(returnedPromise).toBe(nativePromise);
    expect(nativeFetch).toHaveBeenCalledExactlyOnceWith(
      "https://example.test/items",
      init,
    );
  });
});

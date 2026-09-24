import { describe, expect, it } from "vitest";
import { createXhrOpenMetadata } from "../../../src/transport/createXhrOpenMetadata";
import { createXhrInstanceStoreRegistry } from "../../../src/transport/createXhrInstanceStoreRegistry";

describe("createXhrInstanceStoreRegistry", () => {
  it("[NET-XHR-001..003] retains one independent tracing store per XHR instance", () => {
    const registry = createXhrInstanceStoreRegistry();
    const firstXhr = Object.create(null);
    const secondXhr = Object.create(null);
    const firstStore = registry.getInstanceStore(firstXhr);
    const repeatedFirstStore = registry.getInstanceStore(firstXhr);
    const secondStore = registry.getInstanceStore(secondXhr);

    firstStore.setOpenMetadata(
      createXhrOpenMetadata({ method: "POST", requestedUrl: "/first" }),
    );
    firstStore.appendRequestHeader("X-Test", "first");

    expect(repeatedFirstStore).toBe(firstStore);
    expect(secondStore).not.toBe(firstStore);
    expect(secondStore.getOpenMetadata()).toBeUndefined();
    expect([...secondStore.getRequestHeaders()]).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import { createIncludedRequestCountStore } from "../../../src/identity/createIncludedRequestCountStore";

describe("createIncludedRequestCountStore", () => {
  it("[NET-ID-007][NET-AUTOSTOP-002] stores and resets the session admission count", () => {
    const store = createIncludedRequestCountStore();

    expect(store.getAdmittedRequestCount()).toBe(0);

    store.setAdmittedRequestCount(2);
    expect(store.getAdmittedRequestCount()).toBe(2);

    store.resetAdmittedRequestCount();
    expect(store.getAdmittedRequestCount()).toBe(0);
  });
});

import { describe, expect, it } from "vitest";
import { createXhrRequestHeadersStore } from "../../../src/transport/createXhrRequestHeadersStore";

describe("createXhrRequestHeadersStore", () => {
  it("[NET-CAPTURE-004] combines repeated script-provided request headers", () => {
    const store = createXhrRequestHeadersStore();

    store.appendRequestHeader("X-Trace", "first");
    store.appendRequestHeader("x-trace", "second");

    expect(Object.fromEntries(store.getRequestHeaders())).toEqual({
      "x-trace": "first, second",
    });
  });

  it("[NET-CAPTURE-004][NET-OUTPUT-005] returns detached snapshots and clears for a later open", () => {
    const store = createXhrRequestHeadersStore();
    store.appendRequestHeader("X-Trace", "first");

    const snapshot = store.getRequestHeaders();
    snapshot.set("X-Trace", "mutated");
    store.clearRequestHeaders();

    expect(snapshot.get("X-Trace")).toBe("mutated");
    expect([...store.getRequestHeaders()]).toEqual([]);
  });
});

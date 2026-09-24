import { describe, expect, it } from "vitest";
import { createAutomaticTracingStoppedEvent } from "../../../src/events/createAutomaticTracingStoppedEvent";
import { createTracingStoppedEvent } from "../../../src/events/createTracingStoppedEvent";
import { createNetworkTracingDrainStore } from "../../../src/state/createNetworkTracingDrainStore";

describe("createNetworkTracingDrainStore", () => {
  it("[NET-STOP-006][NET-AUTOSTOP-006..007] stores and replaces the selected final drain event", () => {
    const store = createNetworkTracingDrainStore();
    const manualEvent = createTracingStoppedEvent();
    const automaticEvent = createAutomaticTracingStoppedEvent(12);

    expect(store.getFinalEvent()).toBeUndefined();

    store.setFinalEvent(manualEvent);
    expect(store.getFinalEvent()).toBe(manualEvent);

    store.setFinalEvent(automaticEvent);
    expect(store.getFinalEvent()).toBe(automaticEvent);

    store.clearFinalEvent();
    expect(store.getFinalEvent()).toBeUndefined();
  });
});

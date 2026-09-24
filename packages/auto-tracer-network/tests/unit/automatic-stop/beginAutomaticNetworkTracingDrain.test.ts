import { describe, expect, it } from "vitest";
import { beginAutomaticNetworkTracingDrain } from "../../../src/automatic-stop/beginAutomaticNetworkTracingDrain";
import { createAutomaticTracingStoppedEvent } from "../../../src/events/createAutomaticTracingStoppedEvent";
import { createNetworkTracerStateStore } from "../../../src/state/createNetworkTracerStateStore";
import { createNetworkTracingDrainStore } from "../../../src/state/createNetworkTracingDrainStore";

describe("beginAutomaticNetworkTracingDrain", () => {
  it("[NET-AUTOSTOP-004..007] selects the limit marker before entering stopping", () => {
    const stateStore = createNetworkTracerStateStore(true);
    const drainStore = createNetworkTracingDrainStore();

    beginAutomaticNetworkTracingDrain(7, stateStore, drainStore);

    expect(stateStore.getState()).toBe("stopping");
    expect(drainStore.getFinalEvent()).toEqual(
      createAutomaticTracingStoppedEvent(7),
    );
  });
});

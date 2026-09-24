import { describe, expect, it, vi } from "vitest";
import { finalizeNetworkTracingDrain } from "../../../src/api/finalizeNetworkTracingDrain";
import { createNetworkTracerStateStore } from "../../../src/state/createNetworkTracerStateStore";

describe("finalizeNetworkTracingDrain", () => {
  it("[NET-STOP-006][NET-AUTOSTOP-006] emits the selected final marker only after pending work settles", () => {
    const stateStore = createNetworkTracerStateStore(true);
    const emitFinalMarker = vi.fn();
    stateStore.beginPendingWork();
    stateStore.enterStopping();

    finalizeNetworkTracingDrain(stateStore, emitFinalMarker);

    expect(stateStore.getState()).toBe("stopping");
    expect(emitFinalMarker).not.toHaveBeenCalled();

    stateStore.settlePendingWork();
    finalizeNetworkTracingDrain(stateStore, emitFinalMarker);

    expect(stateStore.getState()).toBe("stopped");
    expect(emitFinalMarker).toHaveBeenCalledOnce();

    finalizeNetworkTracingDrain(stateStore, emitFinalMarker);

    expect(emitFinalMarker).toHaveBeenCalledOnce();
  });

  it("[NET-STOP-010] does not emit a final marker outside a drain", () => {
    const stateStore = createNetworkTracerStateStore(true);
    const emitFinalMarker = vi.fn();

    finalizeNetworkTracingDrain(stateStore, emitFinalMarker);
    stateStore.enterStopped();
    finalizeNetworkTracingDrain(stateStore, emitFinalMarker);

    expect(emitFinalMarker).not.toHaveBeenCalled();
  });
});

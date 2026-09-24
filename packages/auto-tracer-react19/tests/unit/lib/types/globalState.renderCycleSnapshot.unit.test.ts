import { beforeEach, describe, expect, it, vi } from "vitest";

describe("globalState - render cycle snapshot", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("getRenderCyclesDelta returns 0 immediately after snapshotRenderCycleStart on a fresh counter", async () => {
    const {
      getRenderCyclesDelta,
      resetRenderCycleCounter,
      snapshotRenderCycleStart,
    } = await import("@src/lib/types/globalState.js");

    resetRenderCycleCounter();
    snapshotRenderCycleStart();

    expect(getRenderCyclesDelta()).toBe(0);
  });

  it("getRenderCyclesDelta counts renders since snapshot, not total renders", async () => {
    const {
      getRenderCyclesDelta,
      resetRenderCycleCounter,
      snapshotRenderCycleStart,
      incrementRenderCycle,
    } = await import("@src/lib/types/globalState.js");

    resetRenderCycleCounter();
    incrementRenderCycle(); // total = 1
    incrementRenderCycle(); // total = 2
    incrementRenderCycle(); // total = 3
    snapshotRenderCycleStart(); // snapshot at 3
    incrementRenderCycle(); // total = 4
    incrementRenderCycle(); // total = 5

    expect(getRenderCyclesDelta()).toBe(2); // delta = 5 - 3 = 2
  });

  it("delta resets to 0 after re-snapshotting", async () => {
    const {
      getRenderCyclesDelta,
      resetRenderCycleCounter,
      snapshotRenderCycleStart,
      incrementRenderCycle,
    } = await import("@src/lib/types/globalState.js");

    resetRenderCycleCounter();
    incrementRenderCycle(); // total = 1
    snapshotRenderCycleStart(); // snapshot at 1
    incrementRenderCycle(); // total = 2

    expect(getRenderCyclesDelta()).toBe(1);

    snapshotRenderCycleStart(); // re-snapshot at 2

    expect(getRenderCyclesDelta()).toBe(0);
  });

  it("resetRenderCycleCounter also resets the snapshot to 0", async () => {
    const {
      getRenderCyclesDelta,
      resetRenderCycleCounter,
      snapshotRenderCycleStart,
      incrementRenderCycle,
    } = await import("@src/lib/types/globalState.js");

    resetRenderCycleCounter();
    incrementRenderCycle(); // total = 1
    incrementRenderCycle(); // total = 2
    snapshotRenderCycleStart(); // snapshot at 2
    resetRenderCycleCounter(); // resets everything to 0

    expect(getRenderCyclesDelta()).toBe(0); // total=0, snapshot=0, delta=0
  });

  it("getTotalRenderCount remains monotonic and is unaffected by snapshotRenderCycleStart", async () => {
    const {
      getTotalRenderCount,
      resetRenderCycleCounter,
      snapshotRenderCycleStart,
      incrementRenderCycle,
    } = await import("@src/lib/types/globalState.js");

    resetRenderCycleCounter();
    incrementRenderCycle(); // total = 1
    incrementRenderCycle(); // total = 2
    snapshotRenderCycleStart(); // snapshot at 2 — must NOT affect total
    incrementRenderCycle(); // total = 3

    expect(getTotalRenderCount()).toBe(3);
  });
});

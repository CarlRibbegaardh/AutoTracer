import { describe, expect, it, vi } from "vitest";
import { settlePendingDetailTask } from "../../../src/capture/settlePendingDetailTask";

describe("settlePendingDetailTask", () => {
  it("[NET-BODY-015] settles pending work after body-read resolution", async () => {
    const settle = vi.fn();

    await expect(
      settlePendingDetailTask(Promise.resolve("body"), settle),
    ).resolves.toBe("body");
    expect(settle).toHaveBeenCalledOnce();
  });

  it("[NET-BODY-015] settles pending work after body-read rejection", async () => {
    const settle = vi.fn();
    const failure = new Error("read failed");

    await expect(
      settlePendingDetailTask(Promise.reject(failure), settle),
    ).rejects.toBe(failure);
    expect(settle).toHaveBeenCalledOnce();
  });
});

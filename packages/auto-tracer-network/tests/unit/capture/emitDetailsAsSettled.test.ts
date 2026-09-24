import { describe, expect, it } from "vitest";
import { emitDetailsAsSettled } from "../../../src/capture/emitDetailsAsSettled";

describe("emitDetailsAsSettled", () => {
  it("[NET-EVENT-013] emits concurrent details in settlement order", async () => {
    const emitted: string[] = [];
    const delayed = new Promise<string>((resolve) => {
      queueMicrotask(() => resolve("delayed"));
    });

    await emitDetailsAsSettled(
      [delayed, Promise.resolve("immediate")],
      (detail) => emitted.push(detail),
    );

    expect(emitted).toEqual(["immediate", "delayed"]);
  });
});

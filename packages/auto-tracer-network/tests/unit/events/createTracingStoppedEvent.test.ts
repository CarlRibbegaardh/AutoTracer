import { describe, expect, it } from "vitest";
import { createTracingStoppedEvent } from "../../../src/events/createTracingStoppedEvent";

describe("createTracingStoppedEvent", () => {
  it("[NET-STATE-009][NET-STATE-012] creates the normal lifecycle stopped marker", () => {
    expect(createTracingStoppedEvent()).toEqual({
      kind: "tracing-stopped",
      tokens: [{ role: "runtime-control", text: "Network tracing stopped" }],
    });
  });
});

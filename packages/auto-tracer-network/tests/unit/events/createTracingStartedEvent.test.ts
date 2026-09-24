import { describe, expect, it } from "vitest";
import { createTracingStartedEvent } from "../../../src/events/createTracingStartedEvent";

describe("createTracingStartedEvent", () => {
  it("[NET-STATE-006][NET-STATE-012] creates the normal lifecycle start marker", () => {
    expect(createTracingStartedEvent()).toEqual({
      kind: "tracing-started",
      tokens: [{ role: "runtime-control", text: "Network tracing started" }],
    });
  });
});

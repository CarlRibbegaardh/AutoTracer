import { describe, expect, it } from "vitest";
import { createAutomaticTracingStoppedEvent } from "../../../src/events/createAutomaticTracingStoppedEvent";

describe("createAutomaticTracingStoppedEvent", () => {
  it("[NET-AUTOSTOP-007][NET-STATE-012] identifies the triggering request limit", () => {
    expect(createAutomaticTracingStoppedEvent(25)).toEqual({
      kind: "automatic-tracing-stopped",
      tokens: [
        {
          role: "runtime-control",
          text: "Network tracing stopped automatically (limit: 25 requests)",
        },
      ],
    });
  });
});

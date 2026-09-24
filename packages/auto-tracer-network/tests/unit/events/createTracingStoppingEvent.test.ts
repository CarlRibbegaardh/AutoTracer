import { describe, expect, it } from "vitest";
import { createTracingStoppingEvent } from "../../../src/events/createTracingStoppingEvent";

describe("createTracingStoppingEvent", () => {
  it("[NET-STATE-008][NET-STATE-012] creates the normal draining marker with its pending count", () => {
    expect(createTracingStoppingEvent(3)).toEqual({
      kind: "tracing-stopping",
      tokens: [
        {
          role: "runtime-control",
          text: "Network tracing stopping (3 requests pending)",
        },
      ],
    });
  });
});

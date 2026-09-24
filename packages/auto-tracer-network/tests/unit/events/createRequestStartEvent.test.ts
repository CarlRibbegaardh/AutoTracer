import { describe, expect, it } from "vitest";
import { createRequestStartEvent } from "../../../src/events/createRequestStartEvent";

describe("createRequestStartEvent", () => {
  it("[NET-EVENT-001][NET-ID-002][NET-OUTPUT-008] creates semantic start tokens", () => {
    expect(createRequestStartEvent(12, "POST", "/api/orders")).toEqual({
      kind: "start",
      tokens: [
        { role: "identity", text: "Network #12" },
        { role: "direction", text: " -> " },
        { role: "method", text: "POST" },
        { role: "plain", text: " " },
        { role: "url", text: "/api/orders" },
      ],
    });
  });
});

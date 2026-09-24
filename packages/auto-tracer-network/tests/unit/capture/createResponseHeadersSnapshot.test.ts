import { describe, expect, it } from "vitest";
import { createResponseHeadersSnapshot } from "../../../src/capture/createResponseHeadersSnapshot";

describe("createResponseHeadersSnapshot", () => {
  it("[NET-CAPTURE-005][NET-OUTPUT-005] creates a detached snapshot of browser-visible headers", () => {
    const response = new Response(null, {
      headers: {
        "Content-Type": "application/json",
        "X-Visible": "initial",
      },
    });

    const snapshot = createResponseHeadersSnapshot(response);
    response.headers.set("X-Visible", "changed");

    expect(Array.from(snapshot.entries())).toEqual([
      ["content-type", "application/json"],
      ["x-visible", "initial"],
    ]);
  });
});

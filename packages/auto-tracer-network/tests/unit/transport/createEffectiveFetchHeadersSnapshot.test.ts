import { describe, expect, it } from "vitest";
import { createEffectiveFetchHeadersSnapshot } from "../../../src/transport/createEffectiveFetchHeadersSnapshot";

describe("createEffectiveFetchHeadersSnapshot", () => {
  it("[NET-CAPTURE-004] gives explicit init headers precedence over Request headers", () => {
    const request = new Request("https://example.test/api", {
      headers: { "X-Source": "request" },
    });

    const headers = createEffectiveFetchHeadersSnapshot(request, {
      headers: { "X-Source": "init" },
    });

    expect(Array.from(headers.entries())).toEqual([["x-source", "init"]]);
  });

  it("[NET-CAPTURE-004][NET-OUTPUT-005] returns a detached snapshot", () => {
    const initHeaders = new Headers({ "X-Source": "initial" });
    const headers = createEffectiveFetchHeadersSnapshot("/api", {
      headers: initHeaders,
    });

    initHeaders.set("X-Source", "changed");

    expect(headers.get("X-Source")).toBe("initial");
  });

  it("[NET-CAPTURE-004] returns an empty snapshot when neither input supplies headers", () => {
    expect(
      Array.from(createEffectiveFetchHeadersSnapshot("/api").entries()),
    ).toEqual([]);
  });
});

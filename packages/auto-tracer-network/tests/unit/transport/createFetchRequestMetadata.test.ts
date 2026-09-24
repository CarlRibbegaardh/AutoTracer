import { describe, expect, it } from "vitest";
import { createFetchRequestMetadata } from "../../../src/transport/createFetchRequestMetadata";

describe("createFetchRequestMetadata", () => {
  it("[NET-EVENT-001][NET-URL-004][NET-CAPTURE-004] composes effective RequestInit metadata", () => {
    const request = new Request("https://example.test/request", {
      method: "post",
      headers: { "Content-Type": "text/plain" },
    });

    const metadata = createFetchRequestMetadata(request, {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        "X-Source": "init",
      },
    });

    expect(metadata.method).toBe("PUT");
    expect(metadata.requestedUrl).toBe("https://example.test/request");
    expect(Array.from(metadata.headers.entries())).toEqual([
      ["content-type", "application/json"],
      ["x-source", "init"],
    ]);
    expect(metadata.contentType).toBe("application/json");
  });

  it("[NET-EVENT-001][NET-CAPTURE-004] composes defaults for string input", () => {
    const metadata = createFetchRequestMetadata("/api/orders");

    expect(metadata.method).toBe("GET");
    expect(metadata.requestedUrl).toBe("/api/orders");
    expect(Array.from(metadata.headers.entries())).toEqual([]);
    expect(metadata.contentType).toBeNull();
  });

  it("[NET-CAPTURE-004][NET-OUTPUT-005] retains detached effective headers", () => {
    const headers = new Headers({ "X-State": "initial" });
    const metadata = createFetchRequestMetadata("/api/orders", { headers });

    headers.set("X-State", "changed");

    expect(metadata.headers.get("X-State")).toBe("initial");
  });
});

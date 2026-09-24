import { describe, expect, it } from "vitest";
import { createXhrOpenMetadata } from "../../../src/transport/createXhrOpenMetadata";

describe("createXhrOpenMetadata", () => {
  it("[NET-XHR-002] normalizes standard methods and defaults omitted async to true", () => {
    expect(
      createXhrOpenMetadata({
        method: "post",
        requestedUrl: "/api/orders",
      }),
    ).toEqual({
      method: "POST",
      requestedUrl: "/api/orders",
      async: true,
    });
  });

  it("[NET-XHR-002] preserves extension-method casing and explicit synchronous mode", () => {
    expect(
      createXhrOpenMetadata({
        method: "m-search",
        requestedUrl: "/api/search",
        async: false,
      }),
    ).toEqual({
      method: "m-search",
      requestedUrl: "/api/search",
      async: false,
    });
  });

  it("[NET-XHR-002] excludes credentials from captured metadata", () => {
    expect(
      createXhrOpenMetadata({
        method: "GET",
        requestedUrl: "/api/private",
        username: "developer",
        password: "secret",
      }),
    ).toEqual({
      method: "GET",
      requestedUrl: "/api/private",
      async: true,
    });
  });
});

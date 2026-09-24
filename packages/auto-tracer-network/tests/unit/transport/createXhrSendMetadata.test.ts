import { describe, expect, it } from "vitest";
import { createXhrOpenMetadata } from "../../../src/transport/createXhrOpenMetadata";
import { createXhrSendMetadata } from "../../../src/transport/createXhrSendMetadata";

describe("createXhrSendMetadata", () => {
  it("[NET-XHR-002] creates a detached snapshot of the latest open metadata", () => {
    const openMetadata = createXhrOpenMetadata({
      method: "post",
      requestedUrl: "/api/orders",
      async: false,
    });

    const sendMetadata = createXhrSendMetadata(openMetadata);

    expect(sendMetadata).toEqual({
      method: "POST",
      requestedUrl: "/api/orders",
      async: false,
    });
    expect(sendMetadata).not.toBe(openMetadata);
  });

  it("[NET-XHR-002] keeps an admitted send independent from later open metadata", () => {
    const admittedMetadata = createXhrSendMetadata(
      createXhrOpenMetadata({
        method: "GET",
        requestedUrl: "/api/first",
      }),
    );

    createXhrSendMetadata(
      createXhrOpenMetadata({
        method: "DELETE",
        requestedUrl: "/api/second",
        async: false,
      }),
    );

    expect(admittedMetadata).toEqual({
      method: "GET",
      requestedUrl: "/api/first",
      async: true,
    });
  });
});

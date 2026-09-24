import { describe, expect, it } from "vitest";
import { createUnavailableDetailEvent } from "../../../src/events/createUnavailableDetailEvent";
import { createRequestBodyCaptureTask } from "../../../src/capture/createRequestBodyCaptureTask";

describe("createRequestBodyCaptureTask", () => {
  it("[NET-CAPTURE-010..011][NET-BODY-003..004] reads only a cloned Request body", async () => {
    const request = new Request("https://example.test/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"token":"secret","visible":true}',
    });

    await expect(
      createRequestBodyCaptureTask(12, request, {
        bodyCaptureLimit: 64,
        redactionPatterns: ["token"],
      }),
    ).resolves.toMatchObject({
      kind: "structured-detail",
      value: {
        status: "parsed",
        value: { token: "[REDACTED]", visible: true },
      },
    });
    expect(request.bodyUsed).toBe(false);
  });

  it("[NET-CAPTURE-012] resolves request body UNAVAILABLE when cloning fails", async () => {
    const request = new Request("https://example.test/orders", {
      method: "POST",
      body: "request body",
    });
    request.clone = () => {
      throw new TypeError("cannot clone");
    };

    await expect(
      createRequestBodyCaptureTask(13, request, {
        bodyCaptureLimit: 64,
        redactionPatterns: [],
      }),
    ).resolves.toEqual(createUnavailableDetailEvent(13, "request body"));
    expect(request.bodyUsed).toBe(false);
  });

  it("[NET-CAPTURE-012] resolves request body UNAVAILABLE when clone reading rejects", async () => {
    const request = new Request("https://example.test/orders", {
      method: "POST",
      body: "request body",
    });
    const clone = request.clone();
    clone.text = () => Promise.reject(new TypeError("cannot read"));
    request.clone = () => clone;

    await expect(
      createRequestBodyCaptureTask(14, request, {
        bodyCaptureLimit: 64,
        redactionPatterns: [],
      }),
    ).resolves.toEqual(createUnavailableDetailEvent(14, "request body"));
    expect(request.bodyUsed).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { createUnavailableDetailEvent } from "../../../src/events/createUnavailableDetailEvent";
import { createResponseBodyCaptureTask } from "../../../src/capture/createResponseBodyCaptureTask";

describe("createResponseBodyCaptureTask", () => {
  it("[NET-BODY-003..005] reads only a cloned Response body", async () => {
    const response = new Response("response text", {
      headers: { "Content-Type": "text/plain" },
    });

    await expect(
      createResponseBodyCaptureTask(15, response, {
        bodyCaptureLimit: 64,
        redactionPatterns: [],
      }),
    ).resolves.toMatchObject({
      kind: "structured-detail",
      value: {
        status: "captured",
        text: "response text",
        truncated: false,
      },
    });
    expect(response.bodyUsed).toBe(false);
  });

  it("[NET-CAPTURE-012][NET-BODY-016] resolves response body UNAVAILABLE when cloning fails", async () => {
    const response = new Response("response body");
    response.clone = () => {
      throw new TypeError("cannot clone");
    };

    await expect(
      createResponseBodyCaptureTask(16, response, {
        bodyCaptureLimit: 64,
        redactionPatterns: [],
      }),
    ).resolves.toEqual(createUnavailableDetailEvent(16, "response body"));
    expect(response.bodyUsed).toBe(false);
  });

  it("[NET-BODY-015..016] resolves response body UNAVAILABLE when clone reading rejects", async () => {
    const response = new Response("response body");
    const clone = response.clone();
    clone.text = () => Promise.reject(new TypeError("cannot read"));
    response.clone = () => clone;

    await expect(
      createResponseBodyCaptureTask(17, response, {
        bodyCaptureLimit: 64,
        redactionPatterns: [],
      }),
    ).resolves.toEqual(createUnavailableDetailEvent(17, "response body"));
    expect(response.bodyUsed).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { createXhrResponseBodyCaptureTask } from "../../../src/capture/createXhrResponseBodyCaptureTask";
import { createXhrResponseBodyDetailEvent } from "../../../src/capture/createXhrResponseBodyDetailEvent";
import { createUnavailableDetailEvent } from "../../../src/events/createUnavailableDetailEvent";

describe("createXhrResponseBodyCaptureTask", () => {
  it("[NET-BODY-004..005] reads the browser-visible XHR response and content type", () => {
    expect(
      createXhrResponseBodyCaptureTask(
        37,
        {
          response: "response text",
          getResponseHeader: () => "text/plain",
        },
        { bodyCaptureLimit: 64, redactionPatterns: [] },
      ),
    ).toEqual(
      createXhrResponseBodyDetailEvent(37, "response text", {
        contentType: "text/plain",
        bodyCaptureLimit: 64,
        redactionPatterns: [],
      }),
    );
  });

  it("[NET-CAPTURE-012][NET-BODY-016] returns unavailable when XHR response access fails", () => {
    expect(
      createXhrResponseBodyCaptureTask(
        38,
        {
          get response(): unknown {
            throw new TypeError("cannot read");
          },
          getResponseHeader: () => "text/plain",
        },
        { bodyCaptureLimit: 64, redactionPatterns: [] },
      ),
    ).toEqual(createUnavailableDetailEvent(38, "response body"));
  });
});

import { describe, expect, it } from "vitest";
import { cloneResponseForBodyCapture } from "../../../src/capture/cloneResponseForBodyCapture";

describe("cloneResponseForBodyCapture", () => {
  it("[NET-BODY-003] clones a Response without reading the original body", () => {
    const response = new Response("response body");

    const clone = cloneResponseForBodyCapture(response);

    expect(clone).toBeInstanceOf(Response);
    expect(clone).not.toBe(response);
    expect(response.bodyUsed).toBe(false);
  });

  it("[NET-CAPTURE-012][NET-BODY-016] returns undefined when Response cloning fails", () => {
    const response = new Response("response body");
    response.clone = () => {
      throw new TypeError("cannot clone");
    };

    expect(cloneResponseForBodyCapture(response)).toBeUndefined();
    expect(response.bodyUsed).toBe(false);
  });
});

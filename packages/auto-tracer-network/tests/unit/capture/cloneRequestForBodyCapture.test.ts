import { describe, expect, it } from "vitest";
import { cloneRequestForBodyCapture } from "../../../src/capture/cloneRequestForBodyCapture";

describe("cloneRequestForBodyCapture", () => {
  it("[NET-CAPTURE-010] clones a Request without reading the original body", () => {
    const request = new Request("https://api.example.test/orders", {
      method: "POST",
      body: "request body",
    });

    const clone = cloneRequestForBodyCapture(request);

    expect(clone).toBeInstanceOf(Request);
    expect(clone).not.toBe(request);
    expect(request.bodyUsed).toBe(false);
  });

  it("[NET-CAPTURE-012] returns undefined when Request cloning fails", () => {
    const request = new Request("https://api.example.test/orders", {
      method: "POST",
      body: "request body",
    });
    request.clone = () => {
      throw new TypeError("cannot clone");
    };

    expect(cloneRequestForBodyCapture(request)).toBeUndefined();
    expect(request.bodyUsed).toBe(false);
  });
});

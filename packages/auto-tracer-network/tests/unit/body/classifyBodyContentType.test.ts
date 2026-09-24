import { describe, expect, it } from "vitest";
import { classifyBodyContentType } from "../../../src/body/classifyBodyContentType";

describe("classifyBodyContentType", () => {
  it("[NET-BODY-004] classifies declared JSON text", () => {
    expect(
      classifyBodyContentType('{"status":201}', "application/json"),
    ).toBe("json");
  });

  it("[NET-BODY-005] classifies plain text", () => {
    expect(classifyBodyContentType("response text", "text/plain")).toBe(
      "text",
    );
  });

  it("[NET-BODY-006] classifies URL-encoded data", () => {
    expect(
      classifyBodyContentType(new URLSearchParams({ status: "open" })),
    ).toBe("url-encoded");
  });

  it("[NET-BODY-007] classifies FormData", () => {
    expect(classifyBodyContentType(new FormData())).toBe("form-data");
  });

  it("[NET-BODY-009] classifies binary data", () => {
    expect(
      classifyBodyContentType(
        new Blob(["binary"], { type: "application/octet-stream" }),
      ),
    ).toBe("binary");
  });

  it("[NET-BODY-010] classifies application-owned request streams", () => {
    expect(
      classifyBodyContentType(new ReadableStream<Uint8Array>()),
    ).toBe("stream");
  });
});

import { describe, expect, it } from "vitest";
import { createNonTextBodySnapshot } from "../../../src/body/createNonTextBodySnapshot";

describe("createNonTextBodySnapshot", () => {
  it("[NET-BODY-006,011] captures serialized URL-encoded data within the limit", () => {
    expect(
      createNonTextBodySnapshot({
        body: new URLSearchParams({ a: "1" }),
        contentType: "application/x-www-form-urlencoded",
        captureLimit: 3,
      }),
    ).toEqual({
      status: "captured",
      text: "a=1",
      originalByteSize: 3,
      capturedByteSize: 3,
      truncated: false,
    });
  });

  it("[NET-BODY-007..008] snapshots ordered FormData metadata", () => {
    const body = new FormData();
    body.append("name", "Ada");

    expect(
      createNonTextBodySnapshot({
        body,
        contentType: null,
        captureLimit: 1,
      }),
    ).toEqual([{ kind: "text", name: "name", value: "Ada" }]);
  });

  it("[NET-BODY-009] captures only binary metadata", () => {
    expect(
      createNonTextBodySnapshot({
        body: new Blob(["abc"]),
        contentType: "application/octet-stream",
        captureLimit: 1,
      }),
    ).toEqual({
      status: "metadata-only",
      contentType: "application/octet-stream",
      knownByteSize: 3,
    });
  });

  it("[NET-BODY-010] does not capture an application-owned stream", () => {
    expect(
      createNonTextBodySnapshot({
        body: new ReadableStream<Uint8Array>(),
        contentType: null,
        captureLimit: 1,
      }),
    ).toEqual({
      status: "not-captured",
      reason: "application-owned request stream",
    });
  });
});

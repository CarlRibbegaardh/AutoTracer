import { describe, expect, it } from "vitest";
import { isApplicationOwnedRequestStream } from "../../../src/body/isApplicationOwnedRequestStream";

describe("isApplicationOwnedRequestStream", () => {
  it("[NET-BODY-010] identifies a readable request stream", () => {
    const stream = new ReadableStream<Uint8Array>();

    expect(isApplicationOwnedRequestStream(stream)).toBe(true);
    expect(stream.locked).toBe(false);
  });

  it("[NET-BODY-010] excludes safely inspectable and absent request bodies", () => {
    expect(isApplicationOwnedRequestStream("request text")).toBe(false);
    expect(isApplicationOwnedRequestStream(null)).toBe(false);
  });
});

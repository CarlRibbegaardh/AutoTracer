import { describe, expect, it } from "vitest";
import { createApplicationOwnedStreamBodySnapshot } from "../../../src/body/createApplicationOwnedStreamBodySnapshot";

describe("createApplicationOwnedStreamBodySnapshot", () => {
  it("[NET-BODY-010] returns the fixed application-owned stream result", () => {
    expect(createApplicationOwnedStreamBodySnapshot()).toEqual({
      status: "not-captured",
      reason: "application-owned request stream",
    });
  });
});

import { describe, expect, it } from "vitest";
import { createOversizedJsonBodySnapshot } from "../../../src/body/createOversizedJsonBodySnapshot";

describe("createOversizedJsonBodySnapshot", () => {
  it("[NET-BODY-012] exposes only JSON metadata and the fixed limit reason", () => {
    expect(
      createOversizedJsonBodySnapshot("application/problem+json", 65_537),
    ).toEqual({
      status: "exceeds-limit",
      contentType: "application/problem+json",
      byteSize: 65_537,
      reason: "JSON body exceeds capture limit",
    });
  });
});

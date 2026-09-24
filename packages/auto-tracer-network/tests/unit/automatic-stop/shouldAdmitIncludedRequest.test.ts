import { describe, expect, it } from "vitest";
import { shouldAdmitIncludedRequest } from "../../../src/automatic-stop/shouldAdmitIncludedRequest";

describe("shouldAdmitIncludedRequest", () => {
  it("[NET-AUTOSTOP-002] admits included requests while automatic stop is disabled", () => {
    expect(shouldAdmitIncludedRequest(0, undefined)).toBe(true);
    expect(shouldAdmitIncludedRequest(100, undefined)).toBe(true);
  });

  it("[NET-AUTOSTOP-003] admits included requests below the configured limit", () => {
    expect(shouldAdmitIncludedRequest(0, 3)).toBe(true);
    expect(shouldAdmitIncludedRequest(2, 3)).toBe(true);
  });

  it("[NET-AUTOSTOP-003] rejects included requests at or above the configured limit", () => {
    expect(shouldAdmitIncludedRequest(3, 3)).toBe(false);
    expect(shouldAdmitIncludedRequest(4, 3)).toBe(false);
  });
});

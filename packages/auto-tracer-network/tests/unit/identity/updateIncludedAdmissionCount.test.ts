import { describe, expect, it } from "vitest";
import { updateIncludedAdmissionCount } from "../../../src/identity/updateIncludedAdmissionCount";

describe("updateIncludedAdmissionCount", () => {
  it("[NET-ID-007] increments the admission count for an included request", () => {
    expect(updateIncludedAdmissionCount(2, true)).toBe(3);
  });

  it("[NET-FILTER-008] retains the admission count for a hidden request", () => {
    expect(updateIncludedAdmissionCount(2, false)).toBe(2);
  });
});

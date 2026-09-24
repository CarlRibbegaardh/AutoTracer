import { describe, expect, it } from "vitest";
import type { RequestCaptureSnapshot } from "../../../src/capture/RequestCaptureSnapshot";
import { countPendingRequestWork } from "../../../src/state/countPendingRequestWork";

const disabledCapture = {
  captureRequestHeaders: false,
  captureRequestBody: false,
  captureResponseHeaders: false,
  captureResponseBody: false,
  bodyCaptureLimit: 1_024,
  redactionPatterns: [],
} satisfies RequestCaptureSnapshot;

describe("countPendingRequestWork", () => {
  it("[NET-ID-008] contributes no pending work for a hidden request", () => {
    expect(countPendingRequestWork(false, disabledCapture)).toBe(0);
  });

  it("[NET-ID-008] counts an included request outcome as pending work", () => {
    expect(countPendingRequestWork(true, disabledCapture)).toBe(1);
  });

  it("[NET-ID-008] counts every enabled detail as additional pending work", () => {
    expect(
      countPendingRequestWork(true, {
        ...disabledCapture,
        captureRequestHeaders: true,
        captureRequestBody: true,
        captureResponseHeaders: true,
        captureResponseBody: true,
      }),
    ).toBe(5);
  });
});

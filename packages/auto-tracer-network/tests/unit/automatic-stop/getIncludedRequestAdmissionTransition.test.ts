import { describe, expect, it } from "vitest";
import { getIncludedRequestAdmissionTransition } from "../../../src/automatic-stop/getIncludedRequestAdmissionTransition";

describe("getIncludedRequestAdmissionTransition", () => {
  it("[NET-AUTOSTOP-002] admits and counts requests while the limit is disabled", () => {
    expect(getIncludedRequestAdmissionTransition(4, undefined)).toEqual({
      admitted: true,
      admittedRequestCount: 5,
      automaticStopTriggered: false,
    });
  });

  it("[NET-AUTOSTOP-002..004] admits the final request and triggers automatic stop", () => {
    expect(getIncludedRequestAdmissionTransition(2, 3)).toEqual({
      admitted: true,
      admittedRequestCount: 3,
      automaticStopTriggered: true,
    });
  });

  it("[NET-AUTOSTOP-003] rejects requests after the limit without changing the count", () => {
    expect(getIncludedRequestAdmissionTransition(3, 3)).toEqual({
      admitted: false,
      admittedRequestCount: 3,
      automaticStopTriggered: false,
    });
  });
});

import { describe, expect, it } from "vitest";
import { mergeValidatedOptions } from "@src/lib/functions/mergeValidatedOptions.js";
import type { ReactTracerInternalOptions } from "@src/lib/types/ReactTracerInternalOptions.js";

describe("mergeValidatedOptions", () => {
  it("should merge partial options into current options", () => {
    const currentOptions: ReactTracerInternalOptions = {
      enabled: true,
      internalLogLevel: "error",
      includeReconciled: "never",
      includeSkipped: "never",
      showFlags: false,
      maxFiberDepth: 100,
      detectIdenticalValueChanges: true,
      includeNonTrackedBranches: false,
      skippedObjectProps: [],
      startTriggerFunctionName: null,
      endTriggerFunctionName: null,
    };

    const partialOptions = {
      enabled: false,
      maxFiberDepth: 50,
    };

    const result = mergeValidatedOptions(currentOptions, partialOptions);

    expect(result.enabled).toBe(false);
    expect(result.maxFiberDepth).toBe(50);
    expect(result.internalLogLevel).toBe("error"); // preserved
    expect(result.includeReconciled).toBe("never"); // preserved
  });

  it("should validate options before merging", () => {
    const currentOptions: ReactTracerInternalOptions = {
      enabled: true,
      internalLogLevel: "error",
      includeReconciled: "never",
      includeSkipped: "never",
      showFlags: false,
      maxFiberDepth: 100,
      detectIdenticalValueChanges: true,
      includeNonTrackedBranches: false,
      skippedObjectProps: [],
      startTriggerFunctionName: null,
      endTriggerFunctionName: null,
    };

    const partialOptions = {
      showFlags: true,
    };

    const result = mergeValidatedOptions(currentOptions, partialOptions);

    expect(result.showFlags).toBe(true);
  });

  it("should return new object without mutating input", () => {
    const currentOptions: ReactTracerInternalOptions = {
      enabled: true,
      internalLogLevel: "error",
      includeReconciled: "never",
      includeSkipped: "never",
      showFlags: false,
      maxFiberDepth: 100,
      detectIdenticalValueChanges: true,
      includeNonTrackedBranches: false,
      skippedObjectProps: [],
      startTriggerFunctionName: null,
      endTriggerFunctionName: null,
    };

    const partialOptions = {
      enabled: false,
    };

    const result = mergeValidatedOptions(currentOptions, partialOptions);

    expect(result).not.toBe(currentOptions);
    expect(currentOptions.enabled).toBe(true); // not mutated
    expect(result.enabled).toBe(false);
  });
});

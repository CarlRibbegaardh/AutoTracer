/**
 * @file TEMPORARY: Utility to capture react-hook-form fiber data for test fixtures.
 * This file should be removed after fixture capture is complete.
 */

import { internalLogger } from "@logger/internalLogger.js";
import type { LabelEntry } from "./LabelEntry.js";
import { stringify } from "flatted";

/**
 * Flag to track if we've already captured a fixture (only capture once)
 */
const fixtureAlreadyCaptured = false;

/**
 * Checks if the given value is a react-hook-form object
 */
function isReactHookFormObject(value: unknown): boolean {
  internalLogger.log(`Checking if value is react-hook-form object...`);
  internalLogger.log(`  typeof value: ${typeof value}`);
  internalLogger.log(`  value === null: ${value === null}`);

  if (typeof value !== "object" || value === null) {
    internalLogger.log(`  ❌ Not an object or is null`);
    return false;
  }

  const obj = value as Record<string, unknown>;

  // Check for react-hook-form signature
  const hasRegister = typeof obj.register === "function";
  const hasHandleSubmit = typeof obj.handleSubmit === "function";
  const hasFormState =
    typeof obj.formState === "object" && obj.formState !== null;
  const hasControl = typeof obj.control === "object" && obj.control !== null;

  internalLogger.log(`  hasRegister: ${hasRegister} (${typeof obj.register})`);
  internalLogger.log(
    `  hasHandleSubmit: ${hasHandleSubmit} (${typeof obj.handleSubmit})`
  );
  internalLogger.log(
    `  hasFormState: ${hasFormState} (${typeof obj.formState})`
  );
  internalLogger.log(`  hasControl: ${hasControl} (${typeof obj.control})`);

  const keys = Object.keys(obj).slice(0, 20);
  internalLogger.log(`  Object keys (first 20): ${keys.join(", ")}`);

  const isRHF = hasRegister && hasHandleSubmit && hasFormState && hasControl;
  internalLogger.log(
    `  Result: ${isRHF ? "✅ IS react-hook-form" : "❌ NOT react-hook-form"}`
  );

  return isRHF;
}

/**
 * Counts function properties in an object
 */
function countFunctionProperties(value: unknown): number {
  if (typeof value !== "object" || value === null) {
    return 0;
  }

  let count = 0;
  for (const key in value) {
    if (typeof (value as Record<string, unknown>)[key] === "function") {
      count++;
    }
  }
  return count;
}

/**
 * Safe replacer for JSON.stringify that handles circular refs and functions
 */
function createSafeReplacer() {
  const seen = new WeakSet();
  const path: string[] = [];

  return function replacer(
    this: unknown,
    key: string,
    value: unknown
  ): unknown {
    // Track path
    if (key) {
      path.push(key);
    }

    // Handle primitives
    if (value === null || value === undefined) {
      if (key) path.pop();
      return value;
    }

    // Handle functions
    if (typeof value === "function") {
      const result = {
        __type: "function" as const,
        name: value.name || "<anonymous>",
        length: value.length,
      };
      if (key) path.pop();
      return result;
    }

    // Handle DOM elements
    if (typeof value === "object" && value !== null) {
      if (value instanceof HTMLElement) {
        const result = {
          __type: "HTMLElement" as const,
          tagName: value.tagName,
          id: value.id || undefined,
        };
        if (key) path.pop();
        return result;
      }

      // Handle circular references
      if (seen.has(value as object)) {
        const result = {
          __type: "circular-ref" as const,
          path: path.join("."),
        };
        if (key) path.pop();
        return result;
      }

      seen.add(value as object);

      // Handle Sets
      if (value instanceof Set) {
        const result = {
          __type: "Set" as const,
          size: value.size,
          values: Array.from(value).slice(0, 10), // Limit to 10 items
        };
        if (key) path.pop();
        return result;
      }

      // Handle Maps
      if (value instanceof Map) {
        const result = {
          __type: "Map" as const,
          size: value.size,
          entries: Array.from(value.entries()).slice(0, 10),
        };
        if (key) path.pop();
        return result;
      }
    }

    if (key) path.pop();
    return value;
  };
}

/**
 * Captures a fiber fixture to a JSON file (browser environment)
 */
function captureToBrowser(
  value: unknown,
  metadata: {
    componentName: string;
    anchorIndex: number;
    guid: string;
    functionCount: number;
  }
): void {
  const fixture = {
    description: "React Hook Form state object causing slow serialization",
    capturedAt: new Date().toISOString(),
    metadata,
    validation: {
      isReactHookForm: isReactHookFormObject(value),
      functionPropertyCount: countFunctionProperties(value),
    },
    rawValue: value,
  };

  try {
    const json = JSON.stringify(fixture, createSafeReplacer(), 2);
    const fson = stringify(value);

    // Download as file
    // const blob = new Blob([json], { type: "application/json" });
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement("a");
    // a.href = url;
    // a.download = `fiber-fixture-${metadata.componentName}-${Date.now()}.json`;
    // a.click();
    // URL.revokeObjectURL(url);

    const blob2 = new Blob([fson], { type: "application/json" });
    const url2 = URL.createObjectURL(blob2);
    const a2 = document.createElement("a");
    a2.href = url2;
    a2.download = `fiber-fixture-${
      metadata.componentName
    }-${Date.now()}-flatted.json`;
    a2.click();
    URL.revokeObjectURL(url2);

    internalLogger.log("✅ Fiber fixture captured successfully");
    internalLogger.log(`Component: ${metadata.componentName}`);
    internalLogger.log(`Functions: ${metadata.functionCount}`);
    internalLogger.log(`File size: ${(json.length / 1024).toFixed(2)} KB`);
  } catch (error) {
    internalLogger.error("❌ Failed to capture fiber fixture:", error);
  }
}

/**
 * Attempts to capture a fiber fixture if conditions are met.
 *
 * Feature flag: Set window.__CAPTURE_FIBER_FIXTURE = true to enable
 */
export function attemptFiberCapture(
  _labels: readonly LabelEntry[],
  anchorValue: unknown,
  componentName: string,
  anchorIndex: number,
  guid: string
): void {
  const h = internalLogger.enter(
    `[attemptFiberCapture] Attempting fiber fixture capture for ${componentName}...`
  );
  // Check feature flag
  if (
    typeof window === "undefined" ||
    !(window as { __CAPTURE_FIBER_FIXTURE?: boolean }).__CAPTURE_FIBER_FIXTURE
  ) {
    internalLogger.log(
      "Fiber fixture capture disabled (feature flag not set)."
    );
    internalLogger.exit(h);
    return;
  }

  // Only capture once
  if (fixtureAlreadyCaptured) {
    internalLogger.log("Fiber fixture already captured, skipping.");
    internalLogger.exit(h);
    return;
  }

  // // Validate it's react-hook-form
  // if (!isReactHookFormObject(anchorValue)) {
  //   internalLogger.log(
  //     "Anchor value is not a react-hook-form object, skipping."
  //   );
  //   internalLogger.exit(h);
  //   return;
  // }

  const functionCount = countFunctionProperties(anchorValue);

  // // Additional validation: must have many functions (react-hook-form has ~15+)
  // if (functionCount < 10) {
  //   internalLogger.log(
  //     `Not enough function properties (${functionCount}), skipping capture.`
  //   );
  //   internalLogger.exit(h);
  //   return;
  // }
  // if (componentName !== "LocationEditor") {
  //   internalLogger.log(
  //     `Component is not LocationEditor (it's ${componentName}), skipping capture.`
  //   );
  //   internalLogger.exit(h);
  //   return;
  // }

  internalLogger.log(`🎯 Detected react-hook-form object in ${componentName}`);
  internalLogger.log(
    `   Functions: ${functionCount}, AnchorIndex: ${anchorIndex}`
  );

  //fixtureAlreadyCaptured = true;

  internalLogger.log("Capturing fiber fixture...");
  captureToBrowser(anchorValue, {
    componentName,
    anchorIndex,
    guid,
    functionCount,
  });
  internalLogger.exit(h);
}

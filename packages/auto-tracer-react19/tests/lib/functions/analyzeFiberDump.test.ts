import { describe, expect, it } from "vitest";
import { parse } from "flatted";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Checks whether a value is a non-null object.
 */
const isNonNullObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

describe("Fiber Dump Analysis", () => {
  it("should parse the fiber dump fixture and expose a finite hook chain", () => {
    const fixtureData = fs.readFileSync(
      path.join(
        __dirname,
        "..",
        "..",
        "fixtures",
        "todoListFiberWithDispatch.fixture.flatted"
      ),
      "utf8"
    );

    const fiber: unknown = parse(fixtureData);
    expect(isNonNullObject(fiber)).toBe(true);
    if (!isNonNullObject(fiber)) {
      return;
    }

    const debugHookTypes = fiber["_debugHookTypes"];
    expect(Array.isArray(debugHookTypes)).toBe(true);
    if (Array.isArray(debugHookTypes)) {
      expect(debugHookTypes.every((x) => typeof x === "string")).toBe(true);
    }

    const firstHook = fiber["memoizedState"];
    let hookCount = 0;
    let hookWithQueueCount = 0;
    let currentHook: unknown = firstHook;

    while (isNonNullObject(currentHook) && hookCount < 100) {
      hookCount++;

      const queueValue = currentHook["queue"];
      if (queueValue !== null && queueValue !== undefined) {
        hookWithQueueCount++;
      }

      currentHook = currentHook["next"];
    }

    expect(hookCount).toBeGreaterThan(0);
    expect(hookCount).toBeLessThan(100);
    expect(hookWithQueueCount).toBeGreaterThan(0);
  });
});

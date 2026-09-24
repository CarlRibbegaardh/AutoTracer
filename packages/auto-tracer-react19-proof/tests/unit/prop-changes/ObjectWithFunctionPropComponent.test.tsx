import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ObjectWithFunctionPropComponent } from "@src/prop-changes/ObjectWithFunctionPropComponent";

/**
 * BUG REPRODUCTION TEST
 *
 * This test reproduces the exact bug reported:
 * - Component receives an object prop containing a function
 * - On re-render, the function changes (new instance with different ID)
 * - System shows "(identical value)" but the Before/After show different function IDs
 *
 * Expected output from browser:
 * ⚠️ Changed prop config: (identical value)
 *   Before {handler: '(fn:180)', …}
 *   After  {handler: '(fn:196)', …}
 *
 * The bug: function IDs are DIFFERENT but labeled as "(identical value)"
 */
describe("ObjectWithFunctionPropComponent - Bug Reproduction", () => {
  let consoleLogSpy: any;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log");
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it("FAILING TEST: object with different function IDs shows '(identical value)'", () => {
    const { getByText } = render(<ObjectWithFunctionPropComponent />);

    // Clear logs after initial render
    consoleLogSpy.mockClear();

    // Trigger re-render by clicking increment
    const button = getByText(/Increment:/);
    fireEvent.click(button);

    // Get all console.log calls as strings
    const allLogs: string[] = consoleLogSpy.mock.calls.map((call: unknown[]) =>
      call
        .map((arg: unknown) => {
          if (typeof arg === "string") return arg;
          if (typeof arg === "object") {
            try {
              return JSON.stringify(arg);
            } catch {
              return String(arg);
            }
          }
          return String(arg);
        })
        .join(" ")
    );

    console.log("\n=== ALL CONSOLE OUTPUT ===");
    allLogs.forEach((log: string, idx: number) =>
      console.log(`[${idx}]: ${log}`)
    );
    console.log("=== END ===\n");

    // Find logs mentioning the "config" prop (child component receiving the prop)
    const configLogs = allLogs.filter(
      (log: string) =>
        log.toLowerCase().includes("config") ||
        log.toLowerCase().includes("handler")
    );

    console.log("\n=== CONFIG/HANDLER PROP LOGS ===");
    configLogs.forEach((log: string, idx: number) =>
      console.log(`[${idx}]: ${log}`)
    );
    console.log("=== END ===\n");

    // Look for any log with "(identical value)"
    const identicalValueLog = configLogs.find((log: string) =>
      log.includes("(identical value)")
    );

    if (identicalValueLog) {
      console.log("\n🐛 FOUND '(identical value)' LOG:");
      console.log(identicalValueLog);
      console.log("\n");

      // Check if this log shows different function IDs
      const functionIdPattern = /\(fn:(\d+)\)/g;
      const matches = identicalValueLog.match(functionIdPattern);

      if (matches && matches.length >= 2) {
        const ids = matches
          .map((m: string) => {
            const idMatch = m.match(/\(fn:(\d+)\)/);
            return idMatch ? parseInt(idMatch[1], 10) : null;
          })
          .filter((id: number | null) => id !== null);

        console.error("🐛 BUG CONFIRMED:");
        console.error(`   Function IDs in output: ${ids.join(" vs ")}`);
        console.error(`   IDs are DIFFERENT: ${ids[0]} !== ${ids[1]}`);
        console.error(`   But output shows: "(identical value)"`);
        console.error(
          "   This is WRONG - different functions should NOT show as identical\n"
        );
      }
    }

    // ❌ THIS SHOULD FAIL
    // When the log contains different function IDs, it should NOT show "(identical value)"
    expect(identicalValueLog).toBeUndefined();
  });
});

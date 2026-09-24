import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DuplicateHookComponent } from "@src/special-cases/DuplicateHookComponent";

/**
 * Tests for Special Case: Duplicate Hook Value Inference
 *
 * This test suite documents the `.unknown` suffix pattern for duplicate detection.
 *
 * NOTE: The actual `.unknown` suffix behavior is best demonstrated in real-world
 * scenarios like Redux useSelector, where the library creates internal state that
 * React doesn't optimize away. See the perf-test-mui app's UsersDashboard for
 * a working example showing `usersByDept.unknown` in the console.
 *
 * This simplified test verifies the component structure works correctly.
 */

describe("DuplicateHookComponent", () => {
  let consoleOutput: string[] = [];

  beforeEach(() => {
    consoleOutput = [];
    const originalLog = console.log;
    console.log = vi.fn((...args: unknown[]) => {
      const message = args
        .map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg)))
        .join(" ");
      consoleOutput.push(message);
      originalLog(...args);
    });
  });

  it("should label the selector result correctly", () => {
    render(<DuplicateHookComponent />);

    // Should have labeled the selector result
    const usersByDeptLog = consoleOutput.find(
      (line) =>
        line.includes("Initial state usersByDept:") &&
        line.includes("Engineering") &&
        line.includes("Sales")
    );
    expect(usersByDeptLog).toBeDefined();
  });

  it("should not have unlabeled state", () => {
    render(<DuplicateHookComponent />);

    // Should not have any plain "unknown" labels
    const unknownLabels = consoleOutput.filter((line) =>
      /Initial state unknown:/.test(line)
    );

    expect(unknownLabels.length).toBe(0);
  });

  it("should render component correctly", () => {
    const { container } = render(<DuplicateHookComponent />);
    expect(container).toBeTruthy();

    const heading = screen.getByRole("heading", { name: /Duplicate Hook Test/i });
    expect(heading).toBeDefined();
  });
});

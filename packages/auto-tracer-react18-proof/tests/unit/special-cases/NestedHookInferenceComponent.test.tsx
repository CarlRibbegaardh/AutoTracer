import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NestedHookInferenceComponent } from "@src/special-cases/NestedHookInferenceComponent";

/**
 * Tests for Special Case: Nested Hook Inference
 *
 * Verifies that when custom hooks internally use useState, the tracer
 * can automatically infer that the unlabeled internal state belongs
 * to the labeled custom hook object.
 *
 * Example:
 * ```tsx
 * const customHookResult = useCustomValue("test");
 * logger.labelState(0, "customHookResult", customHookResult);
 * ```
 *
 * The internal `useState("test")` should be automatically inferred as
 * `customHookResult.value` instead of remaining `unknown`.
 */
describe("NestedHookInferenceComponent", () => {
  let consoleOutput: string[] = [];
  let originalLog: typeof console.log;

  beforeEach(() => {
    consoleOutput = [];
    originalLog = console.log;
    console.log = vi.fn((...args: any[]) => {
      consoleOutput.push(args.map(String).join(" "));
    });
  });

  afterEach(() => {
    console.log = originalLog;
  });

  it("should infer nested hook values on mount", () => {
    render(<NestedHookInferenceComponent />);

    // Debug: Output all console logs
    originalLog("=== MOUNT TEST - ALL CONSOLE OUTPUT ===");
    consoleOutput.forEach((line, i) => originalLog(`[${i}] ${line}`));
    originalLog("=== END MOUNT OUTPUT ===");

    // Check that component mounted
    const mountLog = consoleOutput.find((line) =>
      line.includes("[NestedHookInferenceComponent] Mount")
    );
    expect(mountLog).toBeDefined();

    // The custom hook objects should be labeled correctly
    const customHookLog = consoleOutput.find((line) =>
      line.includes("Initial state customHookResult:") &&
      line.includes('"value":"pattern-custom"')
    );
    expect(customHookLog).toBeDefined();

    const nestedHookLog = consoleOutput.find((line) =>
      line.includes("Initial state nestedHookResult:") &&
      line.includes('"value":"nested-custom"')
    );
    expect(nestedHookLog).toBeDefined();

    // The internal useState values should be inferred with dotted paths
    // customHookResult.value instead of unknown
    const customValueLog = consoleOutput.find((line) =>
      line.includes("Initial state customHookResult.value:") &&
      line.includes("pattern-custom")
    );
    expect(customValueLog).toBeDefined();

    const nestedValueLog = consoleOutput.find((line) =>
      line.includes("Initial state nestedHookResult.value:") &&
      line.includes("nested-custom")
    );
    expect(nestedValueLog).toBeDefined();

    // Note: Setter functions are NOT inferred because the inference algorithm
    // intentionally skips functions to avoid false positives with stable references.
    // The setters will remain as "unknown" in the logs.

    // Regular state should be labeled normally
    const descriptionLog = consoleOutput.find((line) =>
      line.includes("Initial state description:") &&
      line.includes("initial")
    );
    expect(descriptionLog).toBeDefined();
  });

  it("should infer nested hook values on update", async () => {
    const user = userEvent.setup();
    render(<NestedHookInferenceComponent />);

    consoleOutput = [];

    // Update the custom hook value
    const customButton = screen.getByRole("button", { name: /Update Custom Hook/i });
    await user.click(customButton);

    // Debug: Output all console logs
    originalLog("=== UPDATE TEST - ALL CONSOLE OUTPUT ===");
    consoleOutput.forEach((line, i) => originalLog(`[${i}] ${line}`));
    originalLog("=== END UPDATE OUTPUT ===");

    // The internal state value should be inferred with the dotted path
    const customValueChange = consoleOutput.find((line) =>
      line.includes("State change customHookResult.value:") &&
      line.includes("pattern-custom") &&
      line.includes("pattern-updated")
    );
    expect(customValueChange).toBeDefined();

    // The custom hook object itself should also show the change
    const customObjectChange = consoleOutput.find((line) =>
      line.includes("State change customHookResult:") &&
      line.includes('"value":"pattern-custom"') &&
      line.includes('"value":"pattern-updated"')
    );
    expect(customObjectChange).toBeDefined();
  });

  it("should infer multiple nested hooks independently", async () => {
    const user = userEvent.setup();
    render(<NestedHookInferenceComponent />);

    consoleOutput = [];

    // Update the nested hook value
    const nestedButton = screen.getByRole("button", { name: /Update Nested Hook/i });
    await user.click(nestedButton);

    // Debug: Output all console logs
    originalLog("=== NESTED UPDATE TEST - ALL CONSOLE OUTPUT ===");
    consoleOutput.forEach((line, i) => originalLog(`[${i}] ${line}`));
    originalLog("=== END NESTED UPDATE OUTPUT ===");

    // The internal state value should be inferred with the dotted path
    const nestedValueChange = consoleOutput.find((line) =>
      line.includes("State change nestedHookResult.value:") &&
      line.includes("nested-custom") &&
      line.includes("nested-updated")
    );
    expect(nestedValueChange).toBeDefined();

    // The nested hook object should also show the change
    const nestedObjectChange = consoleOutput.find((line) =>
      line.includes("State change nestedHookResult:") &&
      line.includes('"value":"nested-custom"') &&
      line.includes('"value":"nested-updated"')
    );
    expect(nestedObjectChange).toBeDefined();
  });

  it("should not interfere with regular labeled state", async () => {
    const user = userEvent.setup();
    render(<NestedHookInferenceComponent />);

    consoleOutput = [];

    // Update regular state
    const descButton = screen.getByRole("button", { name: /Update Description/i });
    await user.click(descButton);

    // Regular state should work normally
    const descriptionChange = consoleOutput.find((line) =>
      line.includes("State change description:") &&
      line.includes("initial") &&
      line.includes("updated")
    );
    expect(descriptionChange).toBeDefined();
  });

  it("should render component correctly", () => {
    const { container } = render(<NestedHookInferenceComponent />);

    expect(container.textContent).toContain("Nested Hook Inference Test");
    expect(container.textContent).toContain("Description: initial");
    expect(container.textContent).toContain("Custom: pattern-custom");
    expect(container.textContent).toContain("Nested: nested-custom");
  });

  it("should embed setters in hook objects", () => {
    render(<NestedHookInferenceComponent />);

    // Debug: Output all console logs
    originalLog("=== SETTER TEST - ALL CONSOLE OUTPUT ===");
    consoleOutput.forEach((line, i) => originalLog(`[${i}] ${line}`));
    originalLog("=== END SETTER OUTPUT ===");

    // Setter functions are embedded in the custom hook objects as "setValue": "(fn:N)"
    // They are not logged separately, because they're part of the labeled object.
    const customHookWithSetter = consoleOutput.find((line) =>
      line.includes("Initial state customHookResult:") &&
      line.includes('"setValue":"(fn:') &&
      line.includes('"value":"pattern-custom"')
    );
    expect(customHookWithSetter).toBeDefined();

    const nestedHookWithSetter = consoleOutput.find((line) =>
      line.includes("Initial state nestedHookResult:") &&
      line.includes('"setValue":"(fn:') &&
      line.includes('"value":"nested-custom"')
    );
    expect(nestedHookWithSetter).toBeDefined();
  });
});

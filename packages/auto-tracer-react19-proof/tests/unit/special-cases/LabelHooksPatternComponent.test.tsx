import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LabelHooksPatternComponent } from "@src/special-cases/LabelHooksPatternComponent";

/**
 * Tests for Special Case: Label Hooks Pattern
 * Verifies custom hook container detection and .internal labeling.
 *
 * This test mirrors the E2E test from todo-example-vite-injected.
 * Key behaviors:
 * - Custom hook objects (with methods) are detected as containers
 * - Internal useState from custom hooks are labeled as .internal
 * - Nested custom hooks are properly inferred
 * - Destructured custom hook properties are labeled individually
 */
describe("LabelHooksPatternComponent", () => {
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

  describe("Initial State Detection", () => {
    it("should detect useReducer state with correct labels", () => {
      render(<LabelHooksPatternComponent />);

      const counterLog = consoleOutput.find((line) =>
        line.includes("Initial state counter:")
      );
      const dispatchLog = consoleOutput.find((line) =>
        line.includes("Initial state dispatchCounter:")
      );

      expect(counterLog).toContain("10");
      expect(dispatchLog).toMatch(/\(fn:\d+\)/);
    });

    it("should label internal useState as customHookResult.value (NOT value.internal)", () => {
      render(<LabelHooksPatternComponent />);

      // The internal useState from customHookResult should be labeled as customHookResult.value
      const customHookValueLog = consoleOutput.find((line) =>
        line.includes("Initial state customHookResult.value:")
      );

      expect(customHookValueLog).toBeDefined();
      expect(customHookValueLog).toContain("pattern-custom");

      // Should NOT be labeled as value.internal
      const wrongLabel = consoleOutput.find((line) =>
        line.includes("Initial state value.internal:")
      );
      expect(wrongLabel).toBeUndefined();
    });

    it("should label nested hook internal state as nestedHookResult.value", () => {
      render(<LabelHooksPatternComponent />);

      const nestedValueLog = consoleOutput.find((line) =>
        line.includes("Initial state nestedHookResult.value:")
      );

      expect(nestedValueLog).toBeDefined();
      expect(nestedValueLog).toContain("nested-custom");
    });

    it("should detect custom hook object with correct label", () => {
      render(<LabelHooksPatternComponent />);

      const customHookLog = consoleOutput.find((line) =>
        line.includes("Initial state customHookResult:")
      );

      expect(customHookLog).toBeDefined();
      expect(customHookLog).toContain('"value":"pattern-custom"');
    });

    it("should detect destructured custom hook properties", () => {
      render(<LabelHooksPatternComponent />);

      const valueLog = consoleOutput.find((line) =>
        line.includes("Initial state value:")
      );
      const setValueLog = consoleOutput.find((line) =>
        line.includes("Initial state setValue:")
      );

      expect(valueLog).toContain("destructed-pattern-custom");
      expect(setValueLog).toMatch(/\(fn:\d+\)/);
    });

    it("should detect nested custom hook object with correct label", () => {
      render(<LabelHooksPatternComponent />);

      const nestedHookLog = consoleOutput.find((line) =>
        line.includes("Initial state nestedHookResult:")
      );

      expect(nestedHookLog).toBeDefined();
      expect(nestedHookLog).toContain('"value":"nested-custom"');
    });
  });

  describe("State Change Detection", () => {
    it("should detect useReducer state changes", async () => {
      const user = userEvent.setup();
      render(<LabelHooksPatternComponent />);

      consoleOutput = [];

      const button = screen.getByText("Add to Counter");
      await user.click(button);

      const stateChangeLog = consoleOutput.find((line) =>
        line.includes("State change counter:")
      );

      expect(stateChangeLog).toBeDefined();
      expect(stateChangeLog).toContain("10");
      expect(stateChangeLog).toContain("15");
    });

    it("should detect custom hook object change", async () => {
      const user = userEvent.setup();
      render(<LabelHooksPatternComponent />);

      consoleOutput = [];

      const button = screen.getByText("Update Custom Hook");
      await user.click(button);

      // The custom hook object itself changes
      const objectChangeLog = consoleOutput.find((line) =>
        line.includes("State change customHookResult:")
      );

      expect(objectChangeLog).toBeDefined();
      expect(objectChangeLog).toContain('"value":"pattern-custom"');
      expect(objectChangeLog).toContain('"value":"pattern-updated"');
    });

    it("should detect internal state change as customHookResult.value", async () => {
      const user = userEvent.setup();
      render(<LabelHooksPatternComponent />);

      consoleOutput = [];

      const button = screen.getByText("Update Custom Hook");
      await user.click(button);

      // The internal useState should be labeled as customHookResult.value
      const internalStateLog = consoleOutput.find((line) =>
        line.includes("State change customHookResult.value:")
      );

      expect(internalStateLog).toBeDefined();
      expect(internalStateLog).toContain("pattern-custom");
      expect(internalStateLog).toContain("pattern-updated");
    });

    it("should detect nested hook internal state change as nestedHookResult.value", async () => {
      const user = userEvent.setup();
      render(<LabelHooksPatternComponent />);

      consoleOutput = [];

      const button = screen.getByText("Update Nested Hook");
      await user.click(button);

      const internalStateLog = consoleOutput.find((line) =>
        line.includes("State change nestedHookResult.value:")
      );

      expect(internalStateLog).toBeDefined();
      expect(internalStateLog).toContain("nested-custom");
      expect(internalStateLog).toContain("nested-updated");
    });

    it("should detect destructured value changes", async () => {
      const user = userEvent.setup();
      render(<LabelHooksPatternComponent />);

      consoleOutput = [];

      const button = screen.getByText("Update Destructured");
      await user.click(button);

      const valueChangeLog = consoleOutput.find((line) =>
        line.includes("State change value:")
      );

      expect(valueChangeLog).toBeDefined();
      expect(valueChangeLog).toContain("destructed-pattern-custom");
      expect(valueChangeLog).toContain("destructed-updated");
    });

    it("should detect nested hook object change", async () => {
      const user = userEvent.setup();
      render(<LabelHooksPatternComponent />);

      consoleOutput = [];

      const button = screen.getByText("Update Nested Hook");
      await user.click(button);

      // The nested hook object itself changes
      const objectChangeLog = consoleOutput.find((line) =>
        line.includes("State change nestedHookResult:")
      );

      expect(objectChangeLog).toBeDefined();
      expect(objectChangeLog).toContain('"value":"nested-custom"');
      expect(objectChangeLog).toContain('"value":"nested-updated"');
    });
  });

  describe("Re-render Scenario", () => {
    it("should detect all updates to custom hook", async () => {
      const user = userEvent.setup();
      render(<LabelHooksPatternComponent />);

      // First update: pattern-custom → pattern-updated
      consoleOutput = [];
      const button = screen.getByText("Update Custom Hook");
      await user.click(button);

      const firstObjectLog = consoleOutput.find((line) =>
        line.includes("State change customHookResult:")
      );
      expect(firstObjectLog).toBeDefined();
      if (firstObjectLog) {
        expect(firstObjectLog).toContain('"value":"pattern-custom"');
        expect(firstObjectLog).toContain('"value":"pattern-updated"');
      }
    });
  });

  describe("Rendering", () => {
    it("should render component correctly", () => {
      const { container } = render(<LabelHooksPatternComponent />);

      expect(container.textContent).toContain("Counter: 10");
      expect(container.textContent).toContain("Custom Hook: pattern-custom");
      expect(container.textContent).toContain("Destructured: destructed-pattern-custom");
      expect(container.textContent).toContain("Nested Hook: nested-custom");
    });
  });
});

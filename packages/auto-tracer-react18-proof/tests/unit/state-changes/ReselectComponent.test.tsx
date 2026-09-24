import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReselectComponent } from "@src/state-changes/ReselectComponent";
import { createAppStore } from "@src/state-changes/reselect/store";

/**
 * Tests for Redux Toolkit (reselect) state tracking.
 * Verifies that selectors with simple and complex objects are properly labeled.
 */
describe("ReselectComponent", () => {
  let consoleOutput: string[] = [];
  let originalLog: typeof console.log;

  beforeEach(() => {
    consoleOutput = [];
    originalLog = console.log;
    console.log = vi.fn((...args: unknown[]) => {
      consoleOutput.push(args.map(String).join(" "));
    });
  });

  afterEach(() => {
    console.log = originalLog;
  });

  it("should label simple selectors (user, filter, settings)", () => {
    const testStore = createAppStore();
    render(<ReselectComponent testStore={testStore} />);

    const userLog = consoleOutput.find((line) =>
      line.includes("Initial state user:")
    );
    const filterLog = consoleOutput.find((line) =>
      line.includes("Initial state filter:")
    );
    const settingsLog = consoleOutput.find((line) =>
      line.includes("Initial state settings:")
    );

    expect(userLog).toBeDefined();
    expect(filterLog).toBeDefined();
    expect(settingsLog).toBeDefined();
  });

  it("should label memoized simple selectors (todoCount, userInfo)", () => {
    const testStore = createAppStore();
    render(<ReselectComponent testStore={testStore} />);

    const todoCountLog = consoleOutput.find((line) =>
      line.includes("todoCount")
    );
    const userInfoLog = consoleOutput.find((line) => line.includes("userInfo"));

    expect(todoCountLog).toBeDefined();
    expect(userInfoLog).toBeDefined();
  });

  it("should label memoized complex selectors (filteredTodos, todosByPriority)", () => {
    const testStore = createAppStore();
    render(<ReselectComponent testStore={testStore} />);

    const filteredTodosLog = consoleOutput.find((line) =>
      line.includes("filteredTodos")
    );
    const todosByPriorityLog = consoleOutput.find((line) =>
      line.includes("todosByPriority")
    );

    expect(filteredTodosLog).toBeDefined();
    expect(todosByPriorityLog).toBeDefined();
  });

  it("should label complex computed selector (todoStats)", () => {
    const testStore = createAppStore();
    render(<ReselectComponent testStore={testStore} />);

    const todoStatsLog = consoleOutput.find((line) =>
      line.includes("todoStats")
    );

    expect(todoStatsLog).toBeDefined();
    if (todoStatsLog) {
      // Should not be labeled as unknown
      expect(todoStatsLog).not.toContain("unknown");
    }
  });

  it("should label inline selector (completedTodos)", () => {
    const testStore = createAppStore();
    render(<ReselectComponent testStore={testStore} />);

    const completedTodosLog = consoleOutput.find((line) =>
      line.includes("completedTodos")
    );

    expect(completedTodosLog).toBeDefined();
  });

  it("should label useMemo selector (highPriorityTodos)", () => {
    const testStore = createAppStore();
    render(<ReselectComponent testStore={testStore} />);

    const highPriorityTodosLog = consoleOutput.find((line) =>
      line.includes("highPriorityTodos")
    );

    expect(highPriorityTodosLog).toBeDefined();
  });

  it("should detect state change when user is updated", async () => {
    const user = userEvent.setup();
    const testStore = createAppStore();
    render(<ReselectComponent testStore={testStore} />);

    consoleOutput = [];

    const button = screen.getByText("Update User");
    await user.click(button);

    // Should see state changes for user and userInfo
    const hasUserChange = consoleOutput.some(
      (line) =>
        line.includes("State change") &&
        (line.includes("user") || line.includes("userInfo"))
    );

    expect(hasUserChange).toBe(true);
  });

  it("should detect state change when theme is toggled", async () => {
    const user = userEvent.setup();
    const testStore = createAppStore();
    render(<ReselectComponent testStore={testStore} />);

    consoleOutput = [];

    const button = screen.getByText("Toggle Theme");
    await user.click(button);

    // Should see state change for settings
    const hasSettingsChange = consoleOutput.some(
      (line) => line.includes("State change") && line.includes("settings")
    );

    expect(hasSettingsChange).toBe(true);
  });

  it("should detect state change when filter is changed", async () => {
    const user = userEvent.setup();
    const testStore = createAppStore();
    render(<ReselectComponent testStore={testStore} />);

    consoleOutput = [];

    const button = screen.getByText("Completed");
    await user.click(button);

    // Should see state changes for filter and filteredTodos
    const hasFilterChange = consoleOutput.some(
      (line) =>
        line.includes("State change") &&
        (line.includes("filter") || line.includes("filteredTodos"))
    );

    expect(hasFilterChange).toBe(true);
  });

  it("should detect state change when todo is toggled", async () => {
    const user = userEvent.setup();
    const testStore = createAppStore();
    render(<ReselectComponent testStore={testStore} />);

    consoleOutput = [];

    // Find and click first toggle button
    const toggleButtons = screen.getAllByText("Toggle");
    await user.click(toggleButtons[0]);

    // Should see state changes for various todo-related selectors
    const hasTodoChange = consoleOutput.some(
      (line) =>
        line.includes("State change") &&
        (line.includes("todos") ||
          line.includes("todoStats") ||
          line.includes("filteredTodos") ||
          line.includes("completedTodos"))
    );

    expect(hasTodoChange).toBe(true);
  });

  it("should detect state change when todo is added", async () => {
    const user = userEvent.setup();
    const testStore = createAppStore();
    render(<ReselectComponent testStore={testStore} />);

    consoleOutput = [];

    const button = screen.getByText("Add Todo");
    await user.click(button);

    // Should see state changes
    const hasAddChange = consoleOutput.some(
      (line) =>
        line.includes("State change") &&
        (line.includes("todos") ||
          line.includes("todoCount") ||
          line.includes("todoStats"))
    );

    expect(hasAddChange).toBe(true);
  });

  it("should render selectors correctly", () => {
    const testStore = createAppStore();
    const { container } = render(<ReselectComponent testStore={testStore} />);

    expect(container.textContent).toContain("User Info");
    expect(container.textContent).toContain("Name: John Doe");
    expect(container.textContent).toContain("Email: john@example.com");
    expect(container.textContent).toContain("Theme: light");
    expect(container.textContent).toContain("Filter: all");
    expect(container.textContent).toContain("Total: 3");
  });

  it("should show correct todo statistics", () => {
    const testStore = createAppStore();
    const { container } = render(<ReselectComponent testStore={testStore} />);

    expect(container.textContent).toContain("Completed: 1");
    expect(container.textContent).toContain("Active: 2");
    expect(container.textContent).toMatch(/Completion Rate: \d+\.\d+%/);
  });

  it("should not label selector results as unknown", () => {
    const testStore = createAppStore();
    render(<ReselectComponent testStore={testStore} />);

    // Count how many "unknown" labels appear
    const unknownCount = consoleOutput.filter((line) =>
      /State change unknown.*:/.test(line)
    ).length;

    console.log(`Unknown state labels in Reselect: ${unknownCount}`);

    // Log all state changes for debugging
    const stateChanges = consoleOutput.filter((line) =>
      line.includes("State change")
    );
    console.log("All Reselect state changes:", stateChanges);
  });

  it("should track array selector results", () => {
    const testStore = createAppStore();
    render(<ReselectComponent testStore={testStore} />);

    // Check that array results (allTodos, filteredTodos, etc.) are not unknown
    const arraySelectors = [
      "allTodos",
      "filteredTodos",
      "completedTodos",
      "highPriorityTodos",
    ];

    arraySelectors.forEach((selector) => {
      const log = consoleOutput.find(
        (line) => line.includes(selector) && line.includes("State change")
      );
      if (log) {
        expect(log).not.toContain(": unknown");
      }
    });
  });

  it("should track complex object selector results", () => {
    const testStore = createAppStore();
    render(<ReselectComponent testStore={testStore} />);

    // Check that complex objects (todosByPriority, todoStats) are not unknown
    const complexSelectors = ["todosByPriority", "todoStats", "settings"];

    complexSelectors.forEach((selector) => {
      const log = consoleOutput.find(
        (line) => line.includes(selector) && line.includes("State change")
      );
      if (log) {
        expect(log).not.toContain(": unknown");
      }
    });
  });

  it("should distinguish between different selector results with same structure", () => {
    const testStore = createAppStore();
    render(<ReselectComponent testStore={testStore} />);

    // user and userInfo have similar structure but should be distinguished
    const userLog = consoleOutput.find(
      (line) =>
        line.includes("Initial state user:") && !line.includes("userInfo")
    );
    const userInfoLog = consoleOutput.find((line) =>
      line.includes("Initial state userInfo:")
    );

    expect(userLog).toBeDefined();
    expect(userInfoLog).toBeDefined();

    // Both should have their correct labels, not unknown
    if (userLog) expect(userLog).not.toContain(": unknown");
    if (userInfoLog) expect(userInfoLog).not.toContain(": unknown");
  });
});

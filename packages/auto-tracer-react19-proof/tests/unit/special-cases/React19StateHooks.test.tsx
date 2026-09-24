import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, {
  startTransition,
  useActionState,
  useOptimistic,
  useState,
} from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useReactTracer } from "@autotracer/react19";

/**
 * Increments action state after form submission.
 *
 * @param previousCount Current action count.
 * @returns The incremented action count.
 */
function incrementActionCount(previousCount: number): number {
  return previousCount + 1;
}

/**
 * Applies an optimistic increment.
 *
 * @param currentCount Current optimistic count.
 * @param increment Amount to add.
 * @returns The optimistic count.
 */
function applyOptimisticIncrement(
  currentCount: number,
  increment: number,
): number {
  return currentCount + increment;
}

/**
 * Exercises React 19 state hooks through the public tracer API.
 *
 * @returns A test form and optimistic update control.
 */
function React19StateHooksComponent(): React.JSX.Element {
  const logger = useReactTracer();
  const [actionCount, dispatchAction, isPending] = useActionState(
    incrementActionCount,
    0,
  );
  const [count, setCount] = useState(0);
  const [optimisticCount, addOptimisticCount] = useOptimistic(
    count,
    applyOptimisticIncrement,
  );

  logger.labelState(
    0,
    "actionCount",
    actionCount,
    "dispatchAction",
    dispatchAction,
    "isPending",
    isPending,
  );
  logger.labelState(1, "count", count, "setCount", setCount);
  logger.labelState(
    2,
    "optimisticCount",
    optimisticCount,
    "addOptimisticCount",
    addOptimisticCount,
  );

  const incrementOptimistically = (): void => {
    startTransition(() => {
      addOptimisticCount(1);
      setCount((currentCount) => currentCount + 1);
    });
  };

  return (
    <div>
      <form action={dispatchAction}>
        <output>Action count: {actionCount}</output>
        <button type="submit">Increment action count</button>
      </form>
      <output>Optimistic count: {optimisticCount}</output>
      <button type="button" onClick={incrementOptimistically}>
        Increment optimistically
      </button>
    </div>
  );
}

describe("React 19 state hooks", () => {
  let consoleOutput: string[];
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

  it("labels useActionState through the generic hook-label contract", async () => {
    const user = userEvent.setup();
    render(<React19StateHooksComponent />);

    expect(
      consoleOutput.find((line) => line.includes("Initial state actionCount:")),
    ).toContain("0");
    expect(
      consoleOutput.find((line) =>
        line.includes("Initial state dispatchAction:"),
      ),
    ).toMatch(/\(fn:\d+\)/);
    expect(
      consoleOutput.find((line) => line.includes("Initial state isPending:")),
    ).toContain("false");

    consoleOutput = [];
    await user.click(screen.getByText("Increment action count"));

    expect(screen.getByText("Action count: 1")).toBeDefined();
    expect(
      consoleOutput.find((line) => line.includes("State change actionCount:")),
    ).toContain("0");
    expect(
      consoleOutput.find((line) => line.includes("State change actionCount:")),
    ).toContain("1");
  });

  it("labels useOptimistic through the generic hook-label contract", async () => {
    const user = userEvent.setup();
    render(<React19StateHooksComponent />);

    expect(
      consoleOutput.find((line) =>
        line.includes("Initial state optimisticCount:"),
      ),
    ).toContain("0");
    expect(
      consoleOutput.find((line) =>
        line.includes("Initial state addOptimisticCount:"),
      ),
    ).toMatch(/\(fn:\d+\)/);

    consoleOutput = [];
    await act(async () => {
      await user.click(screen.getByText("Increment optimistically"));
    });

    expect(screen.getByText("Optimistic count: 1")).toBeDefined();
    expect(
      consoleOutput.find((line) =>
        line.includes("State change optimisticCount:"),
      ),
    ).toContain("1");
  });
});

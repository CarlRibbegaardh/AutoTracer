import React from "react";
import { useReactTracer } from "@autotracer/react18";

/**
 * Hook that simulates Redux useSelector behavior.
 * Creates an internal unlabeled state that duplicates the returned value.
 */
function useSelectorSimulator<T>(selectFn: () => T) {
  const value = selectFn();
  // Simulate Redux's internal subscription state (unlabeled useState)
  // This creates a duplicate that won't be labeled by the user
  React.useState(value); // Internal state - intentionally unused

  return value;
}

/**
 * Component demonstrating duplicate value detection with .unknown suffix.
 * Special Case: Duplicate Hook Value Inference
 *
 * This component uses a hook that creates internal duplicate state
 * similar to Redux useSelector.
 * The tracer should detect that the unlabeled internal state is an exact
 * duplicate of a labeled value and suffix it with `.unknown`.
 *
 * Example:
 * - `const usersByDept = useSelectorSimulator(...)`
 * - Internal duplicate should be labeled: `usersByDept.unknown`
 */
export const DuplicateHookComponent: React.FC = () => {
  const logger = useReactTracer();

  // Simulate Redux selector that creates internal duplicate state
  const usersByDept = useSelectorSimulator(() => ({
    Engineering: ["Alice", "Bob"],
    Sales: ["Charlie"],
  }));

  // Label only the selector result, not the internal duplicate
  logger.labelState(0, "usersByDept", usersByDept);

  return (
    <div data-testid="duplicate-hook-test">
      <h3>Duplicate Hook Test</h3>
      <p>Users: {JSON.stringify(usersByDept)}</p>
    </div>
  );
};

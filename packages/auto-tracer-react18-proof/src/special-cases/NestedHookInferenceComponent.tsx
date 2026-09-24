import React from "react";
import { useReactTracer } from "@autotracer/react18";
import { useCustomValue } from "./useCustomValue";
import { useNestedCustom } from "./useNestedCustom";

/**
 * Component demonstrating nested hook label inference.
 * Special Case: Nested Hook Inference
 *
 * This component uses custom hooks that internally call useState.
 * The tracer should automatically infer that the unlabeled internal
 * useState values belong to the labeled custom hook objects.
 *
 * Example:
 * - `const customHookResult = useCustomValue("test")`
 * - Internal `useState("test")` should be inferred as `customHookResult.value`
 */

export const NestedHookInferenceComponent: React.FC = () => {
  const logger = useReactTracer();

  // Custom hook with internal useState
  const customHookResult = useCustomValue("pattern-custom");

  // Another custom hook to test multiple nested hooks
  const nestedHookResult = useNestedCustom("nested-custom");

  // A regular useState for comparison
  const [description, setDescription] = React.useState("initial");

  // Label the custom hook objects and the regular state
  logger.labelState(
    0,
    "customHookResult", customHookResult,
    "nestedHookResult", nestedHookResult,
    "description", description,
    "setDescription", setDescription
  );

  return (
    <div data-testid="nested-hook-inference-test">
      <h3>Nested Hook Inference Test</h3>
      <p>Description: {description}</p>
      <p>Custom: {customHookResult.value}</p>
      <p>Nested: {nestedHookResult.value}</p>

      <button onClick={() => setDescription("updated")}>
        Update Description
      </button>
      <button onClick={() => customHookResult.setValue("pattern-updated")}>
        Update Custom Hook
      </button>
      <button onClick={() => nestedHookResult.setValue("nested-updated")}>
        Update Nested Hook
      </button>
    </div>
  );
};

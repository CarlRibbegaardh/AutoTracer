import React, { useReducer } from "react";
import { useReactTracer } from "@autotracer/react18";
import { useCustomHook } from "./useCustomHook";
import { useNestedCustomHook } from "./useNestedCustomHook";

/**
 * Component demonstrating label hooks pattern behavior.
 * Tests custom hook container detection and .internal labeling.
 *
 * Special Case: Nested Hook Inference with Custom Hooks
 */
export const LabelHooksPatternComponent: React.FC = () => {
  const logger = useReactTracer();

  // useReducer
  const [counter, dispatchCounter] = useReducer(
    (state: number, action: string) => {
      return action === "add" ? state + 5 : state;
    },
    10
  );
  logger.labelState(0, "counter", counter, "dispatchCounter", dispatchCounter);

  // useCustomHook - object with methods (custom hook container)
  const customHookResult = useCustomHook("pattern-custom");
  logger.labelState(1, "customHookResult", customHookResult);

  // useCustomHook - destructured (individual properties)
  const { value, setValue } = useCustomHook("destructed-pattern-custom");
  logger.labelState(2, "value", value, "setValue", setValue);

  // useNestedCustomHook - nested custom hook
  const nestedHookResult = useNestedCustomHook();
  logger.labelState(3, "nestedHookResult", nestedHookResult);

  return (
    <div data-testid="label-hooks-pattern-test">
      <h3>LabelHooksPattern Test Component</h3>
      <p>Counter: {counter}</p>
      <p>Custom Hook: {customHookResult.value}</p>
      <p>Destructured: {value}</p>
      <p>Nested Hook: {nestedHookResult.value}</p>

      <button onClick={() => dispatchCounter("add")}>Add to Counter</button>
      <button onClick={() => customHookResult.setValue("pattern-updated")}>
        Update Custom Hook
      </button>
      <button onClick={() => setValue("destructed-updated")}>
        Update Destructured
      </button>
      <button onClick={() => nestedHookResult.setValue("nested-updated")}>
        Update Nested Hook
      </button>
    </div>
  );
};

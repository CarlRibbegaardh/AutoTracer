import { useState } from "react";

/**
 * Custom hook for testing nested hook inference.
 * Special Case: Nested Hook Inference
 */

export interface UseCustomValueReturn {
  value: string;
  setValue: (newValue: string) => void;
}

/**
 * A custom hook that internally uses useState.
 * The internal state should be inferred as belonging to the parent object.
 *
 * When labeled as `customHookResult`, the internal `value` should be
 * automatically inferred as `customHookResult.value`.
 */
export const useCustomValue = (initialValue: string): UseCustomValueReturn => {
  const [value, setValue] = useState(initialValue);

  return { value, setValue };
};

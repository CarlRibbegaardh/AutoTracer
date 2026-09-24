import { useState } from "react";

/**
 * Another custom hook for testing nested hook inference.
 * Special Case: Nested Hook Inference
 */

export interface UseNestedCustomReturn {
  value: string;
  setValue: (newValue: string) => void;
}

/**
 * A second custom hook to test multiple nested hooks in one component.
 * Similar to useCustomValue but separate to test multiple inferences.
 */
export const useNestedCustom = (initialValue: string): UseNestedCustomReturn => {
  const [value, setValue] = useState(initialValue);

  return { value, setValue };
};

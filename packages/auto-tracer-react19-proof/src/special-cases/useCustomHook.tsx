import { useState } from "react";

/**
 * Simple custom hook with useState.
 * Returns an object with value and setValue.
 */
export function useCustomHook(initialValue: string = "custom-initial") {
  const [value, setValue] = useState(initialValue);
  return { value, setValue };
}

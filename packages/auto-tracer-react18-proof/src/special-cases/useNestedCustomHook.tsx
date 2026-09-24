import { useCustomHook } from "./useCustomHook";

/**
 * Nested custom hook that uses another custom hook inside.
 * Demonstrates hook composition.
 */
export function useNestedCustomHook() {
  const inner = useCustomHook("nested-custom");

  return {
    value: inner.value,
    setValue: inner.setValue,
  };
}

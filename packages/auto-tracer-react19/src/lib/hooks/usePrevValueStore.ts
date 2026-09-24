/**
 * @file Hook for storing previous hook values across renders.
 */

import { useRef } from "react";

/**
 * Store interface for previous values.
 */
export interface PrevValueStore {
  /**
   * Gets the previous value for a hook.
   *
   * @param index - Build-time ordinal position
   * @param label - Friendly name for the hook
   * @returns Previous value or undefined if not found
   */
  get(index: number, label: string): unknown;

  /**
   * Sets the current value as previous for next render.
   *
   * @param index - Build-time ordinal position
   * @param label - Friendly name for the hook
   * @param value - Current value to store
   */
  set(index: number, label: string, value: unknown): void;
}

/**
 * Creates a stable store for previous hook values.
 * Uses a ref to persist values across renders.
 *
 * @returns A store interface for getting/setting previous values
 */
export function usePrevValueStore(): PrevValueStore {
  const storeRef = useRef<Map<string, unknown>>(new Map());

  return {
    get: (index: number, label: string): unknown => {
      const key = `${index}-${label}`;
      return storeRef.current.get(key);
    },
    set: (index: number, label: string, value: unknown): void => {
      const key = `${index}-${label}`;
      storeRef.current.set(key, value);
    },
  };
}

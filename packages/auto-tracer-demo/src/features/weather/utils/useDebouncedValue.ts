import { useEffect, useState } from "react";

/**
 * Delays publishing a changing value until the caller has paused updates.
 *
 * @param value - Value waiting to be published
 * @param delayMilliseconds - Quiet period before publishing the value
 * @returns Most recently published value
 */
export const useDebouncedValue = <Value>(
  value: Value,
  delayMilliseconds: number,
): Value => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setDebouncedValue(value),
      delayMilliseconds,
    );

    return () => window.clearTimeout(timeoutId);
  }, [delayMilliseconds, value]);

  return debouncedValue;
};

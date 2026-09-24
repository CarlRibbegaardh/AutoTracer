import type { PragmaResult } from "@autotracer/filter-utils";

/**
 * Merges two {@link PragmaResult} values using logical OR for each flag.
 *
 * @param a - The first pragma result.
 * @param b - The second pragma result.
 * @returns A new {@link PragmaResult} with each flag set if either input has it set.
 */
export const merge = (a: PragmaResult, b: PragmaResult): PragmaResult => ({
  hasTrace: a.hasTrace || b.hasTrace,
  hasDisable: a.hasDisable || b.hasDisable,
});

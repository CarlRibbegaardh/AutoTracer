import type { PragmaResult } from "@autotracer/filter-utils";

/** Empty pragma result used as accumulator seed. */
export const EMPTY: PragmaResult = { hasTrace: false, hasDisable: false } as const;

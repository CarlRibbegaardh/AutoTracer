import type babelFlowDefault from "@autotracer/plugin-babel-flow";
import type { normalizeConfig, shouldProcessFile } from "@autotracer/plugin-babel-flow";

/**
 * Typed shape of the CJS-loaded `@autotracer/plugin-babel-flow` module.
 *
 * All members are derived via `typeof` from the package's named and default
 * exports, so this type stays in sync automatically when signatures change.
 *
 * Used only as a cast target for the `require()` return value in `index.ts`.
 */
export type BabelFlowModule = {
  /** The default export: the Babel plugin function. */
  readonly default: typeof babelFlowDefault;
  /** Normalizes partial config into a full config with defaults applied. */
  readonly normalizeConfig: typeof normalizeConfig;
  /** Checks if a file should be processed based on include/exclude patterns. */
  readonly shouldProcessFile: typeof shouldProcessFile;
};

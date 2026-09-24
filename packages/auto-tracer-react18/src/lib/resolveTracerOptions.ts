import type { ReactTracerOptions } from "./interfaces/ReactTracerOptions.js";
import type { ReactTracerInternalOptions } from "./types/ReactTracerInternalOptions.js";
import merge from "deepmerge";
import { mergeThemes } from "./functions/theme/index.js";
import { validateReactTracerOptions } from "./functions/validateOptions.js";
import { deepMergeOptions } from "./functions/deepMerge.js";

/**
 * Result of resolving tracer options.
 */
export type ResolvedTracerOptions = {
  /** Validated (but not yet merged) options, used for downstream side-effects such as outputMode. */
  readonly validatedOptions: ReactTracerOptions;
  /** Fully merged options ready for use as the new currentOptions. */
  readonly mergedOptions: ReactTracerInternalOptions;
};

/**
 * Resolves the final tracer options from raw user input.
 *
 * Applies the enabledOnLoad override (first-init only), merges the global
 * theme injection point, validates, and deep-merges with current options.
 *
 * Pure except for reading `globalThis.__REACTTRACER_THEME__` (global injection point).
 *
 * @param options - Raw user-provided options
 * @param enabledOnLoadOverride - Storage-persisted enabled-on-load value, or null if not applicable
 * @param currentOptions - The existing internal options to merge into
 * @returns Validated and merged options
 */
export function resolveTracerOptions(
  options: ReactTracerOptions,
  enabledOnLoadOverride: boolean | null,
  currentOptions: ReactTracerInternalOptions,
): ResolvedTracerOptions {
  const optionsWithAutoStart: ReactTracerOptions =
    enabledOnLoadOverride !== null
      ? { ...options, enabled: enabledOnLoadOverride }
      : options;

  const themeFromFiles = globalThis.__REACTTRACER_THEME__ ?? {};

  const mergedThemeInput = merge(
    optionsWithAutoStart.colors ?? {},
    themeFromFiles,
    {
      arrayMerge: (_target, source) => {
        return source;
      },
    },
  );

  const mergedTheme = mergeThemes(mergedThemeInput);

  const optionsWithTheme: ReactTracerOptions = {
    ...optionsWithAutoStart,
    colors: mergedTheme,
  };

  const validatedOptions = validateReactTracerOptions(optionsWithTheme);
  const mergedOptions = deepMergeOptions(currentOptions, validatedOptions);

  return { validatedOptions, mergedOptions };
}

/**
 * Options that control how the Auto Tracer code transform behaves.
 *
 * Limitations
 * -----------
 * This transformer instruments React function components by injecting hook calls.
 * React class components are not instrumented.
 *
 * These options are forwarded by the Vite plugin, so they can be configured
 * directly in your `vite.config.ts` inside the `reactTracer.vite({...})` call.
 *
 * @example
 * import { defineConfig } from 'vite';
 * import react from '@vitejs/plugin-react';
 * import { reactTracer } from '@autotracer/plugin-vite-react19';
 *
 * export default defineConfig(({ mode }) => ({
 *   plugins: [
 *     reactTracer.vite({
 *       inject: mode === 'development',
 *       mode: 'opt-out',
 *       importSource: '@autotracer/react19',
 *       include: {
 *         paths: ['src/**\/*.tsx'],
 *         components: ['App', 'UserProfile']
 *       },
 *       exclude: {
 *         paths: ['**\/*.spec.*', '**\/*.test.*'],
 *         components: [/^Internal/, 'DebugComponent']
 *       },
 *       labelHooks: ['useState', 'useReducer', 'useSelector'],
 *       labelHooksPattern: '^use[A-Z].*',
 *     }),
 *     react(),
 *   ],
 * }));
 */
export interface TransformConfig {
  /**
   * Controls how components are selected for injection.
   *
   * - `opt-in`: Only files/components matching `include` (and not matching `exclude`) are transformed.
   * - `opt-out`: All files/components are eligible except those matching `exclude`.
   *
   * **Default**: `"opt-out"` - Most projects want broad coverage by default.
   *
   * Pragmas (compile-time attributes) and precedence
   * -----------------------------------------------
   * The transformer honors function-level pragma comments to override behavior per component.
   *
   * - In `opt-in`, files must still match `include.paths`; pragmas enable
   *   tracing for specific components within included files.
   * - In `opt-out`, a pragma can disable tracing for specific components
   *   even though the file would otherwise be included.
   * - A "disable" pragma wins over an "enable" pragma when both apply.
   * - `include`/`exclude` component filters are evaluated before pragmas.
   *   `@trace` only operates within the eligible set and cannot override an
   *   include miss or explicit exclude match.
   * - `@trace-disable` is the highest-precedence skip within the eligible set.
   *
   * Examples:
   * ```tsx
   * // Disable specific component in opt-out mode
   * // @trace-disable
   * export function MyComponent() { … }
   *
   * // Enable specific component in opt-in mode
   * // @trace
   * export function AnotherComponent() { … }
   *
   * // Component without pragma follows mode default
   * export const ThirdComponent = function() { … };
   * ```
   *
   * @example
   * // Use opt-in during initial adoption for careful rollout
   * mode: 'opt-in'
   *
   * @example
   * // Use opt-out (default) for broad coverage
   * mode: 'opt-out'
   */
  mode: "opt-in" | "opt-out";
  /**
   * Include filters for files and components.
   *
   * - `paths`: Glob patterns of files to include in the transform.
   * - `components`: Component names or patterns to include (glob, regex, or exact strings).
   *
   * In `opt-out` mode (default), `paths` acts as an additional filter on top of excluding patterns.
   * In `opt-in` mode, only files matching these patterns (and not excluded) are transformed.
   *
   * Component filters allow fine-grained control over which components within a file are instrumented.
   * Glob patterns (e.g., "User*"), regex (e.g., /^Internal/), and exact strings (e.g., "App") are supported.
   *
   * Uses Vite/rollup-style globs relative to the project root.
   *
   * **Deep merge behavior**: Providing only one property (e.g., just `components`) will keep
   * the defaults for the other property (e.g., `paths`). To override defaults completely, specify both.
   *
   * **Default paths**: `["**\/*.tsx", "**\/*.jsx"]` - All React files in the project
   * **Default components**: `[]` - All components (no filtering)
   *
   * @example
   * include: {
   *   paths: ['src/**\/*.tsx', 'components/**\/*.tsx'],
   *   components: ['App', 'UserProfile', /^Dashboard/]
   * }
   */
  include?: {
    paths?: string[];
    components?: Array<string | RegExp>;
  };
  /**
   * Exclude filters for files and components.
   *
   * - `paths`: Glob patterns of files to exclude from the transform.
   * - `components`: Component names or patterns to exclude (glob, regex, or exact strings).
   *
   * This is applied in both modes, and is particularly useful to skip tests,
   * stories, or build artifacts.
   *
   * Component filters allow fine-grained control over which components within a file are NOT instrumented.
   * Glob patterns (e.g., "Test*"), regex (e.g., /^Internal/), and exact strings (e.g., "Debug") are supported.
   *
   * **Deep merge behavior**: Providing only one property (e.g., just `components`) will keep
   * the defaults for the other property (e.g., `paths`). To override defaults completely, specify both.
   *
   * **Default paths**: Excludes tests, test folders, node_modules, and build outputs
   * ```
   * ["**\/*.test.*", "**\/*.spec.*", "**\/tests\/**", "**\/test\/**",
   *  "**\/__tests__\/**", "**\/node_modules\/**", "**\/dist\/**",
   *  "**\/build\/**", "**\/.next\/**", "**\/coverage\/**"]
   * ```
   * **Default components**: `[]` - No components excluded
   *
   * @example
   * // Add component exclusions while keeping default path exclusions
   * exclude: {
   *   components: [/^Internal/, 'DebugComponent']
   * }
   *
   * @example
   * // Override both paths and components
   * exclude: {
   *   paths: ['**\/*.spec.*', '**\/*.test.*', 'src/mocks/**'],
   *   components: [/^Internal/, 'DebugComponent']
   * }
   */
  exclude?: {
    paths?: string[];
    components?: Array<string | RegExp>;
  };
  /**
   * Enable React Server Components (RSC) safety checks.
   *
   * When enabled, the transformer only injects tracing into modules that
   * contain the `"use client";` directive. Files without this directive
   * are left unchanged to avoid injecting client-only hooks into server code.
   *
   * Enable this in RSC-aware toolchains (e.g., Next.js App Router) to prevent
   * accidental client code injection in server components.
   *
   * When disabled, the transformer proceeds based on `mode`, `include`, `exclude`,
   * and pragmas without checking for client directives.
   *
   * @default false
   *
   * @example
   * serverComponents: true // For Next.js App Router or other RSC frameworks
   */
  serverComponents?: boolean;
  /**
   * The module specifier to import runtime helpers from.
   *
   * This determines where the injected `useReactTracer` and `labelState`
   * imports come from. Use this to redirect imports to a custom wrapper
   * or alternative implementation.
   *
  * @default '@autotracer/react19'
   *
   * @example
  * importSource: '@autotracer/react19' // Default
   *
   * @example
   * importSource: '@my-company/custom-tracer' // Custom wrapper
   */
  importSource?: string;
  /**
   * Names of hooks that should be automatically labeled.
   *
   * These hook names are always labeled regardless of the pattern.
   * Useful for explicitly specifying specific hooks you want to track.
   *
   * **Default**: `[]` - Rely on `labelHooksPattern` instead
   *
   * @example
   * labelHooks: ['useState', 'useReducer', 'useSelector']
   */
  labelHooks?: string[];
  /**
   * Optional regex pattern (as a string) to match additional hook names to label.
   *
   * The pattern is used to create a JavaScript RegExp. Provide just the pattern itself,
   * NOT the regex literal delimiters. The transform will automatically strip any
   * accidentally included delimiters for convenience.
   *
   * **Default**: `"^use[A-Z].*"` - Matches all custom hooks (e.g., useMyHook, useCustomState)
   *
   * Common patterns:
   * - `^use[A-Z].*` - Matches all hooks starting with "use" followed by uppercase letter (default)
   * - `^use(Selector|Dispatch)$` - Matches specific hook names
   * - `Custom$` - Matches hooks ending with "Custom"
   * - `""` (empty string) - Disables pattern matching, only `labelHooks` are labeled
   *
   * @example
   * // CORRECT - just the pattern
   * labelHooksPattern: '^use[A-Z].*'
   *
   * @example
   * // Also works - delimiters auto-stripped if included by mistake
   * labelHooksPattern: '&#47;^use[A-Z].*&#47;'
   */
  labelHooksPattern?: string;
}

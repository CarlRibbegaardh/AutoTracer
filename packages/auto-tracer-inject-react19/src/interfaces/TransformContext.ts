import type { TransformConfig } from "./TransformConfig.js";

/**
 * Transformation context containing filename and configuration.
 * Config must be normalized via normalizeConfig() before passing to transform().
 */
export interface TransformContext {
  /** Source file path. */
  filename: string;
  /** Fully-normalized transform configuration. */
  config: Required<TransformConfig>;
  /**
   * Optional prefix prepended to every injected component name, separated by
   * a colon (e.g. `"Header"` → `"Header:MyComponent"`).
   *
   * Use this when multiple independent React entry-points (micro-frontends,
   * React islands) share a single browser tab so that log entries identify
   * which island a component belongs to.
   *
   * An empty string or `undefined` disables prefixing.
   */
  prefix?: string;
}

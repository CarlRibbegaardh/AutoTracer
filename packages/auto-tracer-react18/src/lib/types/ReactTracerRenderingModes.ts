/**
 * Internal rendering-mode knobs used to implement `outputMode`.
 *
 * These settings are intentionally not part of the public `ReactTracerOptions` API.
 */
export type ReactTracerRenderingModes = {
  /**
   * Controls how the component tree structure is emitted.
   */
  treeRenderingMode?: "lineart" | "group";

  /**
   * Controls how values (props/state/logs) are emitted.
   */
  valueRenderingMode?: "serialized" | "as-is";
};

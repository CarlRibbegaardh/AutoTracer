/**
 * Rendering options passed to node detail rendering functions.
 * Explicit alternative to reading from global state.
 */
export interface RenderOptions {
  /**
   * Value rendering mode.
   *
   * - "serialized": Values are formatted for copy/paste (strings and snapshots).
   * - "as-is": Values are logged as native JS values for DevTools inspection.
   */
  readonly valueRenderingMode: "serialized" | "as-is";

  /**
   * Whether to detect and warn about identical value changes.
   * When true, shows warnings for new references with identical content.
   */
  readonly detectIdenticalValueChanges: boolean;

  /**
   * Indentation prefix for output lines.
   * Empty string for console-group renderer.
   */
  readonly prefix: string;

  /**
   * Component display name for filtering skipped props.
   */
  readonly displayName?: string;
}

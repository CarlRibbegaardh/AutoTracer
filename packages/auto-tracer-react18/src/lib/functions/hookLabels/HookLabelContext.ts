/**
 * Context for resolving hook labels.
 * Groups related anchor and component information.
 */
export interface HookLabelContext {
  /**
   * Component GUID for label lookup.
   */
  readonly guid: string;

  /**
   * All stateful hooks in the fiber (labeled + unlabeled).
   */
  readonly allAnchors: Array<{ index: number; value: unknown }>;
}

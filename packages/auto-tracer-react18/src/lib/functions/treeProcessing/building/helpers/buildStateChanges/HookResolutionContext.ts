import type { Hook } from "../../../../hookMapping/types.js";
import type { AnchorEntry } from "../getHookAnchors.js";

/**
 * Context for resolving hook labels during state change building.
 * Groups related anchor and tracking information.
 */
export interface HookResolutionContext {
  /**
   * Ordered list of stateful hook anchors from the fiber.
   */
  readonly anchors: readonly Hook[];

  /**
   * Anchor index/value pairs for label resolution.
   */
  readonly allAnchors: AnchorEntry[];

  /**
   * Tracking GUID if component is tracked, otherwise null.
   */
  readonly trackingGUID: string | null;
}

import type { ExitHandle } from "./ExitHandle.js";

/**
 * Extended exit handle for styled enter/exit operations.
 * Returned by enterStyled() to provide both the original raw label
 * and the styled label for re-styling on exit.
 *
 * @remarks
 * Use with enterStyled() and exitStyled() when you need full control
 * over message styling while preserving the original unthemed label.
 *
 * @example
 * ```typescript
 * const handle = logger.enterStyled("myFunction", "%c→ myFunction", "color: blue");
 * // handle.rawLabel = "myFunction"
 * // handle.label = "%c→ myFunction"
 *
 * logger.exitStyled(handle, "%c← myFunction", "color: green");
 * ```
 */
export interface StyledExitHandle extends ExitHandle {
  /** Original unthemed label provided to enterStyled() */
  readonly rawLabel: string;
}

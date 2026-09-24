/**
 * Internal ReactTracer option shape that includes internal rendering-mode knobs.
 *
 * This type is used for internal state, mapping, and rendering.
 * It must not be exported from the public package surface.
 */
import type { ReactTracerOptions } from "../interfaces/ReactTracerOptions.js";
import type { ReactTracerRenderingModes } from "./ReactTracerRenderingModes.js";

/**
 * Internal options used by the runtime implementation.
 */
export type ReactTracerInternalOptions = ReactTracerOptions & ReactTracerRenderingModes;

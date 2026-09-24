import type { TransformConfig } from "../../interfaces/TransformConfig.js";
import { shouldProcessFile as shouldProcessFileBase } from "@autotracer/filter-utils";

/**
 * shouldProcessFile
 *
 * Applies include/exclude logic to determine whether a file should be transformed.
 * Delegates to shared filter-utils implementation.
 * Exclude patterns are evaluated first, then include patterns must match.
 */
export function shouldProcessFile(
  filepath: string,
  config: Required<TransformConfig>
): boolean {
  return shouldProcessFileBase(filepath, config.include, config.exclude);
}

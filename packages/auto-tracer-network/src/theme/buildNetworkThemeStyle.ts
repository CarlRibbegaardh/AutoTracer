import type { NetworkThemeOptions } from "./NetworkThemeOptions.js";

/**
 * Builds a console CSS declaration from Network theme options.
 *
 * @param options - Semantic theme options.
 * @returns CSS declarations in repository theme-option order.
 */
export function buildNetworkThemeStyle(options: NetworkThemeOptions): string {
  const declarations: string[] = [];

  if (options.text !== undefined) declarations.push(`color: ${options.text}`);
  if (options.background !== undefined) {
    declarations.push(`background: ${options.background}`);
  }
  if (options.bold === true) declarations.push("font-weight: bold");
  if (options.italic === true) declarations.push("font-style: italic");

  return declarations.join("; ");
}

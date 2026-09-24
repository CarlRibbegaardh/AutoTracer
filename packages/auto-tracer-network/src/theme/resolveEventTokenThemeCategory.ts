import type { EventToken } from "../events/EventToken.js";
import { isHttpErrorStatus } from "../outcomes/isHttpErrorStatus.js";
import type { NetworkThemeCategory } from "./NetworkThemeCategory.js";

/**
 * Resolves an event token to its optional Network theme category.
 *
 * @param token - Renderer-neutral event token.
 * @returns The semantic theme category, or undefined for inherited styling.
 */
export function resolveEventTokenThemeCategory(
  token: EventToken,
): NetworkThemeCategory | undefined {
  if (token.role === "status") {
    return isHttpErrorStatus(Number(token.text)) ? "error" : undefined;
  }

  const categories: Partial<
    Readonly<Record<EventToken["role"], NetworkThemeCategory>>
  > = {
    identity: "identity",
    method: "method",
    label: "detailLabel",
    outcome: "error",
    redirect: "redirect",
    unavailable: "error",
    "runtime-control": "runtimeControl",
  };

  return categories[token.role];
}

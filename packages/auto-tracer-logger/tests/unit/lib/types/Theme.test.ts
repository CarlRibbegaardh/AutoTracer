import { describe, expect, it } from "vitest";
import type { Theme } from "@src/lib/types/Theme";

/** @internal */
type ExpectFalse<T extends false> = T;

/** @internal */
type ThemeHasGroupMode = "groupMode" extends keyof Theme ? true : false;

/** @internal */
type _ThemeMustNotExposeGroupingControls = ExpectFalse<ThemeHasGroupMode>;

describe("Theme invariants", () => {
  it("does not expose grouping controls", () => {
    expect(true).toBe(true);
  });
});

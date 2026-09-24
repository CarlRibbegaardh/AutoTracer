import { describe, expect, it } from "vitest";
import { buildNetworkThemeStyle } from "../../../src/theme/buildNetworkThemeStyle";

describe("buildNetworkThemeStyle", () => {
  it("[NET-OUTPUT-007..008] builds CSS in the repository theme-option order", () => {
    expect(
      buildNetworkThemeStyle({
        text: "#112233",
        background: "#f0f0f0",
        bold: true,
        italic: true,
      }),
    ).toBe(
      "color: #112233; background: #f0f0f0; font-weight: bold; font-style: italic",
    );
  });

  it("[NET-OUTPUT-007..008] omits disabled and unavailable options", () => {
    expect(buildNetworkThemeStyle({ bold: false, italic: false })).toBe("");
  });
});

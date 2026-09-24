import { describe, expect, it } from "vitest";
import { defaultNetworkTheme } from "../../../src/theme/defaultNetworkTheme";
import { resolveNetworkTheme } from "../../../src/theme/resolveNetworkTheme";

describe("resolveNetworkTheme", () => {
  it("[NET-OUTPUT-007..008] returns the complete default theme without overrides", () => {
    expect(resolveNetworkTheme()).toEqual(defaultNetworkTheme);
  });

  it("[NET-OUTPUT-007..008] merges base, mode, then programmatic overrides deeply", () => {
    const baseTheme = {
      identity: {
        lightMode: { text: "base-light", italic: true },
        darkMode: { text: "base-dark" },
      },
    };
    const modeTheme = {
      identity: {
        lightMode: { text: "mode-light" },
      },
      method: {
        darkMode: { background: "mode-dark-background" },
      },
    };
    const programmaticTheme = {
      identity: {
        lightMode: { text: "programmatic-light" },
      },
    };

    expect(
      resolveNetworkTheme(baseTheme, modeTheme, programmaticTheme),
    ).toEqual({
      ...defaultNetworkTheme,
      identity: {
        lightMode: {
          text: "programmatic-light",
          bold: true,
          italic: true,
        },
        darkMode: { text: "base-dark", bold: true },
      },
      method: {
        lightMode: defaultNetworkTheme.method.lightMode,
        darkMode: {
          text: defaultNetworkTheme.method.darkMode.text,
          background: "mode-dark-background",
        },
      },
    });
  });

  it("[NET-OUTPUT-007..008] does not mutate override objects", () => {
    const baseTheme = Object.freeze({
      error: Object.freeze({
        darkMode: Object.freeze({ text: "custom-error" }),
      }),
    });

    resolveNetworkTheme(baseTheme);

    expect(baseTheme).toEqual({
      error: { darkMode: { text: "custom-error" } },
    });
  });
});

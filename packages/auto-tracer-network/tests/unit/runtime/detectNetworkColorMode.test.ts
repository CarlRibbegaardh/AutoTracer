import { describe, expect, it, vi } from "vitest";
import { detectNetworkColorMode } from "../../../src/runtime/detectNetworkColorMode";

describe("detectNetworkColorMode", () => {
  it("[NET-OUTPUT-007] reads the browser dark-mode preference", () => {
    const matchMedia = vi.fn(() => ({ matches: true }));

    expect(detectNetworkColorMode({ matchMedia })).toBe("dark");
    expect(matchMedia).toHaveBeenCalledExactlyOnceWith(
      "(prefers-color-scheme: dark)",
    );

    expect(
      detectNetworkColorMode({ matchMedia: () => ({ matches: false }) }),
    ).toBe("light");
  });

  it("[NET-OUTPUT-007] defaults to light when media matching is unavailable or fails", () => {
    expect(detectNetworkColorMode({})).toBe("light");
    expect(
      detectNetworkColorMode({
        matchMedia: () => {
          throw new Error("unavailable");
        },
      }),
    ).toBe("light");
  });
});

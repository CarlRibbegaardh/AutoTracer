import { defaultNetworkTheme } from "./defaultNetworkTheme.js";
import type { NetworkThemeConfig } from "./NetworkThemeConfig.js";
import type { NetworkThemeOverride } from "./NetworkThemeOverride.js";

/**
 * Resolves a complete Network theme from ordered immutable override layers.
 *
 * @param baseTheme - Base theme-file overrides.
 * @param modeTheme - Light or dark theme-file overrides.
 * @param programmaticTheme - Final programmatic overrides.
 * @returns A complete detached Network theme.
 */
export function resolveNetworkTheme(
  baseTheme?: NetworkThemeOverride,
  modeTheme?: NetworkThemeOverride,
  programmaticTheme?: NetworkThemeOverride,
): NetworkThemeConfig {
  return {
    identity: {
      lightMode: {
        ...defaultNetworkTheme.identity.lightMode,
        ...baseTheme?.identity?.lightMode,
        ...modeTheme?.identity?.lightMode,
        ...programmaticTheme?.identity?.lightMode,
      },
      darkMode: {
        ...defaultNetworkTheme.identity.darkMode,
        ...baseTheme?.identity?.darkMode,
        ...modeTheme?.identity?.darkMode,
        ...programmaticTheme?.identity?.darkMode,
      },
    },
    method: {
      lightMode: {
        ...defaultNetworkTheme.method.lightMode,
        ...baseTheme?.method?.lightMode,
        ...modeTheme?.method?.lightMode,
        ...programmaticTheme?.method?.lightMode,
      },
      darkMode: {
        ...defaultNetworkTheme.method.darkMode,
        ...baseTheme?.method?.darkMode,
        ...modeTheme?.method?.darkMode,
        ...programmaticTheme?.method?.darkMode,
      },
    },
    detailLabel: {
      lightMode: {
        ...defaultNetworkTheme.detailLabel.lightMode,
        ...baseTheme?.detailLabel?.lightMode,
        ...modeTheme?.detailLabel?.lightMode,
        ...programmaticTheme?.detailLabel?.lightMode,
      },
      darkMode: {
        ...defaultNetworkTheme.detailLabel.darkMode,
        ...baseTheme?.detailLabel?.darkMode,
        ...modeTheme?.detailLabel?.darkMode,
        ...programmaticTheme?.detailLabel?.darkMode,
      },
    },
    error: {
      lightMode: {
        ...defaultNetworkTheme.error.lightMode,
        ...baseTheme?.error?.lightMode,
        ...modeTheme?.error?.lightMode,
        ...programmaticTheme?.error?.lightMode,
      },
      darkMode: {
        ...defaultNetworkTheme.error.darkMode,
        ...baseTheme?.error?.darkMode,
        ...modeTheme?.error?.darkMode,
        ...programmaticTheme?.error?.darkMode,
      },
    },
    redirect: {
      lightMode: {
        ...defaultNetworkTheme.redirect.lightMode,
        ...baseTheme?.redirect?.lightMode,
        ...modeTheme?.redirect?.lightMode,
        ...programmaticTheme?.redirect?.lightMode,
      },
      darkMode: {
        ...defaultNetworkTheme.redirect.darkMode,
        ...baseTheme?.redirect?.darkMode,
        ...modeTheme?.redirect?.darkMode,
        ...programmaticTheme?.redirect?.darkMode,
      },
    },
    runtimeControl: {
      lightMode: {
        ...defaultNetworkTheme.runtimeControl.lightMode,
        ...baseTheme?.runtimeControl?.lightMode,
        ...modeTheme?.runtimeControl?.lightMode,
        ...programmaticTheme?.runtimeControl?.lightMode,
      },
      darkMode: {
        ...defaultNetworkTheme.runtimeControl.darkMode,
        ...baseTheme?.runtimeControl?.darkMode,
        ...modeTheme?.runtimeControl?.darkMode,
        ...programmaticTheme?.runtimeControl?.darkMode,
      },
    },
  };
}

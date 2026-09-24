import type { TransformConfig } from "../../interfaces/TransformConfig.js";

/**
 * DEFAULT_CONFIG
 *
 * The default, normalized configuration used by the transform when no user configuration is supplied.
 * Keep this as the single source of truth for default values.
 */
export const DEFAULT_CONFIG: Required<TransformConfig> = {
  mode: "opt-out",
  include: {
    paths: ["**/*.{tsx,jsx}"],
    components: [],
  },
  exclude: {
    paths: [
      "**/*.test.*",
      "**/*.spec.*",
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/coverage/**",
      "**/tests/**",
      "**/test/**",
      "**/__tests__/**",
    ],
    components: [],
  },
  serverComponents: false,
  importSource: "@autotracer/react19",
  labelHooks: [],
  labelHooksPattern: "^use[A-Z].*",
};

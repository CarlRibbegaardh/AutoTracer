import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/coverage/**"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{js,ts,jsx,tsx}"],
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/coverage/**",
        "**/tests/**",
        "**/*.test.*",
        "**/*.spec.*",
        "**/vitest.config.*",
        "**/tsconfig.*",
      ],
      reporter: ["html", "text", "json-summary", "text-summary"],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});

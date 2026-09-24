import { type ConfigEnv, ViteUserConfig, defineConfig } from "vitest/config";

// https://vitest.dev/guide/#configuring-vitest
const config = defineConfig(({ command, mode }: ConfigEnv): ViteUserConfig => {
  console.log("command:", command);
  console.log("mode:", mode);

  const result: ViteUserConfig = {
    resolve: {
      alias: {
        "@src": new URL("./src", import.meta.url).pathname,
        "@tests": new URL("./tests", import.meta.url).pathname,
      },
    },
    test: {
      globals: true,
      include: ["tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
      exclude: ["**/node_modules/**", "**/dist/**", "**/coverage/**"],
      environment: "jsdom",
      setupFiles: ["./tests/setup.ts"],
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
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100,
          },
        },
      },
      reporters: ["default"],
      outputFile: { junit: "test/junit.xml" },
    },
  };
  return result;
});

// eslint-disable-next-line import/no-default-export
export default config;

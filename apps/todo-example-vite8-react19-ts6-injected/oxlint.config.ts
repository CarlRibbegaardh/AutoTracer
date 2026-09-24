import { defineConfig } from "oxlint";

export default defineConfig({
  categories: {
    correctness: "error",
  },
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  ignorePatterns: ["dist", "node_modules", "playwright-report", "test-results"],
  plugins: ["eslint", "typescript", "react"],
  rules: {
    "react/rules-of-hooks": "error",
    "react/exhaustive-deps": "warn",
    "react/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "typescript/no-explicit-any": "error",
  },
});

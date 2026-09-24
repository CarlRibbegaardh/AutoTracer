import { defineConfig } from "oxlint";

export default defineConfig({
  categories: {
    correctness: "error",
  },
  env: {
    browser: true,
    es2022: true,
    vitest: true,
  },
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  plugins: ["eslint", "typescript", "react"],
  rules: {
    "react/rules-of-hooks": "error",
    "react/exhaustive-deps": "warn",
    "react/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "typescript/no-explicit-any": "off",
  },
});

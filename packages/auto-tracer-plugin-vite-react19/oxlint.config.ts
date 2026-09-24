import { defineConfig } from "oxlint";

export default defineConfig({
  categories: {
    correctness: "error",
  },
  env: {
    node: true,
    vitest: true,
  },
  plugins: ["eslint", "typescript", "vitest"],
  rules: {
    "typescript/no-explicit-any": "off",
    "vitest/require-mock-type-parameters": "off",
  },
});

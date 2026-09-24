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
  },
  overrides: [
    {
      files: [
        "tests/functions/transform.anonymous-edge-cases.test.ts",
        "tests/functions/transform.self-validation-vulnerability.test.ts",
        "tests/manifestDoesNotDependOnFilterUtils.test.ts",
      ],
      rules: {
        "vitest/expect-expect": "off",
      },
    },
  ],
});

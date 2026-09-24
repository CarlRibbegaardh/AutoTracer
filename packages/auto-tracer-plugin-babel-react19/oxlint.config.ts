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
});

/** @type {import("eslint").Linter.Config} */
/* c8 ignore start */
module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
  },
  ignorePatterns: ["dist/**", "*.config.*"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
    project: "./tsconfig.eslint.json",
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  plugins: [
    "@typescript-eslint",
    "import",
    "sort-exports"
  ],
  settings: {
    "import/resolver": {
      typescript: true,
      node: true
    }
  },
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-module-boundary-types": "error",
    "sort-exports/sort-exports": ["error", { "sortDir": "asc" }],
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
      "newlines-between": "always",
      "alphabetize": { "order": "asc" }
    }]
  }
};

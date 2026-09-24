import { defineConfig } from "oxlint";

export default defineConfig({
  categories: {
    correctness: "error",
  },
  env: {
    node: true,
  },
  plugins: ["eslint", "typescript", "import", "react"],
  jsPlugins: ["eslint-plugin-local-rules", "eslint-plugin-sort-exports"],
  rules: {
    "typescript/no-non-null-assertion": "off",
    "no-unused-vars": [
      "error",
      {
        args: "all",
        argsIgnorePattern: "^_",
        caughtErrors: "all",
        caughtErrorsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      },
    ],
    "import/no-default-export": "warn",
    "sort-imports": [
      "error",
      {
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
        allowSeparatedGroups: true,
      },
    ],
    "arrow-body-style": ["warn", "always"],
    "prefer-template": "warn",
    "react/rules-of-hooks": "error",
    "react/exhaustive-deps": "warn",
    "local-rules/no-console-disallow": "error",
  },
  overrides: [
    {
      files: ["**/index.ts"],
      rules: {
        "sort-exports/sort-exports": [
          "error",
          { ignoreCase: true, sortDir: "asc" },
        ],
      },
    },
    {
      files: ["**/*.config.*"],
      rules: {
        "import/no-default-export": "off",
      },
    },
  ],
});

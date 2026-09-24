# `exclude`

**Package:** `@autotracer/plugin-babel-flow` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `object` &nbsp;·&nbsp; **Default:** see below

---

`exclude` is a build configuration option passed to `@autotracer/plugin-babel-flow` in your Babel config. It removes files and function names from the eligible set before pragma comments are evaluated.

`paths` uses glob patterns matched against the normalized filename Babel passes to the plugin. If a pattern is not absolute and does not already start with `**/`, AutoTracer also tests it with a leading `**/` so project-relative patterns can still match absolute filenames. `functions` accepts exact names, glob-like strings, or regular expressions. When `exclude` matches, it wins over `include`.

This option uses object-key merge with the plugin defaults. If you provide only `functions`, the default path exclusions are kept. If you provide only `paths`, the default `functions` value is kept. Arrays are never concatenated.

By default, the plugin already excludes common test files, build outputs, coverage folders, dependency folders, and test directories. `exclude` is the setting you use when the default eligible set still includes files or functions that should never be instrumented.

Read together with [`include`](./include), [`mode`](./mode), and [pragma comments](../pragmas).

## Default

```typescript
{
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
  functions: [],
}
```

## How Exclusion Works

1. `exclude.paths` removes matching files before function pragmas are considered.
2. `exclude.functions` removes matching function names inside files that are otherwise still eligible.
3. These exclusions still apply in both `"opt-in"` and `"opt-out"` modes.
4. `@trace` cannot override an explicit exclude match.

## Fields

- `paths` skips whole files and folders before transformation.
- `functions` skips matching function names inside otherwise eligible files.

## Function Name Matching

Function-name filters use the extracted meaningful function name rather than the full emitted chain.

- Plain nested names such as `outer:inner` are filtered as `inner`.
- Wrapper segments such as `useCallback`, `map`, or `then` are ignored when Flow can resolve a clearer function name.
- Anonymous functions are not removed by `exclude.functions` name matching alone.

## When To Set It

- Leave the defaults when the built-in test and build-output exclusions are enough.
- Add exclusions when specific files, folders, or function families must stay out of instrumentation even though they are otherwise eligible.

## Usage

```javascript
{
  "plugins": [
    [
      "@autotracer/plugin-babel-flow",
      {
        "exclude": {
          "paths": ["**/*.spec.*", "**/*.test.*", "src/legacy/**"],
          "functions": [/^_internal/, "debug*"]
        }
      }
    ]
  ]
}
```

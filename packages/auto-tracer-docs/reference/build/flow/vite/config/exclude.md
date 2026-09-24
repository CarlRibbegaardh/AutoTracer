# `exclude`

**Package:** `@autotracer/plugin-vite-flow` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `object` &nbsp;·&nbsp; **Default:** see below

---

`exclude` is a build configuration option for `flowTracer()` — the Vite plugin initializer of the `@autotracer/plugin-vite-flow` Flow build-time instrumentation package. It removes files and functions from the eligible set.

`paths` uses glob patterns that the Vite plugin matches directly against each module id. `functions` is forwarded to the Babel transform for files that already passed the path check. When `exclude` matches, it wins over `include`.

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

- `paths` filters out matching files before Babel transformation.
- `functions` filters out matching function names inside files that remain eligible.

## Path Matching Note

In this Vite plugin, `paths` patterns are matched directly against the full Vite module id. The plugin does not add an implicit leading `**/`.

That means `src/**/*.ts` and `**/src/**/*.ts` are not equivalent here.

## When To Set It

- Leave the defaults when the built-in test and build-output exclusions are enough.
- Add exclusions when specific files, folders, or function families must stay out of instrumentation even though they are otherwise eligible.

## Usage

```typescript
flowTracer({
  exclude: {
    paths: ["**/*.test.{ts,tsx,js,jsx}", "**/*.spec.{ts,tsx,js,jsx}"],
    functions: ["helper*", /^_internal/],
  },
});
```

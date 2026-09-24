# `exclude`

**Package:** `@autotracer/plugin-vite-react18` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `object` &nbsp;·&nbsp; **Default:** see below

---

`exclude` is a build configuration option for `reactTracer.vite()` — the Vite plugin initializer of the `@autotracer/plugin-vite-react18` React build-time injection package. It removes files and component names from the eligible set before pragma comments are evaluated.

`paths` uses glob patterns relative to the project root. `components` accepts exact names, glob-like strings, or regular expressions.

This option is deep-merged with the plugin defaults. If you provide only `components`, the default path exclusions are kept.

By default, the plugin already excludes tests, build output folders, coverage folders, and common dependency folders. `exclude` is the setting you use when the default eligible set still includes React code that should never be instrumented.

Read together with [`include`](./include) and [`mode`](./mode) when you are deciding what the plugin must leave alone.

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
  components: [],
}
```

## How Exclusion Works

1. `exclude.paths` removes matching files before component pragmas are considered.
2. `exclude.components` removes matching component names inside files that are otherwise still eligible.
3. These exclusions still apply in both `"opt-in"` and `"opt-out"` modes.
4. `@trace` cannot override an explicit exclude match.

## Fields

- `paths` skips whole files and folders before transformation.
- `components` skips matching component names inside otherwise eligible files.

## When To Set It

- Leave the defaults when the built-in test and build-output exclusions are enough.
- Add exclusions when specific files, folders, or component families must stay out of instrumentation even though they are otherwise eligible.

## Usage

```typescript
reactTracer.vite({
  exclude: {
    paths: ["**/*.spec.*", "**/*.test.*", "src/legacy/**"],
    components: [/^Internal/, "Debug*"],
  },
});
```

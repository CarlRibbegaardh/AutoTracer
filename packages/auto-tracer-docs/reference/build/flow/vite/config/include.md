# `include`

**Package:** `@autotracer/plugin-vite-flow` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `object` &nbsp;·&nbsp; **Default:** see below

---

`include` is a build configuration option for `flowTracer()` — the Vite plugin initializer of the `@autotracer/plugin-vite-flow` Flow build-time instrumentation package. It defines which files and function names are eligible for instrumentation before pragma comments are evaluated.

`paths` uses glob patterns that the Vite plugin matches directly against each module id. `functions` accepts exact names, glob-like strings, or regular expressions, and those function-name filters are forwarded to the Babel transform for files that already passed the path check.

This option uses object-key merge with the plugin defaults. If you provide only `functions`, the default `paths` value is kept. If you provide only `paths`, the default `functions` value is kept. Arrays are never concatenated.

By default, the plugin considers every `.js`, `.jsx`, `.mjs`, `.ts`, `.tsx`, and `.mts` file eligible and applies no function-name filter. `include` is the setting you use when that default eligible set is too broad.

Read together with [`exclude`](./exclude) and [`mode`](./mode) when you are narrowing the eligible set.

## Default

```typescript
{
  paths: ["**/*.{js,jsx,mjs,ts,tsx,mts}"],
  functions: [],
}
```

In the default `"opt-out"` mode, that means most JS and TS source files start eligible unless another setting removes them.

## How Eligibility Works

1. If `include.paths` is present and non-empty, the Vite plugin requires the module id to match at least one pattern.
2. If `exclude.paths` matches, the file is skipped even if it matched `include.paths`.
3. For files that remain eligible, `include.functions` and `exclude.functions` are applied inside the Babel transform.
4. [Pragma comments](../pragmas) such as `@trace` and `@trace-disable` operate only within that eligible set.

## Fields

- `paths` filters which files Vite passes to the Flow transform.
- `functions` filters which function names inside those files can still be instrumented.

## Monorepo Note

In this Vite plugin, `paths` patterns are matched directly against the full Vite module id. The plugin does not add an implicit leading `**/`.

That means `src/**/*.ts` and `**/src/**/*.ts` are not equivalent here.

```typescript
// Usually too narrow for the Flow Vite plugin when ids are absolute paths
flowTracer({
  include: {
    paths: ["src/**/*.ts"],
  },
});

// Matches absolute module ids that contain /src/
flowTracer({
  include: {
    paths: ["**/src/**/*.ts"],
  },
});
```

This matters especially in monorepos, where transformed files often arrive with absolute paths such as `C:/repo/apps/web/src/main.ts` or `C:/repo/packages/shared/src/helpers.ts`.

If you need one specific subtree, make the path explicit.

```typescript
// Example when the Vite project root is the monorepo root
flowTracer({
  include: {
    paths: ["apps/storefront/src/**/*.ts"],
  },
});
```

## Usage

```typescript
flowTracer({
  include: {
    paths: ["**/src/**/*.{ts,tsx,js,jsx}"],
    functions: ["handle*", "process*", /^load[A-Z]/],
  },
});
```

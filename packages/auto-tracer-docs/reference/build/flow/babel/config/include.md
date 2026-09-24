# `include`

**Package:** `@autotracer/plugin-babel-flow` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `object` &nbsp;·&nbsp; **Default:** see below

---

`include` is a build configuration option passed to `@autotracer/plugin-babel-flow` in your Babel config. It defines which files and function names are eligible for instrumentation before pragma comments are evaluated.

`paths` uses glob patterns matched against the normalized filename Babel passes to the plugin. If a pattern is not absolute and does not already start with `**/`, AutoTracer also tests it with a leading `**/` so project-relative patterns can still match absolute filenames. `functions` accepts exact names, glob-like strings, or regular expressions.

This option uses object-key merge with the plugin defaults. If you provide only `functions`, the default `paths` value is kept. If you provide only `paths`, the default `functions` value is kept. Arrays are never concatenated.

By default, the plugin considers every `.js`, `.jsx`, `.mjs`, `.ts`, `.tsx`, and `.mts` file eligible and applies no function-name filter. `include` is the setting you use when that default eligible set is too broad.

Read together with [`exclude`](./exclude), [`mode`](./mode), and [pragma comments](../pragmas) when you are narrowing the eligible set.

## Default

```typescript
{
  paths: ["**/*.{js,jsx,mjs,ts,tsx,mts}"],
  functions: [],
}
```

In the default `"opt-out"` mode, that means most JS and TS source files start eligible unless another setting removes them.

## How Eligibility Works

1. [`exclude`](./exclude) removes files before `include` is checked.
2. `include.paths` decides which remaining files are eligible for transformation.
3. `include.functions` and `exclude.functions` decide which function names inside those eligible files can still be instrumented.
4. Pragma comments such as `@trace` and `@trace-disable` run only inside that eligible set. `@trace` cannot bypass an `include` miss or an explicit `exclude` match.

## Fields

- `paths` filters which files are considered for transformation.
- `functions` filters which function names inside eligible files can be instrumented.

## Function Name Matching

Function-name filters do not match the full emitted colon-delimited name. The Flow Babel plugin first extracts the meaningful function name from that chain.

- Plain nested names such as `outer:inner` are filtered as `inner`.
- Wrapper segments such as `useCallback`, `map`, or `then` are ignored when Flow can resolve a clearer function name.
- Anonymous functions cannot match `include.functions` by name, so they stay out when `include.functions` is non-empty.

## Usage

```javascript
{
  "plugins": [
    [
      "@autotracer/plugin-babel-flow",
      {
        "include": {
          "paths": ["src/**/*.{ts,tsx,js,jsx}", "app/**/*.ts"],
          "functions": ["handle*", "process*", /^load[A-Z]/]
        }
      }
    ]
  ]
}
```

# `include`

**Package:** `@autotracer/plugin-babel-react18` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `object` &nbsp;·&nbsp; **Default:** see below

---

`include` is a build configuration option passed to `@autotracer/plugin-babel-react18` in your Babel config. It defines which files and component names are eligible for injection before pragma comments are evaluated.

`paths` uses glob patterns matched against the normalized filename Babel passes to the plugin. `components` accepts exact names, glob-like strings, or regular expressions.

This option is deep-merged with the plugin defaults. If you provide only `components`, the default `paths` value is kept.

By default, the plugin considers every `.tsx` and `.jsx` file eligible and applies no component-name filter. `include` is the setting you use when that default eligible set is too broad.

Read together with [`exclude`](./exclude) and [`mode`](./mode) when you are narrowing the eligible set.

## Default

```typescript
{
  paths: ["**/*.{tsx,jsx}"],
  components: [],
}
```

In the default `"opt-out"` mode, that means most React component files start eligible unless another setting removes them.

## How Eligibility Works

1. [`exclude`](./exclude) removes files before `include` is checked.
2. `include.paths` decides which remaining files are eligible for transformation.
3. `include.components` and `exclude.components` decide which component names inside those eligible files can still be instrumented.
4. Pragma comments such as `@trace` and `@trace-disable` run only inside that eligible set. `@trace` cannot bypass an `include` miss or an explicit `exclude` match.

## Fields

- `paths` filters which files are considered for transformation.
- `components` filters which component names inside eligible files can be instrumented.

## Path Matching Note

The Babel plugin normalizes Windows and Unix path separators before matching. If a pattern is not absolute and does not already start with `**/`, AutoTracer also tests it with a leading `**/`. That means patterns such as `src/**/*.tsx` can still match an absolute filename Babel reports from somewhere under `/src/`.

## Usage

```javascript
{
  "plugins": [
    [
      "@autotracer/plugin-babel-react18",
      {
        "include": {
          "paths": ["src/**/*.tsx", "app/**/*.tsx"],
          "components": ["App", "User*", /^Dashboard/]
        }
      }
    ]
  ]
}
```

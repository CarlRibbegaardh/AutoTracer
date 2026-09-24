# `include`

**Package:** `@autotracer/plugin-vite-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `{ paths?: string[]; components?: Array<string | RegExp> }` &nbsp;·&nbsp; **Default:** `paths: ["**/*.{tsx,jsx}"], components: []`

---

`include` is a build configuration option for `reactTracer.vite()`. It narrows which files and component names are eligible for React 19 injection before pragma rules and `mode` fallback are applied.

- `paths` filters files by glob pattern
- `components` filters component names by exact string, glob-like string, or regular expression

The plugin normalizes this option through `@autotracer/inject-react19`, so nested fields are deep-merged with the defaults. Providing only `components`, for example, keeps the default `paths` list in place.

## Usage

```ts
reactTracer.vite({
  include: {
    paths: ["src/**/*.tsx"],
    components: ["App", /^Dashboard/],
  },
});
```

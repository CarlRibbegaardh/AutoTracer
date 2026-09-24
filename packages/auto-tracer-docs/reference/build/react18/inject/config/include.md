# `include`

**Package:** `@autotracer/inject-react18` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `object` &nbsp;·&nbsp; **Default:** `{ paths: ["**/*.{tsx,jsx}"], components: [] }`

---

`include` is a shared transform configuration option used by the file and component eligibility checks before `transform()` injects anything. It defines which files and component names are eligible to continue through the transform.

The object is deep-merged with the default config. If you provide only `components`, the default `paths` value stays in place. If you provide only `paths`, component filtering stays open.

## Fields

- `paths`: file patterns that stay eligible for transformation
- `components`: component names or patterns that stay eligible inside matching files

`include.paths` works together with `exclude.paths` in the file-level filter. `include.components` works together with `exclude.components` in the component-level filter. When `include.components` is present, `// @trace` only works inside that eligible set.

## Usage

```typescript
import { normalizeConfig } from "@autotracer/inject-react18";

const config = normalizeConfig({
  include: {
    paths: ["src/**/*.tsx", "app/**/*.tsx"],
    components: ["App", /^Dashboard/],
  },
});
```

Read together with [`exclude`](./exclude) and [`mode`](./mode) because those settings decide which eligible targets are finally instrumented.

# `include`

**Package:** `@autotracer/inject-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `{ paths?: string[]; components?: Array<string | RegExp> }` &nbsp;·&nbsp; **Default:** `paths: ["**/*.{tsx,jsx}"], components: []`

---

`include` is a shared transform configuration option used by `normalizeConfig()` and `transform()`. It narrows which files and component names are eligible for injection before pragma rules and `mode` fallback are applied.

`paths` filters files by glob pattern. `components` filters component names by exact string, glob-like string, or regular expression.

`normalizeConfig()` deep-merges this option with the default configuration.

## Usage

```ts
import { normalizeConfig } from "@autotracer/inject-react19";

const config = normalizeConfig({
  include: {
    paths: ["src/**/*.tsx"],
    components: ["App", /^Dashboard/],
  },
});
```

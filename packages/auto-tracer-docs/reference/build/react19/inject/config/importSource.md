# `importSource`

**Package:** `@autotracer/inject-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `string` &nbsp;·&nbsp; **Default:** `"@autotracer/react19"`

---

`importSource` is a shared transform configuration option used by `normalizeConfig()` and `transform()`. It changes the module specifier used for injected `useReactTracer` and `labelState` imports.

## Usage

```ts
import { normalizeConfig } from "@autotracer/inject-react19";

const config = normalizeConfig({
  importSource: "@autotracer/react19",
});
```

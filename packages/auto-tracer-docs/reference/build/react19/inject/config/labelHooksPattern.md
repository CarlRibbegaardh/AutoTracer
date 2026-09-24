# `labelHooksPattern`

**Package:** `@autotracer/inject-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `string` &nbsp;·&nbsp; **Default:** `"^use[A-Z].*"`

---

`labelHooksPattern` is a shared transform configuration option used by `normalizeConfig()` and `transform()`. It supplies a regular-expression source string that matches additional hook names to label during injection.

Provide the pattern itself, not a JavaScript regex literal. The shared injector strips accidental leading and trailing `/` delimiters for convenience.

## Usage

```ts
import { normalizeConfig } from "@autotracer/inject-react19";

const config = normalizeConfig({
  labelHooksPattern: "^use[A-Z].*",
});
```

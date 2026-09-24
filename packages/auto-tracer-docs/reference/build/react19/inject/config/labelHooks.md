# `labelHooks`

**Package:** `@autotracer/inject-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `string[]` &nbsp;·&nbsp; **Default:** `[]`

---

`labelHooks` is a shared transform configuration option used by `normalizeConfig()` and `transform()`. It lists hook names whose returned values should always receive AutoTracer labels in injected components.

## Usage

```ts
import { normalizeConfig } from "@autotracer/inject-react19";

const config = normalizeConfig({
  labelHooks: ["useState", "useReducer", "useSelector"],
});
```

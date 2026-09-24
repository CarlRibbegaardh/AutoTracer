# `labelHooksPattern`

**Package:** `@autotracer/inject-react18` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `string` &nbsp;·&nbsp; **Default:** `"^use[A-Z].*"`

---

`labelHooksPattern` is a shared transform configuration option used when `transform()` decides which additional hook names should get `labelState(...)` injections. The value is treated as a JavaScript regular-expression pattern string, not as a regex literal.

Before creating the `RegExp`, the transform strips an accidental leading slash and trailing slash-plus-flags. An empty string disables pattern matching so that only the exact names from [`labelHooks`](./labelHooks) and the built-in `useState` and `useReducer` cases are labeled.

## Usage

```typescript
import { normalizeConfig } from "@autotracer/inject-react18";

const config = normalizeConfig({
  labelHooksPattern: "^use(Selector|Dispatch)$",
});
```

Read together with [`labelHooks`](./labelHooks) because both settings contribute to the additional hook-matching set.

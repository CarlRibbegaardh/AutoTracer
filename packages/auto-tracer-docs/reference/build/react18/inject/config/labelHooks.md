# `labelHooks`

**Package:** `@autotracer/inject-react18` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `string[]` &nbsp;·&nbsp; **Default:** `[]`

---

`labelHooks` is a shared transform configuration option used when `transform()` decides which additional hook calls should get `labelState(...)` injections. It adds exact hook names beyond the built-in `useState` and `useReducer` handling.

When a configured hook is assigned to identifiers through array destructuring, object destructuring, or a direct identifier binding, the transform injects labels for those bound names. This option does not change file or component eligibility.

## Usage

```typescript
import { normalizeConfig } from "@autotracer/inject-react18";

const config = normalizeConfig({
  labelHooks: ["useSelector", "useAppSelector"],
});
```

Read together with [`labelHooksPattern`](./labelHooksPattern) because both settings contribute to the additional hook-matching set.

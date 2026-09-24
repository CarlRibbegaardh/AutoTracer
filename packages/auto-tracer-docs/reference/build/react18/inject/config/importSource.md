# `importSource`

**Package:** `@autotracer/inject-react18` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `string` &nbsp;·&nbsp; **Default:** `"@autotracer/react18"`

---

`importSource` is a shared transform configuration option used when `transform()` injects or reuses the `useReactTracer` import. It controls which module specifier the generated import points at.

The transform only treats an existing import as reusable when it already imports `useReactTracer` from this same module source. If you point `importSource` at a wrapper package, that wrapper must export a compatible named `useReactTracer` binding.

## Usage

```typescript
import { normalizeConfig } from "@autotracer/inject-react18";

const config = normalizeConfig({
  importSource: "@my-company/react-tracer-wrapper",
});
```

Read together with [`serverComponents`](./serverComponents) when you are building a custom framework wrapper around the shared transform.

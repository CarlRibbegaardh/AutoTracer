# `detectIdenticalValueChanges`

**Package:** `@autotracer/react19` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** `boolean` &nbsp;·&nbsp; **Default:** `true`

---

`detectIdenticalValueChanges` is a runtime configuration option for `reactTracer()` - the initializer of the `@autotracer/react19` React component render tracing library. It controls whether ReactTracer warns when a state or prop reference changes but the compared value is still identical.

This is meant to surface unnecessary re-renders caused by new object, array, or function references that carry the same value.

## Usage

```typescript
import { reactTracer } from "@autotracer/react19";

reactTracer({ detectIdenticalValueChanges: false });
```

# `maxFiberDepth`

**Package:** `@autotracer/react19` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** `number` &nbsp;·&nbsp; **Default:** `500` &nbsp;·&nbsp; **Valid range:** `20-1000`

---

`maxFiberDepth` is a runtime configuration option for `reactTracer()` - the initializer of the `@autotracer/react19` React component render tracing library. It limits how deep the fiber traversal goes.

Increase this value only when a verified instrumented component is missing from trace output and runtime filters are empty.

## Usage

```typescript
import { reactTracer } from "@autotracer/react19";

reactTracer({ maxFiberDepth: 500 });
```

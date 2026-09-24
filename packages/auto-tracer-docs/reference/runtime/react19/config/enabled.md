# `enabled`

**Package:** `@autotracer/react19` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** `boolean` &nbsp;·&nbsp; **Default:** `false`

---

`enabled` is a runtime configuration option for `reactTracer()` - the initializer of the `@autotracer/react19` React component render tracing library. It controls whether the tracer is active. The default is `false`, so ReactTracer starts dormant unless you opt into immediate startup. When `false`, no tracing occurs and `useReactTracer()` becomes a no-op that still preserves React's rules of hooks.

Set `enabled: true` when you want tracing to start immediately during bootstrap. Omit it, or leave it `false`, when you want a dormant startup and plan to turn tracing on later.

If a saved enabled-on-load preference already exists from the Dashboard or `globalThis.autoTracer.reactTracer.setEnabledOnLoad(...)`, ReactTracer applies that saved value on the first initialization for the page load.

After initialization, use the [Dashboard workflow](/dashboard/webapps) as the normal control surface in browser-based internal web apps when that workflow is mounted. The lower-level `globalThis.autoTracer.reactTracer.start()`, `stop()`, and `isEnabled()` controls remain useful in tests, automation, and other non-Dashboard setups. See [Runtime Control](/api/react19#runtime-control-global-api).

Read together with [`outputMode`](./outputMode) and [`colors`](./colors) when you are tuning whether tracing starts and how the output should look.

## When To Set It

- Set `true` when you want tracing to begin immediately at app startup.
- Leave it omitted, or set `false`, when you want startup to stay dormant and tracing to begin later through the Dashboard or `globalThis.autoTracer`.

## Usage

```typescript
import { reactTracer } from "@autotracer/react19";

reactTracer({
  enabled: true,
});
```

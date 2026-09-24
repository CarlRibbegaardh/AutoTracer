# `mode`

**Package:** `@autotracer/inject-react18` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** `"opt-in" | "opt-out"` &nbsp;·&nbsp; **Default:** `"opt-out"`

---

`mode` is a shared transform configuration option used by `normalizeConfig()` and `transform()`. It decides the fallback instrumentation policy after file eligibility, component eligibility, and pragma checks have already been applied.

In `"opt-out"`, eligible components are instrumented by default. In `"opt-in"`, eligible components are skipped unless they have a `// @trace` pragma. `// @trace-disable` still wins over `// @trace`, and `// @trace` cannot bypass an include miss or explicit exclude match.

## Values

- `"opt-out"`: instrument eligible components unless a higher-precedence skip applies
- `"opt-in"`: instrument eligible components only when `// @trace` is present

## Usage

```typescript
import { normalizeConfig, transform } from "@autotracer/inject-react18";

const config = normalizeConfig({
  mode: "opt-in",
});

const result = transform(sourceCode, {
  filename: "Counter.tsx",
  config,
});
```

Read together with [`include`](./include) and [`exclude`](./exclude) because eligibility is decided before `mode` fallback is applied.

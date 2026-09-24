# ReactTracer Babel Plugin Settings For React 19

**Package:** `@autotracer/plugin-babel-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** Overview

---

Use this page for the build-time settings passed to `@autotracer/plugin-babel-react19` in your Babel configuration.

This layer controls build-time component injection, automatic hook labeling, React Server Components safety checks, and optional output-mode startup seeding. It does not replace the runtime `reactTracer()` initializer in `@autotracer/react19`, and it does not mount the Dashboard or load theme files.

For Next.js App Router style projects, this package covers client components only through the Babel path. Native Turbopack injection, React Server Component execution, and server actions are outside this package's documented coverage.

## Settings By Concern

- Startup and browser control: [`outputMode`](./config/outputMode)
- Eligibility and labeling: [`mode`](./config/mode), [pragma comments](./pragmas), [`include`](./config/include), [`exclude`](./config/exclude), [`labelHooks`](./config/labelHooks), [`labelHooksPattern`](./config/labelHooksPattern), and [`prefix`](./config/prefix)
- Framework and build wiring: [`serverComponents`](./config/serverComponents) and [`importSource`](./config/importSource)

## Adjacent Docs

- [@autotracer/plugin-babel-react19](/api/plugin-babel-react19)
- [React 19 runtime settings](/reference/runtime/react19/)
- [@autotracer/react19](/api/react19)

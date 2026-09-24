# FlowTracer Babel Plugin Settings

**Package:** `@autotracer/plugin-babel-flow` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** Overview

---

Use these pages for the exact behavior of the options passed to `@autotracer/plugin-babel-flow` in your Babel config.

This layer controls which functions are instrumented, how emitted tracing code is named, whether thrown exceptions are logged, and whether a startup output mode is seeded into Flow runtime bootstrap modules. It does not replace the runtime APIs provided by `@autotracer/flow`.

## Public Surface

`@autotracer/plugin-babel-flow` exposes these public build-time surfaces:

- default Babel plugin export used as `"@autotracer/plugin-babel-flow"` in Babel config
- `outputMode`
- `logExceptions`
- `exceptionLogLevel`
- `tracerName`
- `include`
- `exclude`
- `mode`
- `prefix`
- [pragma comments](./pragmas)

## Settings By Concern

- Startup and browser control: [`outputMode`](./config/outputMode)
- Eligibility and naming: [`mode`](./config/mode), [pragma comments](./pragmas), [`include`](./config/include), [`exclude`](./config/exclude), and [`prefix`](./config/prefix)
- Exception logging and emitted bindings: [`logExceptions`](./config/logExceptions), [`exceptionLogLevel`](./config/exceptionLogLevel), and [`tracerName`](./config/tracerName)

## Adjacent Docs

- [@autotracer/plugin-babel-flow](/api/plugin-babel-flow) for package usage, examples, and the current option surface
- [FlowTracer Installation - Next.js](/guide/installation-flow-nextjs) for the Babel-based Next.js entry path
- [FlowTracer Quick Start](/guide/quickstart-flow) for the broader setup path across Vite and Babel builds
- [FlowTracer Options](/guide/config-flow) for the recommended runtime and build-time split
- [@autotracer/flow](/api/flow) for runtime APIs and browser control behavior

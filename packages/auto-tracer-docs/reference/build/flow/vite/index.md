# FlowTracer Vite Plugin Settings

**Package:** `@autotracer/plugin-vite-flow` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** Overview

---

Use these pages for the exact behavior of the options passed to `flowTracer()` in `vite.config.ts`.

This layer controls which functions are instrumented, whether tracing starts dormant or active, whether the dashboard mounts automatically, the initial output format, and Vite root theme file loading. It does not replace the runtime APIs provided by `@autotracer/flow`.

## Public Surface

`@autotracer/plugin-vite-flow` exposes these public build-time surfaces:

- `flowTracer(options?)` in `vite.config.ts`
- `inject`
- `runtimeControlled`
- `dashboardConfig`
- `outputMode`
- `mode`
- `include`
- `exclude`
- `prefix`
- `logExceptions`
- `exceptionLogLevel`
- `tracerName`
- [pragma comments](./pragmas)
- Vite root Flow theme files documented in [FlowTracer Theme API](/themes/flow/api)

## Settings By Concern

- Startup and browser control: [`inject`](./config/inject), [`runtimeControlled`](./config/runtimeControlled), [`dashboardConfig`](./config/dashboardConfig), and [`outputMode`](./config/outputMode)
- Eligibility and labeling: [`mode`](./config/mode), [pragma comments](./pragmas), [`include`](./config/include), [`exclude`](./config/exclude), and [`prefix`](./config/prefix)
- Logging and naming: [`logExceptions`](./config/logExceptions), [`exceptionLogLevel`](./config/exceptionLogLevel), and [`tracerName`](./config/tracerName)

## Adjacent Docs

- [@autotracer/plugin-vite-flow](/api/plugin-vite-flow) for package usage, examples, and the full option surface
- [FlowTracer Installation - Vite](/guide/installation-flow-vite) for the recommended Vite entry path
- [FlowTracer Options](/guide/config-flow) for broader runtime configuration guidance
- [@autotracer/flow](/api/flow) for runtime APIs and browser control behavior
- [FlowTracer Theme API](/themes/flow/api) and [FlowTracer Example Themes](/themes/flow/examples) for Vite root theme files

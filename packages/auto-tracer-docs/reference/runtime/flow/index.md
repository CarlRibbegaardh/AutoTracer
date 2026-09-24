# FlowTracer Runtime Settings

**Package:** `@autotracer/flow` &nbsp;·&nbsp; **Layer:** Runtime &nbsp;·&nbsp; **Type:** Overview

---

`@autotracer/flow` and `@autotracer/flow/runtime` install the runtime surface used by Flow build integrations. Use `@autotracer/flow` when tracing should start immediately. Use `@autotracer/flow/runtime` when the same runtime surface should install in dormant mode and stay off until later activation. The separate `createFlowTracer(logger, config?)` path is an internal manual-tracer surface.

## Normal App Path

For normal app integrations, do not call `createFlowTracer(logger, config?)`.

Use the Flow runtime loaded into your app by `@autotracer/flow` or `@autotracer/flow/runtime` instead.

In Vite apps, use [`@autotracer/plugin-vite-flow`](/api/plugin-vite-flow). When `inject` is `true`, the plugin loads either `@autotracer/flow` or `@autotracer/flow/runtime`, depending on whether `runtimeControlled` is off or on.

In Next.js and other Babel-based builds, use [`@autotracer/plugin-babel-flow`](/api/plugin-babel-flow), import `@autotracer/flow` in your bootstrap when you want immediate startup, or import `@autotracer/flow/runtime` when you want dormant startup.

Build-time instrumentation settings live in the Flow Vite and Babel plugin packages.

## Trigger Sessions

For trigger-driven sessions in browser integrations, use the [Dashboard workflow](/dashboard/webapps) when it is mounted. Otherwise use the lower-level runtime control API on `globalThis.autoTracer.flowTracer`, documented on [@autotracer/flow](/api/flow).

## Startup And Appearance

Importing `@autotracer/flow` ensures the lower-level runtime control surface exists on `globalThis.autoTracer.flowTracer` and the internal instrumentation target exists on `globalThis.__flowTracer`.

Importing `@autotracer/flow/runtime` installs the same runtime surface and then leaves tracing off unless it is enabled on load or started later.

For browser-based internal web apps, the normal control surface is the [Dashboard workflow](/dashboard/webapps) when that workflow is mounted. When the Dashboard is not available, use `globalThis.autoTracer.flowTracer`.

Use [`theme`](./config/theme) only when you are working on that internal manual-tracer path. For theme files and file-based override behavior used by build integrations, see [FlowTracer Theme API](/themes/flow/api) and [FlowTracer Example Themes](/themes/flow/examples).

## Start Here

If tracing should start immediately when your bootstrap runs, use `@autotracer/flow`.

If tracing should stay dormant until you start it in the browser, use `@autotracer/flow/runtime` and then prefer the [Dashboard workflow](/dashboard/webapps). If the Dashboard is not mounted, use `globalThis.autoTracer.flowTracer`.

If tracing should start and stop around one specific workflow, use the runtime control API on `globalThis.autoTracer.flowTracer` or the [Dashboard workflow](/dashboard/webapps).

If output styling is wrong for your workflow, read [`theme`](./config/theme) together with [FlowTracer Theme API](/themes/flow/api) and [FlowTracer Example Themes](/themes/flow/examples).

See [@autotracer/flow](/api/flow), [@autotracer/plugin-vite-flow](/api/plugin-vite-flow), and [@autotracer/plugin-babel-flow](/api/plugin-babel-flow) for the runtime API and build-time integration details.

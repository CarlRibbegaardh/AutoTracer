# FlowTracer Configuration

FlowTracer configuration spans build-time instrumentation, runtime startup, and runtime control. Use this page to choose the right FlowTracer path, then use the linked reference pages for exact setting behavior.

Keep Flow tracing out of publicly accessible builds. The normal use case is local development and restricted internal test or QA environments.

## Recommended Integration Paths

### Vite

Use `@autotracer/plugin-vite-flow` for Vite apps.

This is the normal path for browser apps because the plugin handles build-time instrumentation and can inject the runtime imports used by `@autotracer/flow` and `@autotracer/flow/runtime`.

Use these pages together:

- [Vite installation](/guide/installation-flow-vite)
- [FlowTracer Vite settings](/reference/build/flow/vite/)
- [@autotracer/plugin-vite-flow](/api/plugin-vite-flow)
- [FlowTracer runtime settings](/reference/runtime/flow/)

### Next.js And Other Babel Builds

Use `@autotracer/plugin-babel-flow` for build-time instrumentation, then lazy-load `@autotracer/flow` in your bootstrap entry when you want immediate startup or lazy-load `@autotracer/flow/runtime` when you want dormant startup.

Use these pages together:

- [Next.js installation](/guide/installation-flow-nextjs)
- [FlowTracer Babel settings](/reference/build/flow/babel/)
- [@autotracer/plugin-babel-flow](/api/plugin-babel-flow)
- [@autotracer/flow](/api/flow)
- [FlowTracer runtime settings](/reference/runtime/flow/)

### Manual Tracer Path

For normal browser integrations, do not start with `createFlowTracer(logger, config?)`.

Use that factory only for manual harnesses and other custom tracer setups where you are creating the tracer instance yourself.

For that path, use:

- [@autotracer/flow](/api/flow)
- [`theme`](/reference/runtime/flow/config/theme)

## Reference Pages

- [FlowTracer runtime settings](/reference/runtime/flow/) for runtime startup, dormant mode, browser control, and the normal app path
- [`theme`](/reference/runtime/flow/config/theme) for the manual tracer `createFlowTracer(logger, config?)` theme option
- [FlowTracer Vite settings](/reference/build/flow/vite/) for Vite build-time settings and Vite pragma comments
- [FlowTracer Babel settings](/reference/build/flow/babel/) for Babel build-time settings and Babel pragma comments
- [FlowTracer Theme API](/themes/flow/api) for Vite theme files used by the global tracer
- [FlowTracer Example Themes](/themes/flow/examples) for copyable theme file examples
- [@autotracer/flow](/api/flow) for the runtime package API, including `globalThis.autoTracer.flowTracer`
- [@autotracer/plugin-vite-flow](/api/plugin-vite-flow) for the Vite package surface
- [@autotracer/plugin-babel-flow](/api/plugin-babel-flow) for the Babel package surface

## Browser Control

For browser-based internal web apps, use the [Dashboard workflow](/dashboard/webapps) when it is mounted.

When the Dashboard is not available, use the lower-level runtime API on `globalThis.autoTracer.flowTracer`.

# ReactTracer Configuration

ReactTracer configuration has two layers:

- Runtime configuration in `reactTracer()` controls when tracing starts, what appears in traces, and how output is formatted.
- Optional build-time injection adds automatic component and hook labels so traces are richer without manual instrumentation across the app.

Most React apps should use both.

Keep tracing out of publicly accessible builds. The normal use case is development and restricted internal test or QA environments.

## Recommended Integration Paths

Choose the path that matches your build system.

### Vite

Use `@autotracer/plugin-vite-react18` for build-time injection and `reactTracer()` for runtime startup.

This is the recommended path for Vite apps. It gives you automatic labels, optional file-based themes, optional dashboard mounting, and the normal ReactTracer runtime API.

Use these pages:

- [Vite installation](/guide/installation-react-vite)
- [ReactTracer Vite Plugin Settings](/reference/build/react18/vite/)
- [@autotracer/plugin-vite-react18](/api/plugin-vite-react18)
- [@autotracer/react18](/api/react18)

For restricted internal browser builds where you want narrow capture windows, start ReactTracer dormant and use the [Dashboard workflow](/dashboard/webapps).

### Next.js, Create React App, And Other Babel Builds

Use `@autotracer/plugin-babel-react18` for build-time injection and `reactTracer()` for runtime startup.

This is the recommended path when your React build already goes through Babel.

Use these pages:

- [Next.js Pages Router installation](/guide/installation-react-nextjs-pages)
- [Next.js App Router installation](/guide/installation-react-nextjs-app)
- [Create React App installation](/guide/installation-react-cra)
- [ReactTracer Babel Plugin Settings](/reference/build/react18/babel/)
- [@autotracer/plugin-babel-react18](/api/plugin-babel-react18)
- [@autotracer/react18](/api/react18)

### Runtime-Only Setup

Use runtime-only setup when you do not want build-time injection and you are willing to use `useReactTracer()` or other runtime APIs manually.

Runtime-only setup is useful for manual harnesses, experiments, or cases where automatic labeling is not required.

Use these pages:

- [@autotracer/react18](/api/react18)
- [ReactTracer Runtime Settings](/reference/runtime/react18/)

### Custom Build Tooling

Use `@autotracer/inject-react18` only when you are building your own integration layer instead of using the Vite or Babel plugin packages directly.

This path owns the shared AST transform and shared transform configuration. It does not initialize `reactTracer()` for you, and it does not replace the normal runtime package.

Use these pages:

- [ReactTracer Shared Transform](/reference/build/react18/inject/)
- [@autotracer/inject-react18](/api/inject-react18)
- [@autotracer/react18](/api/react18)

## Runtime Settings

The `reactTracer()` options are easiest to evaluate by concern:

- Startup and capture windows: [`enabled`](/reference/runtime/react18/config/enabled), [`startTriggerFunctionName`](/reference/runtime/react18/config/startTriggerFunctionName), [`endTriggerFunctionName`](/reference/runtime/react18/config/endTriggerFunctionName), [`endTriggerMode`](/reference/runtime/react18/config/endTriggerMode), and [`triggerRearmMode`](/reference/runtime/react18/config/triggerRearmMode)
- Missing or noisy tree output: [`maxFiberDepth`](/reference/runtime/react18/config/maxFiberDepth), [`includeNonTrackedBranches`](/reference/runtime/react18/config/includeNonTrackedBranches), [`includeMount`](/reference/runtime/react18/config/includeMount), [`includeRendered`](/reference/runtime/react18/config/includeRendered), [`includeReconciled`](/reference/runtime/react18/config/includeReconciled), [`includeSkipped`](/reference/runtime/react18/config/includeSkipped), [`filterEmptyNodes`](/reference/runtime/react18/config/filterEmptyNodes), and [`showLevelDetails`](/reference/runtime/react18/config/showLevelDetails)
- Output format and appearance: [`outputMode`](/reference/runtime/react18/config/outputMode), [`colors`](/reference/runtime/react18/config/colors), and [ReactTracer Theme API](/themes/react18/api)
- Noise reduction and diagnostics: [`skippedObjectProps`](/reference/runtime/react18/config/skippedObjectProps), [`detectIdenticalValueChanges`](/reference/runtime/react18/config/detectIdenticalValueChanges), [`showFlags`](/reference/runtime/react18/config/showFlags), [`internalLogLevel`](/reference/runtime/react18/config/internalLogLevel), and [`trackedStateResolution`](/reference/runtime/react18/config/trackedStateResolution)

For exact per-option behavior and defaults, use [ReactTracer Runtime Settings](/reference/runtime/react18/).

## Runtime Control Surface

For runtime APIs such as `reactTracer()`, `updateReactTracerOptions()`, `stopReactTracer()`, `useReactTracer()`, and the global browser control surface on `globalThis.autoTracer.reactTracer`, use [@autotracer/react18](/api/react18).

For browser-based internal web apps, the recommended control surface is the [Dashboard workflow](/dashboard/webapps). The dashboard controls capture windows, but trace output still goes to the browser's normal logging surface.

## Build-Time Injection

Build-time injection adds automatic component and hook labeling. It does not replace the runtime package.

- Use [ReactTracer Vite Plugin Settings](/reference/build/react18/vite/) for Vite apps.
- Use [ReactTracer Babel Plugin Settings](/reference/build/react18/babel/) for Next.js, Create React App, and other Babel-based builds.
- Use [ReactTracer Shared Transform](/reference/build/react18/inject/) only when you are authoring custom tooling around the shared transform.

If multiple islands or microfrontends share one console, use the plugin-level prefix option documented in the plugin API page for your build path. This is a build-time label for component names, not automatic runtime tagging or a separate runtime filter.

## Themes

Use runtime [`colors`](/reference/runtime/react18/config/colors) when you want programmatic project defaults.

If you use the Vite plugin, use [ReactTracer Theme API](/themes/react18/api) for file-based theme loading and [ReactTracer Example Themes](/themes/react18/examples) for copyable examples.

## Reference Pages

- [ReactTracer Runtime Settings](/reference/runtime/react18/)
- [ReactTracer Vite Plugin Settings](/reference/build/react18/vite/)
- [ReactTracer Babel Plugin Settings](/reference/build/react18/babel/)
- [@autotracer/react18](/api/react18)
- [@autotracer/plugin-vite-react18](/api/plugin-vite-react18)
- [@autotracer/plugin-babel-react18](/api/plugin-babel-react18)
- [ReactTracer Theme API](/themes/react18/api)
- [Dashboard For Web Apps](/dashboard/webapps)

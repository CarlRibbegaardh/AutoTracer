# React 19 Configuration

This guide maps the React 19 tracing surface by responsibility. `@autotracer/react19` owns runtime startup and runtime settings. `@autotracer/plugin-vite-react19` and `@autotracer/plugin-babel-react19` own build-time injection. `@autotracer/inject-react19` is the lower-level transform for custom tooling.

For browser apps, the normal workflow is dormant startup plus the Dashboard. `globalThis.autoTracer` remains the lower-level fallback for tests, automation, and other non-Dashboard setups.

## Recommended Integration Paths

### Vite

Use `@autotracer/plugin-vite-react19` for build-time injection and `reactTracer()` for runtime startup.

This path is the tested browser integration in the React 19 examples. It gives you:

- automatic `useReactTracer()` injection;
- automatic hook labels for configured hooks;
- optional Dashboard mounting;
- output-mode startup seeding; and
- project-root theme-file loading.

Use these pages:

- [React 19 Vite Installation](/guide/installation-react19-vite)
- [React 19 Vite Plugin Settings](/reference/build/react19/vite/)
- [React 19 Runtime Settings](/reference/runtime/react19/)
- [React 19 Vite Plugin API](/api/plugin-vite-react19)
- [React 19 Runtime API](/api/react19)

### Next.js App Router And Other Babel Builds

Use `@autotracer/plugin-babel-react19` for build-time injection and `reactTracer()` for runtime startup.

This path covers client-component injection through Babel. The package does not mount the Dashboard or load theme files for you, so those remain runtime concerns.

Use these pages:

- [React 19 Next.js App Router Installation](/guide/installation-react19-nextjs-app)
- [React 19 Babel Plugin Settings](/reference/build/react19/babel/)
- [React 19 Babel Plugin API](/api/plugin-babel-react19)
- [React 19 Runtime API](/api/react19)

### Runtime-Only Setup

Use runtime-only setup when you do not want build-time injection and you are willing to call `useReactTracer()` manually where needed.

That path is most useful for deliberate harnesses, focused experiments, or a custom build pipeline that has not adopted an AutoTracer build plugin yet.

Use these pages:

- [React 19 Runtime API](/api/react19)
- [React 19 Runtime Settings](/reference/runtime/react19/)

### Custom Tooling

Use `@autotracer/inject-react19` only when you are building your own integration layer instead of using the Vite or Babel packages directly.

This package owns the shared AST transform and shared transform configuration. It does not initialize `reactTracer()`, it does not mount the Dashboard, and it does not load theme files.

Use these pages:

- [React 19 Shared Transform](/reference/build/react19/inject/)
- [React 19 Shared Transform API](/api/inject-react19)
- [React 19 Runtime API](/api/react19)

## Runtime Settings By Concern

The `reactTracer()` options are easier to navigate by question than by alphabet:

- Startup and capture windows: [`enabled`](/reference/runtime/react19/config/enabled), [`startTriggerFunctionName`](/reference/runtime/react19/config/startTriggerFunctionName), [`endTriggerFunctionName`](/reference/runtime/react19/config/endTriggerFunctionName), [`endTriggerMode`](/reference/runtime/react19/config/endTriggerMode), and [`triggerRearmMode`](/reference/runtime/react19/config/triggerRearmMode)
- Tree visibility: [`maxFiberDepth`](/reference/runtime/react19/config/maxFiberDepth), [`includeNonTrackedBranches`](/reference/runtime/react19/config/includeNonTrackedBranches), [`includeMount`](/reference/runtime/react19/config/includeMount), [`includeRendered`](/reference/runtime/react19/config/includeRendered), [`includeReconciled`](/reference/runtime/react19/config/includeReconciled), [`includeSkipped`](/reference/runtime/react19/config/includeSkipped), [`filterEmptyNodes`](/reference/runtime/react19/config/filterEmptyNodes), and [`showLevelDetails`](/reference/runtime/react19/config/showLevelDetails)
- Output and appearance: [`outputMode`](/reference/runtime/react19/config/outputMode), [`colors`](/reference/runtime/react19/config/colors), and [React 19 Theme API](/themes/react19/api)
- Noise reduction and diagnostics: [`skippedObjectProps`](/reference/runtime/react19/config/skippedObjectProps), [`detectIdenticalValueChanges`](/reference/runtime/react19/config/detectIdenticalValueChanges), [`showFlags`](/reference/runtime/react19/config/showFlags), [`internalLogLevel`](/reference/runtime/react19/config/internalLogLevel), and [`trackedStateResolution`](/reference/runtime/react19/config/trackedStateResolution)

The dormant default still matters: `enabled` defaults to `false`.

## Browser Control Surface

For internal browser apps, the Dashboard is the normal control surface.

- Keep tracing dormant at startup.
- Start tracing just before the interaction you care about.
- Stop tracing as soon as that interaction window is captured.

When the Dashboard is not present, use `globalThis.autoTracer` directly:

```js
globalThis.autoTracer.setOutputMode("copy-paste");
globalThis.autoTracer.reactTracer.setAutoStopAfterRenders(20);
globalThis.autoTracer.reactTracer.start();
```

## React Compiler Coverage

React Compiler compatibility is verified only for this stack:

- `babel-plugin-react-compiler@1.0.0`
- React `19.2.0`
- Vite `8.2.1`
- `@vitejs/plugin-react` 4.x
- `reactTracer.vite(...)` registered before `react(...)`
- compiler target `{ target: "19" }`

The evidence is narrow and concrete. The React 19 compiler example in this repo inspects the served `App` module and checks for both the compiler memo-cache output and AutoTracer's `labelState` call, then runs the same labeled browser flow in development and production-preview mode.

Other compiler versions and other build integrations need their own verification.

```ts
import { reactTracer } from "@autotracer/plugin-vite-react19";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    reactTracer.vite({
      labelHooks: ["useState"],
    }),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", { target: "19" }]],
      },
    }),
  ],
});
```

## Themes

React 19 uses the same ReactTracer theme model and file naming scheme as the React 18 product line.

- Runtime `colors` overrides belong to `reactTracer(...)`.
- Vite-root `*react-theme.json`, `*react-theme-light.json`, and `*react-theme-dark.json` files belong to the Vite plugin path.
- The Babel and injector paths do not load theme files.

Use these pages:

- [React 19 Theme API](/themes/react19/api)
- [React 19 Theme Examples](/themes/react19/examples)

## Read Next

- [React 19 Quick Start](/guide/quickstart-react19)
- [React 19 Migration From React 18](/guide/migration-react18-to-react19)
- [React 19 Runtime API](/api/react19)
- [React 19 Runtime Settings](/reference/runtime/react19/)
- [Dashboard For Web Apps](/dashboard/webapps)

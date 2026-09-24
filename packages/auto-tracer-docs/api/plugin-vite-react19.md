# @autotracer/plugin-vite-react19

Build-time React 19 instrumentation for Vite applications. Use this package in local development or restricted internal test and QA builds when you want AutoTracer to inject `useReactTracer()` and hook labels before the app reaches the browser.

## Recommended Setup

Use `reactTracer.vite()` for build-time injection and initialize `reactTracer()` separately before React renders.

For browser-based internal apps, the [Dashboard workflow](/dashboard/webapps) is the normal control surface. Start the runtime in a dormant state so the Dashboard can turn tracing on without reloading the page.

```tsx
// src/main.tsx
import { reactTracer } from "@autotracer/react19";

reactTracer({ enabled: false });
```

Register the AutoTracer Vite plugin before `@vitejs/plugin-react`. The AutoTracer transform needs the source-level hook declarations, and the tested React Compiler path depends on that order.

```ts
// vite.config.ts
import react from "@vitejs/plugin-react";
import { reactTracer } from "@autotracer/plugin-vite-react19";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  plugins: [
    reactTracer.vite({
      inject: mode === "development",
    }),
    react(),
  ],
}));
```

Exclude the plugin from public-facing builds. Runtime suppression is not a substitute because leaving the plugin enabled still injects tracing code.

## Package API

This package exports one public Vite entry:

```ts
reactTracer.vite(options?)
```

Use the build reference for the exact option behavior:

- [React 19 Vite settings](/reference/build/react19/vite/)
- [`inject`](/reference/build/react19/vite/config/inject)
- [`dashboardConfig`](/reference/build/react19/vite/config/dashboardConfig)
- [`outputMode`](/reference/build/react19/vite/config/outputMode)
- [`mode`](/reference/build/react19/vite/config/mode)
- [`include`](/reference/build/react19/vite/config/include)
- [`exclude`](/reference/build/react19/vite/config/exclude)
- [`labelHooks`](/reference/build/react19/vite/config/labelHooks)
- [`labelHooksPattern`](/reference/build/react19/vite/config/labelHooksPattern)
- [`serverComponents`](/reference/build/react19/vite/config/serverComponents)
- [`importSource`](/reference/build/react19/vite/config/importSource)
- [`prefix`](/reference/build/react19/vite/config/prefix)
- [`buildWithWorkspaceLibs`](/reference/build/react19/vite/config/buildWithWorkspaceLibs)
- [`reactUmdSrc`](/reference/build/react19/vite/config/reactUmdSrc)
- [`reactDomUmdSrc`](/reference/build/react19/vite/config/reactDomUmdSrc)

## What The Plugin Owns

- build-time component injection through `@autotracer/inject-react19`
- HTML startup script injection for output-mode seeding
- optional Dashboard mounting
- optional theme-file loading from the Vite root
- optional internal-only global-script workspace build support

This package does not replace the runtime initializer in `@autotracer/react19`.

## React Compiler Coverage

The verified React Compiler path is limited to the tested Vite integration:

- Vite `8.2.1`
- React `19.2.0`
- `@vitejs/plugin-react` 4.x
- `babel-plugin-react-compiler` `1.0.0` with `target: "19"`
- plugin order with `reactTracer.vite(...)` before `react(...)`

In the repository proof app, the served `App` module contains both React Compiler memo-cache output and AutoTracer `labelState` calls, and the compiled browser app is exercised in development and production-preview browser runs. That result shows that this tested stack compiles and runs with both transforms present. It does not prove other React Compiler versions or other build integrations.

```ts
react({
  babel: {
    plugins: [["babel-plugin-react-compiler", { target: "19" }]],
  },
})
```

## Theme Files

When `inject` is enabled, the plugin loads matching React theme files from the Vite project root and injects the merged result into `globalThis.__REACTTRACER_THEME__` before application scripts execute.

Theme-file loading belongs to this Vite plugin path. The runtime package owns the theme keys and merge behavior after the injected value reaches `@autotracer/react19`.

Use these pages for the exact file names, merge order, and examples:

- [React 19 theme API](/themes/react19/api)
- [React 19 theme examples](/themes/react19/examples)

## React Server Components

Set [`serverComponents`](/reference/build/react19/vite/config/serverComponents) when you are building a client-and-server source tree and you want the transform to instrument only modules with a top-level `"use client"` directive.

This plugin instruments client components. It does not trace React Server Component execution.

## Internal Workspace Builds

`buildWithWorkspaceLibs` keeps the React 19 version of the restricted internal global-script path. React 19 does not publish official React or ReactDOM UMD files, so you must supply compatible scripts through [`reactUmdSrc`](/reference/build/react19/vite/config/reactUmdSrc) and [`reactDomUmdSrc`](/reference/build/react19/vite/config/reactDomUmdSrc).

Use that mode only for local or internal QA workflows. If any injected global script fails to load, the application fails to start.

## Related Docs

- [@autotracer/react19](/api/react19) for runtime APIs and `globalThis.autoTracer`
- [@autotracer/plugin-babel-react19](/api/plugin-babel-react19) for the Babel build path
- [@autotracer/inject-react19](/api/inject-react19) for the shared low-level transform
- [React 19 Vite pragma comments](/reference/build/react19/vite/pragmas)

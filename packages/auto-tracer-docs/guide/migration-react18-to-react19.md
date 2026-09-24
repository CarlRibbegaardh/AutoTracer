# Migrate From React 18 To React 19

This guide covers the package substitutions and compatibility boundaries for moving an existing AutoTracer React 18 integration onto the React 19 product line. The goal is a narrow migration: swap the product-line packages, keep the runtime model, and update only the build or compiler wiring that changed.

## Package Substitutions

Replace each React 18 package with its React 19 counterpart:

| React 18 | React 19 |
| --- | --- |
| `@autotracer/react18` | `@autotracer/react19` |
| `@autotracer/plugin-vite-react18` | `@autotracer/plugin-vite-react19` |
| `@autotracer/plugin-babel-react18` | `@autotracer/plugin-babel-react19` |
| `@autotracer/inject-react18` | `@autotracer/inject-react19` |

If your app already uses `@autotracer/dashboard`, keep it. The Dashboard package is shared across the React lines.

## Dependency Floors And Build Baselines

- React `19.2.0` and ReactDOM `19.2.0` are the supported floor.
- TypeScript 6 is the minimum supported consumer compiler.
- TypeScript 7 is the primary React 19 package build/compiler path.
- The tested Vite integration in this repo uses Vite `8.2.1`.

If you are on Vite and want to stay inside the currently verified React 19 browser setup, pin your first migration pass to Vite `8.2.1`.

## What Stays The Same

The React 19 runtime preserves the React 18 public tracing model.

- `reactTracer()` is still the owning runtime initializer.
- `useReactTracer()`, `stopReactTracer()`, `isReactTracerInitialized()`, and `updateReactTracerOptions()` stay in the public runtime API.
- `enabled` still defaults to `false`, so dormant startup remains the default.
- `globalThis.autoTracer` remains the lower-level browser control surface.
- The Dashboard remains the normal browser control workflow.
- The runtime settings model still uses the same option families for visibility, triggers, output mode, diagnostics, and colors.
- The theme model stays the same: runtime `colors` plus Vite-root `*react-theme.json`, `*react-theme-light.json`, and `*react-theme-dark.json` files.

If your React 18 setup already uses dormant startup plus Dashboard control, the runtime usage pattern does not need to be reinvented for React 19.

## What Changes

### React Floor

The React 19 line starts at React `19.2.0`. React 18-compatible installs need to stay on the React 18 AutoTracer line.

### Product-Line Package Names

The package substitutions above are required. Mixing the React 18 runtime package with the React 19 build plugins, or the other way around, is not the supported path.

### TypeScript Baseline Split

The React 19 packages are built primarily with TypeScript 7, but they still check a TypeScript 6 consumer fixture. If your application is still on TypeScript 6, that is supported. If you are choosing a new baseline, the primary example/build path in this repo uses TypeScript 7.

### Vite Verification Scope

The current React 19 Vite examples pin `vite@8.2.1`. Treat that as the verified integration instead of assuming a wider Vite range from analogy.

## `useActionState` And `useOptimistic`

The React 19 runtime does not introduce a special logger format for `useActionState` or `useOptimistic`. The React 19 proof harness exercises both hooks through the same generic `labelState()` contract used by existing state hooks.

That means the migration question is not "What is the new React 19 logger format?" The answer is that the runtime model stays the same.

## Vite Migration

Swap the package name, keep the plugin before the React plugin, and keep tracing out of public-facing builds.

```ts
import { reactTracer } from "@autotracer/plugin-vite-react19";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  plugins:
    mode === "development"
      ? [
          reactTracer.vite({
            inject: true,
          }),
          react(),
        ]
      : [react()],
}));
```

Keep the runtime startup before React renders:

```tsx
const { reactTracer } = await import("@autotracer/react19");
reactTracer({ enabled: false });
```

## Babel And Next.js Migration

Swap the package name, exclude the Babel plugin from public builds, and keep the client bootstrap separate from the build transform.

```js
const shouldTrace =
  process.env.NODE_ENV === "development" ||
  process.env.INTERNAL_QA === "true";

module.exports = {
  plugins: shouldTrace
    ? [["@autotracer/plugin-babel-react19", { mode: "opt-out" }]]
    : [],
};
```

For App Router source trees, use `serverComponents: true` so only modules with a top-level `"use client"` directive are eligible for injection.

## Verified React Compiler Setup

React Compiler compatibility is verified only for this exact stack:

- `babel-plugin-react-compiler@1.0.0`
- React `19.2.0`
- Vite `8.2.1`
- `@vitejs/plugin-react` 4.x
- AutoTracer Vite plugin registered before the React plugin
- compiler target `{ target: "19" }`

```ts
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

The evidence is precise rather than broad. The compiler example inspects the served `App` module and proves that the transformed component still contains both the React Compiler memo-cache output and AutoTracer's `labelState` call. The same example then runs the labeled browser flow in development and preview mode.

## Unverified Versions And Integrations

These are not covered by the current React 19 verification described above:

- native Turbopack injection;
- React Server Component execution;
- server actions;
- other React Compiler versions;
- other build integrations beyond the verified Vite stack above; and
- broader Vite-version claims beyond `8.2.1`.

## Current Limits

- The runtime boundary is still the browser-side fiber tree.
- The Dashboard is a runtime control surface, not a trace-output viewer.
- Runtime suppression is not a substitute for excluding tracing from public-facing builds.

## Migration Checklist

1. Replace the React 18 package names with the React 19 package names.
2. Move the app onto React `19.2.0` and ReactDOM `19.2.0`.
3. Keep `reactTracer()` before the first client render.
4. Keep dormant startup and the Dashboard-first browser workflow.
5. Exclude the build plugin and runtime bootstrap from public-facing builds.
6. If you use React Compiler, stay on the verified `1.0.0` plus target `"19"` stack until you have separate proof for anything broader.

## Read Next

- [React 19 Quick Start](/guide/quickstart-react19)
- [React 19 Configuration](/guide/config-react19)
- [React 19 Runtime API](/api/react19)
- [React 19 Vite Plugin API](/api/plugin-vite-react19)
- [React 19 Babel Plugin API](/api/plugin-babel-react19)
- [React 19 Theme API](/themes/react19/api)

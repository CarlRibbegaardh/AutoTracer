# @autotracer/react19

`@autotracer/react19` records React 19 component renders, prop changes, and labeled state changes. Use it with an AutoTracer build plugin in local development or restricted internal test and QA builds.

The runtime listens through the React DevTools hook. The build plugins add `useReactTracer()` calls and source labels, so trace output can identify values such as `count` and `setCount` without manual logging.

## Requirements

- React and ReactDOM `^19.2.0`
- TypeScript 6 or newer for consumers
- TypeScript 7 for the package's primary build

The tested Vite integration uses Vite `8.2.1`. React Server Component execution and server-side actions are outside the runtime boundary; AutoTracer traces client-rendered fibers.

## Installation

For a Vite application with the Dashboard workflow:

```bash
pnpm add @autotracer/react19 @autotracer/dashboard
pnpm add -D @autotracer/plugin-vite-react19
```

For a Babel or Next.js application:

```bash
pnpm add @autotracer/react19 @autotracer/dashboard
pnpm add -D @autotracer/plugin-babel-react19
```

AutoTracer exposes component state, props, and application structure. Do not include the runtime, build plugin, or Dashboard in a public-facing build. A runtime switch is useful for controlling a restricted QA session, but it is not a security boundary.

## Vite Setup

Exclude the AutoTracer plugin from non-development builds. In the React 19 Vite plugin, `inject: false` and `TRACE_INJECT=0` disable transformation and the plugin's HTML side effects, including Dashboard mounting and theme loading. Conditional plugin registration also keeps the tracing integration out of the production configuration entirely.

```ts
// vite.config.ts
import { reactTracer } from "@autotracer/plugin-vite-react19";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  plugins:
    mode === "development"
      ? [
          reactTracer.vite({
            inject: true,
            mode: "opt-out",
            include: { paths: ["src/**/*.tsx"] },
            labelHooks: ["useState"],
            dashboardConfig: {
              enabled: true,
              hideByDefault: false,
              position: "bottom-right",
            },
          }),
          react(),
        ]
      : [react()],
}));
```

Initialize the runtime before React renders. Starting with `enabled: false` installs the control surface without beginning an active trace, so the Dashboard can start tracing when the developer is ready.

```tsx
// src/main.tsx
import { createRoot } from "react-dom/client";

import { App } from "./App.js";

async function renderApplication(): Promise<void> {
  if (import.meta.env.DEV) {
    const { reactTracer } = await import("@autotracer/react19");
    reactTracer({ enabled: false });
  }

  const rootElement = document.getElementById("root");
  if (rootElement === null) {
    throw new Error("Expected the #root element to exist.");
  }

  createRoot(rootElement).render(<App />);
}

void renderApplication();
```

The [Dashboard workflow](https://docs.autotracer.dev/dashboard/webapps) is the normal browser control surface. Tests, automation, and applications without the Dashboard can use `globalThis.autoTracer.reactTracer` after initialization.

## Configuration

Pass `ReactTracerOptions` to `reactTracer()`:

```ts
reactTracer({
  enabled: true,
  outputMode: "devtools",
  includeMount: "always",
  includeRendered: "forPropsOrState",
  filterEmptyNodes: "all",
});
```

`enabled` defaults to `false`. `outputMode` uses a value already seeded by the build plugin when the option is omitted; otherwise the underlying default is `"devtools"`.

The [React 19 runtime settings](https://docs.autotracer.dev/reference/runtime/react19/) describe every option, its default, and the behavior it controls.

## Runtime API

### `reactTracer(options?)`

Initializes React tracing and returns a cleanup function. Call it before `createRoot(...).render(...)` so the runtime can observe the initial render.

```ts
const stop = reactTracer({ enabled: true });
stop();
```

### `useReactTracer(param?)`

Registers a component instance and returns its `ComponentLogger`. Build plugins inject this hook automatically. Direct calls are intended for advanced harnesses and components that are deliberately instrumented by hand.

```tsx
export function SearchPanel() {
  const tracer = useReactTracer({ name: "SearchPanel" });
  tracer.log("rendered");

  return <form>{/* fields */}</form>;
}
```

### `stopReactTracer()`

Stops active tracing, clears retained render data, and leaves the runtime in the appropriate stopped or passive state for its trigger configuration.

### `isReactTracerInitialized()`

Returns `true` while React tracing is active. The function name is retained for API compatibility; a dormant initialization with `enabled: false` returns `false`.

### `updateReactTracerOptions(options)`

Validates and merges a partial options object into the current runtime settings. Changing `enabled` from `true` to `false` also stops active tracing.

The complete signatures and exported types are listed in the [React 19 runtime API](https://docs.autotracer.dev/api/react19).

## Lower-Level Browser Control

After `reactTracer()` initializes the runtime, `globalThis.autoTracer.reactTracer` provides commands for automation and non-Dashboard setups:

```ts
globalThis.autoTracer.reactTracer.start();
globalThis.autoTracer.reactTracer.getRenderCount();
globalThis.autoTracer.reactTracer.stop();
```

The control object also manages enabled-on-load behavior, render-count auto-stop, start and end triggers, trigger modes, and runtime component filters. These preferences use browser storage where the corresponding API says they persist.

## React 19 Behavior

The React 19 runtime preserves the React 18 public tracing model. `useActionState` and `useOptimistic` use the same generic hook-label mechanism as other state hooks; they do not require a React 19-specific logger format.

Compatibility with `babel-plugin-react-compiler@1.0.0` is verified for React `19.2.0`, Vite `8.2.1`, `@vitejs/plugin-react` 4.x, and the AutoTracer-before-React-plugin order. The compiler must be configured explicitly. Other compiler versions and native Turbopack injection are not covered by that result.

## Themes

React 19 uses the same ReactTracer theme model and theme files as React 18. The Vite plugin loads `*react-theme.json`, then light and dark variants, from the project root. Later files override overlapping values from earlier files.

See the [React 19 theme API](https://docs.autotracer.dev/themes/react19/api) for the color keys and file precedence.

## Building And Testing

Run repository-defined scripts from the monorepo root. The package build emits declarations with TypeScript 7, checks source with TypeScript 6, and compiles a TypeScript 6 consumer fixture against the emitted declarations.

```bash
pnpm build
pnpm test
pnpm verify
```

## License

MIT © Carl Ribbegårdh

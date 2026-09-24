# @autotracer/plugin-vite-react19

Automatic React 19 component instrumentation for Vite 8 applications. Use this package in local development or restricted internal test/QA builds to inject `useReactTracer()` calls and preserve source-level component and hook labels.

## Why Use It

The plugin connects Vite's transform lifecycle to `@autotracer/inject-react19`. It can:

- Instrument eligible JSX and TSX function components.
- Preserve source variable names for supported state and hook values.
- Apply include, exclude, pragma, hook-label, and React Server Component settings from the injector.
- Load project theme files before the application starts.
- Seed the output mode and optionally mount `@autotracer/dashboard`.
- Add a stable prefix for islands or microfrontends sharing one browser console.

AutoTracer exposes component state, props, and application structure. Exclude this plugin at build time from public-facing applications.

## Requirements

- React and ReactDOM `19.2.0` or a compatible `^19.2.0` release
- Vite `8.2.1`
- Node.js 24 for repository development and package tooling
- TypeScript 6 or newer for consumers; package artifacts are built with TypeScript 7

## Installation

```bash
pnpm add @autotracer/react19
pnpm add -D @autotracer/plugin-vite-react19
```

Initialize the runtime before React renders, then register the Vite plugin.

```ts
// src/main.tsx
import { reactTracer } from "@autotracer/react19";

reactTracer();
```

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

## Configuration

| Option | Type | Default | Purpose |
| --- | --- | --- | --- |
| `inject` | `boolean` | `true` | Enables all transforms and plugin side effects. `TRACE_INJECT=0` also disables them. |
| `mode` | `"opt-in" \| "opt-out"` | Injector default | Selects pragma eligibility behavior. |
| `include` | Injector path/component filter | Injector default | Restricts eligible files and components. |
| `exclude` | Injector path/component filter | Injector default | Excludes files and components. |
| `importSource` | `string` | `@autotracer/react19` | Changes the injected runtime import. |
| `labelHooks` | `string[]` | `[]` | Adds hook names whose returned values should be labeled. |
| `labelHooksPattern` | `string` | Injector default | Adds hook names by regular-expression source. |
| `serverComponents` | `boolean` | `false` | Restricts injection to modules with a top-level `"use client"` directive. |
| `prefix` | `string` | none | Prefixes injected component names. |
| `outputMode` | `"devtools" \| "copy-paste"` | Runtime default | Seeds output behavior before runtime initialization. |
| `dashboardConfig` | object | none | Configures and mounts `@autotracer/dashboard`. |
| `buildWithWorkspaceLibs` | `boolean` | `false` | Enables restricted internal global-script workspace build support. |
| `reactUmdSrc` | `string` | none | Script exposing `window.React`; required with `buildWithWorkspaceLibs`. |
| `reactDomUmdSrc` | `string` | none | Script exposing `window.ReactDOM`; required with `buildWithWorkspaceLibs`. |

The [React 19 Vite API](https://docs.autotracer.dev/api/plugin-vite-react19) lists the public entry point and types. The [Vite settings reference](https://docs.autotracer.dev/reference/build/react19/vite/) documents each option separately.

When `dashboardConfig` is present, `vite serve` versions the dashboard module import for the lifetime of the development-server process. Restarting Vite loads the latest built dashboard package. Production builds retain the stable `@autotracer/dashboard` import, and multiple AutoTracer plugins still mount one shared widget.

### Hook Labels

```ts
reactTracer.vite({
  labelHooks: ["useState", "useReducer", "useAppSelector"],
  labelHooksPattern: "^use[A-Z].*",
});
```

### Islands And Microfrontends

```ts
reactTracer.vite({
  inject: mode === "development",
  prefix: "AccountIsland",
});
```

The prefix produces names such as `AccountIsland:ProfilePanel` in trace output.

## React Compiler

AutoTracer is verified with `babel-plugin-react-compiler@1.0.0` on React `19.2.0`, Vite `8.2.1`, and `@vitejs/plugin-react` 4.x. Register the AutoTracer plugin before the React plugin so AutoTracer adds labels while the component still has its source-level hook declarations. React Compiler then analyzes the instrumented component.

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

That result covers the versions and plugin order above. Other React Compiler versions and other build integrations require their own verification.

## Workspace Builds

For workspace libraries consumed as source, alias `@autotracer/react19` to the host application's installed copy. This keeps React in the normal Vite bundle and is the preferred setup.

`buildWithWorkspaceLibs` preserves the React 18 plugin's restricted internal global-loading path, with one required React 19 adaptation: React 19 no longer publishes official React or ReactDOM UMD files. You must provide scripts that are compatible with React 19.2.0 and expose `window.React` and `window.ReactDOM`.

```ts
reactTracer.vite({
  inject: process.env.DEPLOY_ENV === "qa",
  buildWithWorkspaceLibs: process.env.DEPLOY_ENV === "qa",
  reactUmdSrc: "/vendor/react-19.global.js",
  reactDomUmdSrc: "/vendor/react-dom-19.global.js",
});
```

The plugin still emits the package-provided `@autotracer/react19/dist/index.umd.js` artifact as `auto-tracer-react19.umd.js`. It externalizes React, ReactDOM, and AutoTracer from the entire application bundle. If any global script fails to load, the application fails to start.

Do not use this mode in public-facing deployments. Do not point these settings at React 18 UMD files.

## Theme Files

The plugin loads matching files from the Vite project root:

1. `*react-theme.json`
2. `*react-theme-light.json`
3. `*react-theme-dark.json`

Later files override earlier theme-file values. Loaded values are assigned to `globalThis.__REACTTRACER_THEME__` before application scripts execute.

## React Server Components

This package instruments client components; it does not trace React Server Component execution. Set `serverComponents: true` when processing an RSC-oriented source tree so only modules with a top-level `"use client"` directive are eligible.

## Building And Testing

Run repository-defined scripts from the monorepo root:

```bash
pnpm build
pnpm test
pnpm verify
```

The package build emits declarations with TypeScript 7, checks source compatibility with TypeScript 6, and compiles a TypeScript 6 fixture against the emitted declarations. `pnpm verify` also runs oxlint and the Vitest suite. Coverage uses Vitest 4.1.10 with 80% global branch, function, line, and statement thresholds.

## License

MIT © Carl Ribbegårdh

# Instrumentation topology

## React 18 Vite monorepos

The documented monorepo setup distinguishes two cases:

- **Source library:** the host app compiles the library's TypeScript source. Use `resolve.alias` when injected `@autotracer/react18` imports must resolve to the host app's installed copy.
- **Pre-built package:** the library produces `dist` independently and externalizes `@autotracer/react18`. The host can use `buildWithWorkspaceLibs` to satisfy that external through injected UMD globals.

`buildWithWorkspaceLibs` externalizes React from the entire application bundle and introduces script-loading and CSP consequences. Do not use it for source libraries.

Do not generalize this React 18 Vite guidance to another package or build path without checking its documentation.

Reference: [Monorepo setup](https://docs.autotracer.dev/guide/monorepo).

## Microfrontends

When a host and remotes share one browser runtime, traced React components share one output stream. AutoTracer does not infer microfrontend names. Configure a build-time `prefix` for stable component labels such as `host:App` or `catalog:ProductList`.

Initialize ReactTracer in the shared browser runtime before React renders.

Reference: [Microfrontends](https://docs.autotracer.dev/examples/microfrontends).

## Islands

Use opt-in mode and `// @trace` to select individual islands. Use `prefix` when multiple island bundles write to one output stream.

Reference: [Islands](https://docs.autotracer.dev/examples/islands).

## Server, worker, CLI, and hybrid runtimes

The Dashboard is a browser widget. Use runtime APIs directly for console apps, servers, CLIs, workers, and native runtimes without a browser DOM. In hybrid applications, choose the control surface separately for each runtime.

Reference: [Platform guidance](https://docs.autotracer.dev/dashboard/platforms).

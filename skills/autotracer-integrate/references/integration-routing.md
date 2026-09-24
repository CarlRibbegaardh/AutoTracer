# Integration routing

## Packages

| Signal | Runtime | Vite transform | Babel transform |
| --- | --- | --- | --- |
| React 18 renders | `@autotracer/react18` | `@autotracer/plugin-vite-react18` | `@autotracer/plugin-babel-react18` |
| React 19 renders | `@autotracer/react19` | `@autotracer/plugin-vite-react19` | `@autotracer/plugin-babel-react19` |
| Function execution | `@autotracer/flow` | `@autotracer/plugin-vite-flow` | `@autotracer/plugin-babel-flow` |

## React with Vite

Register the matching `reactTracer.vite(...)` plugin before the normal React plugin. Initialize the matching runtime before `createRoot(...).render(...)` or its equivalent.

The runtime observes renders. The build transform adds component instrumentation and state labels. Missing labels therefore belong to the transform layer, even when render output is otherwise working.

Use conditional plugin registration or `inject` to omit the transform from publicly accessible builds. Condition the runtime import on the same build boundary.

References:

- [React 18 Vite installation](https://docs.autotracer.dev/guide/installation-react-vite)
- [React 19 Vite installation](https://docs.autotracer.dev/guide/installation-react19-vite)

## Flow with Vite

`flowTracer(...)` instruments eligible functions and can inject the runtime. Use `runtimeControlled: true` for dormant startup. `include` and `exclude` can filter paths and function names; default exclusions omit common tests, dependencies, coverage, and build output.

Use `@autotracer/flow/runtime` for dormant manual loading and `@autotracer/flow` only when tracing should begin immediately.

Reference: [FlowTracer Vite installation](https://docs.autotracer.dev/guide/installation-flow-vite).

## React with Babel, Next.js, Webpack, or CRA

Use the matching Babel transform and confirm that the relevant files pass through the existing Babel pipeline.

For React in Next.js:

- place initialization in a client boundary;
- initialize before the first relevant client render;
- select the guide matching Pages Router or App Router;
- do not expect ReactTracer to observe server component execution or server actions.

For a custom Babel or Webpack pipeline, use the matching React Babel plugin. CRA requires ejecting or using CRACO to expose Babel configuration.

References:

- [React 18 Pages Router](https://docs.autotracer.dev/guide/installation-react-nextjs-pages)
- [React 18 App Router](https://docs.autotracer.dev/guide/installation-react-nextjs-app)
- [React 19 App Router](https://docs.autotracer.dev/guide/installation-react19-nextjs-app)
- [React 18 Create React App](https://docs.autotracer.dev/guide/installation-react-cra)
- [React 18 Babel plugin](https://docs.autotracer.dev/api/plugin-babel-react18)
- [React 19 Babel plugin](https://docs.autotracer.dev/api/plugin-babel-react19)

## Flow with Babel, Next.js, or Webpack

Use the Flow Babel transform and load the runtime before instrumented application modules execute. Use the dormant runtime entry for targeted captures.

References:

- [Flow with Next.js](https://docs.autotracer.dev/guide/installation-flow-nextjs)
- [Flow with Babel or Webpack](https://docs.autotracer.dev/guide/quickstart-flow#for-webpack)
- [Flow Babel plugin](https://docs.autotracer.dev/api/plugin-babel-flow)

## React 18 Vite workspaces

Determine which artifact the host loads:

- **Source library:** the host transform compiles the workspace source. Use `resolve.alias` so injected `@autotracer/react18` imports resolve to the host app's installed copy.
- **Built library:** instrumentation occurs in the library build if its emitted `dist` should contain tracing hooks. Inspect emitted imports and externals; the host must satisfy any externalized runtime.

For the documented pre-built package case, `buildWithWorkspaceLibs` makes the host satisfy the externalized runtime through UMD globals. It also externalizes React from the application bundle and introduces script-loading and CSP consequences. Do not use it for a source library.

Reference: [Monorepo setup](https://docs.autotracer.dev/guide/monorepo).

## Microfrontends and islands

When independent React bundles share one browser runtime, their traces share one output stream. Use the plugin `prefix` option for stable labels per build. Initialize ReactTracer before React renders. Duplicate Dashboard mounts are ignored.

References:

- [Microfrontends](https://docs.autotracer.dev/examples/microfrontends)
- [Islands](https://docs.autotracer.dev/examples/islands)

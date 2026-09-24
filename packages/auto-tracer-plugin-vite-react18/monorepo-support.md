# ReactTracer Vite Monorepo Support

Monorepos need special handling because the Vite plugin injects `@autotracer/react18` imports into traced components, but workspace libraries often do not declare that dependency in their own `package.json`.

The right fix depends on how the host app consumes the workspace library.

Use `resolve.alias` when the host app compiles workspace library source.

Use `buildWithWorkspaceLibs` only when the host app needs UMD/global loading while consuming a workspace library from its `dist/` output.

Most apps do not need `buildWithWorkspaceLibs`.

## Choose The Fix

- Source library compiled by the host app: use `resolve.alias`
- Separately built workspace library that needs host-side UMD/global loading: use `buildWithWorkspaceLibs`

## `resolve.alias`

Use `resolve.alias` when the host app builds the workspace library's source files as part of the same Vite or Rollup pass.

### What It Does

It rewrites `@autotracer/react18` imports to the host app's installed copy before Rollup resolves the injected import.

### Why It Works

When the host app compiles raw workspace source, the injected import is still part of the host app's own build graph. An alias gives Rollup a concrete location for `@autotracer/react18`, so the injected import resolves normally and React stays in the standard app bundle.

### What You Keep

- Normal React bundling
- No injected UMD script tags
- No extra runtime globals
- No CSP or CDN dependency from this fix

## `buildWithWorkspaceLibs`

Use this in the host app.

Use it when the host app consumes a workspace library from `dist`.

That library is built before the host app build runs.

The host app cannot inject AutoTracer into code that is already built.

If you want tracing inside that library, configure AutoTracer in the library's own build.

Technical flow:

- If tracing is enabled for the library build, that build injects AutoTracer.
- The library build writes its output to `dist`.
- The host app later consumes the built output.
- That built output may still import `@autotracer/react18`.
- The host app has to resolve that import.
- `buildWithWorkspaceLibs` is one way to do that.

### What It Does

It changes the host app build.

It loads React, ReactDOM, and ReactTracer as UMD globals.

It stops bundling those packages in the normal way.

### Why It Works

Those globals can satisfy imports that remain in the built library output.

The plugin injects the required script tags before the app bundle runs.

### Tradeoff

This is not a lightweight compatibility flag. It changes how the whole host app build receives React and ReactTracer.

## Important Boundary

`buildWithWorkspaceLibs` is only for restricted internal builds where that tradeoff is acceptable.

It removes React from the normal app bundle and loads React, ReactDOM, and ReactTracer through injected UMD globals. If those script loads fail, the app fails too.

## Reference

- Monorepo setup: https://docs.autotracer.dev/guide/monorepo
- Vite plugin API: https://docs.autotracer.dev/api/plugin-vite-react18
- React configuration: https://docs.autotracer.dev/guide/config-react

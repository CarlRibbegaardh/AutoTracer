# React 19 Vite Monorepo Support

The Vite plugin injects `@autotracer/react19` imports into traced components. Workspace libraries must make that runtime resolvable from the host build.

## Source Libraries

When the host application compiles a workspace library's TypeScript source, use `resolve.alias` to direct injected imports to the host application's installed `@autotracer/react19` package. React remains in the normal application bundle.

```ts
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@autotracer/react19": resolve(
        __dirname,
        "../../node_modules/@autotracer/react19",
      ),
    },
  },
});
```

## Built Libraries

`buildWithWorkspaceLibs` is available for restricted internal builds that must resolve AutoTracer through browser globals. It externalizes React, ReactDOM, and AutoTracer from the whole host bundle and emits the React 19 tracer's package-provided UMD asset.

React 19.2.0 does not publish official React or ReactDOM UMD files. Supply scripts that expose compatible `window.React` and `window.ReactDOM` globals:

```ts
reactTracer.vite({
  inject: isInternalQa,
  buildWithWorkspaceLibs: isInternalQa,
  reactUmdSrc: "/vendor/react-19.global.js",
  reactDomUmdSrc: "/vendor/react-dom-19.global.js",
});
```

If these scripts or the emitted `auto-tracer-react19.umd.js` asset fail to load, the application cannot start. Prefer source-library aliases, and never enable this global-loading mode in public-facing deployments.

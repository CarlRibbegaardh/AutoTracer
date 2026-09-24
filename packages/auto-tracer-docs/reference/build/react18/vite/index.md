# ReactTracer Vite Plugin Settings

**Package:** `@autotracer/plugin-vite-react18` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** Overview

---

Use these pages for the exact behavior of the options passed to `reactTracer.vite()` in `vite.config.ts`.

This layer controls build-time component injection, HTML startup script injection, optional dashboard mounting, optional output-mode startup defaults, optional UMD/global loading, and optional Vite root theme file loading. It does not replace the runtime `reactTracer()` initializer in `@autotracer/react18`.

## Settings By Concern

- Startup and browser control: [`inject`](./config/inject), [`dashboardConfig`](./config/dashboardConfig), and [`outputMode`](./config/outputMode)
- Eligibility and labeling: [`mode`](./config/mode), [pragma comments](./pragmas), [`include`](./config/include), [`exclude`](./config/exclude), [`labelHooks`](./config/labelHooks), [`labelHooksPattern`](./config/labelHooksPattern), and [`prefix`](./config/prefix)
- Framework and build wiring: [`serverComponents`](./config/serverComponents), [`importSource`](./config/importSource), [`buildWithWorkspaceLibs`](./config/buildWithWorkspaceLibs), [`reactUmdSrc`](./config/reactUmdSrc), and [`reactDomUmdSrc`](./config/reactDomUmdSrc)

## Adjacent Docs

- [@autotracer/plugin-vite-react18](/api/plugin-vite-react18) for package usage, pragmas, examples, and troubleshooting
- [ReactTracer Installation - Vite](/guide/installation-react-vite) for the recommended Vite entry path
- [ReactTracer Configuration](/guide/config-react) for the recommended runtime and build-time split
- [ReactTracer Runtime Settings](/reference/runtime/react18/) for `reactTracer()` option behavior
- [Dashboard Package Reference](/dashboard/reference) for injected dashboard fields
- [ReactTracer Theme API](/themes/react18/api) and [ReactTracer Example Themes](/themes/react18/examples) for Vite root theme files

# ReactTracer Vite Plugin Settings For React 19

**Package:** `@autotracer/plugin-vite-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** Overview

---

Use these pages for the exact behavior of the options passed to `reactTracer.vite()` in `vite.config.ts`.

This layer controls build-time component injection, HTML startup script injection, optional Dashboard mounting, optional output-mode startup seeding, optional internal-only global-script workspace wiring, and optional Vite-root theme-file loading. It does not replace the runtime `reactTracer()` initializer in `@autotracer/react19`.

The tested React 19 integration in this package targets Vite `8.2.1`.

## Settings By Concern

- Startup and browser control: [`inject`](./config/inject), [`dashboardConfig`](./config/dashboardConfig), and [`outputMode`](./config/outputMode)
- Eligibility and labeling: [`mode`](./config/mode), [pragma comments](./pragmas), [`include`](./config/include), [`exclude`](./config/exclude), [`labelHooks`](./config/labelHooks), [`labelHooksPattern`](./config/labelHooksPattern), and [`prefix`](./config/prefix)
- Framework and build wiring: [`serverComponents`](./config/serverComponents), [`importSource`](./config/importSource), [`buildWithWorkspaceLibs`](./config/buildWithWorkspaceLibs), [`reactUmdSrc`](./config/reactUmdSrc), and [`reactDomUmdSrc`](./config/reactDomUmdSrc)

## Adjacent Docs

- [@autotracer/plugin-vite-react19](/api/plugin-vite-react19) for package usage and compiler coverage
- [React 19 runtime settings](/reference/runtime/react19/)
- [Dashboard package reference](/dashboard/reference)
- [React 19 theme API](/themes/react19/api)
- [React 19 theme examples](/themes/react19/examples)

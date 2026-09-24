# ReactTracer Shared Transform For React 19

**Package:** `@autotracer/inject-react19` &nbsp;·&nbsp; **Layer:** Build &nbsp;·&nbsp; **Type:** Overview

---

Use this page for the low-level build-time transform shared by the React 19 Vite and Babel plugins.

This package owns the shared AST transform, the shared transform configuration, and helper APIs for tool authors. It does not initialize `reactTracer()`, it does not expose `globalThis.autoTracer`, and it does not load theme files.

## Normal Integration

Use [@autotracer/plugin-vite-react19](/api/plugin-vite-react19) or [@autotracer/plugin-babel-react19](/api/plugin-babel-react19) for normal app integrations.

Use `@autotracer/inject-react19` directly only when you are authoring custom build tooling and you need direct control over `transform()` and `normalizeConfig()`.

## Settings By Concern

- Eligibility and precedence: [`mode`](./config/mode), [`include`](./config/include), and [`exclude`](./config/exclude)
- Framework and import wiring: [`serverComponents`](./config/serverComponents) and [`importSource`](./config/importSource)
- Hook labeling: [`labelHooks`](./config/labelHooks) and [`labelHooksPattern`](./config/labelHooksPattern)

## Adjacent Context Surface

Custom tooling can pass `prefix` through `TransformContext` when multiple islands, micro-frontends, or other independent React entry points share one browser tab and you need injected component names to stay distinguishable as `prefix:ComponentName`.

Use [@autotracer/inject-react19](/api/inject-react19) for the exact `TransformContext` shape.

## Adjacent Docs

- [@autotracer/inject-react19](/api/inject-react19)
- [React 19 Vite settings](/reference/build/react19/vite/)
- [React 19 Babel settings](/reference/build/react19/babel/)
